import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET, R2_PUBLIC_URL } from '../../config/cloudflare-r2';
import { v4 as uuidv4 } from 'uuid';

export class MediaService {
  async upload(file: Express.Multer.File, folder: string): Promise<{ url: string; key: string }> {
    const ext = file.originalname.split('.').pop() || 'bin';
    const key = `${folder}/${uuidv4()}.${ext}`;

    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    return {
      url: `${R2_PUBLIC_URL}/${key}`,
      key,
    };
  }

  async delete(key: string): Promise<void> {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
      })
    );
  }

  async uploadMultiple(files: Express.Multer.File[], folder: string): Promise<Array<{ url: string; key: string }>> {
    return Promise.all(files.map((file) => this.upload(file, folder)));
  }
}
