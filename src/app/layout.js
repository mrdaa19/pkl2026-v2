import "./globals.css";

export const metadata = {
  title: "Portal Pengumpulan PKL | 12 DKV SMK Karya Bhakti Brebes",
  description: "Sistem pengumpulan naskah laporan dan slide presentasi PKL jurusan Desain Komunikasi Visual.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="antialiased selection:bg-amber-900 selection:text-stone-50">
        {children}
      </body>
    </html>
  );
}