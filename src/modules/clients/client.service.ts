import { ClientRepository } from './client.repository';
import { Client, IClient } from './client.model';
import { Unit } from '../units/unit.model';
import { Activity } from '../activities/activity.model';
import { Communication } from '../communications/communication.model';
import { Deal } from '../deals/deal.model';
import { NotFoundException, ConflictException } from '../../shared/errors';
import { CreateClientDTO, UpdateClientDTO } from './dtos/client.dto';

export class ClientService {
  private clientRepository = new ClientRepository();

  async findAll(queryParams: Record<string, string | undefined>) {
    return this.clientRepository.findAll(queryParams);
  }

  async findById(id: string) {
    const client = await this.clientRepository.findById(id);
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async create(data: CreateClientDTO, userId: string) {
    if (data.email) {
      const existing = await Client.findOne({ email: data.email, isDeleted: { $ne: true } });
      if (existing) throw new ConflictException('A client with this email already exists');
    }

    return this.clientRepository.create({
      ...data,
      createdBy: userId as unknown as import('mongoose').Types.ObjectId,
    } as unknown as Partial<IClient>);
  }

  async update(id: string, data: UpdateClientDTO, userId: string) {
    await this.findById(id);

    if (data.email) {
      const existing = await Client.findOne({ email: data.email, _id: { $ne: id }, isDeleted: { $ne: true } });
      if (existing) throw new ConflictException('A client with this email already exists');
    }

    return this.clientRepository.update(id, {
      ...data,
      updatedBy: userId as unknown as import('mongoose').Types.ObjectId,
    } as unknown as Partial<IClient>);
  }

  async softDelete(id: string) {
    await this.findById(id);
    return this.clientRepository.softDelete(id);
  }

  async updateStatus(id: string, status: string, lostReason?: string, userId?: string) {
    await this.findById(id);
    const updateData: Record<string, unknown> = {
      status,
      updatedBy: userId,
    };
    if (status === 'lost' && lostReason) updateData.lostReason = lostReason;
    if (status === 'won') updateData.wonAt = new Date();
    return this.clientRepository.update(id, updateData as Record<string, unknown>);
  }

  async assignAgent(id: string, assignedTo: string, userId: string) {
    await this.findById(id);
    return this.clientRepository.update(id, {
      assignedTo: assignedTo as unknown as import('mongoose').Types.ObjectId,
      updatedBy: userId as unknown as import('mongoose').Types.ObjectId,
    });
  }

  async getTimeline(id: string) {
    await this.findById(id);

    const [activities, communications, deals] = await Promise.all([
      Activity.find({ 'relatedTo.entityType': 'client', 'relatedTo.entityId': id })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      Communication.find({ client: id })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('createdBy', 'name email')
        .lean(),
      Deal.find({ client: id, isDeleted: { $ne: true } })
        .sort({ createdAt: -1 })
        .populate('unit', 'unitNumber price')
        .lean(),
    ]);

    // Merge into timeline sorted by date
    const timeline = [
      ...activities.map((a) => ({ type: 'activity', data: a, date: a.createdAt })),
      ...communications.map((c) => ({ type: 'communication', data: c, date: c.createdAt })),
      ...deals.map((d) => ({ type: 'deal', data: d, date: d.createdAt })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return timeline;
  }

  async getMatchingUnits(id: string) {
    const client = await this.findById(id);
    const prefs = (client as unknown as Record<string, unknown>).preferences as Record<string, unknown> | undefined;
    const budget = (client as unknown as Record<string, unknown>).budget as { min?: number; max?: number } | undefined;

    const filter: Record<string, unknown> = {
      status: 'available',
      isDeleted: { $ne: true },
      'publication.isPublished': true,
    };

    if (budget?.min || budget?.max) {
      filter['price.amount'] = {};
      if (budget.min) (filter['price.amount'] as Record<string, unknown>).$gte = budget.min;
      if (budget.max) (filter['price.amount'] as Record<string, unknown>).$lte = budget.max;
    }

    if (prefs) {
      if (prefs.bedrooms) filter['specifications.bedrooms'] = { $gte: prefs.bedrooms };
      if (prefs.minArea) filter['area.built'] = { $gte: prefs.minArea };
      if ((prefs.unitTypes as string[])?.length) filter.unitType = { $in: prefs.unitTypes };
    }

    return Unit.find(filter)
      .populate('buildingType', 'nameEn nameAr')
      .populate('unitType', 'nameEn nameAr')
      .limit(20)
      .lean();
  }

  async getStatistics() {
    return this.clientRepository.getStatistics();
  }
}
