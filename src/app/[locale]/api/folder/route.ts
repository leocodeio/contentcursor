import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/server/services/auth/auth-client";

// GET - List folders
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.data?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const creatorId = searchParams.get("creatorId");
    const accountId = searchParams.get("accountId");

    // Return mock folders for now
    const folders = [
      {
        id: "folder-1",
        name: "Gaming Videos",
        accountId: accountId,
        creatorId: creatorId,
        createdAt: new Date().toISOString(),
        items: [],
      },
      {
        id: "folder-2",
        name: "Vlogs",
        accountId: accountId,
        creatorId: creatorId,
        createdAt: new Date().toISOString(),
        items: [],
      },
    ];

    return NextResponse.json(folders);
  } catch (error) {
    console.error("Get folders error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch folders" },
      { status: 500 }
    );
  }
}

// POST - Create folder
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.data?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, accountId, editorId } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, message: "Folder name is required" },
        { status: 400 }
      );
    }

    // Create folder logic would go here
    const newFolder = {
      id: `folder-${Date.now()}`,
      name: name.trim(),
      accountId,
      editorId: editorId || null,
      creatorId: session.data.user.id,
      createdAt: new Date().toISOString(),
      items: [],
    };

    return NextResponse.json({
      success: true,
      message: "Folder created successfully",
      data: newFolder,
    });
  } catch (error) {
    console.error("Create folder error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create folder" },
      { status: 500 }
    );
  }
}
