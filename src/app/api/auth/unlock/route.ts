import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyPassword } from "@/lib/password";

export async function POST(req: Request) {
  const { password } = (await req.json()) as { password: string };
  if (!password) return NextResponse.json({ ok: false }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "site_password_hash")
    .single();

  if (error || !data) return NextResponse.json({ ok: false, error: "Password not configured" }, { status: 500 });

  const ok = verifyPassword(password, data.value);
  return NextResponse.json({ ok });
}
