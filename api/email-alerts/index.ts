import { getDb } from "../_db.js";

export default async function handler(req: any, res: any) {
  try {
    const db = await getDb();
    const emailAlerts = db.collection("email_alerts");

    if (req.method === "GET") {
      const query = req.query || {};
      const page = Math.max(1, Number(query.page ?? 1));
      const limit = Math.min(100, Math.max(1, Number(query.limit ?? 20)));
      const status = query.status as string | undefined;

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

      res.status(200).json({
        alerts: results,
        pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
        stats: {
          total: sentCount + skippedCount + failedCount,
          sent: sentCount,
          skipped: skippedCount,
          failed: failedCount,
        },
      });
      return;
    }

    res.status(405).json({ error: "Method not allowed." });
  } catch (err) {
    console.error("Request to /api/email-alerts failed:", err);
    res.status(503).json({
      error: "Could not reach the database. Check MONGODB_URI in your Vercel project settings.",
    });
  }
}
