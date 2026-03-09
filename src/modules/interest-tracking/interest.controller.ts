import { Request, Response, NextFunction } from 'express';
import { InterestService } from './interest.service';
import { ApiResponse } from '../../shared/utils/api-response';

const interestService = new InterestService();

export class InterestController {
  async mostViewed(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const data = await interestService.getMostViewed(limit);
      res.json(ApiResponse.success(data, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async mostSearched(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const data = await interestService.getMostSearched(limit);
      res.json(ApiResponse.success(data, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async trending(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const limit = parseInt(req.query.limit as string) || 10;
      const data = await interestService.getTrending(days, limit);
      res.json(ApiResponse.success(data, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async unitInterest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await interestService.getUnitInterest(String(req.params.id));
      res.json(ApiResponse.success(data, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async heatmap(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await interestService.getSearchHeatmap();
      res.json(ApiResponse.success(data, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }
}
