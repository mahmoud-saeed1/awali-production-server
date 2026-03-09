import { Client, IClient } from "./client.model";
import {
  QueryBuilder,
  PaginatedResult,
} from "../../shared/utils/query-builder";

export class ClientRepository {
  async findAll(
    queryParams: Record<string, string | undefined>,
  ): Promise<PaginatedResult<IClient>> {
    const qb = new QueryBuilder<IClient>(queryParams);
    const { filter, sort, skip, limit, page } = qb
      .filter(["status", "type", "source", "rating", "assignedTo"])
      .search(["name.en", "name.ar", "email", "phone"])
      .sort("-createdAt")
      .paginate(100)
      .build();

    const [data, total] = await Promise.all([
      Client.find(filter)
        .populate("assignedTo", "name email")
        .populate("interestedIn", "unitNumber price status")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Client.countDocuments(filter),
    ]);

    return { data: data as IClient[], total, page, limit };
  }

  async findById(id: string): Promise<IClient | null> {
    return Client.findById(id)
      .populate("assignedTo", "name email")
      .populate("interestedIn", "unitNumber price status")
      .populate("createdBy", "name email")
      .lean() as Promise<IClient | null>;
  }

  async create(data: Partial<IClient>): Promise<IClient> {
    const client = await Client.create(data);
    return this.findById(client._id.toString()) as Promise<IClient>;
  }

  async update(id: string, data: Partial<IClient>): Promise<IClient | null> {
    await Client.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    return this.findById(id);
  }

  async softDelete(id: string): Promise<IClient | null> {
    return Client.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true },
    ).lean() as Promise<IClient | null>;
  }

  async getStatistics(): Promise<Record<string, number>> {
    const pipeline = await Client.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const stats: Record<string, number> = { total: 0 };
    for (const item of pipeline) {
      stats[item._id] = item.count;
      stats.total += item.count;
    }
    return stats;
  }
}
