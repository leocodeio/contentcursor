import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { contributeService } from "@/server/services/contribute/contribute.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contribution = await contributeService.getContributionById(params.id);
  if (!contribution) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(contribution);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const videoFile = formData.get("video") as File;
    const thumbnailFile = formData.get("thumbnail") as File;
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

    const version = await contributeService.createVersion(
      params.id,
      files,
      { title, description, tags }
    );

    return NextResponse.json(version);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
