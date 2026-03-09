import { Feature } from './feature.model';
import { Unit } from '../units/unit.model';
import { NotFoundException, ConflictException, BadRequestException } from '../../shared/errors';
import { CreateFeatureDTO, UpdateFeatureDTO } from './dtos/feature.dto';

export class FeatureService {
  async findAll(queryParams: Record<string, string | undefined>) {
    const page = Math.max(1, parseInt(queryParams.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit || '50', 10)));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (queryParams.isActive !== undefined) filter.isActive = queryParams.isActive === 'true';
    if (queryParams.category) filter.category = queryParams.category;
    if (queryParams.search) {
      filter.$or = [
        { nameEn: { $regex: queryParams.search, $options: 'i' } },
        { nameAr: { $regex: queryParams.search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      Feature.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      Feature.countDocuments(filter),
    ]);
    return { data, total, page, limit };
  }

  async findById(id: string) {
    const item = await Feature.findById(id).lean();
    if (!item) throw new NotFoundException('Feature not found');
    return item;
  }

  async create(data: CreateFeatureDTO) {
    const existing = await Feature.findOne({ nameEn: data.nameEn });
    if (existing) throw new ConflictException('Feature with this English name already exists');
    return Feature.create(data);
  }

  async update(id: string, data: UpdateFeatureDTO) {
    await this.findById(id);
    if (data.nameEn) {
      const existing = await Feature.findOne({ nameEn: data.nameEn, _id: { $ne: id } });
      if (existing) throw new ConflictException('Feature with this English name already exists');
    }
    const updated = await Feature.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
    if (!updated) throw new NotFoundException('Feature not found');
    return updated;
  }

  async delete(id: string) {
    await this.findById(id);
    const unitsCount = await Unit.countDocuments({ features: id } as Record<string, unknown>);
    if (unitsCount > 0) throw new BadRequestException(`Cannot delete: ${unitsCount} unit(s) reference this feature`);
    await Feature.findByIdAndDelete(id);
  }
}
