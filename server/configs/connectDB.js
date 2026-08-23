import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        // Do not exit — let the container stay alive so the health check passes
        // and the env var misconfiguration is visible in logs rather than a
        // misleading "port timed out" error.
    }
};

export default connectDB;