import { DealRepository } from './deal.repository';
import { Deal, STAGE_PROBABILITY } from './deal.model';
import { Unit } from '../units/unit.model';
import { NotFoundException, BadRequestException } from '../../shared/errors';
import { CreateDealDTO, UpdateDealDTO } from './dtos/deal.dto';
import mongoose from 'mongoose';

export class DealService {
  private dealRepository = new DealRepository();

  async findAll(queryParams: Record<string, string | undefined>) {
    return this.dealRepository.findAll(queryParams);
  }

  async findById(id: string) {
    const deal = await this.dealRepository.findById(id);
    if (!deal) throw new NotFoundException('Deal not found');
    return deal;
  }

  async create(data: CreateDealDTO, userId: string) {
    return this.dealRepository.create({
      ...data,
      client: new mongoose.Types.ObjectId(data.client),
      unit: new mongoose.Types.ObjectId(data.unit),
      assignedTo: new mongoose.Types.ObjectId(data.assignedTo),
      probability: STAGE_PROBABILITY[data.stage || 'inquiry'] ?? 10,
      createdBy: new mongoose.Types.ObjectId(userId),
    } as unknown as Record<string, unknown>);
  }

  async update(id: string, data: UpdateDealDTO, userId: string) {
    await this.findById(id);
    return this.dealRepository.update(id, {
      ...data,
      updatedBy: new mongoose.Types.ObjectId(userId),
    } as unknown as Record<string, unknown>);
  }

  async softDelete(id: string) {
    await this.findById(id);
    return this.dealRepository.softDelete(id);
  }

  async updateStage(id: string, stage: string, lostReason: string | undefined, userId: string) {
    const deal = await this.findById(id);

    const updateData: Record<string, unknown> = {
      stage,
      probability: STAGE_PROBABILITY[stage] ?? 0,
      updatedBy: new mongoose.Types.ObjectId(userId),
    };

    if (stage === 'closed_lost' && lostReason) updateData.lostReason = lostReason;
    if (stage === 'closed_won' || stage === 'closed_lost') updateData.actualCloseDate = new Date();

    const updatedDeal = await this.dealRepository.update(id, updateData as unknown as Record<string, unknown>);

    // Sync unit status based on deal stage
    const unitId = (deal as unknown as { unit: { _id: mongoose.Types.ObjectId } }).unit?._id || deal.unit;
    if (unitId) {
      if (stage === 'contract') {
        await Unit.findByIdAndUpdate(unitId, { status: 'reserved' });
      } else if (stage === 'closed_won') {
        await Unit.findByIdAndUpdate(unitId, { status: 'sold' });
      } else if (stage === 'closed_lost') {
        // Only revert to available if no other active deals exist for this unit
        const activeDeals = await Deal.countDocuments({
          unit: unitId,
          _id: { $ne: id },
          stage: { $nin: ['closed_won', 'closed_lost'] },
          isDeleted: { $ne: true },
        });
        if (activeDeals === 0) await Unit.findByIdAndUpdate(unitId, { status: 'available' });
      }
    }

    return updatedDeal;
  }

  async recordPayment(id: string, payment: { amount: number; date: Date; method: string; reference?: string; notes?: string }, userId: string) {
    await this.findById(id);

    await Deal.findByIdAndUpdate(id, {
      $push: { payments: payment },
      updatedBy: new mongoose.Types.ObjectId(userId),
    });

    return this.dealRepository.findById(id);
  }

  async getPipelineSummary() {
    return this.dealRepository.getPipelineSummary();
  }

  async getStatistics() {
    return this.dealRepository.getStatistics();
  }
}
