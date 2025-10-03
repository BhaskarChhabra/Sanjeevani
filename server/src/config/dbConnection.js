import mongoose from "mongoose";

const connection = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `${process.env.MONGO_URI}/SanjeevaniDB`
        );
        console.log(`\n✅ MongoDB Connected successfully! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("--- MONGODB CONNECTION FAILED ---", error);
        process.exit(1); // Exit process with failure
    }
};

export { connection };