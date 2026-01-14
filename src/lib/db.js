import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export default async function dbConnect() {
  try {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
      cached.promise = mongoose.connect(process.env.DB_TOKEN, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
      });
    }

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    console.error("Mongo connection failed");
    throw e;
  }
}
