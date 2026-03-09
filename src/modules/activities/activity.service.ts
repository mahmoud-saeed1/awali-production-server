import { Activity, IActivity } from './activity.model';
import { QueryBuilder } from '../../shared/utils/query-builder';
import mongoose from 'mongoose';

export class ActivityService {
  async findAll(queryParams: Record<string, string | undefined>) {
    const qb = new QueryBuilder<IActivity>(queryParams);
    const { filter, sort, skip, limit, page } = qb
      .filter(['type', 'client', 'deal', 'unit', 'performedBy'])
      .sort('-createdAt')
      .paginate(100)
      .build();

    const [data, total] = await Promise.all([
      Activity.find(filter)
        .populate('client', 'name')
        .populate('deal', 'title stage')
        .populate('unit', 'unitNumber')
        .populate('performedBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Activity.countDocuments(filter),
    ]);

    return { data: data as IActivity[], total, page, limit };
  }

  async findById(id: string) {
    return Activity.findById(id)
      .populate('client', 'name')
      .populate('deal', 'title stage')
      .populate('unit', 'unitNumber')
      .populate('performedBy', 'name email')
      .lean();
  }

  async create(data: {
    type: string;
    description: string;
    metadata?: Record<string, unknown>;
    client?: string;
    deal?: string;
    unit?: string;
    performedBy: string;
  }) {
    const activity = await Activity.create({
      ...data,
      performedBy: new mongoose.Types.ObjectId(data.performedBy),
      client: data.client ? new mongoose.Types.ObjectId(data.client) : undefined,
      deal: data.deal ? new mongoose.Types.ObjectId(data.deal) : undefined,
      unit: data.unit ? new mongoose.Types.ObjectId(data.unit) : undefined,
    });
    return this.findById(activity._id.toString());
  }

  async getByClient(clientId: string, queryParams: Record<string, string | undefined>) {
    const qb = new QueryBuilder<IActivity>(queryParams);
    const { sort, skip, limit, page } = qb.sort('-createdAt').paginate(100).build();

    const filter = { client: new mongoose.Types.ObjectId(clientId) };
    const [data, total] = await Promise.all([
      Activity.find(filter)
        .populate('performedBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Activity.countDocuments(filter),
    ]);

    return { data: data as IActivity[], total, page, limit };
  }
}
