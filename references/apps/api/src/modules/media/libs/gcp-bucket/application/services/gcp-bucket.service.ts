import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';
import { randomUUID } from 'node:crypto';
import { Readable } from 'stream';

@Injectable()
export class GcpBucketService {
  private readonly storage: Storage;
  private readonly logger = new Logger(GcpBucketService.name);

  constructor(private readonly configService: ConfigService) {
    const projectId = this.configService.get<string>('GCP_PROJECT_ID');
    const privateKeyId = this.configService.get<string>('GCP_PRIVATE_KEY_ID');
    const clientEmail = this.configService.get<string>('GCP_CLIENT_EMAIL');
    const rawKey = this.configService.get<string>('GCP_PRIVATE_KEY_B64')!;
    const privateKey = Buffer.from(rawKey, 'base64').toString('utf8');
    if (
      ![projectId, privateKeyId, clientEmail].every(Boolean) ||
      !privateKey?.includes('-----BEGIN PRIVATE KEY-----')
    ) {
      throw new Error('GCP credentials are missing or malformed');
    }

    this.storage = new Storage({
      projectId,
      credentials: {
        type: 'service_account',
        client_email: clientEmail,
        private_key_id: privateKeyId,
        private_key: privateKey,
      },
    });
    // this.storage = new Storage({ keyFilename: 'secrets.json' });
  }

  async uploadImage(
    file: Express.Multer.File,
    bucketName: string,
    folder?: string,
    fileName?: string,
  ): Promise<{ url: string; fileName: string }> {
    if (!file.mimetype.includes('image')) {
      throw new BadRequestException(
        'Invalid file type. Only images are allowed.',
      );
    }

    return this.uploadFile({
      file,
      bucketName,
      folder,
      fileName,
    });
  }

  async uploadVideo(
    file: Express.Multer.File,
    bucketName: string,
    folder?: string,
    fileName?: string,
  ): Promise<{ url: string; fileName: string }> {
    if (!file.mimetype.includes('video')) {
      throw new BadRequestException(
        'Invalid file type. Only videos are allowed.',
      );
    }

    return this.uploadFile({
      file,
      bucketName,
      folder,
      fileName,
    });
  }

  async uploadFile({
    file,
    bucketName,
    folder,
    fileName,
  }: {
    file: Express.Multer.File;
    bucketName: string;
    folder?: string;
    fileName?: string;
  }): Promise<{ url: string; fileName: string }> {
    const fileKey = `${folder ? folder + '/' : ''}${fileName || randomUUID()}-${file.originalname}`;

    try {
      if (!(await this.bucketExists(bucketName))) {
        throw new NotFoundException('Bucket does not exist');
      }

      const bucket = this.storage.bucket(bucketName);
      const fileUpload = bucket.file(fileKey);

      const stream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      return new Promise((resolve, reject) => {
        stream.on('error', (error: any) => {
          this.logger.error(`GCP upload failed: ${error.message}`);
          reject(new Error('File upload failed'));
        });

        stream.on('finish', () => {
          const url = `gs://${bucketName}/${fileKey}`;
          resolve({
            url,
            fileName: fileKey,
          });
        });

        stream.end(file.buffer);
      });
    } catch (error: any) {
      this.logger.error(`GCP upload failed: ${error.message}`);
      throw new Error('File upload failed');
    }
  }

  async bucketExists(bucketName: string): Promise<boolean> {
    try {
      const bucket = this.storage.bucket(bucketName);
      const [exists] = await bucket.exists();
      return exists;
    } catch (error: any) {
      this.logger.error(`Error checking bucket existence: ${error.message}`);
      return false;
    }
  }

  async createBucket(bucketName: string): Promise<void> {
    if (typeof bucketName !== 'string') {
      throw new BadRequestException('Invalid bucket name — expected a string.');
    }

    if (await this.bucketExists(bucketName)) {
      this.logger.log(`Bucket "${bucketName}" already exists.`);
      return;
    }

    try {
      await this.storage.createBucket(bucketName, {
        locationType: 'region',
        location: this.configService.get<string>(
          'GCP_BUCKET_LOCATION',
          'asia-south1 (Mumbai)',
        ),
        storageClass: this.configService.get<string>(
          'GCP_STORAGE_CLASS',
          'STANDARD',
        ),
      });
      this.logger.log(`Bucket "${bucketName}" created.`);
    } catch (error: any) {
      this.logger.error(
        `Failed to create bucket: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to create bucket: ${error.message}`);
    }
  }

  async deleteFile(fileName: string, bucketName: string): Promise<void> {
    try {
      const bucket = this.storage.bucket(bucketName);
      await bucket.file(fileName).delete();
    } catch (error: any) {
      this.logger.error(`Failed to delete file: ${error.message}`);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async getFileStream(bucketName: string, fileName: string): Promise<Readable> {
    try {
      if (!(await this.bucketExists(bucketName))) {
        throw new NotFoundException('Bucket does not exist');
      }

      const bucket = this.storage.bucket(bucketName);
      const file = bucket.file(fileName);

      const [exists] = await file.exists();
      if (!exists) {
        throw new NotFoundException('File does not exist');
      }

      return file.createReadStream();
    } catch (error: any) {
      this.logger.error(`Failed to create file stream: ${error.message}`);
      throw error;
    }
  }

  async getFileMetadata(bucketName: string, fileName: string): Promise<any> {
    try {
      const bucket = this.storage.bucket(bucketName);
      const file = bucket.file(fileName);
      const [metadata] = await file.getMetadata();
      return metadata;
    } catch (error: any) {
      this.logger.error(`Failed to get file metadata: ${error.message}`);
      throw new NotFoundException('File not found');
    }
  }
}
