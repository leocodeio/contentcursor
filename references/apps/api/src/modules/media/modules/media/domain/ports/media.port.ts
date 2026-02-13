import { xDomainMedia } from '../models/media.model';
import { CreateMediaDto } from '../../application/dtos/create-media.dto';

export abstract class IMediaPort {
  abstract findAll(): Promise<xDomainMedia[]>;
  abstract findById(id: string): Promise<xDomainMedia | null>;
  abstract save(
    media: Partial<xDomainMedia>,
    file: Express.Multer.File,
  ): Promise<xDomainMedia>;
  abstract saveWithFolderRelation(
    createMediaDto: CreateMediaDto,
    file: Express.Multer.File,
    userId: string,
  ): Promise<xDomainMedia>;
  abstract update(
    id: string,
    media: Partial<xDomainMedia>,
  ): Promise<xDomainMedia | null>;
  abstract delete(id: string): Promise<void>;
}
