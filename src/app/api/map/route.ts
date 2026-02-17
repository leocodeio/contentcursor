import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/services/auth/db.server";
import { mapService } from "@/server/services/map/map.service";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const creatorId = searchParams.get("creatorId");
  const editorId = searchParams.get("editorId");
  const editorMail = searchParams.get("editorMail");

  try {
    if (creatorId && editorMail) {
      const map = await mapService.findCreatorEditorMap(creatorId, editorMail);
      return NextResponse.json(map);
    }
    if (creatorId) {
      const maps = await mapService.findMapsByCreatorId(creatorId);
      return NextResponse.json(maps);
    }
    if (editorId) {
      const maps = await mapService.findMapsByEditorId(editorId);
      return NextResponse.json(maps);
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
    const { creatorId, editorId } = await req.json();
    const map = await mapService.requestEditor(creatorId, editorId);
    return NextResponse.json(map);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, status } = await req.json();
    const map = await mapService.updateCreatorEditorStatus(id, status);
    return NextResponse.json(map);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
