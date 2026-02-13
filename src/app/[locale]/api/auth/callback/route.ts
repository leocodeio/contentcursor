import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/server/services/auth/auth-client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL(`/accounts?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/accounts?error=missing_code", request.url)
      );
    }

    // Exchange code for tokens and store them
    // This would integrate with YouTube OAuth
    const session = await getSession();
    
    if (!session?.data?.user) {
      return NextResponse.redirect(
        new URL("/auth/login?redirect=/accounts", request.url)
      );
    }

    // In a real implementation, this would:
    // 1. Exchange the code for access/refresh tokens
    // 2. Store the tokens securely
    // 3. Link the account to the user

    // For now, redirect with success
    return NextResponse.redirect(
      new URL("/accounts?success=linked", request.url)
    );
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/accounts?error=callback_failed", request.url)
    );
  }
}
