import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/services/auth/db.server";
import { ytIntService } from "@/server/services/yt_int/yt_int.service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL(`/en/accounts?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/en/accounts?error=missing_code", request.url)
      );
    }

    // Get session to identify the user
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.redirect(
        new URL("/en/auth/login?redirect=/en/accounts", request.url)
      );
    }

    // Handle YouTube OAuth callback
    try {
      await ytIntService.handleCallback(code, session.user.id);
      return NextResponse.redirect(
        new URL("/en/accounts?success=linked", request.url)
      );
    } catch (ytError: any) {
      console.error("YouTube OAuth error:", ytError);
      return NextResponse.redirect(
        new URL(`/en/accounts?error=${encodeURIComponent(ytError.message)}`, request.url)
      );
    }
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/en/accounts?error=callback_failed", request.url)
    );
  }
}
