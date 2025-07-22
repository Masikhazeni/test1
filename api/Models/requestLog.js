import mongoose from "mongoose";

const requestLogSchema = new mongoose.Schema({
  method: String,
  path: String,
  headers: Object,
  body: Object,
  query: Object,
  params: Object,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const RequestLog = mongoose.model("RequestLog", requestLogSchema);
export default RequestLog;
