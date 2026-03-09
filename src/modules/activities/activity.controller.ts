import { Request, Response, NextFunction } from 'express';
import { ActivityService } from './activity.service';
import { ApiResponse } from '../../shared/utils/api-response';

const activityService = new ActivityService();

export class ActivityController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { data, total, page, limit } = await activityService.findAll(req.query as Record<string, string>);
      res.json(ApiResponse.paginated(data, total, page, limit, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const activity = await activityService.findById(String(req.params.id));
      if (!activity) { res.status(404).json(ApiResponse.error('NOT_FOUND', 'Activity not found')); return; }
      res.json(ApiResponse.success(activity, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const activity = await activityService.create({ ...req.body, performedBy: req.user!._id.toString() });
      res.status(201).json(ApiResponse.success(activity, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async getByClient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { data, total, page, limit } = await activityService.getByClient(String(req.params.clientId), req.query as Record<string, string>);
      res.json(ApiResponse.paginated(data, total, page, limit, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }
}
