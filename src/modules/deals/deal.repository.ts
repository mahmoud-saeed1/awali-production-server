import { Deal, IDeal } from "./deal.model";
import {
  QueryBuilder,
  PaginatedResult,
} from "../../shared/utils/query-builder";

export class DealRepository {
  async findAll(
    queryParams: Record<string, string | undefined>,
  ): Promise<PaginatedResult<IDeal>> {
    const qb = new QueryBuilder<IDeal>(queryParams);
    const { filter, sort, skip, limit, page } = qb
      .filter(["stage", "assignedTo", "client", "unit", "value.amount"])
      .search(["title"])
      .sort("-createdAt")
      .paginate(100)
      .build();

    const [data, total] = await Promise.all([
      Deal.find(filter)
        .populate("client", "name email phone status")
        .populate("unit", "unitNumber price status")
        .populate("assignedTo", "name email")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Deal.countDocuments(filter),
    ]);

    return { data: data as IDeal[], total, page, limit };
  }

  async findById(id: string): Promise<IDeal | null> {
    return Deal.findById(id)
      .populate("client", "name email phone status budget")
      .populate("unit", "unitNumber price status buildingType unitType")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .lean() as Promise<IDeal | null>;
  }

  async create(data: Partial<IDeal>): Promise<IDeal> {
    const deal = await Deal.create(data);
    return this.findById(deal._id.toString()) as Promise<IDeal>;
  }

  async update(id: string, data: Partial<IDeal>): Promise<IDeal | null> {
    await Deal.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    return this.findById(id);
  }

  async softDelete(id: string): Promise<IDeal | null> {
    return Deal.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true },
    ).lean() as Promise<IDeal | null>;
  }

  async getPipelineSummary(): Promise<Record<string, unknown>[]> {
    return Deal.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      {
        $group: {
          _id: "$stage",
          count: { $sum: 1 },
          totalValue: { $sum: "$value.amount" },
          avgValue: { $avg: "$value.amount" },
          avgProbability: { $avg: "$probability" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  async getStatistics(): Promise<Record<string, unknown>> {
    const [pipeline, totals] = await Promise.all([
      this.getPipelineSummary(),
      Deal.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        {
          $group: {
            _id: null,
            totalDeals: { $sum: 1 },
            totalValue: { $sum: "$value.amount" },
            wonValue: {
              $sum: {
                $cond: [{ $eq: ["$stage", "closed_won"] }, "$value.amount", 0],
              },
            },
            lostCount: {
              $sum: { $cond: [{ $eq: ["$stage", "closed_lost"] }, 1, 0] },
            },
            wonCount: {
              $sum: { $cond: [{ $eq: ["$stage", "closed_won"] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    const stats = totals[0] || {
      totalDeals: 0,
      totalValue: 0,
      wonValue: 0,
      lostCount: 0,
      wonCount: 0,
    };
    return {
      ...stats,
      pipeline,
      winRate:
        stats.totalDeals > 0
          ? ((stats.wonCount / stats.totalDeals) * 100).toFixed(1)
          : "0",
    };
  }
}
