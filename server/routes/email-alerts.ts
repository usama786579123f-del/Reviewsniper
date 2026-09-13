import { Router } from "express";
import { getDb } from "../db.js";

const router = Router();

router.get("/email-alerts", async (req, res) => {
  try {
    const db = await getDb();
    const emailAlerts = db.collection("email_alerts");

    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
    const { status } = req.query as Record<string, string | undefined>;

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const total = await emailAlerts.countDocuments(filter);
    const results = await emailAlerts
      .find(filter)
      .sort({ sent_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const [sentCount, skippedCount, failedCount] = await Promise.all([
      emailAlerts.countDocuments({ status: "sent" }),
      emailAlerts.countDocuments({ status: "skipped" }),
      emailAlerts.countDocuments({ status: "failed" }),
    ]);

    res.json({
      alerts: results,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
      stats: {
        total: sentCount + skippedCount + failedCount,
        sent: sentCount,
        skipped: skippedCount,
        failed: failedCount,
      },
    });
  } catch (err) {
    console.error("[api] GET /email-alerts failed:", err);
    res.status(503).json({ error: "Could not reach the database. Check MONGODB_URI in your .env file." });
  }
});

export default router;
