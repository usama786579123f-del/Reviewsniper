import "dotenv/config";
import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import leadsRouter from "./routes/leads.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === "production";

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());

  // API routes (leads + stats) — must be mounted before the static
  // catch-all below, otherwise every /api/* request would return index.html.
  app.use("/api", leadsRouter);

  if (isProd) {
    // Serve static files from dist/public in production
    const staticPath = path.resolve(__dirname, "public");
    app.use(express.static(staticPath));

    // Handle client-side routing - serve index.html for all remaining routes
    app.get("*", (_req, res) => {
      res.sendFile(path.join(staticPath, "index.html"));
    });
  }

  // In dev, Vite serves the frontend on its own port and proxies /api
  // requests here (see vite.config.ts) — this server only needs to answer
  // API calls, so no static/catch-all handler is registered above.
  const port = isProd ? process.env.PORT || 3000 : process.env.API_PORT || 4000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
