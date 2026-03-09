import { Router } from 'express';
import { ActivityController } from './activity.controller';
import { auth } from '../../shared/middlewares/auth.middleware';
import { requirePermission } from '../../shared/middlewares/permission.middleware';

const router = Router();
const controller = new ActivityController();

router.get('/', auth(), requirePermission('activities', 'read'), controller.list);
router.get('/client/:clientId', auth(), requirePermission('activities', 'read'), controller.getByClient);
router.get('/:id', auth(), requirePermission('activities', 'read'), controller.getById);
router.post('/', auth(), requirePermission('activities', 'create'), controller.create);

export { router as activityRoutes };
