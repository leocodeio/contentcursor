import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/services/auth/db.server";
import { mediaService } from "@/server/services/media/media.service";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;
    const folderId = formData.get("folderId") as string;

    if (!file) throw new Error("No file uploaded");

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileData = {
      buffer,
      mimeType: file.type,
      originalname: file.name,
      size: file.size,
    };

    let media;
    if (folderId) {
      media = await mediaService.saveWithFolderRelation(fileData, type, folderId, session.user.id);
    } else {
      media = await mediaService.save(fileData, type);
    }

    return NextResponse.json(media);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
