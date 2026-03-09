import { Router } from 'express';
import { FeatureController } from './feature.controller';
import { auth } from '../../shared/middlewares/auth.middleware';
import { requirePermission } from '../../shared/middlewares/permission.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import { auditLog } from '../../shared/middlewares/audit.middleware';
import { createFeatureSchema, updateFeatureSchema } from './dtos/feature.dto';
import { idParamSchema } from '../users/dtos/user.dto';

const router = Router();
const controller = new FeatureController();

router.get('/', auth(), requirePermission('features', 'read'), controller.list);
router.get('/:id', auth(), requirePermission('features', 'read'), validate(idParamSchema), controller.getById);
router.post('/', auth(), requirePermission('features', 'create'), validate(createFeatureSchema), auditLog('features', 'create'), controller.create);
router.patch('/:id', auth(), requirePermission('features', 'update'), validate(updateFeatureSchema), auditLog('features', 'update'), controller.update);
router.delete('/:id', auth(), requirePermission('features', 'delete'), validate(idParamSchema), auditLog('features', 'delete'), controller.remove);

export { router as featureRoutes };
