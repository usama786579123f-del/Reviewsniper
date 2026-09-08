import { getDb } from "../_db.js";

export default async function handler(req: any, res: any) {
  try {
    const db = await getDb();
    const leads = db.collection("leads");

    const query = req.query || {};
    const niche = query.niche as string | undefined;
    const country = query.country as string | undefined;
    const status = query.status as string | undefined;
    const minStars = Number(query.minStars ?? 1);
    const maxStars = Number(query.maxStars ?? 2);
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 20)));

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

    res.status(200).json({
      leads: results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    console.error("GET /api/leads failed:", err);
    res.status(503).json({
      error: "Could not reach the database. Check MONGODB_URI in your Vercel project settings.",
    });
  }
}
