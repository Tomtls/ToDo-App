import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { LabelsService } from "./labels.service.js";
import { validateAttachLabel, validateCreateLabel, validateUpdateLabel } from "./labels.validation.js";

function parseId(param: string | string[]): string {
  const idString = Array.isArray(param) ? param[0] : param;
  if (typeof idString !== "string" || idString.trim().length === 0) {
    const err: any = new Error("Invalid id");
    err.statusCode = 400;
    throw err;
  }
  return idString.trim();
}

function getOwnerId(res: Response): string {
  const uid = res.locals?.user?.uid;
  return typeof uid === "string" && uid.length > 0 ? uid : "dev-user";
}

export class LabelsController {
  constructor(private readonly service: LabelsService) { }

  list = asyncHandler(async (_req: Request, res: Response) => {
    const owner_id = getOwnerId(res);
    const labels = await this.service.list(owner_id);
    res.json(labels);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const owner_id = getOwnerId(res);
    const validation = validateCreateLabel(req.body);
    if (!validation.ok) {
      res.status(400).json({ error: validation.error, details: validation.details });
      return;
    }
    const label = await this.service.create(owner_id, validation.value);
    res.status(201).json(label);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const owner_id = getOwnerId(res);
    const id = parseId(req.params.id);
    const validation = validateUpdateLabel(req.body);
    if (!validation.ok) {
      res.status(400).json({ error: validation.error, details: validation.details });
      return;
    }
    const label = await this.service.update(id, owner_id, validation.value);
    res.json(label);
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const owner_id = getOwnerId(res);
    const id = parseId(req.params.id);
    await this.service.delete(owner_id, id);
    res.status(204).send();
  });

  listForTask = asyncHandler(async (req: Request, res: Response) => {
    const owner_id = getOwnerId(res);
    const task_id = parseId(req.params.taskId);
    const labels = await this.service.listForTask(owner_id, task_id);
    res.json(labels);
  });

  attachToTask = asyncHandler(async (req: Request, res: Response) => {
    const owner_id = getOwnerId(res);
    const task_id = parseId(req.params.taskId);
    const validation = validateAttachLabel(req.body);
    if (!validation.ok) {
      res.status(400).json({ error: validation.error, details: validation.details });
      return;
    }

    const label_id = validation.value.label_id;
    if (!label_id || typeof label_id !== "string") {
      res.status(400).json({ error: "Validation failed", details: { label_id: "Invalid id" } });
      return;
    }

    const result = await this.service.attachToTask(owner_id, task_id, {
      label_id: label_id.toString(),
    });
    res.status(201).json(result);
  });

  detachFromTask = asyncHandler(async (req: Request, res: Response) => {
    const owner_id = getOwnerId(res);
    const task_id = parseId(req.params.taskId);
    const label_id = parseId(req.params.labelId);
    await this.service.detachFromTask(owner_id, task_id, label_id);
    res.status(204).send();
  });
}
