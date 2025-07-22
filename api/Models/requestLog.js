import mongoose from "mongoose";

const requestLogSchema = new mongoose.Schema({
  method: String,
  path: String,
  headers: Object,
  params: Object,
  query: Object,
  body: Object,
  statusCode: Number,
  success: Boolean,
  timestamp: { type: Date, default: Date.now }
});

const RequestLog = mongoose.model("RequestLog", requestLogSchema);
export default RequestLog;
