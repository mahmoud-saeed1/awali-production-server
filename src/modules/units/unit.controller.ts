import { Request, Response, NextFunction } from 'express';
import { UnitService } from './unit.service';
import { ApiResponse } from '../../shared/utils/api-response';

const unitService = new UnitService();

export class UnitController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { data, total, page, limit } = await unitService.findAll(req.query as Record<string, string>);
      res.json(ApiResponse.paginated(data, total, page, limit, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const unit = await unitService.findById(String(req.params.id), req.user?._id?.toString());
      res.json(ApiResponse.success(unit, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const unit = await unitService.create(req.body, req.user!._id.toString());
      res.status(201).json(ApiResponse.success(unit, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const unit = await unitService.update(String(req.params.id), req.body, req.user!._id.toString());
      res.json(ApiResponse.success(unit, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await unitService.softDelete(String(req.params.id));
      res.status(204).send();
    } catch (error) { next(error); }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const unit = await unitService.updateStatus(String(req.params.id), req.body.status, req.user!._id.toString());
      res.json(ApiResponse.success(unit, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async publish(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const unit = await unitService.publish(String(req.params.id), req.body.isPublished, req.user!._id.toString());
      res.json(ApiResponse.success(unit, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async uploadImages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json(ApiResponse.error('VALIDATION_ERROR', 'No files uploaded'));
        return;
      }
      const unit = await unitService.uploadImages(String(req.params.id), files, req.user!._id.toString());
      res.json(ApiResponse.success(unit, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async deleteImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { imageKey } = req.body;
      const unit = await unitService.deleteImage(String(req.params.id), imageKey, req.user!._id.toString());
      res.json(ApiResponse.success(unit, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async reorderImages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const unit = await unitService.reorderImages(String(req.params.id), req.body.images, req.user!._id.toString());
      res.json(ApiResponse.success(unit, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async uploadDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json(ApiResponse.error('VALIDATION_ERROR', 'No file uploaded'));
        return;
      }
      const unit = await unitService.uploadDocument(String(req.params.id), file, req.user!._id.toString());
      res.json(ApiResponse.success(unit, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async statistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await unitService.getStatistics();
      res.json(ApiResponse.success(stats, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async mostViewed(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const units = await unitService.getMostViewed(limit);
      res.json(ApiResponse.success(units, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }
}
