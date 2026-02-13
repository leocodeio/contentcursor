import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/utilities/database/prisma.service';
import {
  IFolderPort,
  CreateFolderData,
  UpdateFolderData,
} from '../../domain/ports/folder.port';
import {
  xDomainFolderItem,
  xDomainFolders,
} from '../../domain/models/folder.model';

@Injectable()
export class FolderRepositoryAdapter implements IFolderPort {
  constructor(private readonly prisma: PrismaService) {}

  async getFoldersByCreator(
    creatorId: string,
    accountId: string,
  ): Promise<xDomainFolders[]> {
    const folders = await this.prisma.folder.findMany({
      where: {
        creatorId,
        accountId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return folders.map((folder) => ({
      id: folder.id,
      folderId: folder.folderId,
      name: folder.name,
      creatorId: folder.creatorId,
      editorId: folder.editorId,
      accountId: folder.accountId,
    }));
  }

  async getFoldersByEditor(
    editorId: string,
    accountId: string,
  ): Promise<xDomainFolders[]> {
    const folders = await this.prisma.folder.findMany({
      where: {
        editorId,
        accountId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return folders.map((folder) => ({
      id: folder.id,
      folderId: folder.folderId,
      name: folder.name,
      creatorId: folder.creatorId,
      editorId: folder.editorId,
      accountId: folder.accountId,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
      deletedAt: folder.deletedAt,
    }));
  }

  async createFolder(
    folderId: string,
    data: CreateFolderData,
  ): Promise<xDomainFolders> {
    return await this.prisma.$transaction(async (tx) => {
      // 1) Check if folder name already exists
      const existingFolder = await tx.folder.findFirst({
        where: {
          name: data.name,
          accountId: data.accountId,
        },
      });

      if (existingFolder) {
        throw new ConflictException(
          'A folder with this name already exists for the account',
        );
      }

      // 2) Create folder
      const folder = await tx.folder.create({
        data: {
          folderId,
          name: data.name,
          creatorId: data.creatorId,
          editorId: data.editorId,
          accountId: data.accountId,
        },
      });

      return {
        id: folder.id,
        folderId: folder.folderId,
        name: folder.name,
        creatorId: folder.creatorId,
        editorId: folder.editorId,
        accountId: folder.accountId,
      };
    });
  }

  async updateFolder(
    id: string,
    data: UpdateFolderData,
  ): Promise<xDomainFolders> {
    return await this.prisma.$transaction(async (tx) => {
      // 1) Check if folder name already exists
      const existingFolder = await tx.folder.findFirst({
        where: { id },
      });

      if (!existingFolder) {
        throw new NotFoundException('Folder not found');
      }

      // 2) Update folder
      const folder = await tx.folder.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          // ...(data.editorId && { editorId: data.editorId }),
          updatedAt: new Date(),
        },
      });

      return {
        id: folder.id,
        folderId: folder.folderId,
        name: folder.name,
        creatorId: folder.creatorId,
        editorId: folder.editorId,
        accountId: folder.accountId,
      };
    });
  }

  async deleteFolder(id: string, userId: string): Promise<boolean> {
    return await this.prisma.$transaction(async (tx) => {
      // 1) check if current user is the creator of the folder
      const folder = await tx.folder.findUnique({
        where: { id, OR: [{ creatorId: userId }, { editorId: userId }] },
      });
      if (!folder) {
        throw new NotFoundException('Folder not found');
      }
      await tx.folder.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });
      return true;
    });
  }

  async getFolderById(id: string): Promise<xDomainFolders | null> {
    const folder = await this.prisma.folder.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!folder) {
      return null;
    }

    return {
      id: folder.id,
      folderId: folder.folderId,
      name: folder.name,
      creatorId: folder.creatorId,
      editorId: folder.editorId,
      accountId: folder.accountId,
    };
  }

  async getFolderItems(
    creatorId: string,
    editorId: string,
    accountId: string,
    folderName: string,
  ): Promise<xDomainFolderItem[]> {
    const folder = await this.prisma.folder.findFirst({
      where: {
        name: folderName,
        creatorId,
        editorId,
        accountId,
        deletedAt: null,
      },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    const folderItems = await this.prisma.folderItem.findMany({
      where: {
        folderId: folder.id,
        deletedAt: null,
      },
      include: {
        media: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return folderItems.map((item) => ({
      id: item.id,
      folderId: item.folderId,
      mediaId: item.mediaId,
      media: {
        id: item.media.id,
        type: item.media.type,
        integrationUrl: item.media.integrationUrl,
        integrationKey: item.media.integrationKey,
      },
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  }

  // New folderitem CRUD methods
  async createFolderItem(
    folderId: string,
    mediaId: string,
  ): Promise<xDomainFolderItem> {
    return await this.prisma.$transaction(async (tx) => {
      const result = await tx.folderItem.create({
        data: {
          id: randomUUID(),
          folderId,
          mediaId,
        },
        include: {
          media: true,
        },
      });
      return this.toFolderItemDomain(result);
    });
  }

  async getFolderItemsByFolderId(
    folderId: string,
  ): Promise<xDomainFolderItem[]> {
    return await this.prisma.$transaction(async (tx) => {
      const result = await tx.folderItem.findMany({
        where: {
          folderId,
          deletedAt: null,
        },
        include: {
          media: true,
        },
      });
      return result.map((item) => this.toFolderItemDomain(item));
    });
  }

  async getFolderItem(
    folderId: string,
    mediaId: string,
  ): Promise<xDomainFolderItem | null> {
    return await this.prisma.$transaction(async (tx) => {
      const result = await tx.folderItem.findUnique({
        where: {
          folderId_mediaId: {
            folderId,
            mediaId,
          },
        },
        include: {
          media: true,
        },
      });
      return result ? this.toFolderItemDomain(result) : null;
    });
  }

  async deleteFolderItem(folderId: string, mediaId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const folderItem = await tx.folderItem.findUnique({
        where: {
          folderId_mediaId: {
            folderId,
            mediaId,
          },
        },
      });

      if (!folderItem) {
        throw new NotFoundException('Folder item not found');
      }

      await tx.folderItem.update({
        where: {
          folderId_mediaId: {
            folderId,
            mediaId,
          },
        },
        data: {
          deletedAt: new Date(),
        },
      });
    });
  }

  private toFolderItemDomain(folderItem: any): xDomainFolderItem {
    return {
      id: folderItem.id,
      folderId: folderItem.folderId,
      mediaId: folderItem.mediaId,
      media: {
        id: folderItem.media.id,
        type: folderItem.media.type,
        integrationUrl: folderItem.media.integrationUrl,
        integrationKey: folderItem.media.integrationKey,
      },
    };
  }
}
