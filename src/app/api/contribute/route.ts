import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { contributeService } from "@/server/services/contribute/contribute.service";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get("accountId");

  if (!accountId) return NextResponse.json({ error: "Missing accountId" }, { status: 400 });

  const contributions = await contributeService.getContributionsByAccountId(accountId);
  return NextResponse.json(contributions);
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const videoFile = formData.get("video") as File;
    const thumbnailFile = formData.get("thumbnail") as File;
    const accountId = formData.get("accountId") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const tags = formData.get("tags") as string;

    const files = {
      video: {
        buffer: Buffer.from(await videoFile.arrayBuffer()),
        mimeType: videoFile.type,
        originalname: videoFile.name,
        size: videoFile.size,
      },
      thumbnail: {
        buffer: Buffer.from(await thumbnailFile.arrayBuffer()),
        mimeType: thumbnailFile.type,
        originalname: thumbnailFile.name,
        size: thumbnailFile.size,
      },
    };

    const contribution = await contributeService.createContribution(
      files,
      { accountId, title, description, tags },
      session.user.id
    );

    return NextResponse.json(contribution);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
