import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IFolderPort, CreateFolderData } from '../../domain/ports/folder.port';
import { xDomainFolders } from '../../domain/models/folder.model';
import { xDomainFolderItem } from '../../domain/models/folder.model';
import { CreateFolderDto } from '../dtos/create-folder.dto';
import { UpdateFolderDto } from '../dtos/update-folder.dto';
import { CreateFolderItemDto } from '../dtos/create-folder-item.dto';
import { DriveService } from '../../../media/libs/drive/application/services/drive.service';

@Injectable()
export class FolderService {
  constructor(
    private readonly folderPort: IFolderPort,
    private readonly driveService: DriveService,
  ) {}
  async getFoldersByCreator(
    creatorId: string,
    accountId: string,
  ): Promise<xDomainFolders[]> {
    try {
      const folders = await this.folderPort.getFoldersByCreator(
        creatorId,
        accountId,
      );
      return folders;
    } catch {
      throw new NotFoundException('Folders not found for the given creator');
    }
  }

  async getFoldersByEditor(
    editorId: string,
    accountId: string,
  ): Promise<xDomainFolders[]> {
    try {
      const folders = await this.folderPort.getFoldersByEditor(
        editorId,
        accountId,
      );
      return folders;
    } catch {
      throw new NotFoundException('Folders not found for the given editor');
    }
  }

  async createFolder(
    createFolderDto: CreateFolderDto,
  ): Promise<xDomainFolders> {
    const folderData: CreateFolderData = {
      name: createFolderDto.name,
      creatorId: createFolderDto.creatorId,
      editorId: createFolderDto.editorId,
      accountId: createFolderDto.accountId,
    };

    // 1) create folder in drive
    const folderId = await this.driveService.createFolder(folderData.name);

    // 2) return our part
    return await this.folderPort.createFolder(folderId, folderData);
  }

  async updateFolder(
    id: string,
    updateFolderDto: UpdateFolderDto,
  ): Promise<xDomainFolders> {
    try {
      // 1) check if folder exists
      const existingFolder = await this.folderPort.getFolderById(id);
      if (!existingFolder) {
        throw new NotFoundException('Folder not found');
      }

      // 2) Try to update the folder name at drive
      await this.driveService.updateFolder(
        existingFolder.folderId,
        updateFolderDto.name!,
      );

      // 2) update folder
      const updatedFolder = await this.folderPort.updateFolder(
        id,
        updateFolderDto,
      );

      // 3) return updated folder
      return updatedFolder;
    } catch {
      throw new InternalServerErrorException('Failed to update folder');
    }
  }

  async deleteFolder(id: string, userId: string): Promise<boolean> {
    return await this.folderPort.deleteFolder(id, userId);
  }

  async getFolderById(id: string): Promise<xDomainFolders> {
    const folder = await this.folderPort.getFolderById(id);
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }
    return folder;
  }

  async getFolderItems(
    creatorId: string,
    editorId: string,
    accountId: string,
    folderName: string,
  ): Promise<xDomainFolderItem[]> {
    try {
      const folderItems = await this.folderPort.getFolderItems(
        creatorId,
        editorId,
        accountId,
        folderName,
      );
      return folderItems;
    } catch {
      throw new NotFoundException('Folder items not found');
    }
  }

  // New folderitem CRUD methods
  async createFolderItem(
    createFolderItemDto: CreateFolderItemDto,
  ): Promise<xDomainFolderItem> {
    return this.folderPort.createFolderItem(
      createFolderItemDto.folderId,
      createFolderItemDto.mediaId,
    );
  }

  async getFolderItemsByFolderId(
    folderId: string,
  ): Promise<xDomainFolderItem[]> {
    return this.folderPort.getFolderItemsByFolderId(folderId);
  }

  async getFolderItem(
    folderId: string,
    mediaId: string,
  ): Promise<xDomainFolderItem | null> {
    return this.folderPort.getFolderItem(folderId, mediaId);
  }

  async deleteFolderItem(folderId: string, mediaId: string): Promise<void> {
    return this.folderPort.deleteFolderItem(folderId, mediaId);
  }
}
