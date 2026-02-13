import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/server/services/auth/auth-client";

// PUT - Update folder
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.data?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Extract folderId from the URL path
    const url = request.nextUrl.pathname;
    const folderId = url.split("/api/folder/")[1]?.split("/")[0];

    if (!folderId) {
      return NextResponse.json(
        { success: false, message: "Folder ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, message: "Folder name is required" },
        { status: 400 }
      );
    }

    // Update folder logic would go here
    return NextResponse.json({
      success: true,
      message: "Folder updated successfully",
      data: {
        id: folderId,
        name: name.trim(),
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Update folder error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update folder" },
      { status: 500 }
    );
  }
}

// DELETE - Delete folder
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.data?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Extract folderId from the URL path
    const url = request.nextUrl.pathname;
    const folderId = url.split("/api/folder/")[1]?.split("/")[0];

    if (!folderId) {
      return NextResponse.json(
        { success: false, message: "Folder ID is required" },
        { status: 400 }
      );
    }

    // Delete folder logic would go here
    return NextResponse.json({
      success: true,
      message: "Folder deleted successfully",
    });
  } catch (error) {
    console.error("Delete folder error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete folder" },
      { status: 500 }
    );
  }
}
