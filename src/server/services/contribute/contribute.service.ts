import { prisma } from "@/lib/prisma";
import { mediaService } from "../media/media.service";
import { randomUUID } from "node:crypto";

export class ContributeService {
  async createContribution(
    files: { video: any; thumbnail: any },
    data: { accountId: string; title: string; description: string; tags: string },
    editorId: string
  ) {
    const videoMedia = await mediaService.save(files.video, "VIDEO");
    const thumbnailMedia = await mediaService.save(files.thumbnail, "IMAGE");

    return prisma.contribute.create({
      data: {
        id: randomUUID(),
        accountId: data.accountId,
        editorId,
        videoId: videoMedia.id,
        thumbnailId: thumbnailMedia.id,
        title: data.title,
        description: data.description,
        tags: data.tags.split(","),
        duration: files.video.size,
      },
    });
  }

  async getContributionsByAccountId(accountId: string) {
    return prisma.contribute.findMany({
      where: { accountId },
      include: {
        editor: true,
        video: true,
        thumbnail: true,
        versions: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getContributionById(id: string) {
    return prisma.contribute.findUnique({
      where: { id },
      include: {
        editor: true,
        video: true,
        thumbnail: true,
        versions: {
          include: {
            video: true,
            thumbnail: true,
            comments: {
              include: { author: true },
            },
          },
        },
      },
    });
  }

  async createVersion(
    contributeId: string,
    files: { video: any; thumbnail: any },
    data: { title: string; description: string; tags: string }
  ) {
    const videoMedia = await mediaService.save(files.video, "VIDEO");
    const thumbnailMedia = await mediaService.save(files.thumbnail, "IMAGE");

    return prisma.contributionVersion.create({
      data: {
        id: randomUUID(),
        contributeId,
        videoId: videoMedia.id,
        thumbnailId: thumbnailMedia.id,
        title: data.title,
        description: data.description,
        tags: data.tags.split(","),
        duration: files.video.size,
      },
    });
  }

  async getVersionsByContributionId(contributeId: string) {
    return prisma.contributionVersion.findMany({
      where: { contributeId },
      include: {
        video: true,
        thumbnail: true,
        comments: {
          include: { author: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateVersionStatus(versionId: string, status: any) {
    // Logic for YouTube upload would go here if status is COMPLETED
    // Mirroring the original service's check
    const version = await prisma.contributionVersion.findUnique({
      where: { id: versionId },
      include: { 
        contribute: { include: { account: true } },
        video: true,
        thumbnail: true
      }
    });

    if (!version) throw new Error("Version not found");

    if (status === "COMPLETED") {
       // ytAuthService.uploadVideoThroughContribution(...) call would go here
       // For now, we update status.
    }

    return prisma.contributionVersion.update({
      where: { id: versionId },
      data: { status },
    });
  }

  async createVersionComment(versionId: string, authorId: string, content: string) {
    return prisma.versionComment.create({
      data: {
        id: randomUUID(),
        versionId,
        authorId,
        content,
      },
    });
  }

  async getVersionComments(versionId: string) {
    return prisma.versionComment.findMany({
      where: { versionId },
      include: { author: true },
      orderBy: { createdAt: "asc" },
    });
  }
}

export const contributeService = new ContributeService();
