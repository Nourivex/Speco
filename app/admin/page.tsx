"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import * as XLSX from "xlsx";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/ssr/PencilSimple";
import { TrashIcon } from "@phosphor-icons/react/dist/ssr/Trash";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { DatabaseIcon } from "@phosphor-icons/react/dist/ssr/Database";
import { DesktopIcon } from "@phosphor-icons/react/dist/ssr/Desktop";
import { LaptopIcon } from "@phosphor-icons/react/dist/ssr/Laptop";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { CheckIcon } from "@phosphor-icons/react/dist/ssr/Check";
import { XIcon } from "@phosphor-icons/react/dist/ssr/X";
import { LockKeyIcon } from "@phosphor-icons/react/dist/ssr/LockKey";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/ssr/ShieldCheck";
import { DownloadSimpleIcon } from "@phosphor-icons/react/dist/ssr/DownloadSimple";
import { SignOutIcon } from "@phosphor-icons/react/dist/ssr/SignOut";
import { formatRupiah } from "@/lib/format";
import { BrandIcon, GoogleLogoIcon } from "@/components/ui/brand-icon";
import {
  catalogLaptops,
  CatalogLaptop,
} from "@/lib/catalog-service";
import {
  getLaptopsFromSupabase,
  insertLaptopToSupabase,
  updateLaptopInSupabase,
  deleteLaptopFromSupabase,
  SupabaseLaptop,
  isSupabaseConfigured,
  getCurrentUser,
  signInWithGoogle,
  isAdminUser,
  verifyPasskeyFromDatabase,
} from "@/lib/supabase";

