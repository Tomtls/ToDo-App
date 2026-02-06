import { Router } from "express";
import { LabelsRepository } from "./labels.repository.js";
import { LabelsService } from "./labels.service.js";
import { LabelsController } from "./labels.controller.js";

export const labelsRouter = Router();
export const taskLabelsRouter = Router();

const repo = new LabelsRepository();
const service = new LabelsService(repo);
const controller = new LabelsController(service);

labelsRouter.get("/", controller.list);
labelsRouter.post("/", controller.create);
labelsRouter.patch("/:id", controller.update);
labelsRouter.delete("/:id", controller.remove);

taskLabelsRouter.get("/:taskId/labels", controller.listForTask);
taskLabelsRouter.post("/:taskId/labels", controller.attachToTask);
taskLabelsRouter.delete("/:taskId/labels/:labelId", controller.detachFromTask);
