import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { hashPassword, verifyPassword } from "@/lib/password";

export async function POST(req: Request) {
  const { currentPassword, newPassword } = (await req.json()) as {
    currentPassword: string;
    newPassword: string;
  };
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ ok: false, error: "Both passwords are required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "site_password_hash")
    .single();

  if (error || !data) return NextResponse.json({ ok: false, error: "Password not configured" }, { status: 500 });
  if (!verifyPassword(currentPassword, data.value)) {
    return NextResponse.json({ ok: false, error: "Current password is incorrect" }, { status: 401 });
  }

  const { error: updateError } = await supabase
    .from("app_settings")
    .update({ value: hashPassword(newPassword) })
    .eq("key", "site_password_hash");

  if (updateError) return NextResponse.json({ ok: false, error: updateError.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
