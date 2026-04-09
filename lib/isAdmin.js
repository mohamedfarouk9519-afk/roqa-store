import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function isAdminUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("sb-access-token")?.value;

  if (!accessToken) return { ok: false, user: null };

  const {
    data: { user },
    error,
  } = await supabaseAuth.auth.getUser(accessToken);

  if (error || !user) return { ok: false, user: null };

  const ok =
    user.email &&
    user.email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase();

  return { ok: !!ok, user };
}