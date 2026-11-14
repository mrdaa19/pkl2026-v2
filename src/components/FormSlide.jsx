"use client";

import { useState } from "react";
import { CONFIG_PKL } from "@/lib/supabase";
import { submitSlidePKL } from "@/lib/pklService";

export default function FormSlide() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [pakaiCanva, setPakaiCanva] = useState("tidak");
  const [form, setForm] = useState({
    nama_siswa: "",
    nis: "",
    kelas: "12 DKV 1",
    tempat_pkl: "",
    link_canva: "",
  });
  const [fileSlide, setFileSlide] = useState(null);

  const handleNisChange = (value) => {
    const onlyDigits = value.replace(/\D/g, "").slice(0, 6);
    setForm((prev) => ({ ...prev, nis: onlyDigits }));
  };

  const handleCanvaOption = (choice) => {
    setPakaiCanva(choice);
    if (choice === "tidak") {
      setForm((prev) => ({ ...prev, link_canva: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setLoading(true);

    try {
      await submitSlidePKL(form, fileSlide, pakaiCanva);
      setStatus({ type: "success", message: "Slide presentasi berhasil dikirim." });
      setForm({ nama_siswa: "", nis: "", kelas: "12 DKV 1", tempat_pkl: "", link_canva: "" });
      setPakaiCanva("tidak");
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
            NIS * (5-6 digit)
          </label>
          <input
            id="sld-nis"
            type="text"
            inputMode="numeric"
            pattern="\d{5,6}"
            minLength={5}
            maxLength={6}
            required
            title="NIS harus berupa 5 sampai 6 digit angka"
            value={form.nis}
            onChange={(e) => handleNisChange(e.target.value)}
            className="input-editorial tabular-nums"
            placeholder="Contoh: 23456"
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

      <div className="space-y-5 pt-4 border-t border-zinc-200">
        <div>
          <label htmlFor="file-slide" className="block text-xs font-medium text-zinc-700 mb-1.5">
            Upload File Slide (.PPTX / .PDF) *
          </label>
          <input
            id="file-slide"
            type="file"
            accept=".ppt,.pptx,.pdf"
            required
            onChange={(e) => setFileSlide(e.target.files[0] || null)}
            className="file-editorial"
          />
        </div>

        <fieldset className="space-y-3">
          <legend className="text-xs font-medium text-zinc-700">
            Apakah presentasi Anda dibuat menggunakan Canva?
          </legend>
          <div className="flex gap-6">
            <label className="inline-flex items-center gap-2 text-xs text-zinc-800 cursor-pointer">
              <input
                type="radio"
                name="pakai_canva"
                value="tidak"
                checked={pakaiCanva === "tidak"}
                onChange={() => handleCanvaOption("tidak")}
                className="accent-amber-800"
              />
              Tidak
            </label>
            <label className="inline-flex items-center gap-2 text-xs text-zinc-800 cursor-pointer">
              <input
                type="radio"
                name="pakai_canva"
                value="ya"
                checked={pakaiCanva === "ya"}
                onChange={() => handleCanvaOption("ya")}
                className="accent-amber-800"
              />
              Ya, pakai Canva
            </label>
          </div>
        </fieldset>

        {pakaiCanva === "ya" && (
          <div className="border-l-2 border-amber-700 pl-4 py-1">
            <label htmlFor="link-canva" className="block text-xs font-medium text-zinc-700 mb-1.5">
              Link Desain Canva *
            </label>
            <input
              id="link-canva"
              type="url"
              required
              value={form.link_canva}
              onChange={(e) => setForm({ ...form, link_canva: e.target.value })}
              className="input-editorial"
              placeholder="https://www.canva.com/design/..."
            />
            <p className="text-[11px] text-zinc-500 mt-1">
              Pastikan pengaturan berbagi link Canva sudah dibuka untuk siapa saja yang memiliki tautan.
            </p>
          </div>
        )}
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