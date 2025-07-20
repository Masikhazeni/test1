// api-features.js – fully rewritten and self‑contained
import mongoose from "mongoose";
import winston from "winston";
import HandleERROR from "./handleError.js";

/***********************
 * security‑config     *
 ***********************/
export const securityConfig = {
  allowedOperators: [
    "eq",
    "ne",
    "gt",
    "gte",
    "lt",
    "lte",
    "in",
    "nin",
    "regex",
    "exists",
    "size",
    "or",
    "and"
  ],
  forbiddenFields: ["password"],
  accessLevels: {
    guest: { maxLimit: 50, allowedPopulate: ["*"] },
    user: { maxLimit: 100, allowedPopulate: ["*"] },
    admin: { maxLimit: 1000, allowedPopulate: ["*"] },
    superAdmin: { maxLimit: 1000, allowedPopulate: ["*"] }
  }
};

/***********************
 * logger (winston)    *
 ***********************/
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});

/***********************
 * ApiFeatures class   *
 ***********************/
class ApiFeatures {
  constructor(model, query = {}, userRole = "guest") {
    this.Model = model;
    this.query = { ...query };
    this.userRole = userRole;
    this.pipeline = [];
    this.countPipeline = [];
    this.manualFilters = {};
    this.useCursor = false;

    this.#initialSanitization();
  }

  /* ---------------- public chainable helpers -------------- */
  filter() {
    const merged = { ...this.#parseQueryFilters(), ...this.manualFilters };
    const safe = this.#applySecurityFilters(merged);

    if (Object.keys(safe).length) {
      const matchStage = { $match: safe };
      this.pipeline.push(matchStage);
      this.countPipeline.push(matchStage);
    }
    return this;
  }

  sort() {
    if (this.query.sort) {
      const sortObj = this.query.sort.split(",").reduce((acc, f) => {
        const [key, order] = f.startsWith("-") ? [f.slice(1), -1] : [f, 1];
        acc[key] = order;
        return acc;
      }, {});
      this.pipeline.push({ $sort: sortObj });
    }
    return this;
  }

  limitFields() {
    if (this.query.fields) {
      const projection = this.query.fields
        .split(",")
        .filter(f => !securityConfig.forbiddenFields.includes(f))
        .reduce((acc, f) => ({ ...acc, [f]: 1 }), {});
      if (Object.keys(projection).length) this.pipeline.push({ $project: projection });
    }
    return this;
  }

  paginate() {
    const { maxLimit } = securityConfig.accessLevels[this.userRole] || { maxLimit: 100 };
    const page = Math.max(Number(this.query.page) || 1, 1);
    const limit = Math.min(Number(this.query.limit) || 10, maxLimit);

    this.pipeline.push({ $skip: (page - 1) * limit }, { $limit: limit });
    return this;
  }

  populate(input = "") {
    const collect = [];
    const push = v => v && collect.push(v);
    

    // from arg
    if (Array.isArray(input)) input.forEach(push);
    else if (typeof input === "object" && input.path) push(input);
    else if (typeof input === "string" && input.trim())
      input.split(",").forEach(i => push(i.trim()));

    // from query
    if (this.query.populate)
      this.query.populate.split(",").forEach(i => push(i.trim()));

    // dedupe
    const opts = Array.from(new Map(collect.map(o => [typeof o === "object" ? o.path : o, o])).values());

    opts.forEach(opt => {
      const field = (typeof opt === "object" ? opt.path : opt).trim();
      const projection = typeof opt === "object" && opt.select ? opt.select.split(" ").reduce((a, f) => ({ ...a, [f]: 1 }), {}) : {};
      const { collection } = this.#getCollectionInfo(field);

      const lookup = {
        $lookup: {
          from: collection,
          let: { localField: `$${field}` },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$localField"] } } },
            ...(Object.keys(projection).length ? [{ $project: projection }] : [])
          ],
          as: field
        }
      };

      this.pipeline.push(lookup);
      this.pipeline.push({ $unwind: { path: `$${field}`, preserveNullAndEmptyArrays: true } });
    });
    return this;
  }

  addManualFilters(filters) {
    if (filters && typeof filters === "object")
      this.manualFilters = { ...this.manualFilters, ...filters };
    return this;
  }

