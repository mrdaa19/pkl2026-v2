"use client";

import { useState } from "react";
import { CONFIG_PKL } from "@/lib/supabase";
import { updateLaporanPKL, updateSlidePKL } from "@/lib/pklService";

export default function EditDrawer({ editState, onClose, onSaved }) {
  const { type, item } = editState;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // State khusus Laporan
  const [formLap, setFormLap] = useState({
    siswa1_nama: item.siswa1_nama || "",
    siswa1_nis: item.siswa1_nis || "",
    siswa2_nama: item.siswa2_nama || "",
    siswa2_nis: item.siswa2_nis || "",
    kelas: item.kelas || "12 DKV 1",
    tempat_pkl: item.tempat_pkl || "",
  });
  const [newDocx, setNewDocx] = useState(null);
  const [newPdf, setNewPdf] = useState(null);

  // State khusus Slide
  const [formSld, setFormSld] = useState({
    nama_siswa: item.nama_siswa || "",
    nis: item.nis || "",
    kelas: item.kelas || "12 DKV 1",
    tempat_pkl: item.tempat_pkl || "",
    link_canva: item.link_canva || "",
  });
  const [newSlide, setNewSlide] = useState(null);

  const handleNisLap = (field, val) => {
    const clean = val.replace(/\D/g, "").slice(0, 6);
    setFormLap((prev) => ({ ...prev, [field]: clean }));
  };

  const handleNisSld = (val) => {
    const clean = val.replace(/\D/g, "").slice(0, 6);
    setFormSld((prev) => ({ ...prev, nis: clean }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (type === "laporan") {
        await updateLaporanPKL(item, formLap, newDocx, newPdf);
      } else {
        await updateSlidePKL(item, formSld, newSlide);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || "Gagal menyimpan perubahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-zinc-900/40 backdrop-blur-[1px]">
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Edit Data Berkas PKL"
        className="w-full max-w-lg bg-[#f8f7f4] h-full border-l-2 border-zinc-900 flex flex-col overflow-y-auto"
      >
        <div className="px-6 py-5 border-b border-zinc-200 flex items-center justify-between bg-white">
          <div>
            <span className="text-[11px] font-mono uppercase text-amber-800">
              Mode Koreksi Data
            </span>
            <h2 className="text-lg font-bold text-zinc-900">
              {type === "laporan" ? "Edit Naskah Laporan" : "Edit Slide Presentasi"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium text-zinc-500 hover:text-zinc-900 underline underline-offset-4 cursor-pointer"
          >
            Tutup
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1">
          {error && (
            <div role="alert" className="p-3 text-xs bg-red-50 border-l-4 border-red-700 text-red-900">
              {error}
            </div>
          )}

          {type === "laporan" ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Nama Siswa 1 *</label>
                  <input
                    type="text"
                    required
                    value={formLap.siswa1_nama}
                    onChange={(e) => setFormLap({ ...formLap, siswa1_nama: e.target.value })}
                    className="input-editorial"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">NIS Siswa 1 *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="\d{5,6}"
                    minLength={5}
                    maxLength={6}
                    required
                    value={formLap.siswa1_nis}
                    onChange={(e) => handleNisLap("siswa1_nis", e.target.value)}
                    className="input-editorial tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Nama Siswa 2 (Opsional)</label>
                  <input
                    type="text"
                    value={formLap.siswa2_nama}
                    onChange={(e) => setFormLap({ ...formLap, siswa2_nama: e.target.value })}
                    className="input-editorial"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">NIS Siswa 2 (Opsional)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="\d{5,6}"
                    minLength={5}
                    maxLength={6}
                    value={formLap.siswa2_nis}
                    onChange={(e) => handleNisLap("siswa2_nis", e.target.value)}
                    className="input-editorial tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Kelas *</label>
                  <select
                    value={formLap.kelas}
                    onChange={(e) => setFormLap({ ...formLap, kelas: e.target.value })}
                    className="input-editorial"
                  >
                    {CONFIG_PKL.DAFTAR_KELAS.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Tempat PKL *</label>
                  <input
                    type="text"
                    required
                    value={formLap.tempat_pkl}
                    onChange={(e) => setFormLap({ ...formLap, tempat_pkl: e.target.value })}
                    className="input-editorial"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-zinc-200">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-zinc-700">Ganti File DOCX (Opsional)</label>
                    <a href={item.docx_url} target="_blank" rel="noreferrer" className="text-[11px] text-amber-800 underline">
                      Lihat DOCX saat ini
                    </a>
                  </div>
                  <input
                    type="file"
                    accept=".doc,.docx"
                    onChange={(e) => setNewDocx(e.target.files[0] || null)}
                    className="file-editorial"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-zinc-700">Ganti / Tambah File PDF (Opsional)</label>
                    {item.pdf_url && (
                      <a href={item.pdf_url} target="_blank" rel="noreferrer" className="text-[11px] text-teal-800 underline">
                        Lihat PDF saat ini
                      </a>
                    )}
                  </div>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setNewPdf(e.target.files[0] || null)}
                    className="file-editorial"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Nama Siswa *</label>
                  <input
                    type="text"
                    required
                    value={formSld.nama_siswa}
                    onChange={(e) => setFormSld({ ...formSld, nama_siswa: e.target.value })}
                    className="input-editorial"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">NIS *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="\d{5,6}"
                    minLength={5}
                    maxLength={6}
                    required
                    value={formSld.nis}
                    onChange={(e) => handleNisSld(e.target.value)}
                    className="input-editorial tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Kelas *</label>
                  <select
                    value={formSld.kelas}
                    onChange={(e) => setFormSld({ ...formSld, kelas: e.target.value })}
                    className="input-editorial"
                  >
                    {CONFIG_PKL.DAFTAR_KELAS.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Tempat PKL *</label>
                  <input
                    type="text"
                    required
                    value={formSld.tempat_pkl}
                    onChange={(e) => setFormSld({ ...formSld, tempat_pkl: e.target.value })}
                    className="input-editorial"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-zinc-200">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-zinc-700">Ganti File Slide (Opsional)</label>
                    {item.slide_url && (
                      <a href={item.slide_url} target="_blank" rel="noreferrer" className="text-[11px] text-amber-800 underline">
                        Lihat Slide saat ini
                      </a>
                    )}
                  </div>
                  <input
                    type="file"
                    accept=".ppt,.pptx,.pdf"
                    onChange={(e) => setNewSlide(e.target.files[0] || null)}
                    className="file-editorial"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Link Canva (Opsional)</label>
                  <input
                    type="url"
                    value={formSld.link_canva}
                    onChange={(e) => setFormSld({ ...formSld, link_canva: e.target.value })}
                    className="input-editorial"
                    placeholder="https://www.canva.com/design/..."
                  />
                </div>
              </div>
            </>
          )}

          <div className="pt-4 border-t border-zinc-200 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-zinc-300 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-zinc-900 hover:bg-amber-800 disabled:bg-zinc-400 text-stone-50 text-xs font-semibold uppercase tracking-wider cursor-pointer"
            >
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}