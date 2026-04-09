import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get("sb-access-token")?.value;

  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const {
    data: { user },
    error,
  } = await supabaseAuth.auth.getUser(accessToken);

  if (error || !user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const isAdmin =
    user.email &&
    user.email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase();

  if (!isAdmin) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};