  /* ---------------- execute ---------------- */
  async execute({ useCursor = false, allowDiskUse = false } = {}) {
    try {
      this.useCursor = useCursor;

      const [countArr, dataRaw] = await Promise.all([
        this.Model.aggregate([...this.countPipeline, { $count: "total" }]),
        useCursor
          ? this.Model.aggregate(this.pipeline).cursor({ batchSize: 100 }).exec()
          : this.Model.aggregate(this.pipeline).allowDiskUse(allowDiskUse).readConcern("majority")
      ]);

      const count = countArr[0]?.total || 0;
      const data = useCursor ? await dataRaw.toArray() : dataRaw;

      return { success: true, count, data };
    } catch (err) {
      this.#handleError(err);
    }
  }

  /* ---------------- private helpers ---------------- */
  #initialSanitization() {
    ["$where", "$accumulator", "$function"].forEach(op => {
      delete this.query[op];
      delete this.manualFilters[op];
    });
    ["page", "limit"].forEach(f => {
      if (this.query[f] && !/^\d+$/.test(this.query[f]))
        throw new HandleERROR(`Invalid value for ${f}`, 400);
    });
  }

  #parseQueryFilters() {
    const q = { ...this.query };
    ["page", "limit", "sort", "fields", "populate"].forEach(el => delete q[el]);

    const jsonStr = JSON.stringify(q).replace(/\b(gte|gt|lte|lt|eq|ne|in|nin|regex|exists|size)\b/g, m => `$${m}`);
    return JSON.parse(jsonStr);
  }

  #applySecurityFilters(filters) {
    let safe = { ...filters };

    securityConfig.forbiddenFields.forEach(f => delete safe[f]);

    if (this.userRole !== "admin" && this.Model.schema.path("isActive")) safe.isActive = true;

    safe = this.#sanitizeNestedObjects(safe);
    safe = this.#normalizeInOperators(safe);
    return safe;
  }

  #sanitizeNestedObjects(obj) {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, typeof v === "object" && v !== null && !Array.isArray(v) ? this.#sanitizeNestedObjects(v) : this.#sanitizeValue(v)])
    );
  }

  #sanitizeValue(val) {
    if (typeof val !== "string") return val;
    const t = val.trim();
    if (!t) return t;
    if (t.toLowerCase() === "null") return null;
    if (t === "true") return true;
    if (t === "false") return false;
    if (/^\d+$/.test(t)) return parseInt(t, 10);
    if (mongoose.isValidObjectId(t)) return new mongoose.Types.ObjectId(t);
    return t;
  }

  #normalizeInOperators(obj) {
    for (const [k, v] of Object.entries(obj)) {
      if (k === "$in" || k === "$nin") {
        if (!Array.isArray(v)) obj[k] = [v];
      } else if (typeof v === "object" && v !== null) {
        this.#normalizeInOperators(v);
      }
    }
    return obj;
  }

  #getCollectionInfo(field) {
    const schemaPath = this.Model.schema.path(field);
    if (!schemaPath?.options?.ref) throw new HandleERROR(`Invalid populate field: ${field}`, 400);

    const refModel = mongoose.model(schemaPath.options.ref);
    if (refModel.schema.options.restricted && this.userRole !== "admin")
      throw new HandleERROR(`Unauthorized to populate ${field}`, 403);

    return { collection: refModel.collection.name };
  }

  #handleError(err) {
    logger.error(`[API Features Error]: ${err.message}`, { stack: err.stack });
    throw err;
  }
}

/* ---------- exports ---------- */
export default ApiFeatures;



// api-features.js – fully rewritten and self-contained
// import mongoose from "mongoose";
// import winston from "winston";
// import HandleERROR from "./handleError.js";

// /***********************
//  * security-config     *
//  ***********************/
// export const securityConfig = {
//   allowedOperators: [
//     "eq",
//     "ne",
//     "gt",
//     "gte",
//     "lt",
//     "lte",
//     "in",
//     "nin",
//     "regex",
//     "exists",
//     "size",
//     "or",
//     "and"
//   ],
//   forbiddenFields: ["password"],
//   accessLevels: {
//     guest: { maxLimit: 50, allowedPopulate: ["*"] },
//     user: { maxLimit: 100, allowedPopulate: ["*"] },
//     admin: { maxLimit: 1000, allowedPopulate: ["*"] },
//     superAdmin: { maxLimit: 1000, allowedPopulate: ["*"] }
//   }
// };

