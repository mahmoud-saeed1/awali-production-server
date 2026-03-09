import { Request, Response, NextFunction } from 'express';
import { CommunicationService } from './communication.service';
import { ApiResponse } from '../../shared/utils/api-response';

const communicationService = new CommunicationService();

export class CommunicationController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { data, total, page, limit } = await communicationService.findAll(req.query as Record<string, string>);
      res.json(ApiResponse.paginated(data, total, page, limit, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const comm = await communicationService.create(req.body, req.user!._id.toString());
      res.status(201).json(ApiResponse.success(comm, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async getByClient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { data, total, page, limit } = await communicationService.getByClient(String(req.params.clientId), req.query as Record<string, string>);
      res.json(ApiResponse.paginated(data, total, page, limit, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }
}
