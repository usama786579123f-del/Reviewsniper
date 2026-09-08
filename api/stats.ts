import { getDb } from "./_db.js";

export default async function handler(req: any, res: any) {
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

    res.status(200).json({
      totalLeads: total,
      newLeads,
      contactedAgencies: contacted,
      conversionRate,
    });
  } catch (err) {
    console.error("GET /api/stats failed:", err);
    res.status(503).json({
      error: "Could not reach the database. Check MONGODB_URI in your Vercel project settings.",
    });
  }
}
