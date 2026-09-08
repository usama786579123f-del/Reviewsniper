import { MongoClient, Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || "reviewsniper";

let client: MongoClient | null = null;
let dbPromise: Promise<Db> | null = null;

/**
 * Lazily connects to MongoDB and caches the connection so every request
 * reuses the same client instead of opening a new one each time.
 */
export function getDb(): Promise<Db> {
  if (!MONGODB_URI) {
    return Promise.reject(
      new Error(
        "MONGODB_URI is not set. Add it to your .env file (see .env.example)."
      )
    );
  }

  if (!dbPromise) {
    client = new MongoClient(MONGODB_URI);
    dbPromise = client
      .connect()
      .then((c) => {
        console.log("[db] Connected to MongoDB");
        return c.db(DB_NAME);
      })
      .catch((err) => {
        // Reset so the next request can retry instead of being stuck
        // on a rejected promise forever.
        dbPromise = null;
        throw err;
      });
  }

  return dbPromise;
}
