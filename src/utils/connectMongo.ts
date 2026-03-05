import mongoose from "mongoose";

export const connectMongo = async (): Promise<void> => {
  if (mongoose.connection.readyState) {
    return;
  }

  const uri = process.env.MONGODB_URL;
  if (!uri) {
    throw new Error(
      "MONGODB_URL environment variable is not set. Check your .env file.",
    );
  }

  try {
    await mongoose.connect(uri, { dbName: "edockets" });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
};
