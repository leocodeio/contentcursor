import { xDomainFolderItem, xDomainFolders } from '../models/folder.model';

export interface CreateFolderData {
  name: string;
  creatorId: string;
  editorId: string;
  accountId: string;
}

export interface UpdateFolderData {
  name?: string;
  editorId?: string;
}

export interface IFolderItem {
  id: string;
  folderId: string;
  mediaId: string;
  media: {
    id: string;
    type: string;
    integrationUrl?: string | null;
    integrationKey?: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export abstract class IFolderPort {
  abstract getFoldersByCreator(
    creatorId: string,
    accountId: string,
  ): Promise<xDomainFolders[]>;

  abstract getFoldersByEditor(
    editorId: string,
    accountId: string,
  ): Promise<xDomainFolders[]>;

  abstract createFolder(
    folderId: string,
    data: CreateFolderData,
  ): Promise<xDomainFolders>;

  abstract updateFolder(
    id: string,
    data: UpdateFolderData,
  ): Promise<xDomainFolders>;

  abstract deleteFolder(id: string, userId: string): Promise<boolean>;

  abstract getFolderById(id: string): Promise<xDomainFolders | null>;

  abstract getFolderItems(
    creatorId: string,
    editorId: string,
    accountId: string,
    folderName: string,
  ): Promise<xDomainFolderItem[]>;

  // New folderitem CRUD methods
  abstract createFolderItem(
    folderId: string,
    mediaId: string,
  ): Promise<xDomainFolderItem>;

  abstract getFolderItemsByFolderId(
    folderId: string,
  ): Promise<xDomainFolderItem[]>;

  abstract getFolderItem(
    folderId: string,
    mediaId: string,
  ): Promise<xDomainFolderItem | null>;

  abstract deleteFolderItem(folderId: string, mediaId: string): Promise<void>;
}
