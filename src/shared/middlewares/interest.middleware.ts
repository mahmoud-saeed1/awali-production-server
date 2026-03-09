import { Request, Response, NextFunction } from 'express';
import { InterestLog } from '../../modules/interest-tracking/interest.model';

export const trackUnitView = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const unitId = String(req.params.id);
    const userId = req.user?._id;
    if (unitId && userId) {
      InterestLog.create({
        type: 'view',
        unit: unitId,
        userId,
        ipAddress: req.ip,
        userAgent: (req.headers['user-agent'] as string) || '',
      } as Record<string, unknown>).catch(() => {});
    }
  } catch {
    // Never block the request
  }
  next();
};

export const trackUnitSearch = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const userId = req.user?._id;
    const searchQuery = req.query.search as string;
    const filters = { ...req.query };
    delete filters.page;
    delete filters.limit;
    delete filters.sort;
    delete filters.fields;
    delete filters.search;

    if (userId && (searchQuery || Object.keys(filters).length > 0)) {
      InterestLog.create({
        type: 'search',
        userId,
        searchQuery: searchQuery || '',
        searchFilters: filters,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      }).catch(() => {});
    }
  } catch {
    // Never block the request
  }
  next();
};
