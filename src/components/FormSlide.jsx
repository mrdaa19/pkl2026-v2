"use client";

import { useState } from "react";
import { CONFIG_PKL } from "@/lib/supabase";
import { submitSlidePKL } from "@/lib/pklService";

export default function FormSlide() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [form, setForm] = useState({
    nama_siswa: "",
    nis: "",
    kelas: "12 DKV 1",
    tempat_pkl: "",
    link_canva: "",
  });
  const [fileSlide, setFileSlide] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setLoading(true);

    try {
      await submitSlidePKL(form, fileSlide);
      setStatus({ type: "success", message: "Slide presentasi berhasil dikirim." });
      setForm({ nama_siswa: "", nis: "", kelas: "12 DKV 1", tempat_pkl: "", link_canva: "" });
      setFileSlide(null);
      e.target.reset();
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Gagal mengirim slide." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status.message && (
        <div
          role="status"
          aria-live="polite"
          className={`p-3.5 text-xs font-medium border-l-4 ${
            status.type === "success"
              ? "bg-teal-50/70 border-teal-700 text-teal-900"
              : "bg-red-50/70 border-red-700 text-red-900"
          }`}
        >
          {status.message}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="sld-nama" className="block text-xs font-medium text-zinc-700 mb-1.5">
            Nama Lengkap Siswa *
          </label>
          <input
            id="sld-nama"
            type="text"
            required
            value={form.nama_siswa}
            onChange={(e) => setForm({ ...form, nama_siswa: e.target.value })}
            className="input-editorial"
            placeholder="Nama lengkap"
          />
        </div>
        <div>
          <label htmlFor="sld-nis" className="block text-xs font-medium text-zinc-700 mb-1.5">
            NIS *
          </label>
          <input
            id="sld-nis"
            type="text"
            required
            value={form.nis}
            onChange={(e) => setForm({ ...form, nis: e.target.value })}
            className="input-editorial"
            placeholder="Nomor Induk Siswa"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="sld-kelas" className="block text-xs font-medium text-zinc-700 mb-1.5">
            Kelas *
          </label>
          <select
            id="sld-kelas"
            value={form.kelas}
            onChange={(e) => setForm({ ...form, kelas: e.target.value })}
            className="input-editorial"
          >
            {CONFIG_PKL.DAFTAR_KELAS.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sld-dudi" className="block text-xs font-medium text-zinc-700 mb-1.5">
            Tempat PKL (DUDI) *
          </label>
          <input
            id="sld-dudi"
            type="text"
            required
            value={form.tempat_pkl}
            onChange={(e) => setForm({ ...form, tempat_pkl: e.target.value })}
            className="input-editorial"
            placeholder="Nama instansi / studio"
          />
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-zinc-200">
        <div>
          <label htmlFor="file-slide" className="block text-xs font-medium text-zinc-700 mb-1.5">
            Upload File Slide (.PPTX / .PDF)
          </label>
          <input
            id="file-slide"
            type="file"
            accept=".ppt,.pptx,.pdf"
            onChange={(e) => setFileSlide(e.target.files[0] || null)}
            className="file-editorial"
          />
        </div>

        <div>
          <label htmlFor="link-canva" className="block text-xs font-medium text-zinc-700 mb-1.5">
            Atau Tempel Tautan Canva
          </label>
          <input
            id="link-canva"
            type="url"
            value={form.link_canva}
            onChange={(e) => setForm({ ...form, link_canva: e.target.value })}
            className="input-editorial"
            placeholder="https://www.canva.com/design/..."
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-5 bg-zinc-900 hover:bg-amber-800 disabled:bg-zinc-400 text-stone-50 text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
        >
          {loading ? "Mengirim Slide..." : "Kirim Slide Presentasi"}
        </button>
      </div>
    </form>
  );
}