import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/services/auth/db.server";
import { mapService } from "@/server/services/map/map.service";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const creatorId = searchParams.get("creatorId");
  const accountId = searchParams.get("accountId");
  const editorId = searchParams.get("editorId");

  try {
    if (creatorId && accountId) {
      const editors = await mapService.findAccountEditors(creatorId, accountId);
      return NextResponse.json(editors);
    }
    if (editorId) {
      const accounts = await mapService.findAccountsByEditorId(editorId);
      return NextResponse.json(accounts);
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
    const { creatorId, accountId, editorId, status } = await req.json();
    const map = await mapService.changeCEAstatus(creatorId, accountId, editorId, status);
    return NextResponse.json(map);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
