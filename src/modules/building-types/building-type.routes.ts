import { Router } from 'express';
import { BuildingTypeController } from './building-type.controller';
import { auth } from '../../shared/middlewares/auth.middleware';
import { requirePermission } from '../../shared/middlewares/permission.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import { auditLog } from '../../shared/middlewares/audit.middleware';
import { createBuildingTypeSchema, updateBuildingTypeSchema } from './dtos/building-type.dto';
import { idParamSchema } from '../users/dtos/user.dto';

const router = Router();
const controller = new BuildingTypeController();

router.get('/', auth(), requirePermission('building_types', 'read'), controller.list);
router.get('/:id', auth(), requirePermission('building_types', 'read'), validate(idParamSchema), controller.getById);
router.post('/', auth(), requirePermission('building_types', 'create'), validate(createBuildingTypeSchema), auditLog('building_types', 'create'), controller.create);
router.patch('/:id', auth(), requirePermission('building_types', 'update'), validate(updateBuildingTypeSchema), auditLog('building_types', 'update'), controller.update);
router.delete('/:id', auth(), requirePermission('building_types', 'delete'), validate(idParamSchema), auditLog('building_types', 'delete'), controller.remove);

export { router as buildingTypeRoutes };
