import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { folderService } from "@/server/services/folder/folder.service";
import { z } from "zod";

const createFolderSchema = z.object({
  name: z.string().min(1),
  creatorId: z.string(),
  editorId: z.string(),
  accountId: z.string(),
});

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const creatorId = searchParams.get("creatorId");
  const editorId = searchParams.get("editorId");
  const accountId = searchParams.get("accountId");

  try {
    if (creatorId && accountId) {
      const folders = await folderService.getFoldersByCreator(creatorId, accountId);
      return NextResponse.json(folders);
    }
    if (editorId && accountId) {
      const folders = await folderService.getFoldersByEditor(editorId, accountId);
      return NextResponse.json(folders);
    }
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const validatedData = createFolderSchema.parse(body);
    const folder = await folderService.createFolder(validatedData);
    return NextResponse.json(folder);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
