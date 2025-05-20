import { connect } from "mongoose";

export default async function mongooseInit() {
    if (!process.env.CLOUD_DB_URL) {
        console.error("MongoDB connection URL is not configured");
        process.exit(1);
    }

    try {
        await connect(process.env.CLOUD_DB_URL, {
            dbName: "DeploymentCollections",
        });

        console.log("Successfully connect to cloud DB!");
    } catch (error) {
        console.log("Failed to connect to cloud DB!");
        console.log(error.message);
        process.exit(1);
    }
}
