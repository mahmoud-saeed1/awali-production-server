import { Request, Response, NextFunction } from 'express';
import { TaskService } from './task.service';
import { ApiResponse } from '../../shared/utils/api-response';

const taskService = new TaskService();

export class TaskController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { data, total, page, limit } = await taskService.findAll(req.query as Record<string, string>);
      res.json(ApiResponse.paginated(data, total, page, limit, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await taskService.findById(String(req.params.id));
      res.json(ApiResponse.success(task, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await taskService.create(req.body, req.user!._id.toString());
      res.status(201).json(ApiResponse.success(task, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await taskService.update(String(req.params.id), req.body);
      res.json(ApiResponse.success(task, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await taskService.remove(String(req.params.id));
      res.status(204).send();
    } catch (error) { next(error); }
  }

  async complete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await taskService.complete(String(req.params.id));
      res.json(ApiResponse.success(task, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async myTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { data, total, page, limit } = await taskService.getMyTasks(req.user!._id.toString(), req.query as Record<string, string>);
      res.json(ApiResponse.paginated(data, total, page, limit, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async overdue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { data, total, page, limit } = await taskService.getOverdueTasks(req.query as Record<string, string>);
      res.json(ApiResponse.paginated(data, total, page, limit, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }
}
