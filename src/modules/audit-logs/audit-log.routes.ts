import { Router } from 'express';
import { AuditLogController } from './audit-log.controller';
import { auth } from '../../shared/middlewares/auth.middleware';
import { requirePermission } from '../../shared/middlewares/permission.middleware';

const router = Router();
const controller = new AuditLogController();

router.get('/', auth(), requirePermission('audit_logs', 'read'), controller.list);
router.get('/resource/:type/:id', auth(), requirePermission('audit_logs', 'read'), controller.getByResource);
router.get('/user/:id', auth(), requirePermission('audit_logs', 'read'), controller.getByUser);

export { router as auditLogRoutes };
