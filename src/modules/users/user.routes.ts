import { Router } from 'express';
import { UserController } from './user.controller';
import { auth } from '../../shared/middlewares/auth.middleware';
import { requirePermission } from '../../shared/middlewares/permission.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import { auditLog } from '../../shared/middlewares/audit.middleware';
import { createUserSchema, updateUserSchema, idParamSchema, listQuerySchema } from './dtos/user.dto';

const router = Router();
const controller = new UserController();

router.get('/', auth(), requirePermission('users', 'read'), validate(listQuerySchema), controller.list);
router.get('/:id', auth(), requirePermission('users', 'read'), validate(idParamSchema), controller.getById);
router.post('/', auth(), requirePermission('users', 'create'), validate(createUserSchema), auditLog('users', 'create'), controller.create);
router.patch('/:id', auth(), requirePermission('users', 'update'), validate(updateUserSchema), auditLog('users', 'update'), controller.update);
router.delete('/:id', auth(), requirePermission('users', 'delete'), validate(idParamSchema), auditLog('users', 'delete'), controller.remove);
router.post('/:id/activate', auth(), requirePermission('users', 'update'), validate(idParamSchema), auditLog('users', 'update'), controller.activate);
router.post('/:id/deactivate', auth(), requirePermission('users', 'update'), validate(idParamSchema), auditLog('users', 'update'), controller.deactivate);

export { router as userRoutes };
