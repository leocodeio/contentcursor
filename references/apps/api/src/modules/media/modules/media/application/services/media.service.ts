import { Injectable } from '@nestjs/common';
import { xDomainMedia } from '../../domain/models/media.model';
import { IMediaPort } from '../../domain/ports/media.port';
import { CreateMediaDto } from '../dtos/create-media.dto';

@Injectable()
export class MediaService {
  constructor(private readonly mediaPort: IMediaPort) {}

  // findAll(): Promise<xDomainMedia[]> {
  //   return this.mediaPort.findAll();
  // }

  // findById(id: string): Promise<xDomainMedia | null> {
  //   return this.mediaPort.findById(id);
  // }

  async create(
    createMediaDto: CreateMediaDto,
    file: Express.Multer.File,
    userId: string,
  ): Promise<xDomainMedia> {
    return this.mediaPort.saveWithFolderRelation(createMediaDto, file, userId);
  }

  async createWithoutFolder(
    media: Partial<xDomainMedia>,
    file: Express.Multer.File,
  ): Promise<xDomainMedia> {
    return this.mediaPort.save(media, file);
  }

  // update(
  //   id: string,
  //   media: Partial<xDomainMedia>,
  // ): Promise<xDomainMedia | null> {
  //   return this.mediaPort.update(id, media);
  // }

  // delete(id: string): Promise<void> {
  //   return this.mediaPort.delete(id);
  // }

  getDuration(videoFile: Express.Multer.File): number {
    return videoFile.size;
  }
}
