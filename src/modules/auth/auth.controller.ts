import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { ApiResponse } from '../../shared/utils/api-response';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(ApiResponse.success(result, req.headers['x-request-id'] as string));
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
      res.status(200).json(ApiResponse.success(result, req.headers['x-request-id'] as string));
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshToken(refreshToken);
      res.status(200).json(ApiResponse.success(tokens, req.headers['x-request-id'] as string));
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.logout(req.user!._id.toString());
      res.status(200).json(ApiResponse.success({ message: 'Logged out successfully' }, req.headers['x-request-id'] as string));
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.changePassword(req.user!._id.toString(), req.body);
      res.status(200).json(ApiResponse.success({ message: 'Password changed successfully' }, req.headers['x-request-id'] as string));
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await authService.getProfile(req.user!._id.toString());
      res.status(200).json(ApiResponse.success(profile, req.headers['x-request-id'] as string));
    } catch (error) {
      next(error);
    }
  }
}