// /***********************
//  * logger (winston)    *
//  ***********************/
// const logger = winston.createLogger({
//   level: "info",
//   format: winston.format.combine(
//     winston.format.timestamp(),
//     winston.format.json()
//   ),
//   transports: [new winston.transports.Console()]
// });

// /***********************
//  * ApiFeatures class   *
//  ***********************/
// class ApiFeatures {
//   constructor(model, query = {}, userRole = "guest") {
//     this.Model = model;
//     this.query = { ...query };
//     this.userRole = userRole;
//     this.pipeline = [];
//     this.countPipeline = [];
//     this.manualFilters = {};
//     this.useCursor = false;

//     this.#initialSanitization();
//   }

//   /* ---------------- public chainable helpers -------------- */
//   filter() {
//     const merged = { ...this.#parseQueryFilters(), ...this.manualFilters };
//     const safe = this.#applySecurityFilters(merged);

//     if (Object.keys(safe).length) {
//       const matchStage = { $match: safe };
//       this.pipeline.push(matchStage);
//       this.countPipeline.push(matchStage);
//     }
//     return this;
//   }

//   sort() {
//     if (this.query.sort) {
//       const sortObj = this.query.sort.split(",").reduce((acc, f) => {
//         const field = f.startsWith("-") ? f.slice(1) : f;
        
//         // بررسی امنیتی فیلدهای sort
//         if (securityConfig.forbiddenFields.includes(field)) {
//           throw new HandleERROR(`Sorting by ${field} is not allowed`, 400);
//         }
        
//         // بررسی وجود فیلد در مدل
//         if (!this.Model.schema.path(field) && field !== '_id') {
//           throw new HandleERROR(`Invalid sort field: ${field}`, 400);
//         }
        
//         const order = f.startsWith("-") ? -1 : 1;
//         acc[field] = order;
//         return acc;
//       }, {});
      
//       if (Object.keys(sortObj).length) {
//         this.pipeline.push({ $sort: sortObj });
//       }
//     }
//     return this;
//   }

//   limitFields() {
//     if (this.query.fields) {
//       const projection = this.query.fields
//         .split(",")
//         .filter(f => !securityConfig.forbiddenFields.includes(f))
//         .reduce((acc, f) => ({ ...acc, [f]: 1 }), {});
//       if (Object.keys(projection).length) this.pipeline.push({ $project: projection });
//     }
//     return this;
//   }

//   paginate() {
//     const { maxLimit } = securityConfig.accessLevels[this.userRole] || { maxLimit: 100 };
//     const page = Math.max(Number(this.query.page) || 1, 1);
//     const limit = Math.min(Number(this.query.limit) || 10, maxLimit);

//     this.pipeline.push({ $skip: (page - 1) * limit }, { $limit: limit });
//     return this;
//   }

//   populate(input = "") {
//     const collect = [];
//     const push = v => v && collect.push(v);
    

//     // from arg
//     if (Array.isArray(input)) input.forEach(push);
//     else if (typeof input === "object" && input.path) push(input);
//     else if (typeof input === "string" && input.trim())
//       input.split(",").forEach(i => push(i.trim()));

//     // from query
//     if (this.query.populate)
//       this.query.populate.split(",").forEach(i => push(i.trim()));

//     // dedupe
//     const opts = Array.from(new Map(collect.map(o => [typeof o === "object" ? o.path : o, o])).values());

//     opts.forEach(opt => {
//       const field = (typeof opt === "object" ? opt.path : opt).trim();
//       const projection = typeof opt === "object" && opt.select ? opt.select.split(" ").reduce((a, f) => ({ ...a, [f]: 1 }), {}) : {};
//       const { collection } = this.#getCollectionInfo(field);

//       const lookup = {
//         $lookup: {
//           from: collection,
//           let: { localField: `$${field}` },
//           pipeline: [
//             { $match: { $expr: { $eq: ["$_id", "$$localField"] } } },
//             ...(Object.keys(projection).length ? [{ $project: projection }] : [])
//           ],
//           as: field
//         }
//       };

