import { Request, Response, NextFunction } from 'express';
import { DealService } from './deal.service';
import { ApiResponse } from '../../shared/utils/api-response';

const dealService = new DealService();

export class DealController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { data, total, page, limit } = await dealService.findAll(req.query as Record<string, string>);
      res.json(ApiResponse.paginated(data, total, page, limit, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deal = await dealService.findById(String(req.params.id));
      res.json(ApiResponse.success(deal, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deal = await dealService.create(req.body, req.user!._id.toString());
      res.status(201).json(ApiResponse.success(deal, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deal = await dealService.update(String(req.params.id), req.body, req.user!._id.toString());
      res.json(ApiResponse.success(deal, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await dealService.softDelete(String(req.params.id));
      res.status(204).send();
    } catch (error) { next(error); }
  }

  async updateStage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { stage, lostReason } = req.body;
      const deal = await dealService.updateStage(String(req.params.id), stage, lostReason, req.user!._id.toString());
      res.json(ApiResponse.success(deal, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async recordPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deal = await dealService.recordPayment(String(req.params.id), req.body, req.user!._id.toString());
      res.json(ApiResponse.success(deal, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async pipeline(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await dealService.getPipelineSummary();
      res.json(ApiResponse.success(summary, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async statistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await dealService.getStatistics();
      res.json(ApiResponse.success(stats, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }
}
