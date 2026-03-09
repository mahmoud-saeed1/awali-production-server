import { Router } from 'express';
import { UnitTypeController } from './unit-type.controller';
import { auth } from '../../shared/middlewares/auth.middleware';
import { requirePermission } from '../../shared/middlewares/permission.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import { auditLog } from '../../shared/middlewares/audit.middleware';
import { createUnitTypeSchema, updateUnitTypeSchema } from './dtos/unit-type.dto';
import { idParamSchema } from '../users/dtos/user.dto';

const router = Router();
const controller = new UnitTypeController();

router.get('/', auth(), requirePermission('unit_types', 'read'), controller.list);
router.get('/:id', auth(), requirePermission('unit_types', 'read'), validate(idParamSchema), controller.getById);
router.post('/', auth(), requirePermission('unit_types', 'create'), validate(createUnitTypeSchema), auditLog('unit_types', 'create'), controller.create);
router.patch('/:id', auth(), requirePermission('unit_types', 'update'), validate(updateUnitTypeSchema), auditLog('unit_types', 'update'), controller.update);
router.delete('/:id', auth(), requirePermission('unit_types', 'delete'), validate(idParamSchema), auditLog('unit_types', 'delete'), controller.remove);

export { router as unitTypeRoutes };
