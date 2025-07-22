import RequestLog from "../Models/requestLog.js";

export function logRequest(req, res, next) {
  const startTime = Date.now();

  res.on("finish", async () => {
    const duration = Date.now() - startTime;

    try {
      await RequestLog.create({
        method: req.method,
        path: req.originalUrl,
        headers: req.headers,
        params: req.params,
        query: req.query,
        body: req.body,
        statusCode: res.statusCode,            
        success: res.statusCode < 400,         
        duration: duration,                    
        timestamp: new Date()
      });
    } catch (err) {
      console.error(" خطا در ذخیره لاگ:", err);
    }
  });

  next();
}

