import { Task, ITask } from './task.model';
import { QueryBuilder } from '../../shared/utils/query-builder';
import { NotFoundException } from '../../shared/errors';
import { CreateTaskDTO, UpdateTaskDTO } from './dtos/task.dto';
import mongoose from 'mongoose';

export class TaskService {
  async findAll(queryParams: Record<string, string | undefined>) {
    const qb = new QueryBuilder<ITask>(queryParams);
    const { filter, sort, skip, limit, page } = qb
      .filter(['status', 'priority', 'type', 'assignedTo', 'relatedClient', 'relatedDeal'])
      .search(['title.en', 'title.ar', 'description'])
      .sort('dueDate')
      .paginate(100)
      .build();

    const [data, total] = await Promise.all([
      Task.find(filter)
        .populate('assignedTo', 'name email')
        .populate('relatedClient', 'name email phone')
        .populate('relatedDeal', 'title stage value')
        .populate('relatedUnit', 'unitNumber')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Task.countDocuments(filter),
    ]);

    return { data: data as ITask[], total, page, limit };
  }

  async findById(id: string) {
    const task = await Task.findById(id)
      .populate('assignedTo', 'name email')
      .populate('relatedClient', 'name email phone')
      .populate('relatedDeal', 'title stage value')
      .populate('relatedUnit', 'unitNumber')
      .populate('createdBy', 'name email')
      .lean();

    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async create(data: CreateTaskDTO, userId: string) {
    const task = await Task.create({
      ...data,
      createdBy: new mongoose.Types.ObjectId(userId),
    });
    return this.findById(task._id.toString());
  }

  async update(id: string, data: UpdateTaskDTO) {
    await this.findById(id);
    await Task.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    return this.findById(id);
  }

  async remove(id: string) {
    const task = await Task.findByIdAndDelete(id);
    if (!task) throw new NotFoundException('Task not found');
  }

  async complete(id: string) {
    await this.findById(id);
    await Task.findByIdAndUpdate(id, { status: 'completed', completedAt: new Date() });
    return this.findById(id);
  }

  async getMyTasks(userId: string, queryParams: Record<string, string | undefined>) {
    const qb = new QueryBuilder<ITask>({ ...queryParams });
    const { filter, sort, skip, limit, page } = qb
      .filter(['status', 'priority', 'type'])
      .sort('dueDate')
      .paginate(100)
      .build();

    filter.assignedTo = new mongoose.Types.ObjectId(userId);

    const [data, total] = await Promise.all([
      Task.find(filter)
        .populate('relatedClient', 'name')
        .populate('relatedDeal', 'title stage')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Task.countDocuments(filter),
    ]);

    return { data: data as ITask[], total, page, limit };
  }

  async getOverdueTasks(queryParams: Record<string, string | undefined>) {
    const qb = new QueryBuilder<ITask>(queryParams);
    const { sort, skip, limit, page } = qb.sort('dueDate').paginate(100).build();

    const filter = {
      status: { $in: ['pending', 'in_progress'] },
      dueDate: { $lt: new Date() },
    };

    const [data, total] = await Promise.all([
      Task.find(filter)
        .populate('assignedTo', 'name email')
        .populate('relatedClient', 'name')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Task.countDocuments(filter),
    ]);

    return { data: data as ITask[], total, page, limit };
  }
}
