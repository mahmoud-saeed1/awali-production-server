import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { UnauthorizedException } from '../errors';
import { User } from '../../modules/users/user.model';

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: InstanceType<typeof User>;
    }
  }
}

export const auth = () => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Access token is required');
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException('Access token is required');
      }

      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

      const user = await User.findById(decoded.userId).populate('role');
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('Account is deactivated');
      }

      if (user.lockedUntil && user.lockedUntil > new Date()) {
        throw new UnauthorizedException('Account is temporarily locked');
      }

      req.user = user;
      next();
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        next(error);
        return;
      }
      if (error instanceof jwt.JsonWebTokenError) {
        next(new UnauthorizedException('Invalid access token'));
        return;
      }
      if (error instanceof jwt.TokenExpiredError) {
        next(new UnauthorizedException('Access token has expired'));
        return;
      }
      next(error);
    }
  };
};
