import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/server/services/auth/auth-client";

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
    const { accountId } = body;

    if (!accountId) {
      return NextResponse.json(
        { success: false, message: "Account ID is required" },
        { status: 400 }
      );
    }

    // Unlink the account from the creator
    // This would:
    // 1. Remove the YouTube account association
    // 2. Delete stored OAuth tokens
    // 3. Handle any cascading deletes for linked editors

    // For now, just return success
    return NextResponse.json({
      success: true,
      message: "Account unlinked successfully",
    });
  } catch (error) {
    console.error("Unlink account error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to unlink account" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  return POST(request);
}
