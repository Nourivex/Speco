import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SPECO_SUPABASE_URL ||
  "https://jirpzpqnrnzcsgiecogm.supabase.co";

const serviceRoleKey =
  process.env.SPECO_SUPABASE_SERVICE_ROLE_KEY || "";

const supabaseAdmin = serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

export async function POST(req: NextRequest) {
  try {
    const { passkey } = await req.json().catch(() => ({}));
    const cleanKey = (passkey || "").trim();

    if (!cleanKey) {
      return NextResponse.json(
        { valid: false, message: "Passkey tidak boleh kosong." },
        { status: 400 }
      );
    }

    // 1. Verifikasi dengan database public.admin_passkeys / admin_users via Service Role Key (Private)
    if (supabaseAdmin) {
      try {
        if (cleanKey.includes("@")) {
          const { data: adminEmail, error: emailError } = await supabaseAdmin
            .from("admin_users")
            .select("id, email, full_name, role")
            .eq("email", cleanKey.toLowerCase())
            .eq("role", "admin")
            .maybeSingle();

          if (!emailError && adminEmail) {
            return NextResponse.json({
              valid: true,
              message: "Otentikasi email otoritas berhasil diverifikasi dari database.",
              admin: {
                name: adminEmail.full_name || "Admin Otoritas",
                email: adminEmail.email,
              },
            });
          }
        }

        const { data: record, error } = await supabaseAdmin
          .from("admin_passkeys")
          .select("id, label")
          .eq("passkey", cleanKey)
          .eq("is_active", true)
          .maybeSingle();

        if (!error && record) {
          return NextResponse.json({
            valid: true,
            message: "Otentikasi passkey berhasil diverifikasi dari database.",
          });
        }
      } catch (dbErr) {
        console.warn("Supabase admin_passkeys unreachable, using server fallback:", dbErr);
      }
    }

    // 2. Verifikasi dengan private server-side environment variable atau fallback default
    const serverPasskey = process.env.SPECO_ADMIN_PASSKEY || "speco-admin-2026";
    if (serverPasskey && cleanKey === serverPasskey.trim()) {
      return NextResponse.json({
        valid: true,
        message: "Otentikasi passkey berhasil diverifikasi dari server config.",
      });
    }

    return NextResponse.json(
      { valid: false, message: "Passkey admin tidak valid. Akses ditolak." },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { valid: false, message: err.message || "Kesalahan server saat memverifikasi passkey." },
      { status: 500 }
    );
  }
}
