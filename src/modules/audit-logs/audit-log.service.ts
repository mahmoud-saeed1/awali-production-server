import { AuditLog, IAuditLog } from './audit-log.model';
import { QueryBuilder } from '../../shared/utils/query-builder';
import mongoose from 'mongoose';

export class AuditLogService {
  // Used by middleware — fire & forget
  static async create(data: {
    action: string;
    resourceType: string;
    resourceId: string;
    userId: string;
    before?: Record<string, unknown> | null;
    after?: Record<string, unknown> | null;
    changes?: Record<string, unknown> | null;
    ipAddress?: string;
    userAgent?: string;
  }) {
    await AuditLog.create({
      ...data,
      userId: new mongoose.Types.ObjectId(data.userId),
    } as Record<string, unknown>);
  }

  async findAll(queryParams: Record<string, string | undefined>) {
    const qb = new QueryBuilder<IAuditLog>(queryParams);
    const { filter, sort, skip, limit, page } = qb
      .filter(['action', 'resourceType', 'userId'])
      .sort('-createdAt')
      .paginate(100)
      .build();

    const [data, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('userId', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    return { data: data as IAuditLog[], total, page, limit };
  }

  async getByResource(resourceType: string, resourceId: string) {
    return AuditLog.find({ resourceType, resourceId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
  }

  async getByUser(userId: string, queryParams: Record<string, string | undefined>) {
    const qb = new QueryBuilder<IAuditLog>(queryParams);
    const { sort, skip, limit, page } = qb.sort('-createdAt').paginate(100).build();

    const filter = { userId: new mongoose.Types.ObjectId(userId) };
    const [data, total] = await Promise.all([
      AuditLog.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    return { data: data as IAuditLog[], total, page, limit };
  }
}
