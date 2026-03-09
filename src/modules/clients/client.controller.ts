import { Request, Response, NextFunction } from 'express';
import { ClientService } from './client.service';
import { ApiResponse } from '../../shared/utils/api-response';

const clientService = new ClientService();

export class ClientController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { data, total, page, limit } = await clientService.findAll(req.query as Record<string, string>);
      res.json(ApiResponse.paginated(data, total, page, limit, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const client = await clientService.findById(String(req.params.id));
      res.json(ApiResponse.success(client, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const client = await clientService.create(req.body, req.user!._id.toString());
      res.status(201).json(ApiResponse.success(client, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const client = await clientService.update(String(req.params.id), req.body, req.user!._id.toString());
      res.json(ApiResponse.success(client, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await clientService.softDelete(String(req.params.id));
      res.status(204).send();
    } catch (error) { next(error); }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, lostReason } = req.body;
      const client = await clientService.updateStatus(String(req.params.id), status, lostReason, req.user!._id.toString());
      res.json(ApiResponse.success(client, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async assignAgent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const client = await clientService.assignAgent(String(req.params.id), req.body.assignedTo, req.user!._id.toString());
      res.json(ApiResponse.success(client, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async timeline(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const timeline = await clientService.getTimeline(String(req.params.id));
      res.json(ApiResponse.success(timeline, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async matchingUnits(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const units = await clientService.getMatchingUnits(String(req.params.id));
      res.json(ApiResponse.success(units, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async statistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await clientService.getStatistics();
      res.json(ApiResponse.success(stats, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }
}
