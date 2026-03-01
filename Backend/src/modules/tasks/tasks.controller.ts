import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { serializeBigInt } from "../../utils/json.js";
import type { TaskListResponse } from "./tasks.types.js";
import { parseTaskListQuery } from "./tasks.query.js";
import { TasksService } from "./tasks.service.js";
import { validateCreateTask, validateUpdateTask } from "./tasks.validation.js";

function parseId(param: string | string[]): bigint {
  try {
    const idString = Array.isArray(param) ? param[0] : param;
    return BigInt(idString);
  } catch {
    const err: any = new Error("Invalid id");
    err.statusCode = 400;
    throw err;
  }
}

function getOwnerId(res: Response): string {
  const uid = res.locals?.user?.uid;
  return typeof uid === "string" && uid.length > 0 ? uid : "dev-user";
}

export class TasksController {
  constructor(private readonly service: TasksService) { }

  list = asyncHandler(async (req: Request, res: Response) => {
    const owner_id = getOwnerId(res);
    const queryValidation = parseTaskListQuery(req.query);
    if (!queryValidation.ok) {
      res.status(400).json({ error: queryValidation.error, details: queryValidation.details });
      return;
    }

    const tasks = await this.service.listLatest(owner_id, queryValidation.value);
    const lastId = tasks.length > 0 ? tasks[tasks.length - 1].id : null;
    const limit = queryValidation.value.limit;
    const next_cursor = tasks.length > 0 && (limit === undefined || tasks.length === limit)
      ? lastId?.toString() ?? null
      : null;
    const response: TaskListResponse<typeof tasks[number]> = {
      items: tasks,
      next_cursor,
    };
    res.json(serializeBigInt(response));
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const owner_id = getOwnerId(res);
    const id = parseId(req.params.id);
    const task = await this.service.getById(owner_id, id);
    res.json(serializeBigInt(task));
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const owner_id = getOwnerId(res);
    const validation = validateCreateTask(req.body);
    if (!validation.ok) {
      res.status(400).json({ error: validation.error, details: validation.details });
      return;
    }

    const task = await this.service.create(owner_id, validation.value);
    res.status(201).json(serializeBigInt(task));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const owner_id = getOwnerId(res);
    const id = parseId(req.params.id);
    const validation = validateUpdateTask(req.body);
    if (!validation.ok) {
      res.status(400).json({ error: validation.error, details: validation.details });
      return;
    }

    const task = await this.service.update(owner_id, id, validation.value);
    res.json(serializeBigInt(task));
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const owner_id = getOwnerId(res);
    const id = parseId(req.params.id);
    await this.service.delete(owner_id, id);
    res.status(204).send();
  });
}
