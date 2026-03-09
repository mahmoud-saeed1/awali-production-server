import { Request, Response, NextFunction } from 'express';
import { ForbiddenException } from '../errors';

type Action = 'create' | 'read' | 'update' | 'delete';

export const requirePermission = (module: string, action: Action) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user) {
      next(new ForbiddenException('Authentication required'));
      return;
    }

    const role = user.role as unknown as {
      isSystem?: boolean;
      permissions?: Record<string, Record<string, boolean>>;
    };

    // Super admin bypass — identified by isSystem flag on role
    if (role?.isSystem) {
      next();
      return;
    }

    const permissions = role?.permissions;
    if (!permissions || !permissions[module] || !permissions[module][action]) {
      next(
        new ForbiddenException(`You do not have ${action} permission on ${module}`)
      );
      return;
    }

    next();
  };
};
