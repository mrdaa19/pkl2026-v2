import { supabase, CONFIG_PKL } from "./supabase";

/**
 * Validasi ukuran file maksimal 25 MB
 */
export function validateFileSize(file, label) {
  if (!file) return null;
  if (file.size > CONFIG_PKL.MAX_FILE_SIZE) {
    return `Ukuran file ${label} melebihi batas maksimal 25 MB.`;
  }
  return null;
}

/**
 * Validasi NIS wajib 5 sampai 6 digit angka
 */
export function validateNIS(nis, label) {
  const clean = (nis || "").trim();
  if (!/^\d{5,6}$/.test(clean)) {
    return `${label} harus terdiri dari 5 sampai 6 digit angka.`;
  }
  return null;
}

/**
 * Upload file ke Supabase Storage
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
 * Simpan Naskah Laporan (DOCX wajib, PDF opsional)
 */
export async function submitLaporanPKL(formData, fileDocx, filePdf) {
  const errNis1 = validateNIS(formData.siswa1_nis, "NIS Siswa 1");
  if (errNis1) throw new Error(errNis1);

  if (formData.siswa2_nama.trim() || formData.siswa2_nis.trim()) {
    if (!formData.siswa2_nama.trim()) {
      throw new Error("Nama Siswa 2 wajib diisi jika NIS Siswa 2 dicantumkan.");
    }
    const errNis2 = validateNIS(formData.siswa2_nis, "NIS Siswa 2");
    if (errNis2) throw new Error(errNis2);
  }

  if (!fileDocx) {
    throw new Error("File naskah Word (.DOCX) wajib dilampirkan.");
  }

  const errDocx = validateFileSize(fileDocx, "DOCX");
  const errPdf = validateFileSize(filePdf, "PDF");
  if (errDocx || errPdf) throw new Error(errDocx || errPdf);

  const identitas = `${formData.kelas}_${formData.siswa1_nis}_${formData.siswa1_nama}`;

  const resDocx = await uploadBerkasStorage("laporan/docx", fileDocx, identitas);
  const resPdf = filePdf
    ? await uploadBerkasStorage("laporan/pdf", filePdf, identitas)
    : { path: null, url: null };

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
 * Simpan Slide Presentasi (File slide wajib, Link Canva kondisional/opsional)
 */
export async function submitSlidePKL(formData, fileSlide, pakaiCanva) {
  const errNis = validateNIS(formData.nis, "NIS");
  if (errNis) throw new Error(errNis);

  if (!fileSlide) {
    throw new Error("File slide presentasi (.PPTX / .PDF) wajib diunggah.");
  }

  const errSlide = validateFileSize(fileSlide, "Slide");
  if (errSlide) throw new Error(errSlide);

  if (pakaiCanva === "ya" && !formData.link_canva.trim()) {
    throw new Error("Silakan masukkan tautan desain Canva Anda.");
  }

  const identitas = `${formData.kelas}_${formData.nis}_${formData.nama_siswa}`;
  const slideData = await uploadBerkasStorage("slide", fileSlide, identitas);

  const { error } = await supabase.from("pkl_slide").insert({
    nama_siswa: formData.nama_siswa.trim(),
    nis: formData.nis.trim(),
    kelas: formData.kelas,
    tempat_pkl: formData.tempat_pkl.trim(),
    slide_path: slideData.path,
    slide_url: slideData.url,
    link_canva: pakaiCanva === "ya" ? formData.link_canva.trim() : null,
  });

  if (error) throw error;
}

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

export async function hapusLaporanPKL(item) {
  const paths = [item.docx_path, item.pdf_path].filter(Boolean);
  if (paths.length > 0) {
    await supabase.storage.from(CONFIG_PKL.BUCKET_NAME).remove(paths);
  }
  const { error } = await supabase.from("pkl_laporan").delete().eq("id", item.id);
  if (error) throw error;
}

export async function hapusSlidePKL(item) {
  if (item.slide_path) {
    await supabase.storage.from(CONFIG_PKL.BUCKET_NAME).remove([item.slide_path]);
  }
  const { error } = await supabase.from("pkl_slide").delete().eq("id", item.id);
  if (error) throw error;
}

/**
 * Perbarui data Naskah Laporan (termasuk opsi ganti file DOCX / PDF lama)
 */
export async function updateLaporanPKL(oldItem, formData, newFileDocx, newFilePdf) {
  const errNis1 = validateNIS(formData.siswa1_nis, "NIS Siswa 1");
  if (errNis1) throw new Error(errNis1);

  if (formData.siswa2_nama.trim() || formData.siswa2_nis.trim()) {
    if (!formData.siswa2_nama.trim()) {
      throw new Error("Nama Siswa 2 wajib diisi jika NIS Siswa 2 dicantumkan.");
    }
    const errNis2 = validateNIS(formData.siswa2_nis, "NIS Siswa 2");
    if (errNis2) throw new Error(errNis2);
  }

  const errDocx = validateFileSize(newFileDocx, "DOCX");
  const errPdf = validateFileSize(newFilePdf, "PDF");
  if (errDocx || errPdf) throw new Error(errDocx || errPdf);

  const identitas = `${formData.kelas}_${formData.siswa1_nis}_${formData.siswa1_nama}`;
  let docxData = { path: oldItem.docx_path, url: oldItem.docx_url };
  let pdfData = { path: oldItem.pdf_path, url: oldItem.pdf_url };

  if (newFileDocx) {
    docxData = await uploadBerkasStorage("laporan/docx", newFileDocx, identitas);
    if (oldItem.docx_path) {
      await supabase.storage.from(CONFIG_PKL.BUCKET_NAME).remove([oldItem.docx_path]);
    }
  }

  if (newFilePdf) {
    pdfData = await uploadBerkasStorage("laporan/pdf", newFilePdf, identitas);
    if (oldItem.pdf_path) {
      await supabase.storage.from(CONFIG_PKL.BUCKET_NAME).remove([oldItem.pdf_path]);
    }
  }

  const { error } = await supabase
    .from("pkl_laporan")
    .update({
      siswa1_nama: formData.siswa1_nama.trim(),
      siswa1_nis: formData.siswa1_nis.trim(),
      siswa2_nama: formData.siswa2_nama.trim() || null,
      siswa2_nis: formData.siswa2_nis.trim() || null,
      kelas: formData.kelas,
      tempat_pkl: formData.tempat_pkl.trim(),
      docx_path: docxData.path,
      docx_url: docxData.url,
      pdf_path: pdfData.path,
      pdf_url: pdfData.url,
    })
    .eq("id", oldItem.id);

  if (error) throw error;
}

/**
 * Perbarui data Slide Presentasi (termasuk opsi ganti file slide lama)
 */
export async function updateSlidePKL(oldItem, formData, newFileSlide) {
  const errNis = validateNIS(formData.nis, "NIS");
  if (errNis) throw new Error(errNis);

  const errSlide = validateFileSize(newFileSlide, "Slide");
  if (errSlide) throw new Error(errSlide);

  const identitas = `${formData.kelas}_${formData.nis}_${formData.nama_siswa}`;
  let slideData = { path: oldItem.slide_path, url: oldItem.slide_url };

  if (newFileSlide) {
    slideData = await uploadBerkasStorage("slide", newFileSlide, identitas);
    if (oldItem.slide_path) {
      await supabase.storage.from(CONFIG_PKL.BUCKET_NAME).remove([oldItem.slide_path]);
    }
  }

  const { error } = await supabase
    .from("pkl_slide")
    .update({
      nama_siswa: formData.nama_siswa.trim(),
      nis: formData.nis.trim(),
      kelas: formData.kelas,
      tempat_pkl: formData.tempat_pkl.trim(),
      slide_path: slideData.path,
      slide_url: slideData.url,
      link_canva: formData.link_canva.trim() || null,
    })
    .eq("id", oldItem.id);

  if (error) throw error;
}