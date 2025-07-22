import RequestLog from "../Models/requestLog.js";

export async function logRequest(req, res, next) {
  try {
    await RequestLog.create({
      method: req.method,
      path: req.originalUrl,
      headers: req.headers,
      body: req.body,
      query: req.query,
      params: req.params,
    });
  } catch (err) {
    console.error(" Error logging request:", err.message);
  }

  next(); 
}
