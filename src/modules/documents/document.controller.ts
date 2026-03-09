import { Request, Response, NextFunction } from 'express';
import { DocumentService } from './document.service';
import { ApiResponse } from '../../shared/utils/api-response';

const documentService = new DocumentService();

export class DocumentController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { data, total, page, limit } = await documentService.findAll(req.query as Record<string, string>);
      res.json(ApiResponse.paginated(data, total, page, limit, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = req.file;
      if (!file) { res.status(400).json(ApiResponse.error('VALIDATION_ERROR', 'No file uploaded')); return; }
      const doc = await documentService.create(req.body, file, req.user!._id.toString());
      res.status(201).json(ApiResponse.success(doc, req.headers['x-request-id'] as string));
    } catch (error) { next(error); }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await documentService.remove(String(req.params.id));
      res.status(204).send();
    } catch (error) { next(error); }
  }
}
