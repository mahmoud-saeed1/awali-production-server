import { UnitType } from './unit-type.model';
import { Unit } from '../units/unit.model';
import { NotFoundException, ConflictException, BadRequestException } from '../../shared/errors';
import { CreateUnitTypeDTO, UpdateUnitTypeDTO } from './dtos/unit-type.dto';

export class UnitTypeService {
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
      UnitType.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      UnitType.countDocuments(filter),
    ]);
    return { data, total, page, limit };
  }

  async findById(id: string) {
    const item = await UnitType.findById(id).lean();
    if (!item) throw new NotFoundException('Unit type not found');
    return item;
  }

  async create(data: CreateUnitTypeDTO) {
    const existing = await UnitType.findOne({ nameEn: data.nameEn });
    if (existing) throw new ConflictException('Unit type with this English name already exists');
    return UnitType.create(data);
  }

  async update(id: string, data: UpdateUnitTypeDTO) {
    await this.findById(id);
    if (data.nameEn) {
      const existing = await UnitType.findOne({ nameEn: data.nameEn, _id: { $ne: id } });
      if (existing) throw new ConflictException('Unit type with this English name already exists');
    }
    const updated = await UnitType.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
    if (!updated) throw new NotFoundException('Unit type not found');
    return updated;
  }

  async delete(id: string) {
    await this.findById(id);
    const unitsCount = await Unit.countDocuments({ unitType: id });
    if (unitsCount > 0) throw new BadRequestException(`Cannot delete: ${unitsCount} unit(s) reference this unit type`);
    await UnitType.findByIdAndDelete(id);
  }
}
