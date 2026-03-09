import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from './analytics.service';
import { ApiResponse } from '../../shared/utils/api-response';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  async dashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getDashboard();
      res.json(ApiResponse.success(data, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async sales(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getSalesAnalytics(req.query.period as string);
      res.json(ApiResponse.success(data, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async pipeline(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getPipelineAnalytics();
      res.json(ApiResponse.success(data, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async agents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getAgentPerformance();
      res.json(ApiResponse.success(data, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async clients(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getClientAnalytics();
      res.json(ApiResponse.success(data, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async units(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await analyticsService.getUnitAnalytics();
      res.json(ApiResponse.success(data, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }
}
