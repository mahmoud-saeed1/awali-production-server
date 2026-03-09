import { Communication, ICommunication } from './communication.model';
import { QueryBuilder } from '../../shared/utils/query-builder';
import { CreateCommunicationDTO } from './dtos/communication.dto';
import mongoose from 'mongoose';

export class CommunicationService {
  async findAll(queryParams: Record<string, string | undefined>) {
    const qb = new QueryBuilder<ICommunication>(queryParams);
    const { filter, sort, skip, limit, page } = qb
      .filter(['client', 'type', 'direction', 'outcome', 'performedBy'])
      .sort('-createdAt')
      .paginate(100)
      .build();

    const [data, total] = await Promise.all([
      Communication.find(filter)
        .populate('client', 'name email phone')
        .populate('performedBy', 'name email')
        .populate('relatedDeal', 'title stage')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Communication.countDocuments(filter),
    ]);

    return { data: data as ICommunication[], total, page, limit };
  }

  async create(data: CreateCommunicationDTO, userId: string) {
    const comm = await Communication.create({
      ...data,
      performedBy: new mongoose.Types.ObjectId(userId),
    });

    return Communication.findById(comm._id)
      .populate('client', 'name email phone')
      .populate('performedBy', 'name email')
      .lean();
  }

  async getByClient(clientId: string, queryParams: Record<string, string | undefined>) {
    const qb = new QueryBuilder<ICommunication>(queryParams);
    const { sort, skip, limit, page } = qb.sort('-createdAt').paginate(100).build();

    const filter = { client: new mongoose.Types.ObjectId(clientId) };
    const [data, total] = await Promise.all([
      Communication.find(filter)
        .populate('performedBy', 'name email')
        .populate('relatedDeal', 'title stage')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Communication.countDocuments(filter),
    ]);

    return { data: data as ICommunication[], total, page, limit };
  }
}
