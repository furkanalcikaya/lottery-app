import mongoose from "mongoose";

export async function initMongoose() {
    if (mongoose.connection.readyState >= 1) {
        return mongoose.connection.asPromise();
    }

    if (mongoose.connection.readyState === 0) {
        return mongoose.connect(process.env.MONGODB_URL as string);
    }
    const uri = process.env.MONGODB_URL;
    if (!uri) throw new Error("MONGODB_URL environment variable is not set");
    return await mongoose.connect(uri);
}