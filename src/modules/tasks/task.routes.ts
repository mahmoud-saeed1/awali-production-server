import { Router } from 'express';
import { TaskController } from './task.controller';
import { auth } from '../../shared/middlewares/auth.middleware';
import { requirePermission } from '../../shared/middlewares/permission.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import { auditLog } from '../../shared/middlewares/audit.middleware';
import { createTaskSchema, updateTaskSchema, completeTaskSchema } from './dtos/task.dto';
import { idParamSchema } from '../users/dtos/user.dto';

const router = Router();
const controller = new TaskController();

// Special (before :id)
router.get('/my-tasks', auth(), requirePermission('tasks', 'read'), controller.myTasks);
router.get('/overdue', auth(), requirePermission('tasks', 'read'), controller.overdue);

// CRUD
router.get('/', auth(), requirePermission('tasks', 'read'), controller.list);
router.get('/:id', auth(), requirePermission('tasks', 'read'), validate(idParamSchema), controller.getById);
router.post('/', auth(), requirePermission('tasks', 'create'), validate(createTaskSchema), auditLog('tasks', 'create'), controller.create);
router.patch('/:id', auth(), requirePermission('tasks', 'update'), validate(updateTaskSchema), auditLog('tasks', 'update'), controller.update);
router.delete('/:id', auth(), requirePermission('tasks', 'delete'), validate(idParamSchema), auditLog('tasks', 'delete'), controller.remove);

// Complete
router.patch('/:id/complete', auth(), requirePermission('tasks', 'update'), validate(completeTaskSchema), auditLog('tasks', 'update'), controller.complete);

export { router as taskRoutes };