//       this.pipeline.push(lookup);
//       this.pipeline.push({ $unwind: { path: `$${field}`, preserveNullAndEmptyArrays: true } });
//     });
//     return this;
//   }

//   addManualFilters(filters) {
//     if (filters && typeof filters === "object")
//       this.manualFilters = { ...this.manualFilters, ...filters };
//     return this;
//   }

//   /* ---------------- execute ---------------- */
//   async execute({ useCursor = false, allowDiskUse = false } = {}) {
//     try {
//       this.useCursor = useCursor;

//       const [countArr, dataRaw] = await Promise.all([
//         this.Model.aggregate([...this.countPipeline, { $count: "total" }]),
//         useCursor
//           ? this.Model.aggregate(this.pipeline).cursor({ batchSize: 100 }).exec()
//           : this.Model.aggregate(this.pipeline).allowDiskUse(allowDiskUse).readConcern("majority")
//       ]);

//       const count = countArr[0]?.total || 0;
//       const data = useCursor ? await dataRaw.toArray() : dataRaw;

//       return { success: true, count, data };
//     } catch (err) {
//       this.#handleError(err);
//     }
//   }

//   /* ---------------- private helpers ---------------- */
//   #initialSanitization() {
//     ["$where", "$accumulator", "$function"].forEach(op => {
//       delete this.query[op];
//       delete this.manualFilters[op];
//     });
//     ["page", "limit"].forEach(f => {
//       if (this.query[f] && !/^\d+$/.test(this.query[f]))
//         throw new HandleERROR(`Invalid value for ${f}`, 400);
//     });
//   }

//   #parseQueryFilters() {
//     const q = { ...this.query };
//     ["page", "limit", "sort", "fields", "populate"].forEach(el => delete q[el]);

//     const jsonStr = JSON.stringify(q).replace(/\b(gte|gt|lte|lt|eq|ne|in|nin|regex|exists|size)\b/g, m => `$${m}`);
//     return JSON.parse(jsonStr);
//   }

//   #applySecurityFilters(filters) {
//     let safe = { ...filters };

//     securityConfig.forbiddenFields.forEach(f => delete safe[f]);

//     if (this.userRole !== "admin" && this.Model.schema.path("isActive")) safe.isActive = true;

//     safe = this.#sanitizeNestedObjects(safe);
//     safe = this.#normalizeInOperators(safe);
//     return safe;
//   }

//   #sanitizeNestedObjects(obj) {
//     return Object.fromEntries(
//       Object.entries(obj).map(([k, v]) => [k, typeof v === "object" && v !== null && !Array.isArray(v) ? this.#sanitizeNestedObjects(v) : this.#sanitizeValue(v)])
//     );
//   }

//   #sanitizeValue(val) {
//     if (typeof val !== "string") return val;
//     const t = val.trim();
//     if (!t) return t;
//     if (t.toLowerCase() === "null") return null;
//     if (t === "true") return true;
//     if (t === "false") return false;
//     if (/^\d+$/.test(t)) return parseInt(t, 10);
//     if (mongoose.isValidObjectId(t)) return new mongoose.Types.ObjectId(t);
//     return t;
//   }

//   #normalizeInOperators(obj) {
//     for (const [k, v] of Object.entries(obj)) {
//       if (k === "$in" || k === "$nin") {
//         if (!Array.isArray(v)) obj[k] = [v];
//       } else if (typeof v === "object" && v !== null) {
//         this.#normalizeInOperators(v);
//       }
//     }
//     return obj;
//   }

//   #getCollectionInfo(field) {
//     const schemaPath = this.Model.schema.path(field);
//     if (!schemaPath?.options?.ref) throw new HandleERROR(`Invalid populate field: ${field}`, 400);

//     const refModel = mongoose.model(schemaPath.options.ref);
//     if (refModel.schema.options.restricted && this.userRole !== "admin")
//       throw new HandleERROR(`Unauthorized to populate ${field}`, 403);

//     return { collection: refModel.collection.name };
//   }

//   #handleError(err) {
//     logger.error(`[API Features Error]: ${err.message}`, { stack: err.stack });
//     throw err;
//   }
// }

// /* ---------- exports ---------- */
// export default ApiFeatures;