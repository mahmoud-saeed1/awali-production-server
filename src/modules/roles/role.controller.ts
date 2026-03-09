import { Request, Response, NextFunction } from 'express';
import { RoleService } from './role.service';
import { ApiResponse } from '../../shared/utils/api-response';

const roleService = new RoleService();

export class RoleController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { data, total, page, limit } = await roleService.findAll(req.query as Record<string, string>);
      res.json(ApiResponse.paginated(data, total, page, limit, req.headers['x-request-id'] as string));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const role = await roleService.findById(String(req.params.id));
      res.json(ApiResponse.success(role, req.headers['x-request-id'] as string));
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const role = await roleService.create(req.body);
      res.status(201).json(ApiResponse.success(role, req.headers['x-request-id'] as string));
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const role = await roleService.update(String(req.params.id), req.body);
      res.json(ApiResponse.success(role, req.headers['x-request-id'] as string));
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await roleService.delete(String(req.params.id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
