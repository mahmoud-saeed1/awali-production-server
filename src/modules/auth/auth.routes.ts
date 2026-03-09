import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../shared/middlewares/validate.middleware';
import { auth } from '../../shared/middlewares/auth.middleware';
import { authLimiter } from '../../shared/middlewares/rateLimit.middleware';
import { registerSchema, loginSchema, changePasswordSchema, refreshTokenSchema } from './dtos/auth.dto';

const router = Router();
const controller = new AuthController();

router.post('/register', authLimiter, validate(registerSchema), controller.register);
router.post('/login', authLimiter, validate(loginSchema), controller.login);
router.post('/refresh', validate(refreshTokenSchema), controller.refreshToken);
router.post('/logout', auth(), controller.logout);
router.post('/change-password', auth(), validate(changePasswordSchema), controller.changePassword);
router.get('/me', auth(), controller.me);

export { router as authRoutes };
