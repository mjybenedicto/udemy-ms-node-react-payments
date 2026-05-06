import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
    var signin: (id?: string) => string[];
}

jest.mock('../nats-wrapper');

let mongo: any;

beforeAll(async () => {
    process.env.JWT_KEY = "asdf";

    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
    jest.clearAllMocks();
    if (mongoose.connection.db) {
        const collections = await mongoose.connection.db.collections();
 
        for (let collection of collections) {
            await collection.deleteMany({});
        }
    }
});

afterAll(async () => {
    await mongoose.connection.close();
    if (mongo) {
        await mongo.stop();
    }
});


global.signin = (id?: string) => {
    // Build a JWT payload (id, email)
    const payload = {
        id: id || new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com'
    };

    // Create the JWT
    const token = jwt.sign(payload, process.env.JWT_KEY!);

    // Build the session Object { jwt: MY_JWT }
    const session = { jwt: token };

    //Turn that session into JSON
    const sessionJSON = JSON.stringify(session);

    // Tkae JSON and encode it as base64
    const base64 = Buffer.from(sessionJSON).toString('base64');

    // Return a string that's the cookie with encoded data
    return [`session=${base64}`];
}
