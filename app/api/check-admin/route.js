import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("sb-access-token")?.value;

    if (!accessToken) {
      return Response.json({ isAdmin: false }, { status: 401 });
    }

    const {
      data: { user },
      error,
    } = await supabaseAuth.auth.getUser(accessToken);

    if (error || !user) {
      return Response.json({ isAdmin: false }, { status: 401 });
    }

    const isAdmin =
      user.email &&
      user.email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase();

    return Response.json({ isAdmin: !!isAdmin });
  } catch (e) {
    return Response.json(
      { isAdmin: false, error: e.message || "server error" },
      { status: 500 }
    );
  }
}