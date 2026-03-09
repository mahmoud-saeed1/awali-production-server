import { Router } from 'express';
import { DocumentController } from './document.controller';
import { auth } from '../../shared/middlewares/auth.middleware';
import { requirePermission } from '../../shared/middlewares/permission.middleware';
import { auditLog } from '../../shared/middlewares/audit.middleware';
import { uploadDocument } from '../../shared/middlewares/upload.middleware';
import { idParamSchema } from '../users/dtos/user.dto';
import { validate } from '../../shared/middlewares/validate.middleware';

const router = Router();
const controller = new DocumentController();

router.get('/', auth(), requirePermission('documents', 'read'), controller.list);
router.post('/', auth(), requirePermission('documents', 'create'), uploadDocument, auditLog('documents', 'create'), controller.create);
router.delete('/:id', auth(), requirePermission('documents', 'delete'), validate(idParamSchema), auditLog('documents', 'delete'), controller.remove);

export { router as documentRoutes };