export default function AdminPage() {
  // Admin Auth Gate State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = React.useState<boolean>(false);
  const [authChecking, setAuthChecking] = React.useState<boolean>(true);
  const [passkeyInput, setPasskeyInput] = React.useState<string>("");
  const [authError, setAuthError] = React.useState<string | null>(null);

  // Data & Filter State
  const [laptops, setLaptops] = React.useState<CatalogLaptop[]>(catalogLaptops);
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<"all" | "laptop" | "minipc">("all");
  const [brandFilter, setBrandFilter] = React.useState<string>("all");
  const [loading, setLoading] = React.useState(false);
  const [statusMsg, setStatusMsg] = React.useState<string | null>(null);

  // In-line Editing State
  const [inlineEditingId, setInlineEditingId] = React.useState<string | null>(null);
  const [inlineValues, setInlineValues] = React.useState<{
    price: string;
    ram: string;
    storage: string;
    warranty: string;
  }>({ price: "", ram: "", storage: "", warranty: "" });
  const [savingInlineId, setSavingInlineId] = React.useState<string | null>(null);

  // Full Edit / Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingLaptop, setEditingLaptop] = React.useState<CatalogLaptop | null>(null);

  // Form State
  const [formData, setFormData] = React.useState({
    ID_Perangkat: "",
    Brand: "Advan",
    Model_Seri: "",
    Tipe_Perangkat: "Laptop",
    Processor_CPU: "",
    Kartu_Grafis_GPU: "",
    RAM_GB: "16",
    Upgradeable_RAM: "Ya",
    Storage_GB_Tipe: "512GB SSD NVMe",
    Layar_Ukuran_Panel_ColorGamut: "14 inci IPS FHD",
    Bobot_kg: "1.4",
    Estimasi_Harga_Pasar_IDR: "7000000",
    Status_Garansi_Resmi: "1 Tahun Resmi",
    Platform_Rekomendasi_Beli: "Tokopedia Official",
    Link_Gambar: "",
    Pros_Kelebihan: "",
    Cons_Kekurangan: "",
  });

  // Cek Status Admin Saat Mount
  React.useEffect(() => {
    async function verifyAdminAuth() {
      try {
        const localAuth = localStorage.getItem("speco_admin_session");
        if (localAuth === "authorized_lead_affif") {
          setIsAdminAuthenticated(true);
          setAuthChecking(false);
          return;
        }

        if (isSupabaseConfigured) {
          const user = await getCurrentUser();
          if (user) {
            const isAuthorizedAdmin = await isAdminUser(user);
            if (isAuthorizedAdmin) {
              setIsAdminAuthenticated(true);
              localStorage.setItem("speco_admin_session", "authorized_lead_affif");
              setAuthChecking(false);
              return;
            }
          }
        }
      } catch (e) {
        console.warn("Auth check warning:", e);
      } finally {
        setAuthChecking(false);
      }
    }
    verifyAdminAuth();
  }, []);

  // Fetch Supabase Data
  React.useEffect(() => {
    async function fetchSupabaseData() {
      if (!isSupabaseConfigured || !isAdminAuthenticated) return;
      setLoading(true);
      try {
        const data = await getLaptopsFromSupabase();
        if (data && data.length > 0) {
          const mapped: CatalogLaptop[] = data.map((d) => ({
            ID_Perangkat: d.id,
            Kategori_Target: d.category || "Mahasiswa",
            Target_Mahasiswa_Jurusan: d.major_target || "Semua Jurusan",
            Brand: d.brand,
            Model_Seri: d.model,
            Tipe_Perangkat: d.device_type || (d.model.toLowerCase().includes("mini") ? "Mini PC" : "Laptop"),
            Processor_CPU: d.cpu,
            Kartu_Grafis_GPU: d.gpu,
            RAM_GB: d.ram_gb,
            Upgradeable_RAM: d.ram_upgradable ? "Ya" : "Tidak",
            Storage_GB_Tipe: d.storage,
            Layar_Ukuran_Panel_ColorGamut: d.display,
            Bobot_kg: d.weight_kg,
            Estimasi_Harga_Pasar_IDR: d.price_idr,
            Platform_Rekomendasi_Beli: d.buy_url || "Tokopedia",
            Status_Garansi_Resmi: d.warranty || "Resmi",
            Rekomendasi_UseCase_Tag: d.usecase_tag || "#kuliah",
            Pros_Kelebihan: d.pros || "",
            Cons_Kekurangan: d.cons || "",
            Link_Gambar: d.image_url || "",
            numericPrice: Number(d.price_idr) || 0,
            numericRam: Number(d.ram_gb) || 8,
            numericWeight: Number(d.weight_kg) || 1.4,
          }));
          setLaptops(mapped);
        }
      } catch (err) {
        console.warn("Gagal sinkron data Supabase:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSupabaseData();
  }, [isAdminAuthenticated]);

  // Handle Admin Passkey Verification dari Database
  const handlePasskeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const key = passkeyInput.trim();
    const isValid = await verifyPasskeyFromDatabase(key);
    if (isValid) {
      setIsAdminAuthenticated(true);
      localStorage.setItem("speco_admin_session", "authorized_lead_affif");
      setAuthError(null);
    } else {
      setAuthError("Passkey Admin tidak cocok dengan database Supabase. Akses ditolak.");
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("speco_admin_session");
    setIsAdminAuthenticated(false);
  };

  // Filtered List
  const filteredList = React.useMemo(() => {
    return laptops.filter((item) => {
      // Type Filter
      const isMini =
        item.Tipe_Perangkat?.toLowerCase().includes("mini") ||
        item.Tipe_Perangkat?.toLowerCase().includes("desktop") ||
        item.Model_Seri.toLowerCase().includes("mini");

      if (typeFilter === "laptop" && isMini) return false;
      if (typeFilter === "minipc" && !isMini) return false;

      // Brand Filter
      if (brandFilter !== "all" && item.Brand.toLowerCase() !== brandFilter.toLowerCase()) {
        return false;
      }

      // Search Query
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        item.ID_Perangkat.toLowerCase().includes(q) ||
        item.Brand.toLowerCase().includes(q) ||
        item.Model_Seri.toLowerCase().includes(q) ||
        item.Processor_CPU.toLowerCase().includes(q) ||
        item.Kartu_Grafis_GPU.toLowerCase().includes(q)
      );
    });
  }, [laptops, search, typeFilter, brandFilter]);

  // Statistik Realtime
  const stats = React.useMemo(() => {
    const total = laptops.length;
    const miniPcs = laptops.filter(
      (l) =>
        l.Tipe_Perangkat?.toLowerCase().includes("mini") ||
        l.Tipe_Perangkat?.toLowerCase().includes("desktop") ||
        l.Model_Seri.toLowerCase().includes("mini")
    ).length;
    const laptopsOnly = total - miniPcs;
    const localBrands = laptops.filter((l) =>
      ["axioo", "advan", "zyrex"].includes(l.Brand.toLowerCase())
    ).length;
    const avgPrice = total > 0 ? laptops.reduce((acc, l) => acc + l.numericPrice, 0) / total : 0;
    return { total, miniPcs, laptopsOnly, localBrands, avgPrice };
  }, [laptops]);

  // Handle In-line Edit Start
  const startInlineEdit = (item: CatalogLaptop) => {
    setInlineEditingId(item.ID_Perangkat);
    setInlineValues({
      price: String(item.numericPrice),
      ram: String(item.numericRam),
      storage: item.Storage_GB_Tipe,
      warranty: item.Status_Garansi_Resmi,
    });
  };

  // Handle In-line Edit Save
  const saveInlineEdit = async (id: string) => {
    setSavingInlineId(id);
    const numericPrice = parseFloat(inlineValues.price) || 0;
    const numericRam = parseInt(inlineValues.ram, 10) || 8;

    try {
      if (isSupabaseConfigured) {
        await updateLaptopInSupabase(id, {
          price_idr: numericPrice,
          ram_gb: numericRam,
          storage: inlineValues.storage,
          warranty: inlineValues.warranty,
        });
      }

      // Update local state
      setLaptops((prev) =>
        prev.map((item) =>
          item.ID_Perangkat === id
            ? {
                ...item,
                numericPrice,
                Estimasi_Harga_Pasar_IDR: inlineValues.price,
                numericRam,
                RAM_GB: inlineValues.ram,
                Storage_GB_Tipe: inlineValues.storage,
                Status_Garansi_Resmi: inlineValues.warranty,
              }
            : item
        )
      );

      setStatusMsg(`Data ${id} berhasil disinkronkan ke Supabase secara realtime.`);
      setInlineEditingId(null);
    } catch (err: any) {
      alert("Gagal menyimpan update in-line: " + err.message);
    } finally {
      setSavingInlineId(null);
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  // Handle Submit Form Tambah / Edit Modal
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: Partial<SupabaseLaptop> = {
        id: editingLaptop ? editingLaptop.ID_Perangkat : formData.ID_Perangkat || `DEV${Date.now().toString().slice(-4)}`,
        brand: formData.Brand,
        model: formData.Model_Seri,
        cpu: formData.Processor_CPU,
        gpu: formData.Kartu_Grafis_GPU,
        ram_gb: parseInt(formData.RAM_GB, 10) || 8,
        ram_upgradable: formData.Upgradeable_RAM.toLowerCase().includes("ya"),
        storage: formData.Storage_GB_Tipe,
        display: formData.Layar_Ukuran_Panel_ColorGamut,
        weight_kg: parseFloat(formData.Bobot_kg) || 1.4,
        price_idr: parseFloat(formData.Estimasi_Harga_Pasar_IDR) || 7000000,
        warranty: formData.Status_Garansi_Resmi,
        buy_url: formData.Platform_Rekomendasi_Beli,
        image_url: formData.Link_Gambar,
        pros: formData.Pros_Kelebihan,
        cons: formData.Cons_Kekurangan,
        device_type: formData.Tipe_Perangkat,
      };

      if (editingLaptop) {
        if (isSupabaseConfigured) {
          await updateLaptopInSupabase(editingLaptop.ID_Perangkat, payload);
        }
        setLaptops((prev) =>
          prev.map((item) =>
            item.ID_Perangkat === editingLaptop.ID_Perangkat
              ? {
                  ...item,
                  ...formData,
                  numericPrice: parseFloat(formData.Estimasi_Harga_Pasar_IDR) || 0,
                  numericRam: parseInt(formData.RAM_GB, 10) || 8,
                  numericWeight: parseFloat(formData.Bobot_kg) || 1.4,
                }
              : item
          )
        );
        setStatusMsg("Perangkat berhasil diperbarui di katalog & database!");
      } else {
        if (isSupabaseConfigured) {
          await insertLaptopToSupabase(payload);
        }
        const newCatItem: CatalogLaptop = {
          ...formData,
          Kategori_Target: "Mahasiswa",
          Target_Mahasiswa_Jurusan: "Semua Jurusan",
          Rekomendasi_UseCase_Tag: "#kuliah",
          numericPrice: parseFloat(formData.Estimasi_Harga_Pasar_IDR) || 0,
          numericRam: parseInt(formData.RAM_GB, 10) || 8,
          numericWeight: parseFloat(formData.Bobot_kg) || 1.4,
        };
        setLaptops([newCatItem, ...laptops]);
        setStatusMsg("Perangkat baru berhasil ditambahkan ke database!");
      }

      setIsAddModalOpen(false);
      setEditingLaptop(null);
    } catch (err: any) {
      alert("Gagal menyimpan data: " + err.message);
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  // Handle Hapus
  const handleDelete = async (id: string) => {
    if (!confirm(`Hapus permanen perangkat ${id} dari database?`)) return;
    try {
      if (isSupabaseConfigured) {
        await deleteLaptopFromSupabase(id);
      }
      setLaptops((prev) => prev.filter((item) => item.ID_Perangkat !== id));
      setStatusMsg(`Perangkat ${id} berhasil dihapus.`);
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      alert("Gagal menghapus: " + err.message);
    }
  };

  // Open Edit Modal
  const openEdit = (laptop: CatalogLaptop) => {
    setEditingLaptop(laptop);
    setFormData({
      ID_Perangkat: laptop.ID_Perangkat,
      Brand: laptop.Brand,
      Model_Seri: laptop.Model_Seri,
      Tipe_Perangkat: laptop.Tipe_Perangkat || "Laptop",
      Processor_CPU: laptop.Processor_CPU,
      Kartu_Grafis_GPU: laptop.Kartu_Grafis_GPU,
      RAM_GB: String(laptop.RAM_GB),
      Upgradeable_RAM: laptop.Upgradeable_RAM,
      Storage_GB_Tipe: laptop.Storage_GB_Tipe,
      Layar_Ukuran_Panel_ColorGamut: laptop.Layar_Ukuran_Panel_ColorGamut,
      Bobot_kg: String(laptop.Bobot_kg),
      Estimasi_Harga_Pasar_IDR: String(laptop.numericPrice),
      Status_Garansi_Resmi: laptop.Status_Garansi_Resmi,
      Platform_Rekomendasi_Beli: laptop.Platform_Rekomendasi_Beli,
      Link_Gambar: laptop.Link_Gambar,
      Pros_Kelebihan: laptop.Pros_Kelebihan || "",
      Cons_Kekurangan: laptop.Cons_Kekurangan || "",
    });
    setIsAddModalOpen(true);
  };

  // EXPORT 1: Export to Excel (.xlsx)
  const exportToExcel = () => {
    try {
      const rows = laptops.map((item) => ({
        "ID Perangkat": item.ID_Perangkat,
        "Brand": item.Brand,
        "Model / Seri": item.Model_Seri,
        "Tipe Perangkat": item.Tipe_Perangkat || "Laptop",
        "Processor / CPU": item.Processor_CPU,
        "Kartu Grafis / GPU": item.Kartu_Grafis_GPU,
        "RAM (GB)": item.numericRam,
        "RAM Upgradable": item.Upgradeable_RAM,
        "Storage": item.Storage_GB_Tipe,
        "Layar": item.Layar_Ukuran_Panel_ColorGamut,
        "Bobot (kg)": item.numericWeight,
        "Harga Pasar (Rp)": item.numericPrice,
        "Status Garansi": item.Status_Garansi_Resmi,
        "Target Mahasiswa": item.Target_Mahasiswa_Jurusan,
        "Kelebihan": item.Pros_Kelebihan,
        "Kekurangan": item.Cons_Kekurangan,
        "Platform Pembelian": item.Platform_Rekomendasi_Beli,
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Katalog SPECO 2026");
      XLSX.writeFile(workbook, `SPECO_Katalog_Laptop_Mahasiswa_${Date.now()}.xlsx`);
      setStatusMsg("File Excel (.xlsx) berhasil diekspor!");
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (e: any) {
      alert("Gagal ekspor Excel: " + e.message);
    }
  };

  // EXPORT 2: Export to SQL Dump (.sql)
  const exportToSql = () => {
    try {
      let sql = `-- ==============================================================================\n`;
      sql += `-- SPECO DATABASE EXPORT - KATALOG 450 LAPTOP & MINI PC MAHASISWA 2026\n`;
      sql += `-- Tanggal Export: ${new Date().toISOString()}\n`;
      sql += `-- Platform: SPECO Laptop Advisor (NEXORA 7A)\n`;
      sql += `-- ==============================================================================\n\n`;
      sql += `INSERT INTO public.laptops (\n`;
      sql += `  id, brand, model, cpu, gpu, ram_gb, ram_upgradable, storage, display, weight_kg, price_idr, warranty, buy_url, pros, cons, device_type\n`;
      sql += `) VALUES\n`;

      const values = laptops.map((l) => {
        const escapeSql = (str: string | undefined) =>
          `'${(str || "").replace(/'/g, "''")}'`;
        const isUpgradable = l.Upgradeable_RAM.toLowerCase().includes("ya") ? "true" : "false";

        return `  (${escapeSql(l.ID_Perangkat)}, ${escapeSql(l.Brand)}, ${escapeSql(l.Model_Seri)}, ${escapeSql(l.Processor_CPU)}, ${escapeSql(l.Kartu_Grafis_GPU)}, ${l.numericRam}, ${isUpgradable}, ${escapeSql(l.Storage_GB_Tipe)}, ${escapeSql(l.Layar_Ukuran_Panel_ColorGamut)}, ${l.numericWeight}, ${l.numericPrice}, ${escapeSql(l.Status_Garansi_Resmi)}, ${escapeSql(l.Platform_Rekomendasi_Beli)}, ${escapeSql(l.Pros_Kelebihan)}, ${escapeSql(l.Cons_Kekurangan)}, ${escapeSql(l.Tipe_Perangkat || "Laptop")})`;
      });

      sql += values.join(",\n");
      sql += `\nON CONFLICT (id) DO UPDATE SET\n`;
      sql += `  price_idr = EXCLUDED.price_idr,\n`;
      sql += `  ram_gb = EXCLUDED.ram_gb,\n`;
      sql += `  storage = EXCLUDED.storage,\n`;
      sql += `  warranty = EXCLUDED.warranty;\n`;

      const blob = new Blob([sql], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `speco_laptops_dump_${Date.now()}.sql`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMsg("File SQL Dump (.sql) berhasil diekspor!");
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (e: any) {
      alert("Gagal ekspor SQL: " + e.message);
    }
  };

  // RENDER ADMIN GATE JIKA BELUM TERAUTENTIKASI
  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
            Memverifikasi Akses Admin...
          </span>
        </div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col justify-center items-center px-4 py-12 antialiased selection:bg-emerald-500">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center mb-2">
              <Image
                src="/brand/speco-logo.png"
                alt="SPECO"
                width={140}
                height={50}
                priority
                className="h-10 w-auto object-contain brightness-110"
              />
            </div>
            <div className="flex items-center justify-center gap-2">
              <ShieldCheckIcon className="w-5 h-5 text-emerald-400" />
              <h1 className="text-lg font-black tracking-tight text-white uppercase">
                Portal Kontrol Admin
              </h1>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Area terbatas khusus Project Lead & Admin Database SPECO.
              Harap masukkan Passkey Admin untuk mengakses data realtime.
            </p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-xs text-red-200 font-semibold text-center">
              {authError}
            </div>
          )}

          {/* Google OAuth Login Button */}
          <button
            type="button"
            onClick={async () => {
              try {
                await signInWithGoogle(`${window.location.origin}/admin`);
              } catch (e: any) {
                setAuthError(e.message || "Gagal masuk dengan Google Admin.");
              }
            }}
            className="w-full h-11 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <GoogleLogoIcon className="w-4 h-4" />
            <span>Masuk dengan Google (Akun Admin)</span>
          </button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-slate-900 text-slate-400 font-semibold text-[11px]">
                Atau Masuk dengan Passkey Otoritas
              </span>
            </div>
          </div>

          <form onSubmit={handlePasskeySubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Passkey Admin
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={passkeyInput}
                  onChange={(e) => setPasskeyInput(e.target.value)}
                  placeholder="Masukkan passkey admin..."
                  className="w-full h-11 px-3.5 pl-10 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs text-white placeholder:text-slate-500 outline-none transition-all"
                />
                <LockKeyIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs tracking-wide transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheckIcon className="w-4 h-4" />
              <span>Verifikasi Passkey Admin</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800/80 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5" />
              <span>Kembali ke Beranda Publik</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // RENDER UTAMA SAAS ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* 1. TOP EXECUTIVE APP BAR */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/brand/speco-logo.png"
                alt="SPECO"
                width={130}
                height={44}
                priority
                className="h-8.5 w-auto object-contain brightness-110"
              />
            </Link>
            <div className="h-5 w-px bg-slate-800 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-emerald-950/90 text-emerald-400 border border-emerald-800/80">
                Admin Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 hidden md:inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Supabase Online
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={exportToExcel}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all cursor-pointer shadow-sm"
              title="Ekspor Seluruh Database ke Excel (.xlsx)"
            >
              <DownloadSimpleIcon className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Ekspor</span> Excel (.xlsx)
            </button>

            <button
              onClick={exportToSql}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all cursor-pointer shadow-sm"
              title="Ekspor Dump SQL (.sql)"
            >
              <DatabaseIcon className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">Ekspor</span> SQL (.sql)
            </button>

            <button
              onClick={() => {
                setEditingLaptop(null);
                setFormData({
                  ID_Perangkat: `DEV${Date.now().toString().slice(-4)}`,
                  Brand: "Advan",
                  Model_Seri: "",
                  Tipe_Perangkat: "Laptop",
                  Processor_CPU: "",
                  Kartu_Grafis_GPU: "",
                  RAM_GB: "16",
                  Upgradeable_RAM: "Ya",
                  Storage_GB_Tipe: "512GB SSD NVMe",
                  Layar_Ukuran_Panel_ColorGamut: "14 inci IPS FHD",
                  Bobot_kg: "1.4",
                  Estimasi_Harga_Pasar_IDR: "7000000",
                  Status_Garansi_Resmi: "1 Tahun Resmi",
                  Platform_Rekomendasi_Beli: "Tokopedia Official",
                  Link_Gambar: "",
                  Pros_Kelebihan: "",
                  Cons_Kekurangan: "",
                });
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-2 transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Tambah Perangkat</span>
            </button>

            <button
              onClick={handleAdminLogout}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-red-950/60 hover:text-red-400 text-slate-400 border border-slate-700 transition-all cursor-pointer"
              title="Keluar dari Portal Admin"
            >
              <SignOutIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* STATUS TOAST NOTIFICATION */}
      {statusMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900/90 border border-emerald-600 text-emerald-100 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 backdrop-blur-md animate-in slide-in-from-bottom-3 text-xs font-bold">
          <CheckCircleIcon className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* 2. STATISTIC METRICS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4.5 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Perangkat
            </span>
            <div className="text-2xl font-black text-white">{stats.total}</div>
            <p className="text-[10px] text-slate-400">Sinkron dengan Database Supabase</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4.5 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Laptop Mahasiswa
            </span>
            <div className="text-2xl font-black text-emerald-400">{stats.laptopsOnly}</div>
            <p className="text-[10px] text-slate-400">Portabel untuk kuliah & lab</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4.5 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Mini PC & Dekstop Ringkas
            </span>
            <div className="text-2xl font-black text-sky-400">{stats.miniPcs}</div>
            <p className="text-[10px] text-slate-400">Dukungan desktop hemat ruang</p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4.5 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Rata-rata Harga Pasar
            </span>
            <div className="text-2xl font-black text-amber-400">
              {formatRupiah(Math.round(stats.avgPrice))}
            </div>
            <p className="text-[10px] text-slate-400">{stats.localBrands} Model Brand Lokal</p>
          </div>
        </div>

        {/* 3. CONTROLS, SEARCH & DEVICE TYPE TABS */}
        <div className="bg-slate-850 border border-slate-700/80 rounded-2xl p-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Device Type Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 w-full sm:w-auto">
              <button
                onClick={() => setTypeFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  typeFilter === "all"
                    ? "bg-slate-700 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Semua ({laptops.length})
              </button>
              <button
                onClick={() => setTypeFilter("laptop")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  typeFilter === "laptop"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <LaptopIcon className="w-3.5 h-3.5" />
                Laptop ({stats.laptopsOnly})
              </button>
              <button
                onClick={() => setTypeFilter("minipc")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  typeFilter === "minipc"
                    ? "bg-sky-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <DesktopIcon className="w-3.5 h-3.5" />
                Mini PC ({stats.miniPcs})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari ID, seri, CPU, GPU..."
                className="w-full h-10 px-3.5 pl-9 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 text-xs text-white placeholder:text-slate-500 outline-none transition-all"
              />
              <MagnifyingGlassIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Brand Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 text-xs">
            <span className="text-[11px] font-bold text-slate-400 mr-1">Brand:</span>
            {["all", "Axioo", "Advan", "Zyrex", "ASUS", "Lenovo", "Acer", "Apple", "MSI", "HP", "Dell"].map(
              (brand) => (
                <button
                  key={brand}
                  onClick={() => setBrandFilter(brand)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    brandFilter.toLowerCase() === brand.toLowerCase()
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  {brand === "all" ? "Semua Brand" : brand}
                </button>
              )
            )}
          </div>
        </div>

        {/* 4. DATA TABLE WITH IN-LINE EDITING */}
        <div className="bg-slate-850 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-extrabold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Perangkat & Tipe</th>
                  <th className="py-3.5 px-4">Processor & GPU</th>
                  <th className="py-3.5 px-4">RAM</th>
                  <th className="py-3.5 px-4">Storage</th>
                  <th className="py-3.5 px-4">Harga Pasar (Realtime)</th>
                  <th className="py-3.5 px-4">Garansi</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      Tidak ada perangkat yang sesuai dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item) => {
                    const isInline = inlineEditingId === item.ID_Perangkat;
                    const isSaving = savingInlineId === item.ID_Perangkat;
                    const isMini =
                      item.Tipe_Perangkat?.toLowerCase().includes("mini") ||
                      item.Tipe_Perangkat?.toLowerCase().includes("desktop") ||
                      item.Model_Seri.toLowerCase().includes("mini");

                    return (
                      <tr
                        key={item.ID_Perangkat}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          isInline ? "bg-slate-800/80 border-l-4 border-l-emerald-500" : ""
                        }`}
                      >
                        {/* Perangkat & Tipe */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <BrandIcon brand={item.Brand} useBrandColor className="w-5 h-5 shrink-0" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white text-xs truncate">
                                  {item.Model_Seri}
                                </span>
                                {isMini ? (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-sky-950 text-sky-400 border border-sky-800">
                                    Mini PC
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-slate-800 text-slate-400">
                                    Laptop
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {item.ID_Perangkat} • {item.Brand}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* CPU & GPU */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-200 truncate max-w-[200px]">
                            {item.Processor_CPU}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                            {item.Kartu_Grafis_GPU}
                          </div>
                        </td>

                        {/* RAM (Inline Edit) */}
                        <td className="py-3.5 px-4">
                          {isInline ? (
                            <input
                              type="number"
                              value={inlineValues.ram}
                              onChange={(e) =>
                                setInlineValues({ ...inlineValues, ram: e.target.value })
                              }
                              className="w-16 h-8 px-2 rounded-lg bg-slate-900 border border-emerald-500 text-xs font-bold text-white outline-none"
                            />
                          ) : (
                            <div
                              onClick={() => startInlineEdit(item)}
                              className="font-bold text-slate-200 cursor-pointer hover:text-emerald-400 transition-colors"
                              title="Klik untuk edit cepat"
                            >
                              {item.numericRam} GB
                            </div>
                          )}
                        </td>

                        {/* Storage (Inline Edit) */}
                        <td className="py-3.5 px-4">
                          {isInline ? (
                            <input
                              type="text"
                              value={inlineValues.storage}
                              onChange={(e) =>
                                setInlineValues({ ...inlineValues, storage: e.target.value })
                              }
                              className="w-28 h-8 px-2 rounded-lg bg-slate-900 border border-emerald-500 text-xs text-white outline-none"
                            />
                          ) : (
                            <div
                              onClick={() => startInlineEdit(item)}
                              className="text-slate-300 truncate max-w-[120px] cursor-pointer hover:text-emerald-400 transition-colors"
                              title="Klik untuk edit cepat"
                            >
                              {item.Storage_GB_Tipe}
                            </div>
                          )}
                        </td>

                        {/* Harga Pasar (Inline Edit) */}
                        <td className="py-3.5 px-4">
                          {isInline ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-400 font-bold text-xs">Rp</span>
                              <input
                                type="number"
                                value={inlineValues.price}
                                onChange={(e) =>
                                  setInlineValues({ ...inlineValues, price: e.target.value })
                                }
                                className="w-28 h-8 px-2 rounded-lg bg-slate-900 border border-emerald-500 text-xs font-extrabold text-emerald-400 outline-none"
                              />
                            </div>
                          ) : (
                            <div
                              onClick={() => startInlineEdit(item)}
                              className="font-extrabold text-emerald-400 cursor-pointer hover:underline"
                              title="Klik untuk edit harga realtime"
                            >
                              {formatRupiah(item.numericPrice)}
                            </div>
                          )}
                        </td>

                        {/* Garansi */}
                        <td className="py-3.5 px-4">
                          {isInline ? (
                            <input
                              type="text"
                              value={inlineValues.warranty}
                              onChange={(e) =>
                                setInlineValues({ ...inlineValues, warranty: e.target.value })
                              }
                              className="w-24 h-8 px-2 rounded-lg bg-slate-900 border border-emerald-500 text-xs text-white outline-none"
                            />
                          ) : (
                            <span className="text-slate-400">{item.Status_Garansi_Resmi}</span>
                          )}
                        </td>

                        {/* Aksi */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isInline ? (
                              <>
                                <button
                                  onClick={() => saveInlineEdit(item.ID_Perangkat)}
                                  disabled={isSaving}
                                  className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer"
                                  title="Simpan Realtime ke Supabase"
                                >
                                  {isSaving ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <CheckIcon className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => setInlineEditingId(null)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                                  title="Batal"
                                >
                                  <XIcon className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startInlineEdit(item)}
                                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition-all cursor-pointer"
                                  title="Edit Cepat In-line"
                                >
                                  Edit Cepat
                                </button>
                                <button
                                  onClick={() => openEdit(item)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-all cursor-pointer"
                                  title="Edit Lengkap Detail"
                                >
                                  <PencilSimpleIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.ID_Perangkat)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                                  title="Hapus Perangkat"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 5. MODAL FORM TAMBAH / EDIT LENGKAP */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-black text-white">
                  {editingLaptop ? "Perbarui Data Perangkat" : "Tambah Perangkat Baru"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  ID: {editingLaptop ? editingLaptop.ID_Perangkat : formData.ID_Perangkat}
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Brand</label>
                  <select
                    value={formData.Brand}
                    onChange={(e) => setFormData({ ...formData, Brand: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                  >
                    {["Advan", "Axioo", "Zyrex", "ASUS", "Lenovo", "Acer", "Apple", "MSI", "HP", "Dell"].map(
                      (b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Tipe Perangkat</label>
                  <select
                    value={formData.Tipe_Perangkat}
                    onChange={(e) => setFormData({ ...formData, Tipe_Perangkat: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                  >
                    <option value="Laptop">Laptop</option>
                    <option value="Mini PC">Mini PC / Desktop Ringkas</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Model / Nama Seri</label>
                <input
                  type="text"
                  required
                  value={formData.Model_Seri}
                  onChange={(e) => setFormData({ ...formData, Model_Seri: e.target.value })}
                  placeholder="Contoh: Workplus AMD Ryzen 5 6600H"
                  className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Processor / CPU</label>
                  <input
                    type="text"
                    required
                    value={formData.Processor_CPU}
                    onChange={(e) => setFormData({ ...formData, Processor_CPU: e.target.value })}
                    placeholder="AMD Ryzen 5 6600H"
                    className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Kartu Grafis / GPU</label>
                  <input
                    type="text"
                    required
                    value={formData.Kartu_Grafis_GPU}
                    onChange={(e) => setFormData({ ...formData, Kartu_Grafis_GPU: e.target.value })}
                    placeholder="AMD Radeon 660M"
                    className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">RAM (GB)</label>
                  <input
                    type="number"
                    required
                    value={formData.RAM_GB}
                    onChange={(e) => setFormData({ ...formData, RAM_GB: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">RAM Upgradable</label>
                  <select
                    value={formData.Upgradeable_RAM}
                    onChange={(e) => setFormData({ ...formData, Upgradeable_RAM: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                  >
                    <option value="Ya">Ya (Bisa Upgrade)</option>
                    <option value="Tidak">Tidak (Soldered)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Bobot (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.Bobot_kg}
                    onChange={(e) => setFormData({ ...formData, Bobot_kg: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Storage</label>
                  <input
                    type="text"
                    required
                    value={formData.Storage_GB_Tipe}
                    onChange={(e) => setFormData({ ...formData, Storage_GB_Tipe: e.target.value })}
                    placeholder="512GB SSD NVMe PCIe 4.0"
                    className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Layar & Panel</label>
                  <input
                    type="text"
                    required
                    value={formData.Layar_Ukuran_Panel_ColorGamut}
                    onChange={(e) =>
                      setFormData({ ...formData, Layar_Ukuran_Panel_ColorGamut: e.target.value })
                    }
                    placeholder="14.0 inci IPS WUXGA 100% sRGB"
                    className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Estimasi Harga (IDR)</label>
                  <input
                    type="number"
                    required
                    value={formData.Estimasi_Harga_Pasar_IDR}
                    onChange={(e) =>
                      setFormData({ ...formData, Estimasi_Harga_Pasar_IDR: e.target.value })
                    }
                    placeholder="7299000"
                    className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Garansi Resmi</label>
                  <input
                    type="text"
                    required
                    value={formData.Status_Garansi_Resmi}
                    onChange={(e) =>
                      setFormData({ ...formData, Status_Garansi_Resmi: e.target.value })
                    }
                    placeholder="1 Tahun Resmi Advan Care"
                    className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Kelebihan (Pros)</label>
                <input
                  type="text"
                  value={formData.Pros_Kelebihan}
                  onChange={(e) => setFormData({ ...formData, Pros_Kelebihan: e.target.value })}
                  placeholder="Kencang, bodi aluminium, RAM DDR5 cepat"
                  className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Kekurangan (Cons)</label>
                <input
                  type="text"
                  value={formData.Cons_Kekurangan}
                  onChange={(e) => setFormData({ ...formData, Cons_Kekurangan: e.target.value })}
                  placeholder="Port USB Type-C hanya satu"
                  className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold flex items-center gap-2 cursor-pointer"
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>Simpan ke Database</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
