import express from "express";
import { tasksRouter } from "./modules/tasks/tasks.routes.js";
import { labelsRouter, taskLabelsRouter } from "./modules/labels/labels.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

export const app = express();

app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/tasks", tasksRouter);
app.use("/tasks", taskLabelsRouter);
app.use("/labels", labelsRouter);

app.use(errorHandler);
