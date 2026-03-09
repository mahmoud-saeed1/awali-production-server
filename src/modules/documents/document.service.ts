import { DocumentMeta, IDocumentMeta } from './document.model';
import { QueryBuilder } from '../../shared/utils/query-builder';
import { NotFoundException, BadRequestException } from '../../shared/errors';
import { CreateDocumentDTO } from './dtos/document.dto';
import { MediaService } from '../media/media.service';
import mongoose from 'mongoose';

const mediaService = new MediaService();

export class DocumentService {
  async findAll(queryParams: Record<string, string | undefined>) {
    const qb = new QueryBuilder<IDocumentMeta>(queryParams);
    const { filter, sort, skip, limit, page } = qb
      .filter(['type', 'relatedClient', 'relatedDeal', 'relatedUnit', 'uploadedBy'])
      .search(['name.en', 'name.ar'])
      .sort('-createdAt')
      .paginate(100)
      .build();

    const [data, total] = await Promise.all([
      DocumentMeta.find(filter)
        .populate('relatedClient', 'name')
        .populate('relatedDeal', 'title')
        .populate('relatedUnit', 'unitNumber')
        .populate('uploadedBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      DocumentMeta.countDocuments(filter),
    ]);

    return { data: data as IDocumentMeta[], total, page, limit };
  }

  async findById(id: string) {
    return DocumentMeta.findById(id)
      .populate('relatedClient', 'name')
      .populate('relatedDeal', 'title')
      .populate('relatedUnit', 'unitNumber')
      .populate('uploadedBy', 'name email')
      .lean();
  }

  async create(data: CreateDocumentDTO, file: Express.Multer.File, userId: string) {
    if (!file) throw new BadRequestException('File is required');

    const uploaded = await mediaService.upload(file, 'documents');

    const doc = await DocumentMeta.create({
      ...data,
      url: uploaded.url,
      key: uploaded.key,
      mimeType: file.mimetype,
      size: file.size,
      uploadedBy: new mongoose.Types.ObjectId(userId),
    });

    return this.findById(doc._id.toString());
  }

  async remove(id: string) {
    const doc = await DocumentMeta.findById(id);
    if (!doc) throw new NotFoundException('Document not found');

    // Delete from R2
    try { await mediaService.delete(doc.key); } catch { /* silent fail */ }

    await DocumentMeta.findByIdAndDelete(id);
  }
}
