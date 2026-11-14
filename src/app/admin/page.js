"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, CONFIG_PKL } from "@/lib/supabase";
import { fetchSemuaRekap, hapusLaporanPKL, hapusSlidePKL } from "@/lib/pklService";

export default function AdminDashboard() {
  const router = useRouter();
  const [laporan, setLaporan] = useState([]);
  const [slide, setSlide] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("laporan");
  const [filterKelas, setFilterKelas] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }
      await loadData();
    };
    init();
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchSemuaRekap();
      setLaporan(data.laporan);
      setSlide(data.slide);
    } finally {
      setLoading(false);
    }
  };

  const onDeleteLaporan = async (item) => {
    if (!confirm(`Hapus permanen laporan ${item.siswa1_nama}?`)) return;
    await hapusLaporanPKL(item);
    loadData();
  };

  const onDeleteSlide = async (item) => {
    if (!confirm(`Hapus permanen slide ${item.nama_siswa}?`)) return;
    await hapusSlidePKL(item);
    loadData();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const filteredLaporan = laporan.filter((item) => {
    const matchKelas = !filterKelas || item.kelas === filterKelas;
    const q = search.toLowerCase();
    const matchText =
      item.siswa1_nama.toLowerCase().includes(q) ||
      item.siswa1_nis.includes(q) ||
      (item.siswa2_nama && item.siswa2_nama.toLowerCase().includes(q)) ||
      item.tempat_pkl.toLowerCase().includes(q);
    return matchKelas && matchText;
  });

  const filteredSlide = slide.filter((item) => {
    const matchKelas = !filterKelas || item.kelas === filterKelas;
    const q = search.toLowerCase();
    const matchText =
      item.nama_siswa.toLowerCase().includes(q) ||
      item.nis.includes(q) ||
      item.tempat_pkl.toLowerCase().includes(q);
    return matchKelas && matchText;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-zinc-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase text-amber-800">Panel Koordinator PKL</span>
            <h1 className="text-lg font-bold text-zinc-900">Rekap Berkas 12 DKV</h1>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <button onClick={loadData} className="text-zinc-600 hover:text-zinc-900 underline underline-offset-4 cursor-pointer">
              Muat Ulang
            </button>
            <button onClick={handleLogout} className="px-3 py-1.5 bg-zinc-900 text-stone-50 hover:bg-red-800 transition cursor-pointer">
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Ringkasan Angka Editorial (Bersekat Vertikal, Bukan Kartu Kembar) */}
        <section aria-label="Ringkasan Statistik" className="grid grid-cols-2 border-y border-zinc-200 divide-x divide-zinc-200 py-4">
          <div className="pr-6">
            <p className="text-xs uppercase tracking-wider text-zinc-500">Naskah Laporan Masuk</p>
            <p className="text-3xl font-bold tabular-nums text-zinc-900 mt-1">{laporan.length}</p>
          </div>
          <div className="pl-6">
            <p className="text-xs uppercase tracking-wider text-zinc-500">Slide Presentasi Masuk</p>
            <p className="text-3xl font-bold tabular-nums text-amber-800 mt-1">{slide.length}</p>
          </div>
        </section>

        {/* Kontrol Tab & Filter */}
        <section aria-label="Tabel Data PKL" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-3">
            <div className="flex gap-6">
              <button
                onClick={() => setTab("laporan")}
                className={`text-sm font-semibold pb-1 border-b-2 transition cursor-pointer ${
                  tab === "laporan" ? "border-amber-700 text-zinc-900" : "border-transparent text-zinc-400"
                }`}
              >
                Naskah Laporan ({filteredLaporan.length})
              </button>
              <button
                onClick={() => setTab("slide")}
                className={`text-sm font-semibold pb-1 border-b-2 transition cursor-pointer ${
                  tab === "slide" ? "border-amber-700 text-zinc-900" : "border-transparent text-zinc-400"
                }`}
              >
                Slide Presentasi ({filteredSlide.length})
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              <input
                type="search"
                aria-label="Cari siswa atau tempat PKL"
                placeholder="Cari nama, NIS, DUDI..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-editorial !w-auto min-w-[200px]"
              />
              <select
                aria-label="Filter kelas"
                value={filterKelas}
                onChange={(e) => setFilterKelas(e.target.value)}
                className="input-editorial !w-auto"
              >
                <option value="">Semua Kelas</option>
                {CONFIG_PKL.DAFTAR_KELAS.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <p className="text-xs text-zinc-500 py-10">Mengambil data dari database...</p>
          ) : tab === "laporan" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-zinc-900 text-zinc-900 uppercase tracking-wider">
                    <th className="py-3 pr-3">No</th>
                    <th className="py-3 px-3">Siswa 1</th>
                    <th className="py-3 px-3">Siswa 2</th>
                    <th className="py-3 px-3">Kelas</th>
                    <th className="py-3 px-3">Tempat PKL</th>
                    <th className="py-3 px-3">Berkas</th>
                    <th className="py-3 pl-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {filteredLaporan.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-stone-100/80">
                      <td className="py-3 pr-3 tabular-nums text-zinc-500">{idx + 1}</td>
                      <td className="py-3 px-3 font-medium text-zinc-900">{item.siswa1_nama} ({item.siswa1_nis})</td>
                      <td className="py-3 px-3 text-zinc-600">{item.siswa2_nama ? `${item.siswa2_nama} (${item.siswa2_nis})` : "-"}</td>
                      <td className="py-3 px-3">{item.kelas}</td>
                      <td className="py-3 px-3">{item.tempat_pkl}</td>
                      <td className="py-3 px-3 space-x-3 font-medium">
                        <a href={item.docx_url} target="_blank" rel="noreferrer" className="text-amber-800 underline">DOCX</a>
                        <a href={item.pdf_url} target="_blank" rel="noreferrer" className="text-teal-800 underline">PDF</a>
                      </td>
                      <td className="py-3 pl-3 text-right">
                        <button onClick={() => onDeleteLaporan(item)} className="text-red-700 hover:underline cursor-pointer">
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-zinc-900 text-zinc-900 uppercase tracking-wider">
                    <th className="py-3 pr-3">No</th>
                    <th className="py-3 px-3">Nama Siswa</th>
                    <th className="py-3 px-3">NIS</th>
                    <th className="py-3 px-3">Kelas</th>
                    <th className="py-3 px-3">Tempat PKL</th>
                    <th className="py-3 px-3">Materi</th>
                    <th className="py-3 pl-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {filteredSlide.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-stone-100/80">
                      <td className="py-3 pr-3 tabular-nums text-zinc-500">{idx + 1}</td>
                      <td className="py-3 px-3 font-medium text-zinc-900">{item.nama_siswa}</td>
                      <td className="py-3 px-3 tabular-nums">{item.nis}</td>
                      <td className="py-3 px-3">{item.kelas}</td>
                      <td className="py-3 px-3">{item.tempat_pkl}</td>
                      <td className="py-3 px-3 space-x-3 font-medium">
                        {item.slide_url && (
                          <a href={item.slide_url} target="_blank" rel="noreferrer" className="text-amber-800 underline">
                            File Slide
                          </a>
                        )}
                        {item.link_canva && (
                          <a href={item.link_canva} target="_blank" rel="noreferrer" className="text-teal-800 underline">
                            Link Canva
                          </a>
                        )}
                      </td>
                      <td className="py-3 pl-3 text-right">
                        <button onClick={() => onDeleteSlide(item)} className="text-red-700 hover:underline cursor-pointer">
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}