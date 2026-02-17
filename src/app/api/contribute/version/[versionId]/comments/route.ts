import { NextRequest, NextResponse } from "next/server";
import { contributeService } from "@/server/services/contribute/contribute.service";
import { auth } from "@/server/services/auth/db.server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ versionId: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { versionId } = await params;
  const comments = await contributeService.getVersionComments(versionId);
  return NextResponse.json(comments);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ versionId: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { versionId } = await params;
  try {
    const { content } = await req.json();
    const comment = await contributeService.createVersionComment(
      versionId,
      session.user.id,
      content
    );
    return NextResponse.json(comment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
