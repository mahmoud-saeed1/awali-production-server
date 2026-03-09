import { BuildingType, IBuildingType } from './building-type.model';
import { Unit } from '../units/unit.model';
import { NotFoundException, ConflictException, BadRequestException } from '../../shared/errors';
import { CreateBuildingTypeDTO, UpdateBuildingTypeDTO } from './dtos/building-type.dto';

export class BuildingTypeService {
  async findAll(queryParams: Record<string, string | undefined>) {
    const page = Math.max(1, parseInt(queryParams.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit || '50', 10)));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (queryParams.isActive !== undefined) filter.isActive = queryParams.isActive === 'true';
    if (queryParams.search) {
      filter.$or = [
        { nameEn: { $regex: queryParams.search, $options: 'i' } },
        { nameAr: { $regex: queryParams.search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      BuildingType.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      BuildingType.countDocuments(filter),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string) {
    const item = await BuildingType.findById(id).lean();
    if (!item) throw new NotFoundException('Building type not found');
    return item;
  }

  async create(data: CreateBuildingTypeDTO) {
    const existing = await BuildingType.findOne({ nameEn: data.nameEn });
    if (existing) throw new ConflictException('Building type with this English name already exists');
    return BuildingType.create(data);
  }

  async update(id: string, data: UpdateBuildingTypeDTO) {
    await this.findById(id);
    if (data.nameEn) {
      const existing = await BuildingType.findOne({ nameEn: data.nameEn, _id: { $ne: id } });
      if (existing) throw new ConflictException('Building type with this English name already exists');
    }
    const updated = await BuildingType.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
    if (!updated) throw new NotFoundException('Building type not found');
    return updated;
  }

  async delete(id: string) {
    await this.findById(id);
    const unitsCount = await Unit.countDocuments({ buildingType: id });
    if (unitsCount > 0) {
      throw new BadRequestException(`Cannot delete: ${unitsCount} unit(s) reference this building type`);
    }
    await BuildingType.findByIdAndDelete(id);
  }
}
