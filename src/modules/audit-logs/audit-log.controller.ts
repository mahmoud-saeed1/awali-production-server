import { Request, Response, NextFunction } from "express";
import { AuditLogService } from "./audit-log.service";
import { ApiResponse } from "../../shared/utils/api-response";

const auditLogService = new AuditLogService();

export class AuditLogController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { data, total, page, limit } = await auditLogService.findAll(
        req.query as Record<string, string>,
      );
      res.json(
        ApiResponse.paginated(
          data,
          total,
          page,
          limit,
          req.headers["x-request-id"] as string,
        ),
      );
    } catch (error) {
      next(error);
    }
  }

  async getByResource(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const type = String(req.params.type);
      const id = String(req.params.id);
      const data = await auditLogService.getByResource(type, id);
      res.json(
        ApiResponse.success(data, req.headers["x-request-id"] as string),
      );
    } catch (error) {
      next(error);
    }
  }

  async getByUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { data, total, page, limit } = await auditLogService.getByUser(
        String(req.params.id),
        req.query as Record<string, string>,
      );
      res.json(
        ApiResponse.paginated(
          data,
          total,
          page,
          limit,
          req.headers["x-request-id"] as string,
        ),
      );
    } catch (error) {
      next(error);
    }
  }
}
