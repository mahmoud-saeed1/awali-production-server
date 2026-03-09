import { Router } from 'express';
import { RoleController } from './role.controller';
import { auth } from '../../shared/middlewares/auth.middleware';
import { requirePermission } from '../../shared/middlewares/permission.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import { auditLog } from '../../shared/middlewares/audit.middleware';
import { createRoleSchema, updateRoleSchema } from './dtos/role.dto';
import { idParamSchema } from '../users/dtos/user.dto';

const router = Router();
const controller = new RoleController();

router.get('/', auth(), requirePermission('roles', 'read'), controller.list);
router.get('/:id', auth(), requirePermission('roles', 'read'), validate(idParamSchema), controller.getById);
router.post('/', auth(), requirePermission('roles', 'create'), validate(createRoleSchema), auditLog('roles', 'create'), controller.create);
router.patch('/:id', auth(), requirePermission('roles', 'update'), validate(updateRoleSchema), auditLog('roles', 'update'), controller.update);
router.delete('/:id', auth(), requirePermission('roles', 'delete'), validate(idParamSchema), auditLog('roles', 'delete'), controller.remove);

export { router as roleRoutes };
