import "dotenv/config";
import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import leadsRouter from "./routes/leads.js";
import agenciesRouter from "./routes/agencies.js";
import authRouter from "./routes/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === "production";

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());

  app.use("/api", leadsRouter);
  app.use("/api", agenciesRouter);
  app.use("/api", authRouter);

  if (isProd) {
    const staticPath = path.resolve(__dirname, "public");
    app.use(express.static(staticPath));

    app.get("*", (_req, res) => {
      res.sendFile(path.join(staticPath, "index.html"));
    });
  }

  const port = isProd ? process.env.PORT || 3000 : process.env.API_PORT || 4000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
