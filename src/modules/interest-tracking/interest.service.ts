import { InterestLog, IInterestLog } from './interest.model';
import { QueryBuilder } from '../../shared/utils/query-builder';
import mongoose from 'mongoose';

export class InterestService {
  // Used by middleware — fire & forget
  static async logView(unitId: string, userId: string, meta?: { ip?: string; userAgent?: string }) {
    await InterestLog.create({
      type: 'view',
      unit: new mongoose.Types.ObjectId(unitId),
      userId: new mongoose.Types.ObjectId(userId),
      ipAddress: meta?.ip,
      userAgent: meta?.userAgent,
    });
  }

  static async logSearch(userId: string, searchQuery: string, filters: Record<string, unknown>) {
    await InterestLog.create({
      type: 'search',
      userId: new mongoose.Types.ObjectId(userId),
      searchQuery,
      searchFilters: filters,
    });
  }

  async getMostViewed(limit = 10) {
    return InterestLog.aggregate([
      { $match: { type: 'view', unit: { $exists: true } } },
      { $group: { _id: '$unit', viewCount: { $sum: 1 }, lastViewed: { $max: '$createdAt' } } },
      { $sort: { viewCount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'units',
          localField: '_id',
          foreignField: '_id',
          as: 'unit',
        },
      },
      { $unwind: '$unit' },
      {
        $project: {
          unitId: '$_id',
          viewCount: 1,
          lastViewed: 1,
          'unit.unitNumber': 1,
          'unit.price': 1,
          'unit.status': 1,
          'unit.images': { $slice: ['$unit.images', 1] },
        },
      },
    ]);
  }

  async getMostSearched(limit = 20) {
    return InterestLog.aggregate([
      { $match: { type: 'search', searchQuery: { $ne: '' } } },
      { $group: { _id: '$searchQuery', count: { $sum: 1 }, lastSearched: { $max: '$createdAt' } } },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);
  }

  async getTrending(days = 7, limit = 10) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return InterestLog.aggregate([
      { $match: { type: 'view', createdAt: { $gte: since }, unit: { $exists: true } } },
      { $group: { _id: '$unit', viewCount: { $sum: 1 } } },
      { $sort: { viewCount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'units',
          localField: '_id',
          foreignField: '_id',
          as: 'unit',
        },
      },
      { $unwind: '$unit' },
      {
        $project: {
          unitId: '$_id',
          viewCount: 1,
          'unit.unitNumber': 1,
          'unit.price': 1,
          'unit.status': 1,
        },
      },
    ]);
  }

  async getUnitInterest(unitId: string) {
    const [views, recentViews] = await Promise.all([
      InterestLog.countDocuments({ type: 'view', unit: new mongoose.Types.ObjectId(unitId) }),
      InterestLog.find({ type: 'view', unit: new mongoose.Types.ObjectId(unitId) })
        .sort({ createdAt: -1 })
        .limit(20)
        .populate('userId', 'name email')
        .lean(),
    ]);

    return { totalViews: views, recentViews };
  }

  async getSearchHeatmap() {
    return InterestLog.aggregate([
      { $match: { type: 'search', searchFilters: { $exists: true } } },
      { $project: { filters: { $objectToArray: '$searchFilters' } } },
      { $unwind: '$filters' },
      {
        $group: {
          _id: { key: '$filters.k', value: '$filters.v' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 50 },
    ]);
  }
}
