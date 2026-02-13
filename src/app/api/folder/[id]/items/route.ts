import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { folderService } from "@/server/services/folder/folder.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await folderService.getFolderItems(params.id);
  return NextResponse.json(items);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { mediaId } = await req.json();
    const item = await folderService.createFolderItem(params.id, mediaId);
    return NextResponse.json(item);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
