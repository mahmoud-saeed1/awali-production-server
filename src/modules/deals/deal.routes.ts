import { Router } from 'express';
import { DealController } from './deal.controller';
import { auth } from '../../shared/middlewares/auth.middleware';
import { requirePermission } from '../../shared/middlewares/permission.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import { auditLog } from '../../shared/middlewares/audit.middleware';
import { createDealSchema, updateDealSchema, updateStageSchema, recordPaymentSchema } from './dtos/deal.dto';
import { idParamSchema } from '../users/dtos/user.dto';

const router = Router();
const controller = new DealController();

// Pipeline & Statistics (before :id)
router.get('/pipeline', auth(), requirePermission('deals', 'read'), controller.pipeline);
router.get('/statistics', auth(), requirePermission('deals', 'read'), controller.statistics);

// CRUD
router.get('/', auth(), requirePermission('deals', 'read'), controller.list);
router.get('/:id', auth(), requirePermission('deals', 'read'), validate(idParamSchema), controller.getById);
router.post('/', auth(), requirePermission('deals', 'create'), validate(createDealSchema), auditLog('deals', 'create'), controller.create);
router.patch('/:id', auth(), requirePermission('deals', 'update'), validate(updateDealSchema), auditLog('deals', 'update'), controller.update);
router.delete('/:id', auth(), requirePermission('deals', 'delete'), validate(idParamSchema), auditLog('deals', 'delete'), controller.remove);

// Stage & Payments
router.patch('/:id/stage', auth(), requirePermission('deals', 'update'), validate(updateStageSchema), auditLog('deals', 'update'), controller.updateStage);
router.post('/:id/payments', auth(), requirePermission('deals', 'update'), validate(recordPaymentSchema), auditLog('deals', 'update'), controller.recordPayment);

export { router as dealRoutes };
