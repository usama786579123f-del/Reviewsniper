import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db.js";

const router = Router();

router.get("/agencies", async (req, res) => {
  try {
    const db = await getDb();
    const agencies = db.collection("agencies");

    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
    const { status, country } = req.query as Record<string, string | undefined>;

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (country) filter.country = { $regex: country, $options: "i" };

    const total = await agencies.countDocuments(filter);
    const results = await agencies
      .find(filter)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    res.json({
      agencies: results,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (err) {
    console.error("[api] GET /agencies failed:", err);
    res.status(503).json({ error: "Could not reach the database. Check MONGODB_URI in your .env file." });
  }
});

router.post("/agencies", async (req, res) => {
  try {
    const db = await getDb();
    const agencies = db.collection("agencies");
    const body = req.body || {};

    if (!body.name) {
      return res.status(400).json({ error: "Agency name is required." });
    }

    const doc = {
      name: body.name,
      country: body.country || "",
      city: body.city || "",
      niches: Array.isArray(body.niches) ? body.niches : [],
      contact_person: body.contact_person || "",
      email: body.email || "",
      phone: body.phone || "",
      status: body.status || "pending",
      leads_sent: 0,
      created_at: new Date(),
      last_contact: null,
    };

    const result = await agencies.insertOne(doc);
    res.status(201).json({ _id: result.insertedId, ...doc });
  } catch (err) {
    console.error("[api] POST /agencies failed:", err);
    res.status(503).json({ error: "Could not reach the database. Check MONGODB_URI in your .env file." });
  }
});

router.get("/agencies/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid agency id." });
    }
    const db = await getDb();
    const agency = await db.collection("agencies").findOne({ _id: new ObjectId(req.params.id) });
    if (!agency) return res.status(404).json({ error: "Agency not found." });
    res.json(agency);
  } catch (err) {
    console.error("[api] GET /agencies/:id failed:", err);
    res.status(503).json({ error: "Could not reach the database. Check MONGODB_URI in your .env file." });
  }
});

router.patch("/agencies/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid agency id." });
    }
    const allowedFields = ["name", "country", "city", "niches", "contact_person", "email", "phone", "status", "leads_sent", "last_contact"];
    const update: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (req.body && req.body[field] !== undefined) update[field] = req.body[field];
    }
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: "No valid fields to update." });
    }

    const db = await getDb();
    const result = await db
      .collection("agencies")
      .findOneAndUpdate({ _id: new ObjectId(req.params.id) }, { $set: update }, { returnDocument: "after" });

    if (!result) return res.status(404).json({ error: "Agency not found." });
    res.json(result);
  } catch (err) {
    console.error("[api] PATCH /agencies/:id failed:", err);
    res.status(503).json({ error: "Could not reach the database. Check MONGODB_URI in your .env file." });
  }
});

router.delete("/agencies/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid agency id." });
    }
    const db = await getDb();
    const result = await db.collection("agencies").deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Agency not found." });
    res.json({ deleted: true });
  } catch (err) {
    console.error("[api] DELETE /agencies/:id failed:", err);
    res.status(503).json({ error: "Could not reach the database. Check MONGODB_URI in your .env file." });
  }
});

export default router;
