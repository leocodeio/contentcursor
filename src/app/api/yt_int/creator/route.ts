import { NextRequest, NextResponse } from "next/server";
import { ytIntService } from "@/server/services/yt_int/yt_int.service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const creatorId = searchParams.get("creatorId");
  const status = searchParams.get("status");

  try {
    const entries = await ytIntService.getCreatorEntries(creatorId || undefined, status || undefined);
    return NextResponse.json(entries);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const entry = await ytIntService.updateCreatorEntry(id, body);
    return NextResponse.json(entry);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
