import { getDb } from "./_db.js";

// Real numbers only: leads found per day (last 7 days), current status
// breakdown, and the niches with the most leads. No fabricated sources
// or agency data - we only have one lead source (Google Maps).
export default async function handler(req: any, res: any) {
  try {
    const db = await getDb();
    const leads = db.collection("leads");

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [byDay, byStatus, byNiche, total] = await Promise.all([
      leads
        .aggregate([
          { $match: { scraped_at: { $gte: sevenDaysAgo } } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$scraped_at" } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .toArray(),
      leads.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]).toArray(),
      leads
        .aggregate([
          { $group: { _id: "$niche", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
        ])
        .toArray(),
      leads.countDocuments({}),
    ]);

    res.status(200).json({
      totalLeads: total,
      leadsByDay: byDay.map((d: any) => ({ date: d._id, count: d.count })),
      leadsByStatus: byStatus.map((s: any) => ({ status: s._id || "new", count: s.count })),
      topNiches: byNiche.map((n: any) => ({ niche: n._id, count: n.count })),
    });
  } catch (err) {
    console.error("GET /api/analytics failed:", err);
    res.status(503).json({
      error: "Could not reach the database. Check MONGODB_URI in your Vercel project settings.",
    });
  }
}