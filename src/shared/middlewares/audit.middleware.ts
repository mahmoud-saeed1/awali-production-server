import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../../modules/audit-logs/audit-log.model';

type AuditAction = 'create' | 'update' | 'delete';

export const auditLog = (resourceType: string, action: AuditAction) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const originalJson = res.json.bind(res);

    res.json = (body: unknown): Response => {
      const typedBody = body as { data?: { id?: string } } | undefined;
      if (res.statusCode >= 200 && res.statusCode < 300) {
        AuditLog.create({
          action,
          resourceType,
          resourceId: String(req.params.id) || typedBody?.data?.id || 'unknown',
          userId: req.user?._id,
          before: (req as unknown as Record<string, unknown>)._auditBefore || null,
          after: action === 'delete' ? null : typedBody?.data || null,
          changes: action === 'update' ? req.body : null,
          ipAddress: req.ip,
          userAgent: (req.headers['user-agent'] as string) || '',
        } as Record<string, unknown>).catch(() => {});
      }

      return originalJson(body);
    };

    next();
  };
};
