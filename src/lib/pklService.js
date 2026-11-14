import { supabase, CONFIG_PKL } from "./supabase";

/**
 * Validasi ukuran file sebelum proses upload dimulai
 */
export function validateFileSize(file, label) {
  if (!file) return null;
  if (file.size > CONFIG_PKL.MAX_FILE_SIZE) {
    return `Ukuran file ${label} melebihi batas maksimal 25 MB.`;
  }
  return null;
}

/**
 * Upload file ke Supabase Storage dan kembalikan path serta publicUrl
 */
export async function uploadBerkasStorage(folder, file, identitas) {
  const ext = file.name.split(".").pop();
  const cleanIdentitas = identitas.replace(/[^a-zA-Z0-9_-]/g, "_");
  const filePath = `${folder}/${Date.now()}_${cleanIdentitas}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(CONFIG_PKL.BUCKET_NAME)
    .upload(filePath, file, { cacheControl: "3600", upsert: false });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from(CONFIG_PKL.BUCKET_NAME)
    .getPublicUrl(filePath);

  return { path: filePath, url: data.publicUrl };
}

/**
 * Simpan data Naskah Laporan (DOCX + PDF)
 */
export async function submitLaporanPKL(formData, fileDocx, filePdf) {
  const errDocx = validateFileSize(fileDocx, "DOCX");
  const errPdf = validateFileSize(filePdf, "PDF");
  if (errDocx || errPdf) throw new Error(errDocx || errPdf);

  const identitas = `${formData.kelas}_${formData.siswa1_nis}_${formData.siswa1_nama}`;
  const [resDocx, resPdf] = await Promise.all([
    uploadBerkasStorage("laporan/docx", fileDocx, identitas),
    uploadBerkasStorage("laporan/pdf", filePdf, identitas),
  ]);

  const { error } = await supabase.from("pkl_laporan").insert({
    siswa1_nama: formData.siswa1_nama.trim(),
    siswa1_nis: formData.siswa1_nis.trim(),
    siswa2_nama: formData.siswa2_nama.trim() || null,
    siswa2_nis: formData.siswa2_nis.trim() || null,
    kelas: formData.kelas,
    tempat_pkl: formData.tempat_pkl.trim(),
    docx_path: resDocx.path,
    docx_url: resDocx.url,
    pdf_path: resPdf.path,
    pdf_url: resPdf.url,
  });

  if (error) throw error;
}

/**
 * Simpan data Slide Presentasi (File Slide dan/atau Link Canva)
 */
export async function submitSlidePKL(formData, fileSlide) {
  if (!fileSlide && !formData.link_canva.trim()) {
    throw new Error("Lampirkan minimal salah satu: File Slide atau Link Canva.");
  }

  const errSlide = validateFileSize(fileSlide, "Slide");
  if (errSlide) throw new Error(errSlide);

  let slideData = { path: null, url: null };
  if (fileSlide) {
    const identitas = `${formData.kelas}_${formData.nis}_${formData.nama_siswa}`;
    slideData = await uploadBerkasStorage("slide", fileSlide, identitas);
  }

  const { error } = await supabase.from("pkl_slide").insert({
    nama_siswa: formData.nama_siswa.trim(),
    nis: formData.nis.trim(),
    kelas: formData.kelas,
    tempat_pkl: formData.tempat_pkl.trim(),
    slide_path: slideData.path,
    slide_url: slideData.url,
    link_canva: formData.link_canva.trim() || null,
  });

  if (error) throw error;
}

/**
 * Ambil seluruh data rekap untuk Admin
 */
export async function fetchSemuaRekap() {
  const [resLaporan, resSlide] = await Promise.all([
    supabase.from("pkl_laporan").select("*").order("created_at", { ascending: false }),
    supabase.from("pkl_slide").select("*").order("created_at", { ascending: false }),
  ]);

  if (resLaporan.error) throw resLaporan.error;
  if (resSlide.error) throw resSlide.error;

  return {
    laporan: resLaporan.data || [],
    slide: resSlide.data || [],
  };
}

/**
 * Hapus data laporan beserta file DOCX & PDF di Storage
 */
export async function hapusLaporanPKL(item) {
  const paths = [item.docx_path, item.pdf_path].filter(Boolean);
  if (paths.length > 0) {
    await supabase.storage.from(CONFIG_PKL.BUCKET_NAME).remove(paths);
  }
  const { error } = await supabase.from("pkl_laporan").delete().eq("id", item.id);
  if (error) throw error;
}

/**
 * Hapus data slide beserta file di Storage jika ada
 */
export async function hapusSlidePKL(item) {
  if (item.slide_path) {
    await supabase.storage.from(CONFIG_PKL.BUCKET_NAME).remove([item.slide_path]);
  }
  const { error } = await supabase.from("pkl_slide").delete().eq("id", item.id);
  if (error) throw error;
}