import { Router } from "express";
import { TasksRepository } from "./tasks.repository.js";
import { TasksService } from "./tasks.service.js";
import { TasksController } from "./tasks.controller.js";
import { ActivityRepository } from "../activity/activity.repository.js";
import { ActivityService } from "../activity/activity.service.js";

export const tasksRouter = Router();

const repo = new TasksRepository();
const activityRepo = new ActivityRepository();
const activityService = new ActivityService(activityRepo);
const service = new TasksService(repo, activityService);
const controller = new TasksController(service);

tasksRouter.get("/", controller.list);
tasksRouter.get("/:id", controller.getById);
tasksRouter.post("/", controller.create);
tasksRouter.patch("/:id", controller.update);
tasksRouter.delete("/:id", controller.remove);
