import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { ApiResponse } from '../../shared/utils/api-response';

const userService = new UserService();

export class UserController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { data, total, page, limit } = await userService.findAll(req.query as Record<string, string>);
      res.json(ApiResponse.paginated(data, total, page, limit, req.headers['x-request-id'] as string));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.findById(String(req.params.id));
      res.json(ApiResponse.success(user, req.headers['x-request-id'] as string));
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.create(req.body);
      res.status(201).json(ApiResponse.success(user, req.headers['x-request-id'] as string));
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.update(String(req.params.id), req.body);
      res.json(ApiResponse.success(user, req.headers['x-request-id'] as string));
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await userService.softDelete(String(req.params.id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async activate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.activate(String(req.params.id));
      res.json(ApiResponse.success(user, req.headers['x-request-id'] as string));
    } catch (error) {
      next(error);
    }
  }

  async deactivate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.deactivate(String(req.params.id));
      res.json(ApiResponse.success(user, req.headers['x-request-id'] as string));
    } catch (error) {
      next(error);
    }
  }
}
