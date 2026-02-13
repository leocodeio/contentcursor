import { prisma } from "@/lib/prisma";

export class MapService {
  // Creator-Editor Map
  async findCreatorEditorMap(creatorId: string, editorMail: string) {
    const editor = await prisma.user.findUnique({ where: { email: editorMail } });
    if (!editor || editor.role !== "editor") throw new Error("Editor not found");

    const creator = await prisma.user.findUnique({ where: { id: creatorId } });
    if (!creator || creator.role !== "creator") throw new Error("Creator not found");

    const map = await prisma.creatorEditorMap.findFirst({
      where: { creatorId, editorId: editor.id },
    });

    return {
      creatorId,
      editorId: editor.id,
      editorMail: editor.email,
      editorName: editor.name,
      editorAvatar: editor.image || "",
      status: map ? map.status : "INACTIVE",
    };
  }

  async findMapsByCreatorId(creatorId: string) {
    return prisma.creatorEditorMap.findMany({
      where: { creatorId },
      include: {
        editor: {
          select: { id: true, email: true, name: true, image: true },
        },
      },
    });
  }

  async findMapsByEditorId(editorId: string) {
    return prisma.creatorEditorMap.findMany({
      where: { editorId },
      include: {
        creator: {
          select: { id: true, email: true, name: true, image: true },
        },
      },
    });
  }

  async requestEditor(creatorId: string, editorId: string) {
    const exists = await prisma.creatorEditorMap.findFirst({
      where: { creatorId, editorId },
    });

    if (exists) {
      return prisma.creatorEditorMap.update({
        where: { id: exists.id },
        data: { status: "PENDING" },
      });
    }

    return prisma.creatorEditorMap.create({
      data: { creatorId, editorId, status: "PENDING" },
    });
  }

  async updateCreatorEditorStatus(id: string, status: any) {
    const result = await prisma.creatorEditorMap.update({
      where: { id },
      data: { status },
    });

    if (status === "INACTIVE") {
      const accounts = await prisma.ytCreator.findMany({
        where: { creatorId: result.creatorId },
      });

      for (const account of accounts) {
        await prisma.accountEditorMap.updateMany({
          where: { accountId: account.id, editorId: result.editorId },
          data: { status: "INACTIVE" },
        });
      }
    }

    return result;
  }

  // Account-Editor Map
  async findAccountEditors(creatorId: string, accountId: string) {
    const creator = await prisma.user.findUnique({ where: { id: creatorId } });
    if (!creator || creator.role !== "creator") throw new Error("Invalid creator");

    const account = await prisma.ytCreator.findUnique({ where: { id: accountId } });
    if (!account || account.creatorId !== creatorId) throw new Error("Account not found or unauthorized");

    return prisma.accountEditorMap.findMany({
      where: { accountId, status: "ACTIVE" },
      include: { editor: true },
    });
  }

  async findAccountsByEditorId(editorId: string) {
    return prisma.accountEditorMap.findMany({
      where: { editorId, status: "ACTIVE" },
      include: { account: true },
    });
  }

  async changeCEAstatus(creatorId: string, accountId: string, editorId: string, status: any) {
    const creatorEditorMap = await prisma.creatorEditorMap.findFirst({
      where: { creatorId, editorId, status: "ACTIVE" },
    });

    if (!creatorEditorMap) throw new Error("No active relationship between creator and editor");

    const existingMap = await prisma.accountEditorMap.findFirst({
      where: { accountId, editorId },
    });

    if (existingMap) {
      return prisma.accountEditorMap.update({
        where: { id: existingMap.id },
        data: { status },
      });
    }

    return prisma.accountEditorMap.create({
      data: { accountId, editorId, status },
    });
  }
}

export const mapService = new MapService();
