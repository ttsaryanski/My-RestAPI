import { connect } from "mongoose";

export default async function mongooseInit() {
    try {
        await connect(process.env.CLOUD_DB_URL, {
            dbName: "DeploymentCollections",
        });

        console.log("Successfully connect to cloud DB!");
    } catch (error) {
        console.log("Failed to connect to cloud DB!");
        console.log(error.message);
    }
}
