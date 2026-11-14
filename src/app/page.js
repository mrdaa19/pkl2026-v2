"use client";

import { useState } from "react";
import Link from "next/link";
import FormLaporan from "@/components/FormLaporan";
import FormSlide from "@/components/FormSlide";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("laporan");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-zinc-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-700" aria-hidden="true" />
            <span className="text-xs font-semibold tracking-widest uppercase text-zinc-600">
              DKV SMK Karya Bhakti Brebes
            </span>
          </div>
          <nav aria-label="Navigasi Utama">
            <Link
              href="/login"
              className="text-xs font-medium text-zinc-700 hover:text-amber-800 underline underline-offset-4 transition"
            >
              Akses Admin
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Kolom Kiri: Tipografi Editorial & Panduan */}
          <aside className="lg:col-span-5 lg:sticky lg:top-10 space-y-6 border-b lg:border-b-0 lg:border-r border-zinc-200 pb-8 lg:pb-0 lg:pr-10">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-amber-800 mb-2">
                Tahun Pelajaran 2026
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 leading-tight">
                Portal Pengumpulan Berkas PKL
              </h1>
              <p className="mt-3 text-sm text-zinc-600 leading-relaxed">
                Gunakan portal ini untuk mengunggah naskah laporan akhir dan materi presentasi sidang PKL kelas 12 DKV 1 maupun 12 DKV 2.
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-200 text-xs text-zinc-600">
              <div>
                <h2 className="font-semibold text-zinc-900 uppercase tracking-wider mb-1">
                  Ketentuan Naskah Laporan
                </h2>
                <p>Diunggah per kelompok (1 atau 2 siswa). File Word (.DOCX) wajib dilampirkan, sedangkan versi PDF bersifat opsional (maksimal 25 MB per file).</p>
              </div>
              <div>
                <h2 className="font-semibold text-zinc-900 uppercase tracking-wider mb-1">
                  Ketentuan Slide Presentasi
                </h2>
                <p>Diunggah per individu. Wajib mengunggah file presentasi (.PPTX atau .PDF), serta dapat melampirkan tautan Canva jika mendesain di Canva.</p>
              </div>
            </div>
          </aside>

          {/* Kolom Kanan: Workspace Formulir */}
          <section className="relative z-10 lg:col-span-7" aria-label="Formulir Pengumpulan Berkas">
            <div
              role="tablist"
              aria-label="Jenis Berkas PKL"
              className="flex border-b border-zinc-200 mb-8 gap-6"
            >
              <button
                type="button"
                role="tab"
                id="tab-laporan"
                aria-selected={activeTab === "laporan"}
                aria-controls="panel-laporan"
                onClick={() => setActiveTab("laporan")}
                className={`py-3 px-1 text-sm font-semibold border-b-2 transition cursor-pointer select-none ${
                  activeTab === "laporan"
                    ? "border-amber-700 text-zinc-900"
                    : "border-transparent text-zinc-500 hover:text-zinc-900"
                }`}
              >
                01. Naskah Laporan
              </button>
              <button
                type="button"
                role="tab"
                id="tab-slide"
                aria-selected={activeTab === "slide"}
                aria-controls="panel-slide"
                onClick={() => setActiveTab("slide")}
                className={`py-3 px-1 text-sm font-semibold border-b-2 transition cursor-pointer select-none ${
                  activeTab === "slide"
                    ? "border-amber-700 text-zinc-900"
                    : "border-transparent text-zinc-500 hover:text-zinc-900"
                }`}
              >
                02. Slide Presentasi
              </button>
            </div>

            {activeTab === "laporan" ? (
              <div id="panel-laporan" role="tabpanel" aria-labelledby="tab-laporan">
                <FormLaporan />
              </div>
            ) : (
              <div id="panel-slide" role="tabpanel" aria-labelledby="tab-slide">
                <FormSlide />
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}