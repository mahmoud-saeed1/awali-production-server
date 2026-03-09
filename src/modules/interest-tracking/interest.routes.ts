import { Router } from 'express';
import { InterestController } from './interest.controller';
import { auth } from '../../shared/middlewares/auth.middleware';
import { requirePermission } from '../../shared/middlewares/permission.middleware';

const router = Router();
const controller = new InterestController();

router.get('/most-viewed', auth(), requirePermission('interest_tracking', 'read'), controller.mostViewed);
router.get('/most-searched', auth(), requirePermission('interest_tracking', 'read'), controller.mostSearched);
router.get('/trending', auth(), requirePermission('interest_tracking', 'read'), controller.trending);
router.get('/heatmap', auth(), requirePermission('interest_tracking', 'read'), controller.heatmap);
router.get('/unit/:id', auth(), requirePermission('interest_tracking', 'read'), controller.unitInterest);

export { router as interestRoutes };
