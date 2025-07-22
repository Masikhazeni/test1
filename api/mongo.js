import mongoose from "mongoose";

export async function connectMongo() {
  try {
    await mongoose.connect("mongodb://localhost:27017/request_logs", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(" MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
  }
}
