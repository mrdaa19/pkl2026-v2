"use client";

import { useState } from "react";
import { CONFIG_PKL } from "@/lib/supabase";
import { submitLaporanPKL } from "@/lib/pklService";

export default function FormLaporan() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [form, setForm] = useState({
    siswa1_nama: "",
    siswa1_nis: "",
    siswa2_nama: "",
    siswa2_nis: "",
    kelas: "12 DKV 1",
    tempat_pkl: "",
  });
  const [fileDocx, setFileDocx] = useState(null);
  const [filePdf, setFilePdf] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setLoading(true);

    try {
      await submitLaporanPKL(form, fileDocx, filePdf);
      setStatus({ type: "success", message: "Naskah laporan berhasil dikirim dan tersimpan." });
      setForm({ siswa1_nama: "", siswa1_nis: "", siswa2_nama: "", siswa2_nis: "", kelas: "12 DKV 1", tempat_pkl: "" });
      setFileDocx(null);
      setFilePdf(null);
      e.target.reset();
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Terjadi kesalahan saat mengunggah." });
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

      <fieldset className="space-y-4">
        <legend className="text-xs font-mono uppercase tracking-wider text-zinc-500 pb-1">
          Identitas Penyusun
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="s1-nama" className="block text-xs font-medium text-zinc-700 mb-1.5">
              Nama Siswa 1 *
            </label>
            <input
              id="s1-nama"
              type="text"
              required
              value={form.siswa1_nama}
              onChange={(e) => setForm({ ...form, siswa1_nama: e.target.value })}
              className="input-editorial"
              placeholder="Nama lengkap siswa utama"
            />
          </div>
          <div>
            <label htmlFor="s1-nis" className="block text-xs font-medium text-zinc-700 mb-1.5">
              NIS Siswa 1 *
            </label>
            <input
              id="s1-nis"
              type="text"
              required
              value={form.siswa1_nis}
              onChange={(e) => setForm({ ...form, siswa1_nis: e.target.value })}
              className="input-editorial"
              placeholder="Nomor Induk Siswa"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="s2-nama" className="block text-xs font-medium text-zinc-700 mb-1.5">
              Nama Siswa 2 (Opsional)
            </label>
            <input
              id="s2-nama"
              type="text"
              value={form.siswa2_nama}
              onChange={(e) => setForm({ ...form, siswa2_nama: e.target.value })}
              className="input-editorial"
              placeholder="Isi jika berkelompok"
            />
          </div>
          <div>
            <label htmlFor="s2-nis" className="block text-xs font-medium text-zinc-700 mb-1.5">
              NIS Siswa 2 (Opsional)
            </label>
            <input
              id="s2-nis"
              type="text"
              value={form.siswa2_nis}
              onChange={(e) => setForm({ ...form, siswa2_nis: e.target.value })}
              className="input-editorial"
              placeholder="NIS anggota kedua"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4 pt-4 border-t border-zinc-200">
        <legend className="text-xs font-mono uppercase tracking-wider text-zinc-500 pb-1">
          Lokasi Praktik & Berkas
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="lap-kelas" className="block text-xs font-medium text-zinc-700 mb-1.5">
              Kelas *
            </label>
            <select
              id="lap-kelas"
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
            <label htmlFor="lap-dudi" className="block text-xs font-medium text-zinc-700 mb-1.5">
              Tempat PKL (DUDI) *
            </label>
            <input
              id="lap-dudi"
              type="text"
              required
              value={form.tempat_pkl}
              onChange={(e) => setForm({ ...form, tempat_pkl: e.target.value })}
              className="input-editorial"
              placeholder="Nama studio / percetakan / instansi"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="file-docx" className="block text-xs font-medium text-zinc-700 mb-1.5">
              Naskah Word (.DOCX) *
            </label>
            <input
              id="file-docx"
              type="file"
              accept=".doc,.docx"
              required
              onChange={(e) => setFileDocx(e.target.files[0] || null)}
              className="file-editorial"
            />
          </div>
          <div>
            <label htmlFor="file-pdf" className="block text-xs font-medium text-zinc-700 mb-1.5">
              Naskah PDF (.PDF) *
            </label>
            <input
              id="file-pdf"
              type="file"
              accept=".pdf"
              required
              onChange={(e) => setFilePdf(e.target.files[0] || null)}
              className="file-editorial"
            />
          </div>
        </div>
      </fieldset>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-5 bg-zinc-900 hover:bg-amber-800 disabled:bg-zinc-400 text-stone-50 text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
        >
          {loading ? "Mengunggah Berkas..." : "Kirim Naskah Laporan"}
        </button>
      </div>
    </form>
  );
}