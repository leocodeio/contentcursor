import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly logger = new Logger(S3Service.name);
  private readonly endpoint: string;

  constructor(private readonly configService: ConfigService) {
    this.endpoint = this.configService.get<string>(
      'AWS_S3_ENDPOINT',
      'http://localhost:4566',
    );

    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION', 'us-east-1'),
      endpoint: this.endpoint,
      forcePathStyle: true, // Required for LocalStack
      credentials: {
        accessKeyId: this.configService.get<string>(
          'AWS_ACCESS_KEY_ID',
          'test',
        ),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
          'test',
        ),
      },
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    bucketName: string,
    folder?: string,
    fileName?: string,
  ): Promise<{ url: string; key: string }> {
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
  ): Promise<{ url: string; key: string }> {
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

  async getSignedUrl(
    key: string,
    bucketName: string,
    expiresIn = 3600,
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      this.logger.error(
        `Error generating signed URL: ${error.message}`,
        error.stack,
      );
      throw error;
    }
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
  }): Promise<{ url: string; key: string }> {
    const fileKey = `${folder ? folder + '/' : ''}${fileName || randomUUID()}-${file.originalname}`;

    try {
      if (!(await this.bucketExists(bucketName))) {
        // await this.createBucket(bucketName);
        throw new NotFoundException('Bucket does not exist');
      }
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: fileKey,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      return {
        url: `${this.configService.get('AWS_S3_ENDPOINT')}/${bucketName}/${fileKey}`,
        key: fileKey,
      };
    } catch (error) {
      this.logger.error(`S3 upload failed: ${error.message}`);
      throw new Error('File upload failed');
    }
  }

  async bucketExists(bucketName: string): Promise<boolean> {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
      return true;
    } catch (error) {
      if (error.name === 'NotFound') return false;
      throw error;
    }
  }

  async createBucket(bucketName: string): Promise<void> {
    console.log(bucketName);
    if (typeof bucketName !== 'string') {
      throw new BadRequestException('Invalid bucket name — expected a string.');
    }

    if (await this.bucketExists(bucketName)) {
      this.logger.log(`Bucket "${bucketName}" already exists.`);
      return;
    }

    try {
      await this.s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
      this.logger.log(`Bucket "${bucketName}" created.`);
    } catch (error) {
      this.logger.error(
        `Failed to create bucket: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to create bucket: ${error.message}`);
    }
  }

  async deleteFile(key: string, bucketName: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({ Bucket: bucketName, Key: key }),
      );
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }
}
