import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { contributeService } from "@/server/services/contribute/contribute.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { versionId: string } }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const comments = await contributeService.getVersionComments(params.versionId);
  return NextResponse.json(comments);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { versionId: string } }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { content } = await req.json();
    const comment = await contributeService.createVersionComment(
      params.versionId,
      session.user.id,
      content
    );
    return NextResponse.json(comment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { versionId: string } }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { status } = await req.json();
    const version = await contributeService.updateVersionStatus(params.versionId, status);
    return NextResponse.json(version);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
