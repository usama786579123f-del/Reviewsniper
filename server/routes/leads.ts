import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db.js";

const router = Router();

/**
 * GET /api/leads
 * Query params:
 *   niche      - exact niche match (e.g. "Dental Clinics in Dubai")
 *   country    - matches against the tail of the niche string (e.g. "Dubai")
 *   minStars   - lower bound (inclusive), default 1
 *   maxStars   - upper bound (inclusive), default 2
 *   status     - lead status ("new", "contacted", "saved", "converted")
 *   page       - 1-indexed page number, default 1
 *   limit      - page size, default 20
 */
router.get("/leads", async (req, res) => {
  try {
    const db = await getDb();
    const leads = db.collection("leads");

    const { niche, country, status } = req.query as Record<string, string | undefined>;
    const minStars = Number(req.query.minStars ?? 1);
    const maxStars = Number(req.query.maxStars ?? 2);
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));

    const filter: Record<string, unknown> = {
      stars: { $gte: minStars, $lte: maxStars },
    };
    if (niche) filter.niche = niche;
    if (country) filter.niche = { $regex: country, $options: "i" };
    if (status) filter.status = status;

    const total = await leads.countDocuments(filter);
    const results = await leads
      .find(filter)
      .sort({ scraped_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    res.json({
      leads: results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    console.error("[api] GET /leads failed:", err);
    res.status(503).json({
      error: "Could not reach the database. Check MONGODB_URI in your .env file.",
    });
  }
});

/**
 * GET /api/leads/:id
 */
router.get("/leads/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid lead id." });
    }
    const db = await getDb();
    const lead = await db
      .collection("leads")
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!lead) {
      return res.status(404).json({ error: "Lead not found." });
    }
    res.json(lead);
  } catch (err) {
    console.error("[api] GET /leads/:id failed:", err);
    res.status(503).json({
      error: "Could not reach the database. Check MONGODB_URI in your .env file.",
    });
  }
});

/**
 * PATCH /api/leads/:id
 * Body: { status: "new" | "contacted" | "saved" | "converted" }
 */
router.patch("/leads/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid lead id." });
    }
    const { status } = req.body ?? {};
    const allowedStatuses = ["new", "contacted", "saved", "converted"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: `status must be one of: ${allowedStatuses.join(", ")}`,
      });
    }

    const db = await getDb();
    const result = await db
      .collection("leads")
      .findOneAndUpdate(
        { _id: new ObjectId(req.params.id) },
        { $set: { status, updated_at: new Date() } },
        { returnDocument: "after" }
      );

    if (!result) {
      return res.status(404).json({ error: "Lead not found." });
    }
    res.json(result);
  } catch (err) {
    console.error("[api] PATCH /leads/:id failed:", err);
    res.status(503).json({
      error: "Could not reach the database. Check MONGODB_URI in your .env file.",
    });
  }
});

/**
 * GET /api/stats
 * Returns the numbers the dashboard stat cards need.
 */
router.get("/stats", async (_req, res) => {
  try {
    const db = await getDb();
    const leads = db.collection("leads");

    const [total, newLeads, contacted, converted] = await Promise.all([
      leads.countDocuments({}),
      leads.countDocuments({ status: "new" }),
      leads.countDocuments({ status: { $in: ["contacted", "converted"] } }),
      leads.countDocuments({ status: "converted" }),
    ]);

    const conversionRate = total > 0 ? Math.round((converted / total) * 1000) / 10 : 0;

    res.json({
      totalLeads: total,
      newLeads,
      contactedAgencies: contacted,
      conversionRate, // percentage, e.g. 12.5
    });
  } catch (err) {
    console.error("[api] GET /stats failed:", err);
    res.status(503).json({
      error: "Could not reach the database. Check MONGODB_URI in your .env file.",
    });
  }
});

export default router;
