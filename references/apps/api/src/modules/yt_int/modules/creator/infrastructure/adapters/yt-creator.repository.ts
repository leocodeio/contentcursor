import { IYtCreatorEntity } from '../../domain/models/yt-creator.model';
import { IYtCreatorPort } from '../../domain/ports/yt-creator.repository';
import { ConflictException, Injectable } from '@nestjs/common';
import { GetCreatorEntryModel } from '../../domain/enums/get-creator-entry.model';
import { PrismaService } from '../../../../../../utilities/database/prisma.service';
import { YtCreatorStatus } from '../../domain/enums/yt-creator-status.enum';
@Injectable()
export class YtCreatorRepository implements IYtCreatorPort {
  constructor(private readonly prismaService: PrismaService) {}

  async find(
    query: GetCreatorEntryModel,
  ): Promise<Partial<IYtCreatorEntity>[]> {
    const creators = await this.prismaService.ytCreator.findMany({
      where: query,
      select: {
        id: true,
        creatorId: true,
        email: true,
      },
    });
    return creators.map((creator) => this.toDomain(creator));
  }

  async save(creator: IYtCreatorEntity): Promise<IYtCreatorEntity> {
    console.log('Saving creator:', creator);
    if (creator.id) {
      // Update existing creator
      const updatedCreator = await this.prismaService.ytCreator.update({
        where: { id: creator.id },
        data: creator,
      });
      return this.toDomain(updatedCreator);
    } else {
      // Create new creator
      // 1) For new creator, we want to see the mail is alreayd linked to another creator
      const existingCreator = await this.prismaService.ytCreator.findFirst({
        where: {
          AND: [{ email: creator.email }, { status: YtCreatorStatus.ACTIVE }],
        },
      });

      if (existingCreator) {
        // 1.1) If the email is already linked to same creator
        if (existingCreator?.creatorId === creator.creatorId) {
          throw new ConflictException(
            `${creator.email} is already linked to you.`,
          );
        }
        // 1.2) If the email is already linked to another creator
        if (existingCreator?.creatorId !== creator.creatorId) {
          throw new ConflictException(
            `${creator.email} is already linked to another creator.`,
          );
        }
      }

      const savedCreator = await this.prismaService.ytCreator.create({
        data: creator,
      });
      return this.toDomain(savedCreator);
    }
  }

  async delete(id: string): Promise<void> {
    await this.prismaService.ytCreator.delete({ where: { id } });
  }

  async findByEmail(email: string): Promise<IYtCreatorEntity | null> {
    const creator = await this.prismaService.ytCreator.findFirst({
      where: {
        email: email,
        status: YtCreatorStatus.ACTIVE,
      },
    });

    return creator ? this.toDomain(creator) : null;
  }

  async findById(id: string): Promise<IYtCreatorEntity | null> {
    const creator = await this.prismaService.ytCreator.findUnique({
      where: { id },
    });
    return creator ? this.toDomain(creator) : null;
  }

  private toDomain(creator: any): IYtCreatorEntity {
    return {
      id: creator.id,
      creatorId: creator.creatorId,
      email: creator.email,
      accessToken: creator.accessToken,
      refreshToken: creator.refreshToken,
      status: creator.status as YtCreatorStatus,
      createdAt: creator.createdAt,
      updatedAt: creator.updatedAt,
    };
  }
}
