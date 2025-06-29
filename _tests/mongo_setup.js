import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongo = null;

export async function connectTestDB() {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();
    await mongoose.connect(uri);
}

export async function clearTestDB() {
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
        await collection.deleteMany();
    }
}

export async function disconnectTestDB() {
    await mongoose.disconnect();
    if (mongo) {
        await mongo.stop();
    }
}
