import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SPECO_SUPABASE_URLSUPABASE_URL ||
  process.env.NEXT_PUBLIC_SPECO_SUPABASE_URL ||
  "https://jirpzpqnrnzcsgiecogm.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SPECO_SUPABASE_URLSUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SPECO_SUPABASE_URLSUPABASE_PUBLISHABLE_KEY ||
  process.env.SPECO_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SPECO_SUPABASE_ANON_KEY ||
  "";

/**
 * Supabase client instance (hanya aktif jika kredensial environment tersedia).
 * Mendukung akses langsung katalog laptop, otentikasi Google/email,
 * serta penyimpanan bookmark laptop favorit mahasiswa.
 */
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const isSupabaseConfigured = Boolean(supabase);

export interface SupabaseLaptop {
  id: string;
  brand: string;
  model: string;
  series?: string;
  category: string;
  major_target?: string;
  cpu: string;
  gpu: string;
  ram_gb: number;
  ram_upgradable: boolean;
  storage: string;
  display: string;
  weight_kg: number;
  price_idr: number;
  image_url?: string;
  buy_url?: string;
  warranty?: string;
  usecase_tag?: string;
  pros?: string;
  cons?: string;
  device_type?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Mengambil daftar laptop dari Supabase jika terhubung,
 * atau null jika Supabase belum dikonfigurasi.
 */
export async function getLaptopsFromSupabase(): Promise<SupabaseLaptop[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("laptops")
      .select("*")
      .order("price_idr", { ascending: true });

    if (error) {
      console.warn("Gagal mengambil data dari Supabase:", error.message);
      return null;
    }
    return data as SupabaseLaptop[];
  } catch (err) {
    console.warn("Kesalahan koneksi Supabase:", err);
    return null;
  }
}

/**
 * Insert laptop baru ke Supabase
 */
export async function insertLaptopToSupabase(laptop: Partial<SupabaseLaptop>) {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi");
  const { data, error } = await supabase.from("laptops").insert([laptop]).select();
  if (error) throw error;
  return data?.[0] as SupabaseLaptop;
}

/**
 * Update data laptop di Supabase
 */
export async function updateLaptopInSupabase(id: string, updates: Partial<SupabaseLaptop>) {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi");
  const { data, error } = await supabase.from("laptops").update(updates).eq("id", id).select();
  if (error) throw error;
  return data?.[0] as SupabaseLaptop;
}

/**
 * Hapus laptop dari Supabase
 */
export async function deleteLaptopFromSupabase(id: string) {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi");
  const { error } = await supabase.from("laptops").delete().eq("id", id);
  if (error) throw error;
  return true;
}

/**
 * Autentikasi Pengguna
 */
export async function signInWithEmail(email: string, pass: string) {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi");
  return await supabase.auth.signInWithPassword({ email, password: pass });
}

export async function signUpWithEmail(email: string, pass: string, name?: string) {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi");
  return await supabase.auth.signUp({
    email,
    password: pass,
    options: {
      data: { full_name: name || "" },
    },
  });
}

export async function signInWithGoogle(redirectTo?: string) {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi");
  const targetUrl =
    redirectTo ||
    (typeof window !== "undefined" ? `${window.location.origin}/` : undefined);

  return await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: targetUrl,
    },
  });
}

export async function signOutUser() {
  if (!supabase) return;
  return await supabase.auth.signOut();
}

export async function getCurrentUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data?.user ?? null;
}

/**
 * Memeriksa apakah user merupakan admin terotorisasi
 * Memanggil server route /api/admin/verify secara aman tanpa hardcode email
 */
export async function isAdminUser(user: any): Promise<boolean> {
  if (!user) return false;

  // 1. Cek cepat metadata lokal dari JWT session
  if (
    user.app_metadata?.role === "admin" ||
    user.user_metadata?.role === "admin"
  ) {
    return true;
  }

  // 2. Verifikasi ke server API route yang aman
  try {
    const sessionRes = await supabase?.auth.getSession();
    const token = sessionRes?.data.session?.access_token;

    const res = await fetch("/api/admin/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ token }),
    });

    if (res.ok) {
      const data = await res.json();
      return Boolean(data.authorized);
    }
  } catch {
    // ignore network error
  }

  return false;
}

/**
 * Verifikasi passkey melalui server route /api/admin/passkey (Zero Client Secret Exposure)
 */
export async function verifyPasskeyFromDatabase(passkey: string): Promise<boolean> {
  const cleanKey = (passkey || "").trim();
  if (!cleanKey) return false;

  try {
    const res = await fetch("/api/admin/passkey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passkey: cleanKey }),
    });

    if (res.ok) {
      const data = await res.json();
      return Boolean(data.valid);
    }
  } catch {
    // ignore network error
  }

  return false;
}
