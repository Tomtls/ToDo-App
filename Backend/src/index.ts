import "dotenv/config";
import express from "express";
import { pool } from "./db.js";

const app = express();
app.use(express.json());

app.get("/tasks", async (_req, res) => {
  try {
    const result = await pool.query("select * from tasks order by id desc limit 100");
    res.json(result.rows);
  } catch (err: any) {
    console.error("DB error:", err);
    res.status(500).json({
      error: "DB query failed",
      detail: err?.message ?? String(err),
      code: err?.code,
    });
  }
});

app.get("/db-ping", async (_req, res) => {
  try {
    const r = await pool.query("select now() as now, current_database() as db");
    res.json(r.rows[0]);
  } catch (err: any) {
    console.error("DB ping error:", err);
    res.status(500).json({ error: err?.message ?? String(err), code: err?.code });
  }
});

app.get("/health", (_req, res) => res.json({ ok: true }));

const port = Number(process.env.PORT || 8080);
app.listen(port, "0.0.0.0", () => {
  console.log(`Listening on ${port}`);
});
