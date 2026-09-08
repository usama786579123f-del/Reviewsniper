import { MongoClient, Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || "reviewsniper";

let client: MongoClient | null = null;
let dbPromise: Promise<Db> | null = null;

export function getDb(): Promise<Db> {
  if (!MONGODB_URI) {
    return Promise.reject(
      new Error("MONGODB_URI is not set. Add it in your Vercel project Environment Variables.")
    );
  }

  if (!dbPromise) {
    client = new MongoClient(MONGODB_URI);
    dbPromise = client
      .connect()
      .then((c) => c.db(DB_NAME))
      .catch((err) => {
        dbPromise = null;
        throw err;
      });
  }

  return dbPromise;
}
