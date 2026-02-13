import { Injectable, NotFoundException } from '@nestjs/common';
import { IMediaPort } from '../../domain/ports/media.port';
import { xDomainMedia } from '../../domain/models/media.model';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { PrismaService } from 'src/utilities/database/prisma.service';
import { DriveService } from '../../../../libs/drive/application/services/drive.service';
import { CreateMediaDto } from '../../application/dtos/create-media.dto';
import { xMedia } from '@spectral/types';

@Injectable()
export class MediaRepositoryAdapter implements IMediaPort {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly driveService: DriveService,
    private readonly configService: ConfigService,
  ) {}

  async findAll(): Promise<xDomainMedia[]> {
    return await this.prismaService.$transaction(async (tx) => {
      const result = await tx.media.findMany();
      return result.map((media) => this.toDomain(media));
    });
  }

  async findById(id: string): Promise<xDomainMedia | null> {
    return await this.prismaService.$transaction(async (tx) => {
      const result = await tx.media.findUnique({
        where: { id },
      });
      return result ? this.toDomain(result) : null;
    });
  }

  async save(
    media: Partial<xDomainMedia>,
    file: Express.Multer.File,
  ): Promise<xDomainMedia> {
    console.log(
      `MediaRepository: Starting save for file ${file.originalname} (${file.size} bytes)`,
    );

    // Step 1: Upload to Drive first (outside transaction)
    const fileName =
      new Date().toISOString() +
      file.originalname +
      randomUUID() +
      '.' +
      file.mimetype.split('/')[1];

    console.log(
      `MediaRepository: Uploading file to Google Drive as ${fileName}`,
    );

    let driveResult: { url: string; fileId: string };
    try {
      const startTime = Date.now();
      driveResult = await this.driveService.uploadFile({
        file,
        folderName: this.configService.getOrThrow('DRIVE_ROOT_FOLDER_NAME'),
        fileName,
      });
      const uploadTime = Date.now() - startTime;
      console.log(
        `MediaRepository: Drive upload completed in ${uploadTime}ms, fileId: ${driveResult.fileId}`,
      );
    } catch (error) {
      console.error(
        `MediaRepository: Drive upload failed for ${fileName}:`,
        error,
      );
      throw new Error(`Drive upload failed: ${error.message}`);
    }

    // Step 2: Save to database (quick transaction)
    try {
      console.log(`MediaRepository: Saving media entry to database`);
      return await this.prismaService.$transaction(async (tx) => {
        const result = await tx.media.create({
          data: {
            id: media.id || randomUUID(),
            type: media.type!,
            integrationUrl: driveResult.url,
            integrationKey: driveResult.fileId,
          },
        });

        console.log(
          `MediaRepository: Media saved successfully with ID: ${result.id}`,
        );
        return this.toDomain(result);
      });
    } catch (error) {
      console.error(
        `MediaRepository: Database save failed, cleaning up Drive file ${driveResult.fileId}:`,
        error,
      );
      // Step 3: Cleanup Drive file if database save fails
      try {
        await this.driveService.deleteFile(driveResult.fileId);
        console.log(
          `MediaRepository: Drive file ${driveResult.fileId} cleaned up successfully`,
        );
      } catch (cleanupError) {
        // Log cleanup failure but don't throw - original error is more important
        console.error(
          `MediaRepository: Failed to cleanup Drive file ${driveResult.fileId}:`,
          cleanupError,
        );
      }
      throw error;
    }
  }

  async saveWithFolderRelation(
    createMediaDto: CreateMediaDto,
    file: Express.Multer.File,
    userId: string,
  ): Promise<xDomainMedia> {
    // Step 1: Get folder details first
    const folder = await this.prismaService.folder.findUnique({
      where: { id: createMediaDto.folderId },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    // Step 2: Upload to Drive (outside transaction)
    const fileName =
      folder.name +
      new Date().toISOString() +
      file.originalname +
      randomUUID() +
      '.' +
      file.mimetype.split('/')[1] +
      '_' +
      userId;

    let driveResult: { url: string; fileId: string };
    try {
      driveResult = await this.driveService.uploadFile({
        file,
        folderName:
          this.configService.getOrThrow('DRIVE_ROOT_FOLDER_NAME') +
          '/' +
          folder.name +
          '_' +
          folder.id,
        fileName,
      });
    } catch (error) {
      throw new Error(`Drive upload failed: ${error.message}`);
    }

    // Step 3: Save to database (quick transaction)
    try {
      return await this.prismaService.$transaction(async (tx) => {
        // Create media entry
        const mediaResult = await tx.media.create({
          data: {
            id: randomUUID(),
            type: createMediaDto.type,
            integrationUrl: driveResult.url,
            integrationKey: driveResult.fileId,
          },
        });

        // Create folder item relationship
        await tx.folderItem.create({
          data: {
            id: randomUUID(),
            folderId: createMediaDto.folderId,
            mediaId: mediaResult.id,
          },
        });

        return this.toDomain(mediaResult);
      });
    } catch (error) {
      // Step 4: Cleanup Drive file if database save fails
      try {
        await this.driveService.deleteFile(driveResult.fileId);
      } catch (cleanupError) {
        // Log cleanup failure but don't throw - original error is more important
        console.error(
          `Failed to cleanup Drive file ${driveResult.fileId}:`,
          cleanupError,
        );
      }
      throw error;
    }
  }

  async update(
    id: string,
    media: Partial<xDomainMedia>,
  ): Promise<xDomainMedia | null> {
    return await this.prismaService.$transaction(async (tx) => {
      try {
        const result = await tx.media.update({
          where: { id },
          data: {
            ...(media.type && { type: media.type }),
            ...(media.integrationUrl !== undefined && {
              integrationUrl: media.integrationUrl,
            }),
            ...(media.integrationKey !== undefined && {
              integrationKey: media.integrationKey,
            }),
          },
        });
        return this.toDomain(result);
      } catch (error) {
        // If record not found, Prisma throws an error
        return null;
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prismaService.$transaction(async (tx) => {
      const media = await tx.media.findUnique({
        where: { id },
      });

      if (!media) {
        throw new NotFoundException('Media not found');
      }

      if (media.integrationKey) {
        await this.driveService.deleteFile(media.integrationKey);
      }

      await tx.media.delete({
        where: { id },
      });
    });
  }

  toDomain(media: xMedia): xDomainMedia {
    return {
      id: media.id,
      type: media.type,
      integrationUrl: media.integrationUrl ? media.integrationUrl : null,
      integrationKey: media.integrationKey ? media.integrationKey : null,
    };
  }

  toEntity(media: xDomainMedia): xMedia {
    return {
      id: media.id,
      type: media.type,
      integrationUrl: media.integrationUrl ? media.integrationUrl : null,
      integrationKey: media.integrationKey ? media.integrationKey : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
