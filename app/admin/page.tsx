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
import { EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { FunnelIcon } from "@phosphor-icons/react/dist/ssr/Funnel";
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
  const [jurusanFilter, setJurusanFilter] = React.useState<string>("all");
  const [kategoriFilter, setKategoriFilter] = React.useState<string>("all");
  const [sortOption, setSortOption] = React.useState<"default" | "price-asc" | "price-desc" | "ram-desc" | "weight-asc">("default");
  const [loading, setLoading] = React.useState(false);
  const [statusMsg, setStatusMsg] = React.useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(25);

  // In-line Quick Editing State
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

  // All 20 exact dataset fields according to devices-catalog.json
  const [formData, setFormData] = React.useState({
    ID_Perangkat: "",
    Kategori_Target: "Teknik/Informatika",
    Target_Mahasiswa_Jurusan: "Informatika / Sains Data",
    Brand: "Advan",
    Model_Seri: "",
    Tipe_Perangkat: "Laptop",
    Processor_CPU: "",
    Kartu_Grafis_GPU: "",
    RAM_GB: "16",
    Upgradeable_RAM: "Ya",
    Storage_GB_Tipe: "512GB SSD NVMe",
    Layar_Ukuran_Panel_ColorGamut: "14 inci IPS FHD 100% sRGB",
    Bobot_kg: "1.4",
    Estimasi_Harga_Pasar_IDR: "7000000",
    Platform_Rekomendasi_Beli: "Tokopedia Official",
    Status_Garansi_Resmi: "1 Tahun Resmi Indonesia",
    Rekomendasi_UseCase_Tag: "#coding #skripsi",
    Pros_Kelebihan: "",
    Cons_Kekurangan: "",
    Link_Gambar: "",
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

  // Handle Login Admin Form Gate
  const handlePasskeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);

    try {
      const isValid = await verifyPasskeyFromDatabase(passkeyInput);
      if (isValid) {
        localStorage.setItem("speco_admin_session", "authorized_lead_affif");
        localStorage.setItem(
          "speco_user_session",
          JSON.stringify({
            name: "Admin Otoritas",
            email: "admin@speco.id",
            role: "admin",
          })
        );
        setIsAdminAuthenticated(true);
      } else {
        setAuthError("Passkey ditolak atau tidak terdaftar di sistem.");
      }
    } catch {
      setAuthError("Gagal menghubungi server verifikasi.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAdmin = () => {
    localStorage.removeItem("speco_admin_session");
    setIsAdminAuthenticated(false);
  };

  // Filter & Search Logic
  const filteredLaptops = React.useMemo(() => {
    let result = [...laptops];

    // Filter Type
    if (typeFilter === "laptop") {
      result = result.filter((l) => (l.Tipe_Perangkat || "Laptop").toLowerCase().includes("laptop"));
    } else if (typeFilter === "minipc") {
      result = result.filter((l) => (l.Tipe_Perangkat || "").toLowerCase().includes("mini"));
    }

    // Filter Brand
    if (brandFilter !== "all") {
      result = result.filter((l) => l.Brand.toLowerCase() === brandFilter.toLowerCase());
    }

    // Filter Jurusan
    if (jurusanFilter !== "all") {
      result = result.filter((l) => (l.Target_Mahasiswa_Jurusan || "").toLowerCase().includes(jurusanFilter.toLowerCase()));
    }

    // Filter Kategori
    if (kategoriFilter !== "all") {
      result = result.filter((l) => (l.Kategori_Target || "").toLowerCase().includes(kategoriFilter.toLowerCase()));
    }

    // Search Query
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.ID_Perangkat.toLowerCase().includes(q) ||
          l.Model_Seri.toLowerCase().includes(q) ||
          l.Processor_CPU.toLowerCase().includes(q) ||
          l.Kartu_Grafis_GPU.toLowerCase().includes(q) ||
          (l.Target_Mahasiswa_Jurusan || "").toLowerCase().includes(q) ||
          l.Brand.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortOption === "price-asc") {
      result.sort((a, b) => (Number(a.Estimasi_Harga_Pasar_IDR) || 0) - (Number(b.Estimasi_Harga_Pasar_IDR) || 0));
    } else if (sortOption === "price-desc") {
      result.sort((a, b) => (Number(b.Estimasi_Harga_Pasar_IDR) || 0) - (Number(a.Estimasi_Harga_Pasar_IDR) || 0));
    } else if (sortOption === "ram-desc") {
      result.sort((a, b) => (Number(b.RAM_GB) || 0) - (Number(a.RAM_GB) || 0));
    } else if (sortOption === "weight-asc") {
      result.sort((a, b) => (Number(a.Bobot_kg) || 0) - (Number(b.Bobot_kg) || 0));
    }

    return result;
  }, [laptops, search, typeFilter, brandFilter, jurusanFilter, kategoriFilter, sortOption]);

  // Pagination Slicing
  const totalPages = Math.ceil(filteredLaptops.length / itemsPerPage) || 1;
  const paginatedLaptops = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLaptops.slice(start, start + itemsPerPage);
  }, [filteredLaptops, currentPage, itemsPerPage]);

  // Hitung Metrik Dashboard
  const metrics = React.useMemo(() => {
    const total = laptops.length;
    const countLaptop = laptops.filter((l) => (l.Tipe_Perangkat || "Laptop").toLowerCase().includes("laptop")).length;
    const countMiniPc = laptops.filter((l) => (l.Tipe_Perangkat || "").toLowerCase().includes("mini")).length;
    const totalHarga = laptops.reduce((acc, curr) => acc + (Number(curr.Estimasi_Harga_Pasar_IDR) || 0), 0);
    const avgHarga = total > 0 ? Math.round(totalHarga / total) : 0;
    const countLokal = laptops.filter((l) => ["axioo", "advan", "zyrex"].includes(l.Brand.toLowerCase())).length;

    return { total, countLaptop, countMiniPc, avgHarga, countLokal };
  }, [laptops]);

  // Quick In-Line Editing Handlers
  const handleStartInlineEdit = (item: CatalogLaptop) => {
    setInlineEditingId(item.ID_Perangkat);
    setInlineValues({
      price: String(item.Estimasi_Harga_Pasar_IDR || ""),
      ram: String(item.RAM_GB || ""),
      storage: item.Storage_GB_Tipe || "",
      warranty: item.Status_Garansi_Resmi || "",
    });
  };

  const handleCancelInlineEdit = () => {
    setInlineEditingId(null);
  };

  const handleSaveInlineEdit = async (id: string) => {
    setSavingInlineId(id);
    try {
      const target = laptops.find((l) => l.ID_Perangkat === id);
      if (!target) return;

      const updatedItem: CatalogLaptop = {
        ...target,
        Estimasi_Harga_Pasar_IDR: inlineValues.price,
        RAM_GB: inlineValues.ram,
        Storage_GB_Tipe: inlineValues.storage,
        Status_Garansi_Resmi: inlineValues.warranty,
        numericPrice: Number(inlineValues.price) || target.numericPrice,
        numericRam: Number(inlineValues.ram) || target.numericRam,
      };

      // Sinkron ke Supabase jika aktif
      if (isSupabaseConfigured) {
        try {
          await updateLaptopInSupabase(id, {
            price_idr: Number(inlineValues.price) || 0,
            ram_gb: Number(inlineValues.ram) || 8,
            storage: inlineValues.storage,
            warranty: inlineValues.warranty,
          });
        } catch (e) {
          console.warn("Gagal update realtime ke Supabase:", e);
        }
      }

      setLaptops((prev) => prev.map((l) => (l.ID_Perangkat === id ? updatedItem : l)));
      setInlineEditingId(null);
      setStatusMsg(`Berhasil memperbarui data perangkat ${id} secara realtime.`);
      setTimeout(() => setStatusMsg(null), 3000);
    } catch {
      setStatusMsg("Gagal menyimpan perubahan inline.");
    } finally {
      setSavingInlineId(null);
    }
  };

  // Full Edit / Add Handlers
  const handleAddNewClick = () => {
    setEditingLaptop(null);
    const nextIdNum = laptops.length + 1;
    const generatedId = `LP${String(nextIdNum).padStart(3, "0")}`;

    setFormData({
      ID_Perangkat: generatedId,
      Kategori_Target: "Teknik/Informatika",
      Target_Mahasiswa_Jurusan: "Informatika / Sains Data",
      Brand: "Advan",
      Model_Seri: "",
      Tipe_Perangkat: "Laptop",
      Processor_CPU: "",
      Kartu_Grafis_GPU: "",
      RAM_GB: "16",
      Upgradeable_RAM: "Ya",
      Storage_GB_Tipe: "512GB SSD NVMe",
      Layar_Ukuran_Panel_ColorGamut: "14 inci IPS FHD 100% sRGB",
      Bobot_kg: "1.4",
      Estimasi_Harga_Pasar_IDR: "7000000",
      Platform_Rekomendasi_Beli: "Tokopedia Official",
      Status_Garansi_Resmi: "1 Tahun Resmi Advan Indonesia",
      Rekomendasi_UseCase_Tag: "#coding #skripsi",
      Pros_Kelebihan: "",
      Cons_Kekurangan: "",
      Link_Gambar: "",
    });
    setIsAddModalOpen(true);
  };

  const handleEditClick = (item: CatalogLaptop) => {
    setEditingLaptop(item);
    setFormData({
      ID_Perangkat: item.ID_Perangkat,
      Kategori_Target: item.Kategori_Target || "Teknik/Informatika",
      Target_Mahasiswa_Jurusan: item.Target_Mahasiswa_Jurusan || "Informatika / Sains Data",
      Brand: item.Brand,
      Model_Seri: item.Model_Seri,
      Tipe_Perangkat: item.Tipe_Perangkat || "Laptop",
      Processor_CPU: item.Processor_CPU,
      Kartu_Grafis_GPU: item.Kartu_Grafis_GPU,
      RAM_GB: String(item.RAM_GB),
      Upgradeable_RAM: item.Upgradeable_RAM || "Ya",
      Storage_GB_Tipe: item.Storage_GB_Tipe,
      Layar_Ukuran_Panel_ColorGamut: item.Layar_Ukuran_Panel_ColorGamut,
      Bobot_kg: String(item.Bobot_kg),
      Estimasi_Harga_Pasar_IDR: String(item.Estimasi_Harga_Pasar_IDR),
      Platform_Rekomendasi_Beli: item.Platform_Rekomendasi_Beli || "Tokopedia Official",
      Status_Garansi_Resmi: item.Status_Garansi_Resmi,
      Rekomendasi_UseCase_Tag: item.Rekomendasi_UseCase_Tag || "#coding",
      Pros_Kelebihan: item.Pros_Kelebihan || "",
      Cons_Kekurangan: item.Cons_Kekurangan || "",
      Link_Gambar: item.Link_Gambar || "",
    });
    setIsAddModalOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm(`Hapus permanen perangkat ${id} dari database katalog?`)) return;

    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        await deleteLaptopFromSupabase(id);
      }
      setLaptops((prev) => prev.filter((l) => l.ID_Perangkat !== id));
      setStatusMsg(`Perangkat ${id} berhasil dihapus dari database.`);
      setTimeout(() => setStatusMsg(null), 3000);
    } catch {
      setStatusMsg("Gagal menghapus perangkat.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const itemToSave: CatalogLaptop = {
        ID_Perangkat: formData.ID_Perangkat,
        Kategori_Target: formData.Kategori_Target,
        Target_Mahasiswa_Jurusan: formData.Target_Mahasiswa_Jurusan,
        Brand: formData.Brand,
        Model_Seri: formData.Model_Seri,
        Tipe_Perangkat: formData.Tipe_Perangkat,
        Processor_CPU: formData.Processor_CPU,
        Kartu_Grafis_GPU: formData.Kartu_Grafis_GPU,
        RAM_GB: formData.RAM_GB,
        Upgradeable_RAM: formData.Upgradeable_RAM,
        Storage_GB_Tipe: formData.Storage_GB_Tipe,
        Layar_Ukuran_Panel_ColorGamut: formData.Layar_Ukuran_Panel_ColorGamut,
        Bobot_kg: formData.Bobot_kg,
        Estimasi_Harga_Pasar_IDR: formData.Estimasi_Harga_Pasar_IDR,
        Platform_Rekomendasi_Beli: formData.Platform_Rekomendasi_Beli,
        Status_Garansi_Resmi: formData.Status_Garansi_Resmi,
        Rekomendasi_UseCase_Tag: formData.Rekomendasi_UseCase_Tag,
        Pros_Kelebihan: formData.Pros_Kelebihan,
        Cons_Kekurangan: formData.Cons_Kekurangan,
        Link_Gambar: formData.Link_Gambar,
        numericPrice: Number(formData.Estimasi_Harga_Pasar_IDR) || 0,
        numericRam: Number(formData.RAM_GB) || 8,
        numericWeight: Number(formData.Bobot_kg) || 1.4,
      };

      if (isSupabaseConfigured) {
        const supabasePayload: Partial<SupabaseLaptop> = {
          id: formData.ID_Perangkat,
          brand: formData.Brand,
          model: formData.Model_Seri,
          device_type: formData.Tipe_Perangkat,
          category: formData.Kategori_Target,
          major_target: formData.Target_Mahasiswa_Jurusan,
          cpu: formData.Processor_CPU,
          gpu: formData.Kartu_Grafis_GPU,
          ram_gb: Number(formData.RAM_GB) || 8,
          ram_upgradable: formData.Upgradeable_RAM.toLowerCase() === "ya",
          storage: formData.Storage_GB_Tipe,
          display: formData.Layar_Ukuran_Panel_ColorGamut,
          weight_kg: Number(formData.Bobot_kg) || 1.4,
          price_idr: Number(formData.Estimasi_Harga_Pasar_IDR) || 0,
          buy_url: formData.Platform_Rekomendasi_Beli,
          warranty: formData.Status_Garansi_Resmi,
          usecase_tag: formData.Rekomendasi_UseCase_Tag,
          pros: formData.Pros_Kelebihan,
          cons: formData.Cons_Kekurangan,
          image_url: formData.Link_Gambar,
        };

        if (editingLaptop) {
          await updateLaptopInSupabase(formData.ID_Perangkat, supabasePayload);
        } else {
          await insertLaptopToSupabase(supabasePayload as any);
        }
      }

      if (editingLaptop) {
        setLaptops((prev) =>
          prev.map((l) => (l.ID_Perangkat === formData.ID_Perangkat ? itemToSave : l))
        );
        setStatusMsg(`Data perangkat ${formData.ID_Perangkat} berhasil diperbarui.`);
      } else {
        setLaptops((prev) => [itemToSave, ...prev]);
        setStatusMsg(`Perangkat baru ${formData.ID_Perangkat} berhasil ditambahkan.`);
      }

      setIsAddModalOpen(false);
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      alert(`Gagal menyimpan data: ${err?.message || "Kesalahan internal"}`);
    } finally {
      setLoading(false);
    }
  };

  // Export to Excel (.xlsx) Handlers
  const handleExportXLSX = () => {
    try {
      const exportData = laptops.map((l) => ({
        ID_Perangkat: l.ID_Perangkat,
        Kategori_Target: l.Kategori_Target,
        Target_Mahasiswa_Jurusan: l.Target_Mahasiswa_Jurusan,
        Brand: l.Brand,
        Model_Seri: l.Model_Seri,
        Tipe_Perangkat: l.Tipe_Perangkat,
        Processor_CPU: l.Processor_CPU,
        Kartu_Grafis_GPU: l.Kartu_Grafis_GPU,
        RAM_GB: l.RAM_GB,
        Upgradeable_RAM: l.Upgradeable_RAM,
        Storage_GB_Tipe: l.Storage_GB_Tipe,
        Layar_Ukuran_Panel_ColorGamut: l.Layar_Ukuran_Panel_ColorGamut,
        Bobot_kg: l.Bobot_kg,
        Estimasi_Harga_Pasar_IDR: l.Estimasi_Harga_Pasar_IDR,
        Platform_Rekomendasi_Beli: l.Platform_Rekomendasi_Beli,
        Status_Garansi_Resmi: l.Status_Garansi_Resmi,
        Rekomendasi_UseCase_Tag: l.Rekomendasi_UseCase_Tag,
        Pros_Kelebihan: l.Pros_Kelebihan,
        Cons_Kekurangan: l.Cons_Kekurangan,
        Link_Gambar: l.Link_Gambar,
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Katalog_Laptop");
      XLSX.writeFile(wb, `SPECO_Dataset_450_Laptop_${new Date().toISOString().slice(0, 10)}.xlsx`);
      setStatusMsg("Berkas Excel (.xlsx) berhasil diunduh.");
      setTimeout(() => setStatusMsg(null), 3000);
    } catch {
      alert("Gagal mengekspor file Excel.");
    }
  };

  // Export to SQL (.sql) Handlers
  const handleExportSQL = () => {
    try {
      let sql = `-- =============================================================================\n`;
      sql += `-- SPECO DATABASE DUMP - 450 LAPTOP & DESKTOP MAHASISWA\n`;
      sql += `-- Export Date: ${new Date().toISOString()}\n`;
      sql += `-- Platform: SPECO Laptop Advisor (TIM SPECO 7A)\n`;
      sql += `-- =============================================================================\n\n`;

      sql += `CREATE TABLE IF NOT EXISTS public.laptops (\n`;
      sql += `  id VARCHAR(50) PRIMARY KEY,\n`;
      sql += `  brand VARCHAR(100) NOT NULL,\n`;
      sql += `  model VARCHAR(255) NOT NULL,\n`;
      sql += `  device_type VARCHAR(50) DEFAULT 'Laptop',\n`;
      sql += `  category VARCHAR(100),\n`;
      sql += `  major_target VARCHAR(150),\n`;
      sql += `  cpu VARCHAR(200) NOT NULL,\n`;
      sql += `  gpu VARCHAR(200) NOT NULL,\n`;
      sql += `  ram_gb NUMERIC NOT NULL,\n`;
      sql += `  ram_upgradable BOOLEAN DEFAULT true,\n`;
      sql += `  storage VARCHAR(200) NOT NULL,\n`;
      sql += `  display VARCHAR(200) NOT NULL,\n`;
      sql += `  weight_kg NUMERIC NOT NULL,\n`;
      sql += `  price_idr NUMERIC NOT NULL,\n`;
      sql += `  buy_url TEXT,\n`;
      sql += `  warranty VARCHAR(150),\n`;
      sql += `  usecase_tag TEXT,\n`;
      sql += `  pros TEXT,\n`;
      sql += `  cons TEXT,\n`;
      sql += `  image_url TEXT,\n`;
      sql += `  created_at TIMESTAMPTZ DEFAULT NOW()\n`;
      sql += `);\n\n`;

      sql += `INSERT INTO public.laptops (id, brand, model, device_type, category, major_target, cpu, gpu, ram_gb, ram_upgradable, storage, display, weight_kg, price_idr, buy_url, warranty, usecase_tag, pros, cons, image_url)\nVALUES\n`;

      const values = laptops.map((l) => {
        const esc = (str: any) => `'${String(str || "").replace(/'/g, "''")}'`;
        const num = (val: any) => Number(val) || 0;
        const bool = (val: any) => (String(val).toLowerCase() === "ya" ? "true" : "false");

        return `  (${esc(l.ID_Perangkat)}, ${esc(l.Brand)}, ${esc(l.Model_Seri)}, ${esc(l.Tipe_Perangkat || "Laptop")}, ${esc(l.Kategori_Target)}, ${esc(l.Target_Mahasiswa_Jurusan)}, ${esc(l.Processor_CPU)}, ${esc(l.Kartu_Grafis_GPU)}, ${num(l.RAM_GB)}, ${bool(l.Upgradeable_RAM)}, ${esc(l.Storage_GB_Tipe)}, ${esc(l.Layar_Ukuran_Panel_ColorGamut)}, ${num(l.Bobot_kg)}, ${num(l.Estimasi_Harga_Pasar_IDR)}, ${esc(l.Platform_Rekomendasi_Beli)}, ${esc(l.Status_Garansi_Resmi)}, ${esc(l.Rekomendasi_UseCase_Tag)}, ${esc(l.Pros_Kelebihan)}, ${esc(l.Cons_Kekurangan)}, ${esc(l.Link_Gambar)})`;
      });

      sql += values.join(",\n");
      sql += `\nON CONFLICT (id) DO UPDATE SET\n`;
      sql += `  brand = EXCLUDED.brand,\n`;
      sql += `  model = EXCLUDED.model,\n`;
      sql += `  price_idr = EXCLUDED.price_idr,\n`;
      sql += `  ram_gb = EXCLUDED.ram_gb,\n`;
      sql += `  storage = EXCLUDED.storage,\n`;
      sql += `  warranty = EXCLUDED.warranty;\n`;

      const blob = new Blob([sql], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `SPECO_Database_Dump_${new Date().toISOString().slice(0, 10)}.sql`;
      link.click();
      URL.revokeObjectURL(url);
      setStatusMsg("Berkas SQL (.sql) berhasil diekspor.");
      setTimeout(() => setStatusMsg(null), 3000);
    } catch {
      alert("Gagal mengekspor file SQL.");
    }
  };

  // Auth Checking Spinner
  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#0b1120] text-slate-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-mono">Memeriksa hak akses otoritas staff...</span>
        </div>
      </div>
    );
  }

  // Jika Belum Terautentikasi: Tampilkan Auth Gate Otoritas Staff
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-slate-950 font-sans">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <Link href="/" className="inline-flex items-center justify-center mb-6">
            <Image
              src="/brand/speco-logo.png"
              alt="SPECO"
              width={140}
              height={50}
              priority
              className="h-10 w-auto object-contain brightness-0 invert"
            />
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <ShieldCheckIcon className="w-4 h-4" />
            <span>Staff Command Console</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Portal Manajemen Database Staff
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Akses dibatasi khusus tim pengembang data SPECO (Kelompok 7A).
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
          <div className="bg-slate-900/90 backdrop-blur-md py-8 px-6 sm:px-10 rounded-3xl shadow-2xl border border-slate-800 space-y-6">
            {authError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
                {authError}
              </div>
            )}

            <button
              type="button"
              onClick={async () => {
                try {
                  setLoading(true);
                  await signInWithGoogle(`${window.location.origin}/admin`);
                } catch (e: any) {
                  setAuthError(e.message || "Gagal login Google.");
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="w-full h-11 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer"
            >
              <GoogleLogoIcon className="w-4 h-4" />
              <span>Masuk dengan Google (Akun Admin)</span>
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-slate-900 text-slate-500 font-semibold font-mono">
                  Atau via Passkey Otoritas
                </span>
              </div>
            </div>

            <form onSubmit={handlePasskeySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 font-mono">
                  Passkey Otoritas Staff
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={passkeyInput}
                    onChange={(e) => setPasskeyInput(e.target.value)}
                    placeholder="Masukkan passkey staff..."
                    className="w-full h-11 px-3.5 pl-10 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs text-white placeholder:text-slate-500 outline-none font-mono"
                  />
                  <LockKeyIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs tracking-wider uppercase transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheckIcon className="w-4 h-4" />
                    <span>Verifikasi & Masuk Dashboard</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5" />
              <span>Kembali ke Beranda SPECO</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================================
  // DASHBOARD STAFF RESMI (AUTHENTICATED)
  // ==============================================================================
  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* 1. TOP COMMAND BAR */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src="/brand/speco-logo.png"
                alt="SPECO"
                width={100}
                height={32}
                className="h-7 w-auto object-contain brightness-0 invert"
              />
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Staff Engine
              </span>
            </Link>

            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400 pl-3 border-l border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Supabase Online</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300 font-semibold">{laptops.length} Laptop</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportXLSX}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
              title="Unduh Berkas Excel Lengkap"
            >
              <DownloadSimpleIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Ekspor Excel (.xlsx)</span>
            </button>

            <button
              onClick={handleExportSQL}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
              title="Unduh Script Dump SQL"
            >
              <DatabaseIcon className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Ekspor SQL (.sql)</span>
            </button>

            <button
              onClick={handleAddNewClick}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <PlusIcon weight="bold" className="w-3.5 h-3.5" />
              <span>Tambah Perangkat</span>
            </button>

            <button
              onClick={handleLogoutAdmin}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700/80 transition-colors ml-1 cursor-pointer"
              title="Keluar dari Portal Admin"
            >
              <SignOutIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. BODY WORKSPACE */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Status Toast Alert */}
        {statusMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between">
            <span>{statusMsg}</span>
            <button onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-white">
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 4-BENTO METRIC OVERVIEW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
              Total Perangkat
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-white">{metrics.total}</span>
              <span className="text-xs text-emerald-400 font-semibold font-mono">100% Aktif</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Sinkron dengan Database Supabase</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
              Laptop Mahasiswa
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-emerald-400">{metrics.countLaptop}</span>
              <span className="text-xs text-slate-400">Unit</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Portabel untuk kuliah & lab</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
              Mini PC & Desktop Ringkas
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-teal-400">{metrics.countMiniPc}</span>
              <span className="text-xs text-slate-400">Unit</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Dukungan desktop hemat ruang</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
              Rata-Rata Harga Pasar
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-400">{formatRupiah(metrics.avgHarga)}</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">{metrics.countLokal} Model Brand Lokal</span>
          </div>
        </div>

        {/* 3. ADVANCED SEARCH & FILTER CONTROLS */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Type Filter Pills */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start">
              <button
                type="button"
                onClick={() => { setTypeFilter("all"); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  typeFilter === "all" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Semua ({laptops.length})
              </button>
              <button
                type="button"
                onClick={() => { setTypeFilter("laptop"); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  typeFilter === "laptop" ? "bg-emerald-600 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                <LaptopIcon className="w-3.5 h-3.5" />
                <span>Laptop ({metrics.countLaptop})</span>
              </button>
              <button
                type="button"
                onClick={() => { setTypeFilter("minipc"); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  typeFilter === "minipc" ? "bg-teal-600 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                <DesktopIcon className="w-3.5 h-3.5" />
                <span>Mini PC ({metrics.countMiniPc})</span>
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Cari ID, seri, CPU, GPU, target jurusan..."
                className="w-full h-10 px-3.5 pl-10 rounded-xl bg-slate-950 border border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs text-white placeholder:text-slate-500 outline-none"
              />
              <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-3 text-slate-500 hover:text-white"
                >
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Secondary Filters Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 text-xs">
            {/* Brand Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase mr-1">Brand:</span>
              <button
                type="button"
                onClick={() => { setBrandFilter("all"); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                  brandFilter === "all" ? "bg-emerald-600 text-slate-950" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                Semua Brand
              </button>
              {["Axioo", "Advan", "Zyrex", "ASUS", "Lenovo", "Acer", "Apple", "MSI", "HP", "Dell"].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => { setBrandFilter(b); setCurrentPage(1); }}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer ${
                    brandFilter.toLowerCase() === b.toLowerCase()
                      ? "bg-emerald-600 text-slate-950"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  <BrandIcon brand={b} useBrandColor className="w-3.5 h-3.5" />
                  <span>{b}</span>
                </button>
              ))}
            </div>

            {/* Jurusan Target Dropdown */}
            <div className="ml-auto flex items-center gap-2">
              <select
                value={jurusanFilter}
                onChange={(e) => { setJurusanFilter(e.target.value); setCurrentPage(1); }}
                className="h-8 px-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-300 text-[11px] outline-none"
              >
                <option value="all">Semua Jurusan</option>
                <option value="Informatika">Informatika / Sains Data</option>
                <option value="Desain">Desain DKV / Animasi</option>
                <option value="Teknik">Teknik Mesin / Elektro</option>
                <option value="Bisnis">Ekonomi / Bisnis</option>
                <option value="Non-Teknik">Non-Teknik / Umum</option>
              </select>

              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="h-8 px-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-300 text-[11px] outline-none"
              >
                <option value="default">Urutkan: Default ID</option>
                <option value="price-asc">Harga Termurah</option>
                <option value="price-desc">Harga Tertinggi</option>
                <option value="ram-desc">RAM Terbesar</option>
                <option value="weight-asc">Bobot Teringan</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. REALTIME DATA TABLE WITH IN-LINE EDITING */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-mono">
                <tr>
                  <th className="py-3.5 px-4">Perangkat & Tipe</th>
                  <th className="py-3.5 px-4">Target Jurusan</th>
                  <th className="py-3.5 px-4">Processor & GPU</th>
                  <th className="py-3.5 px-3">RAM</th>
                  <th className="py-3.5 px-3">Storage</th>
                  <th className="py-3.5 px-3">Layar & Bobot</th>
                  <th className="py-3.5 px-4 text-emerald-400">Harga Pasar (Realtime)</th>
                  <th className="py-3.5 px-3">Garansi</th>
                  <th className="py-3.5 px-4 text-right">Aksi Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {paginatedLaptops.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500 font-mono">
                      Tidak ada perangkat yang cocok dengan kriteria filter pencarian.
                    </td>
                  </tr>
                ) : (
                  paginatedLaptops.map((l) => {
                    const isInline = inlineEditingId === l.ID_Perangkat;
                    const isSaving = savingInlineId === l.ID_Perangkat;

                    return (
                      <tr
                        key={l.ID_Perangkat}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          isInline ? "bg-slate-800/70" : ""
                        }`}
                      >
                        {/* Perangkat & Tipe */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                              <BrandIcon brand={l.Brand} useBrandColor className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-extrabold text-white text-xs truncate">
                                  {l.Model_Seri}
                                </span>
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-800 text-slate-400">
                                  {l.ID_Perangkat}
                                </span>
                                {(l.Tipe_Perangkat || "").toLowerCase().includes("mini") && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-teal-500/20 text-teal-300 border border-teal-500/30">
                                    Mini PC
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 block mt-0.5">
                                {l.Brand}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Target Jurusan */}
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-medium block w-fit truncate max-w-[150px]">
                            {l.Target_Mahasiswa_Jurusan || "Semua Jurusan"}
                          </span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            {l.Kategori_Target || "Katalog Umum"}
                          </span>
                        </td>

                        {/* CPU & GPU */}
                        <td className="py-3 px-4 font-mono text-[11px]">
                          <span className="text-slate-200 block truncate max-w-[160px] font-medium" title={l.Processor_CPU}>
                            {l.Processor_CPU}
                          </span>
                          <span className="text-slate-500 block truncate max-w-[160px]" title={l.Kartu_Grafis_GPU}>
                            {l.Kartu_Grafis_GPU}
                          </span>
                        </td>

                        {/* RAM */}
                        <td className="py-3 px-3">
                          {isInline ? (
                            <input
                              type="number"
                              value={inlineValues.ram}
                              onChange={(e) => setInlineValues({ ...inlineValues, ram: e.target.value })}
                              className="w-16 h-7 px-1.5 rounded bg-slate-950 border border-emerald-500 text-xs text-white font-mono"
                            />
                          ) : (
                            <div className="flex items-center gap-1">
                              <span className="font-extrabold text-white text-xs">{l.RAM_GB} GB</span>
                              <span className={`text-[9px] px-1 rounded ${
                                String(l.Upgradeable_RAM).toLowerCase() === "ya"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-slate-800 text-slate-400"
                              }`}>
                                {String(l.Upgradeable_RAM).toLowerCase() === "ya" ? "Upgr" : "Sold"}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Storage */}
                        <td className="py-3 px-3 text-[11px]">
                          {isInline ? (
                            <input
                              type="text"
                              value={inlineValues.storage}
                              onChange={(e) => setInlineValues({ ...inlineValues, storage: e.target.value })}
                              className="w-28 h-7 px-1.5 rounded bg-slate-950 border border-emerald-500 text-xs text-white"
                            />
                          ) : (
                            <span className="truncate block max-w-[110px]" title={l.Storage_GB_Tipe}>
                              {l.Storage_GB_Tipe}
                            </span>
                          )}
                        </td>

                        {/* Layar & Bobot */}
                        <td className="py-3 px-3 text-[11px]">
                          <span className="truncate block max-w-[120px] text-slate-300" title={l.Layar_Ukuran_Panel_ColorGamut}>
                            {l.Layar_Ukuran_Panel_ColorGamut}
                          </span>
                          <span className="text-slate-500 block mt-0.5 font-mono">
                            {l.Bobot_kg} kg
                          </span>
                        </td>

                        {/* Harga Pasar (Realtime Inline Edit) */}
                        <td className="py-3 px-4 font-mono font-bold">
                          {isInline ? (
                            <input
                              type="number"
                              value={inlineValues.price}
                              onChange={(e) => setInlineValues({ ...inlineValues, price: e.target.value })}
                              className="w-28 h-7 px-2 rounded bg-slate-950 border border-emerald-500 text-xs text-emerald-400 font-mono font-bold"
                            />
                          ) : (
                            <button
                              onClick={() => handleStartInlineEdit(l)}
                              className="text-emerald-400 hover:text-emerald-300 hover:underline text-left"
                              title="Klik untuk edit harga cepat"
                            >
                              {formatRupiah(Number(l.Estimasi_Harga_Pasar_IDR) || 0)}
                            </button>
                          )}
                        </td>

                        {/* Garansi */}
                        <td className="py-3 px-3 text-[11px]">
                          {isInline ? (
                            <input
                              type="text"
                              value={inlineValues.warranty}
                              onChange={(e) => setInlineValues({ ...inlineValues, warranty: e.target.value })}
                              className="w-24 h-7 px-1.5 rounded bg-slate-950 border border-emerald-500 text-xs text-white"
                            />
                          ) : (
                            <span className="truncate block max-w-[100px] text-slate-400" title={l.Status_Garansi_Resmi}>
                              {l.Status_Garansi_Resmi}
                            </span>
                          )}
                        </td>

                        {/* Aksi Staff */}
                        <td className="py-3 px-4 text-right">
                          {isInline ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleSaveInlineEdit(l.ID_Perangkat)}
                                disabled={isSaving}
                                className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 cursor-pointer"
                                title="Simpan Perubahan Inline"
                              >
                                {isSaving ? (
                                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <CheckIcon weight="bold" className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <button
                                onClick={handleCancelInlineEdit}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                                title="Batal"
                              >
                                <XIcon className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleStartInlineEdit(l)}
                                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors"
                                title="Edit Cepat Baris Ini"
                              >
                                <PencilSimpleIcon className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleEditClick(l)}
                                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                                title="Edit Lengkap Seluruh 20 Field Dataset"
                              >
                                <EyeIcon className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(l.ID_Perangkat)}
                                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
                                title="Hapus Perangkat"
                              >
                                <TrashIcon className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Bar */}
          <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span>Menampilkan {filteredLaptops.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredLaptops.length)} dari {filteredLaptops.length} perangkat</span>
              <span className="text-slate-600">|</span>
              <span>Baris per halaman:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="h-7 px-2 rounded bg-slate-900 border border-slate-700 text-slate-300 text-xs outline-none"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              <span className="px-2 font-mono font-bold text-white">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Berikutnya
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ==============================================================================
          5. MODAL FORM TAMBAH / EDIT LENGKAP (ALL 20 DATASET FIELDS)
      ============================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                  <DatabaseIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    {editingLaptop ? "Perbarui Data Spesifikasi Perangkat" : "Tambah Perangkat Baru ke Dataset"}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    ID Perangkat: <span className="text-emerald-400 font-bold">{formData.ID_Perangkat}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              {/* Row 1: Brand & Device Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Brand Resmi</label>
                  <select
                    value={formData.Brand}
                    onChange={(e) => setFormData({ ...formData, Brand: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none"
                  >
                    {["Advan", "Axioo", "Zyrex", "ASUS", "Lenovo", "Acer", "Apple", "MSI", "HP", "Dell"].map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Tipe Perangkat</label>
                  <select
                    value={formData.Tipe_Perangkat}
                    onChange={(e) => setFormData({ ...formData, Tipe_Perangkat: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none"
                  >
                    <option value="Laptop">Laptop</option>
                    <option value="Mini PC">Mini PC / Desktop Ringkas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Kategori Target</label>
                  <select
                    value={formData.Kategori_Target}
                    onChange={(e) => setFormData({ ...formData, Kategori_Target: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none"
                  >
                    <option value="Teknik/Informatika">Teknik/Informatika</option>
                    <option value="Multimedia/Desain">Multimedia/Desain</option>
                    <option value="Dasar/Pelajar">Dasar/Pelajar</option>
                    <option value="Bisnis/Produktivitas">Bisnis/Produktivitas</option>
                    <option value="Gaming/Komputasi Berat">Gaming/Komputasi Berat</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Model & Target Mahasiswa Jurusan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Model / Nama Seri Lengkap</label>
                  <input
                    type="text"
                    required
                    value={formData.Model_Seri}
                    onChange={(e) => setFormData({ ...formData, Model_Seri: e.target.value })}
                    placeholder="Contoh: Workplus AMD Ryzen 5 6600H"
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Target Mahasiswa Jurusan</label>
                  <input
                    type="text"
                    required
                    value={formData.Target_Mahasiswa_Jurusan}
                    onChange={(e) => setFormData({ ...formData, Target_Mahasiswa_Jurusan: e.target.value })}
                    placeholder="Contoh: Informatika / Sains Data"
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none"
                  />
                </div>
              </div>

              {/* Row 3: CPU & GPU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Processor / CPU</label>
                  <input
                    type="text"
                    required
                    value={formData.Processor_CPU}
                    onChange={(e) => setFormData({ ...formData, Processor_CPU: e.target.value })}
                    placeholder="Contoh: AMD Ryzen 7 7730U"
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Kartu Grafis / GPU</label>
                  <input
                    type="text"
                    required
                    value={formData.Kartu_Grafis_GPU}
                    onChange={(e) => setFormData({ ...formData, Kartu_Grafis_GPU: e.target.value })}
                    placeholder="Contoh: AMD Radeon Graphics / RTX 4050"
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none font-mono"
                  />
                </div>
              </div>

              {/* Row 4: RAM, Upgradeable, Bobot */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">RAM (GB)</label>
                  <input
                    type="number"
                    required
                    value={formData.RAM_GB}
                    onChange={(e) => setFormData({ ...formData, RAM_GB: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">RAM Upgradable</label>
                  <select
                    value={formData.Upgradeable_RAM}
                    onChange={(e) => setFormData({ ...formData, Upgradeable_RAM: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none"
                  >
                    <option value="Ya">Ya (Slot SODIMM Tersedia)</option>
                    <option value="Tidak">Tidak (Soldered Onboard)</option>
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
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono outline-none"
                  />
                </div>
              </div>

              {/* Row 5: Storage & Layar Panel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Storage Kapasitas & Tipe</label>
                  <input
                    type="text"
                    required
                    value={formData.Storage_GB_Tipe}
                    onChange={(e) => setFormData({ ...formData, Storage_GB_Tipe: e.target.value })}
                    placeholder="Contoh: 512GB SSD NVMe PCIe 4.0"
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Layar & Panel</label>
                  <input
                    type="text"
                    required
                    value={formData.Layar_Ukuran_Panel_ColorGamut}
                    onChange={(e) => setFormData({ ...formData, Layar_Ukuran_Panel_ColorGamut: e.target.value })}
                    placeholder="Contoh: 14 inci IPS FHD 100% sRGB"
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none"
                  />
                </div>
              </div>

              {/* Row 6: Harga Pasar, Platform Beli, Garansi */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Estimasi Harga (IDR)</label>
                  <input
                    type="number"
                    required
                    value={formData.Estimasi_Harga_Pasar_IDR}
                    onChange={(e) => setFormData({ ...formData, Estimasi_Harga_Pasar_IDR: e.target.value })}
                    placeholder="7000000"
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 font-mono font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Platform Rekomendasi Beli</label>
                  <input
                    type="text"
                    value={formData.Platform_Rekomendasi_Beli}
                    onChange={(e) => setFormData({ ...formData, Platform_Rekomendasi_Beli: e.target.value })}
                    placeholder="Tokopedia Official Store"
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Garansi Resmi</label>
                  <input
                    type="text"
                    required
                    value={formData.Status_Garansi_Resmi}
                    onChange={(e) => setFormData({ ...formData, Status_Garansi_Resmi: e.target.value })}
                    placeholder="1 Tahun Resmi Indonesia"
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none"
                  />
                </div>
              </div>

              {/* Row 7: Tags & Image URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Rekomendasi UseCase Tag</label>
                  <input
                    type="text"
                    value={formData.Rekomendasi_UseCase_Tag}
                    onChange={(e) => setFormData({ ...formData, Rekomendasi_UseCase_Tag: e.target.value })}
                    placeholder="#skripsi-browsing #office #coding"
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">URL Gambar Perangkat</label>
                  <input
                    type="url"
                    value={formData.Link_Gambar}
                    onChange={(e) => setFormData({ ...formData, Link_Gambar: e.target.value })}
                    placeholder="https://images.tokopedia.net/..."
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none"
                  />
                </div>
              </div>

              {/* Row 8: Pros & Cons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Kelebihan (Pros)</label>
                  <textarea
                    rows={2}
                    value={formData.Pros_Kelebihan}
                    onChange={(e) => setFormData({ ...formData, Pros_Kelebihan: e.target.value })}
                    placeholder="Kinerja prosesor kencang, layar tajam, bodi aluminium"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Kekurangan (Cons)</label>
                  <textarea
                    rows={2}
                    value={formData.Cons_Kekurangan}
                    onChange={(e) => setFormData({ ...formData, Cons_Kekurangan: e.target.value })}
                    placeholder="RAM disolder, webcam standar 720p"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none resize-none"
                  />
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black flex items-center gap-2 cursor-pointer shadow-md transition-colors"
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>Simpan ke Database Supabase</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
