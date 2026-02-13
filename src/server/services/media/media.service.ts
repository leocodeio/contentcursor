import { prisma } from "@/lib/prisma";
import { driveService } from "./drive.service";
import { randomUUID } from "node:crypto";

export class MediaService {
  async save(file: { buffer: Buffer; mimeType: string; originalname: string; size: number }, type: string) {
    const fileName = `${new Date().toISOString()}_${file.originalname}_${randomUUID()}.${file.mimeType.split("/")[1]}`;

    let driveResult: { url: string; fileId: string };
    try {
      driveResult = await driveService.uploadFile({
        file: file.buffer,
        mimeType: file.mimeType,
        folderName: process.env.DRIVE_ROOT_FOLDER_NAME || "spectral ",
        fileName,
        size: file.size,
      });
    } catch (error: any) {
      throw new Error(`Drive upload failed: ${error.message}`);
    }

    try {
      return await prisma.media.create({
        data: {
          id: randomUUID(),
          type,
          integrationUrl: driveResult.url,
          integrationKey: driveResult.fileId,
        },
      });
    } catch (error) {
      await driveService.deleteFile(driveResult.fileId);
      throw error;
    }
  }

  async saveWithFolderRelation(
    file: { buffer: Buffer; mimeType: string; originalname: string; size: number },
    type: string,
    folderId: string,
    userId: string
  ) {
    const folder = await prisma.folder.findUnique({ where: { id: folderId } });
    if (!folder) throw new Error("Folder not found");

    const fileName = `${folder.name}_${new Date().toISOString()}_${file.originalname}_${randomUUID()}.${file.mimeType.split("/")[1]}_${userId}`;

    let driveResult: { url: string; fileId: string };
    try {
      driveResult = await driveService.uploadFile({
        file: file.buffer,
        mimeType: file.mimeType,
        folderName: `${process.env.DRIVE_ROOT_FOLDER_NAME || "spectral "}/${folder.name}_${folder.id}`,
        fileName,
        size: file.size,
      });
    } catch (error: any) {
      throw new Error(`Drive upload failed: ${error.message}`);
    }

    try {
      return await prisma.$transaction(async (tx) => {
        const media = await tx.media.create({
          data: {
            id: randomUUID(),
            type,
            integrationUrl: driveResult.url,
            integrationKey: driveResult.fileId,
          },
        });

        await tx.folderItem.create({
          data: {
            id: randomUUID(),
            folderId,
            mediaId: media.id,
          },
        });

        return media;
      });
    } catch (error) {
      await driveService.deleteFile(driveResult.fileId);
      throw error;
    }
  }

  async delete(id: string) {
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) throw new Error("Media not found");

    if (media.integrationKey) {
      await driveService.deleteFile(media.integrationKey);
    }

    return prisma.media.delete({ where: { id } });
  }

  async getById(id: string) {
    return prisma.media.findUnique({ where: { id } });
  }
}

export const mediaService = new MediaService();
