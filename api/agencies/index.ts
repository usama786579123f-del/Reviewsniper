import { getDb } from "../_db.js";

export default async function handler(req: any, res: any) {
  try {
    const db = await getDb();
    const agencies = db.collection("agencies");

    if (req.method === "GET") {
      const query = req.query || {};
      const page = Math.max(1, Number(query.page ?? 1));
      const limit = Math.min(100, Math.max(1, Number(query.limit ?? 20)));
      const status = query.status as string | undefined;
      const country = query.country as string | undefined;

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

      res.status(200).json({
        agencies: results,
        pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
      });
      return;
    }

    if (req.method === "POST") {
      const body = req.body || {};
      if (!body.name) {
        res.status(400).json({ error: "Agency name is required." });
        return;
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
      return;
    }

    res.status(405).json({ error: "Method not allowed." });
  } catch (err) {
    console.error("Request to /api/agencies failed:", err);
    res.status(503).json({
      error: "Could not reach the database. Check MONGODB_URI in your Vercel project settings.",
    });
  }
}
