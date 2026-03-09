import { Role, IRole } from "./role.model";
import { PaginatedResult } from "../../shared/utils/query-builder";

export class RoleRepository {
  async findAll(
    queryParams: Record<string, string | undefined>,
  ): Promise<PaginatedResult<IRole>> {
    const page = Math.max(1, parseInt(queryParams.page || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(queryParams.limit || "20", 10)),
    );
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (queryParams.isActive !== undefined)
      filter.isActive = queryParams.isActive === "true";
    if (queryParams.search) {
      filter.$or = [
        { nameEn: { $regex: queryParams.search, $options: "i" } },
        { nameAr: { $regex: queryParams.search, $options: "i" } },
      ];
    }

    const sortParam = queryParams.sort || "-createdAt";
    const sort: Record<string, 1 | -1> = {};
    for (const field of sortParam.split(",")) {
      const order = field.startsWith("-") ? -1 : 1;
      sort[field.replace(/^-/, "")] = order;
    }

    const [data, total] = await Promise.all([
      Role.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Role.countDocuments(filter),
    ]);

    return { data: data as IRole[], total, page, limit };
  }

  async findById(id: string): Promise<IRole | null> {
    return Role.findById(id).lean() as Promise<IRole | null>;
  }

  async findByName(nameEn: string): Promise<IRole | null> {
    return Role.findOne({ nameEn }).lean() as Promise<IRole | null>;
  }

  async create(data: Partial<IRole>): Promise<IRole> {
    const role = await Role.create(data);
    return role.toObject() as IRole;
  }

  async update(id: string, data: Partial<IRole>): Promise<IRole | null> {
    return Role.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean() as Promise<IRole | null>;
  }

  async delete(id: string): Promise<IRole | null> {
    return Role.findByIdAndDelete(id).lean() as Promise<IRole | null>;
  }
}
