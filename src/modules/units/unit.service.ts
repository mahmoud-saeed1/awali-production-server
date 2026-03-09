import { UnitRepository } from "./unit.repository";
import { Unit, IUnit } from "./unit.model";
import { InterestLog } from "../interest-tracking/interest.model";
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "../../shared/errors";
import { CreateUnitDTO, UpdateUnitDTO } from "./dtos/unit.dto";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET, R2_PUBLIC_URL } from "../../config/cloudflare-r2";
import { v4 as uuidv4 } from "uuid";

export class UnitService {
  private unitRepository = new UnitRepository();

  async findAll(queryParams: Record<string, string | undefined>) {
    return this.unitRepository.findAll(queryParams);
  }

  async findById(id: string, userId?: string) {
    const unit = await this.unitRepository.findById(id);
    if (!unit) throw new NotFoundException("Unit not found");

    // Track view (fire and forget)
    if (userId) {
      Unit.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }).catch(() => {});
    }

    return unit;
  }

  async create(data: CreateUnitDTO, userId: string) {
    const existing = await Unit.findOne({
      unitNumber: data.unitNumber,
      isDeleted: { $ne: true },
    });
    if (existing)
      throw new ConflictException("Unit with this number already exists");

    return this.unitRepository.create({
      ...data,
      createdBy: userId as unknown as import("mongoose").Types.ObjectId,
    } as unknown as Partial<IUnit>);
  }

  async update(id: string, data: UpdateUnitDTO, userId: string) {
    const unit = await this.findById(id);

    if (
      data.unitNumber &&
      data.unitNumber !==
        (unit as unknown as Record<string, unknown>).unitNumber
    ) {
      const existing = await Unit.findOne({
        unitNumber: data.unitNumber,
        _id: { $ne: id },
        isDeleted: { $ne: true },
      });
      if (existing)
        throw new ConflictException("Unit with this number already exists");
    }

    return this.unitRepository.update(id, {
      ...data,
      updatedBy: userId as unknown as import("mongoose").Types.ObjectId,
    } as unknown as Partial<IUnit>);
  }

  async softDelete(id: string) {
    await this.findById(id);
    const deleted = await this.unitRepository.softDelete(id);
    if (!deleted) throw new NotFoundException("Unit not found");
    return deleted;
  }

  async updateStatus(id: string, status: string, userId: string) {
    await this.findById(id);
    return this.unitRepository.update(id, {
      status,
      updatedBy: userId as unknown as import("mongoose").Types.ObjectId,
    } as Record<string, unknown>);
  }

  async publish(id: string, isPublished: boolean, userId: string) {
    await this.findById(id);
    return this.unitRepository.update(id, {
      "publication.isPublished": isPublished,
      "publication.publishedAt": isPublished ? new Date() : null,
      updatedBy: userId as unknown as import("mongoose").Types.ObjectId,
    } as Record<string, unknown>);
  }

  async uploadImages(id: string, files: Express.Multer.File[], userId: string) {
    const unit = await this.findById(id);

    const uploadedImages = [];
    for (const file of files) {
      const key = `units/${id}/images/${uuidv4()}-${file.originalname}`;
      await r2Client.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
      uploadedImages.push({
        url: `${R2_PUBLIC_URL}/${key}`,
        key,
        alt: file.originalname,
        isPrimary: false,
        order:
          ((unit as unknown as Record<string, unknown>).images as unknown[])
            ?.length || 0 + uploadedImages.length,
      });
    }

    return this.unitRepository.update(id, {
      $push: { images: { $each: uploadedImages } },
      updatedBy: userId as unknown as import("mongoose").Types.ObjectId,
    } as Record<string, unknown>);
  }

  async deleteImage(unitId: string, imageKey: string, userId: string) {
    // Delete from R2
    await r2Client.send(
      new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: imageKey }),
    );

    return this.unitRepository.update(unitId, {
      $pull: { images: { key: imageKey } },
      updatedBy: userId as unknown as import("mongoose").Types.ObjectId,
    } as Record<string, unknown>);
  }

  async reorderImages(
    id: string,
    orderedImages: Array<{ key: string; order: number; isPrimary?: boolean }>,
    userId: string,
  ) {
    const unit = await Unit.findById(id);
    if (!unit) throw new NotFoundException("Unit not found");

    const updatedImages = unit.images.map((img) => {
      const orderInfo = orderedImages.find((o) => o.key === img.key);
      if (orderInfo) {
        img.order = orderInfo.order;
        if (orderInfo.isPrimary !== undefined)
          img.isPrimary = orderInfo.isPrimary;
      }
      return img;
    });

    unit.images = updatedImages.sort((a, b) => a.order - b.order);
    unit.updatedBy = userId as unknown as import("mongoose").Types.ObjectId;
    await unit.save();

    return this.findById(id);
  }

  async uploadDocument(id: string, file: Express.Multer.File, userId: string) {
    await this.findById(id);
    const key = `units/${id}/documents/${uuidv4()}-${file.originalname}`;

    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const doc = {
      url: `${R2_PUBLIC_URL}/${key}`,
      key,
      name: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };

    return this.unitRepository.update(id, {
      $push: { documents: doc },
      updatedBy: userId as unknown as import("mongoose").Types.ObjectId,
    } as Record<string, unknown>);
  }

  async getStatistics() {
    return this.unitRepository.getStatistics();
  }

  async getMostViewed(limit = 10) {
    return Unit.find({ isDeleted: { $ne: true } })
      .sort({ viewCount: -1 })
      .limit(limit)
      .populate("buildingType", "nameEn nameAr")
      .populate("unitType", "nameEn nameAr")
      .populate("features", "nameEn nameAr icon")
      .lean();
  }
}
