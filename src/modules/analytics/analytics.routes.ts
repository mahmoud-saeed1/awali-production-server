import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { auth } from '../../shared/middlewares/auth.middleware';
import { requirePermission } from '../../shared/middlewares/permission.middleware';

const router = Router();
const controller = new AnalyticsController();

router.get('/dashboard', auth(), requirePermission('analytics', 'read'), controller.dashboard);
router.get('/sales', auth(), requirePermission('analytics', 'read'), controller.sales);
router.get('/pipeline', auth(), requirePermission('analytics', 'read'), controller.pipeline);
router.get('/agents', auth(), requirePermission('analytics', 'read'), controller.agents);
router.get('/clients', auth(), requirePermission('analytics', 'read'), controller.clients);
router.get('/units', auth(), requirePermission('analytics', 'read'), controller.units);

export { router as analyticsRoutes };
