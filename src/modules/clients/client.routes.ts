import { Router } from 'express';
import { ClientController } from './client.controller';
import { auth } from '../../shared/middlewares/auth.middleware';
import { requirePermission } from '../../shared/middlewares/permission.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import { auditLog } from '../../shared/middlewares/audit.middleware';
import { createClientSchema, updateClientSchema, updateStatusSchema, assignClientSchema } from './dtos/client.dto';
import { idParamSchema } from '../users/dtos/user.dto';

const router = Router();
const controller = new ClientController();

// Statistics (before :id routes)
router.get('/statistics', auth(), requirePermission('clients', 'read'), controller.statistics);

// CRUD
router.get('/', auth(), requirePermission('clients', 'read'), controller.list);
router.get('/:id', auth(), requirePermission('clients', 'read'), validate(idParamSchema), controller.getById);
router.post('/', auth(), requirePermission('clients', 'create'), validate(createClientSchema), auditLog('clients', 'create'), controller.create);
router.patch('/:id', auth(), requirePermission('clients', 'update'), validate(updateClientSchema), auditLog('clients', 'update'), controller.update);
router.delete('/:id', auth(), requirePermission('clients', 'delete'), validate(idParamSchema), auditLog('clients', 'delete'), controller.remove);

// Status & Assignment
router.patch('/:id/status', auth(), requirePermission('clients', 'update'), validate(updateStatusSchema), auditLog('clients', 'update'), controller.updateStatus);
router.patch('/:id/assign', auth(), requirePermission('clients', 'update'), validate(assignClientSchema), auditLog('clients', 'update'), controller.assignAgent);

// Client intelligence
router.get('/:id/timeline', auth(), requirePermission('clients', 'read'), validate(idParamSchema), controller.timeline);
router.get('/:id/matching-units', auth(), requirePermission('clients', 'read'), validate(idParamSchema), controller.matchingUnits);

export { router as clientRoutes };
