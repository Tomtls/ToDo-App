import express from "express";
import { tasksRouter } from "./modules/tasks/tasks.routes.js";
import { labelsRouter, taskLabelsRouter } from "./modules/labels/labels.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { env } from "./config/env.js";

export const app = express();

app.use(express.json());

const allowAllOrigins = env.corsOrigins.length === 0;
app.use((req, res, next) => {
  if (allowAllOrigins) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else {
    const origin = req.headers.origin;
    if (typeof origin === "string" && env.corsOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
    }
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/tasks", tasksRouter);
app.use("/tasks", taskLabelsRouter);
app.use("/labels", labelsRouter);

app.use(errorHandler);
