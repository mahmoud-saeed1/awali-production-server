import { Request, Response, NextFunction } from 'express';
import { FeatureService } from './feature.service';
import { ApiResponse } from '../../shared/utils/api-response';

const service = new FeatureService();

export class FeatureController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { data, total, page, limit } = await service.findAll(req.query as Record<string, string>);
      res.json(ApiResponse.paginated(data, total, page, limit, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await service.findById(String(req.params.id));
      res.json(ApiResponse.success(item, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await service.create(req.body);
      res.status(201).json(ApiResponse.success(item, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await service.update(String(req.params.id), req.body);
      res.json(ApiResponse.success(item, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await service.delete(String(req.params.id));
      res.status(204).send();
    } catch (error) { next(error); }
  }
}
