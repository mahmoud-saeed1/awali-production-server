import { User, IUser } from "./user.model";
import {
  QueryBuilder,
  PaginatedResult,
} from "../../shared/utils/query-builder";

export class UserRepository {
  async findAll(
    queryParams: Record<string, string | undefined>,
  ): Promise<PaginatedResult<IUser>> {
    const qb = new QueryBuilder<IUser>(queryParams);
    const { filter, sort, skip, limit, page } = qb
      .filter(["role", "isActive"])
      .search(["name.en", "name.ar", "email"])
      .sort("-createdAt")
      .paginate(100)
      .build();

    const [data, total] = await Promise.all([
      User.find(filter)
        .populate("role", "nameEn nameAr permissions isSystem isActive")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return { data: data as IUser[], total, page, limit };
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id)
      .populate("role", "nameEn nameAr permissions isSystem isActive")
      .lean() as Promise<IUser | null>;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email })
      .populate("role", "nameEn nameAr permissions isSystem isActive")
      .lean() as Promise<IUser | null>;
  }

  async create(data: Partial<IUser>): Promise<IUser> {
    const user = await User.create(data);
    return User.findById(user._id)
      .populate("role", "nameEn nameAr permissions isSystem isActive")
      .lean() as Promise<IUser>;
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate("role", "nameEn nameAr permissions isSystem isActive")
      .lean() as Promise<IUser | null>;
  }

  async softDelete(id: string): Promise<IUser | null> {
    return User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    ).lean() as Promise<IUser | null>;
  }

  async count(filter?: Record<string, unknown>): Promise<number> {
    return User.countDocuments(filter || {});
  }
}
