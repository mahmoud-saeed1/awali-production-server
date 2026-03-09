import { Unit } from '../units/unit.model';
import { Client } from '../clients/client.model';
import { Deal, STAGE_PROBABILITY } from '../deals/deal.model';
import { Task } from '../tasks/task.model';
import { Activity } from '../activities/activity.model';
import { InterestLog } from '../interest-tracking/interest.model';

export class AnalyticsService {
  async getDashboard() {
    const [unitStats, clientStats, dealStats, taskStats] = await Promise.all([
      Unit.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Client.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Deal.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            totalValue: { $sum: '$value.amount' },
            wonValue: { $sum: { $cond: [{ $eq: ['$stage', 'closed_won'] }, '$value.amount', 0] } },
            wonCount: { $sum: { $cond: [{ $eq: ['$stage', 'closed_won'] }, 1, 0] } },
          },
        },
      ]),
      Task.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    return {
      units: unitStats,
      clients: clientStats,
      deals: dealStats[0] || { total: 0, totalValue: 0, wonValue: 0, wonCount: 0 },
      tasks: taskStats,
    };
  }

  async getSalesAnalytics(period?: string) {
    const days = period === 'year' ? 365 : period === 'quarter' ? 90 : 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [salesByMonth, topAgents] = await Promise.all([
      Deal.aggregate([
        { $match: { stage: 'closed_won', actualCloseDate: { $gte: since }, isDeleted: { $ne: true } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$actualCloseDate' } },
            count: { $sum: 1 },
            totalValue: { $sum: '$value.amount' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Deal.aggregate([
        { $match: { stage: 'closed_won', isDeleted: { $ne: true } } },
        {
          $group: {
            _id: '$assignedTo',
            dealsWon: { $sum: 1 },
            totalValue: { $sum: '$value.amount' },
          },
        },
        { $sort: { totalValue: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'agent' } },
        { $unwind: '$agent' },
        { $project: { dealsWon: 1, totalValue: 1, 'agent.name': 1, 'agent.email': 1 } },
      ]),
    ]);

    return { salesByMonth, topAgents };
  }

  async getPipelineAnalytics() {
    return Deal.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 },
          totalValue: { $sum: '$value.amount' },
          avgDealSize: { $avg: '$value.amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  async getAgentPerformance() {
    return Deal.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      {
        $group: {
          _id: '$assignedTo',
          totalDeals: { $sum: 1 },
          wonDeals: { $sum: { $cond: [{ $eq: ['$stage', 'closed_won'] }, 1, 0] } },
          lostDeals: { $sum: { $cond: [{ $eq: ['$stage', 'closed_lost'] }, 1, 0] } },
          totalValue: { $sum: '$value.amount' },
          wonValue: { $sum: { $cond: [{ $eq: ['$stage', 'closed_won'] }, '$value.amount', 0] } },
        },
      },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'agent' } },
      { $unwind: '$agent' },
      {
        $project: {
          totalDeals: 1,
          wonDeals: 1,
          lostDeals: 1,
          totalValue: 1,
          wonValue: 1,
          winRate: { $cond: [{ $gt: ['$totalDeals', 0] }, { $multiply: [{ $divide: ['$wonDeals', '$totalDeals'] }, 100] }, 0] },
          'agent.name': 1,
          'agent.email': 1,
        },
      },
      { $sort: { wonValue: -1 } },
    ]);
  }

  async getClientAnalytics() {
    const [funnel, sourceBreakdown] = await Promise.all([
      Client.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Client.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: '$source', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    return { funnel, sourceBreakdown };
  }

  async getUnitAnalytics() {
    const [statusBreakdown, typeBreakdown, priceRange] = await Promise.all([
      Unit.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Unit.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: '$unitType', count: { $sum: 1 }, avgPrice: { $avg: '$price.amount' } } },
        { $lookup: { from: 'unittypes', localField: '_id', foreignField: '_id', as: 'type' } },
        { $unwind: { path: '$type', preserveNullAndEmptyArrays: true } },
        { $project: { count: 1, avgPrice: 1, 'type.nameEn': 1, 'type.nameAr': 1 } },
      ]),
      Unit.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        {
          $group: {
            _id: null,
            minPrice: { $min: '$price.amount' },
            maxPrice: { $max: '$price.amount' },
            avgPrice: { $avg: '$price.amount' },
          },
        },
      ]),
    ]);

    return { statusBreakdown, typeBreakdown, priceRange: priceRange[0] || {} };
  }
}
