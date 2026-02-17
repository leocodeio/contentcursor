import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/services/auth/db.server";
import { mapService } from "@/server/services/map/map.service";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get("accountId");
  const editorId = searchParams.get("editorId");

  if (!accountId || !editorId) {
    return NextResponse.json({ error: "Missing accountId or editorId" }, { status: 400 });
  }

  try {
    const map = await mapService.linkEditorToAccount(session.user.id, accountId, editorId);
    return NextResponse.json(map);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get("accountId");
  const editorId = searchParams.get("editorId");

  if (!accountId || !editorId) {
    return NextResponse.json({ error: "Missing accountId or editorId" }, { status: 400 });
  }

  try {
    const map = await mapService.unlinkEditorFromAccount(session.user.id, accountId, editorId);
    return NextResponse.json(map);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
