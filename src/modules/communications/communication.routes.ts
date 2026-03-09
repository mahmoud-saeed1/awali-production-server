import { Router } from 'express';
import { CommunicationController } from './communication.controller';
import { auth } from '../../shared/middlewares/auth.middleware';
import { requirePermission } from '../../shared/middlewares/permission.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import { createCommunicationSchema } from './dtos/communication.dto';

const router = Router();
const controller = new CommunicationController();

router.get('/', auth(), requirePermission('communications', 'read'), controller.list);
router.post('/', auth(), requirePermission('communications', 'create'), validate(createCommunicationSchema), controller.create);
router.get('/client/:clientId', auth(), requirePermission('communications', 'read'), controller.getByClient);

export { router as communicationRoutes };
