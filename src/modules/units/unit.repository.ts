import { Unit, IUnit } from "./unit.model";
import {
  QueryBuilder,
  PaginatedResult,
} from "../../shared/utils/query-builder";

export class UnitRepository {
  async findAll(
    queryParams: Record<string, string | undefined>,
  ): Promise<PaginatedResult<IUnit>> {
    const qb = new QueryBuilder<IUnit>(queryParams);
    const { filter, sort, skip, limit, page } = qb
      .filter([
        "status",
        "buildingType",
        "unitType",
        "facade",
        "specifications.bedrooms",
        "specifications.bathrooms",
        "price.amount",
        "publication.isPublished",
      ])
      .search(["unitNumber", "description.en", "description.ar"])
      .sort("-createdAt")
      .paginate(100)
      .build();

    const [data, total] = await Promise.all([
      Unit.find(filter)
        .populate("buildingType", "nameEn nameAr icon")
        .populate("unitType", "nameEn nameAr icon")
        .populate("features", "nameEn nameAr category icon")
        .populate("createdBy", "name email")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Unit.countDocuments(filter),
    ]);

    return { data: data as IUnit[], total, page, limit };
  }

  async findById(id: string): Promise<IUnit | null> {
    return Unit.findById(id)
      .populate("buildingType", "nameEn nameAr icon")
      .populate("unitType", "nameEn nameAr icon")
      .populate("features", "nameEn nameAr category icon")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .lean() as Promise<IUnit | null>;
  }

  async create(data: Partial<IUnit>): Promise<IUnit> {
    const unit = await Unit.create(data);
    return this.findById(unit._id.toString()) as Promise<IUnit>;
  }

  async update(id: string, data: Partial<IUnit>): Promise<IUnit | null> {
    await Unit.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    return this.findById(id);
  }

  async softDelete(id: string): Promise<IUnit | null> {
    return Unit.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true },
    ).lean() as Promise<IUnit | null>;
  }

  async getStatistics(): Promise<Record<string, number>> {
    const pipeline = await Unit.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const stats: Record<string, number> = {
      total: 0,
      available: 0,
      reserved: 0,
      under_contract: 0,
      sold: 0,
      maintenance: 0,
    };
    for (const item of pipeline) {
      stats[item._id] = item.count;
      stats.total += item.count;
    }
    return stats;
  }
}
