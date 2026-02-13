import { prisma } from "@/lib/prisma";
import { driveService } from "../media/drive.service";

export interface CreateFolderData {
  name: string;
  creatorId: string;
  editorId: string;
  accountId: string;
}

export class FolderService {
  async getFoldersByCreator(creatorId: string, accountId: string) {
    return prisma.folder.findMany({
      where: { creatorId, accountId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
  }

  async getFoldersByEditor(editorId: string, accountId: string) {
    return prisma.folder.findMany({
      where: { editorId, accountId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
  }

  async createFolder(data: CreateFolderData) {
    const existingFolder = await prisma.folder.findFirst({
      where: { name: data.name, accountId: data.accountId, deletedAt: null },
    });

    if (existingFolder) {
      throw new Error("A folder with this name already exists");
    }

    const driveFolderId = await driveService.createFolder(data.name);

    return prisma.folder.create({
      data: {
        folderId: driveFolderId,
        name: data.name,
        creatorId: data.creatorId,
        editorId: data.editorId,
        accountId: data.accountId,
      },
    });
  }

  async updateFolder(id: string, name: string) {
    const existingFolder = await prisma.folder.findUnique({ where: { id } });
    if (!existingFolder) throw new Error("Folder not found");

    await driveService.updateFolder(existingFolder.folderId, name);

    return prisma.folder.update({
      where: { id },
      data: { name, updatedAt: new Date() },
    });
  }

  async deleteFolder(id: string, userId: string) {
    const folder = await prisma.folder.findFirst({
      where: { id, OR: [{ creatorId: userId }, { editorId: userId }] },
    });
    if (!folder) throw new Error("Folder not found or unauthorized");

    return prisma.folder.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getFolderById(id: string) {
    return prisma.folder.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async getFolderItems(folderId: string) {
    return prisma.folderItem.findMany({
      where: { folderId, deletedAt: null },
      include: { media: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async createFolderItem(folderId: string, mediaId: string) {
    return prisma.folderItem.create({
      data: { folderId, mediaId },
      include: { media: true },
    });
  }

  async deleteFolderItem(folderId: string, mediaId: string) {
    return prisma.folderItem.update({
      where: { folderId_mediaId: { folderId, mediaId } },
      data: { deletedAt: new Date() },
    });
  }
}

export const folderService = new FolderService();
