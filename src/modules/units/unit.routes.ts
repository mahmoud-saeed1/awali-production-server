import { Router } from 'express';
import { UnitController } from './unit.controller';
import { auth } from '../../shared/middlewares/auth.middleware';
import { requirePermission } from '../../shared/middlewares/permission.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import { auditLog } from '../../shared/middlewares/audit.middleware';
import { trackUnitView, trackUnitSearch } from '../../shared/middlewares/interest.middleware';
import { uploadImages, uploadDocument } from '../../shared/middlewares/upload.middleware';
import { createUnitSchema, updateUnitSchema, updateStatusSchema, publishSchema, reorderImagesSchema } from './dtos/unit.dto';
import { idParamSchema } from '../users/dtos/user.dto';

const router = Router();
const controller = new UnitController();

// Statistics (before :id routes)
router.get('/statistics', auth(), requirePermission('units', 'read'), controller.statistics);
router.get('/most-viewed', auth(), requirePermission('units', 'read'), controller.mostViewed);

// CRUD
router.get('/', auth(), requirePermission('units', 'read'), trackUnitSearch, controller.list);
router.get('/:id', auth(), requirePermission('units', 'read'), validate(idParamSchema), trackUnitView, controller.getById);
router.post('/', auth(), requirePermission('units', 'create'), validate(createUnitSchema), auditLog('units', 'create'), controller.create);
router.patch('/:id', auth(), requirePermission('units', 'update'), validate(updateUnitSchema), auditLog('units', 'update'), controller.update);
router.delete('/:id', auth(), requirePermission('units', 'delete'), validate(idParamSchema), auditLog('units', 'delete'), controller.remove);

// Status & Publish
router.patch('/:id/status', auth(), requirePermission('units', 'update'), validate(updateStatusSchema), auditLog('units', 'update'), controller.updateStatus);
router.patch('/:id/publish', auth(), requirePermission('units', 'update'), validate(publishSchema), auditLog('units', 'update'), controller.publish);

// Media
router.post('/:id/images', auth(), requirePermission('units', 'update'), uploadImages, controller.uploadImages);
router.delete('/:id/images', auth(), requirePermission('units', 'update'), controller.deleteImage);
router.patch('/:id/images/reorder', auth(), requirePermission('units', 'update'), validate(reorderImagesSchema), controller.reorderImages);
router.post('/:id/documents', auth(), requirePermission('units', 'update'), uploadDocument, controller.uploadDocument);

export { router as unitRoutes };
