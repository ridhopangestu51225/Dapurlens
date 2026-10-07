import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "DapurLens — Jelajah Resep",
  description: "Cari nama masakan viral dan khas daerah, temukan resepnya.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        {/* AuthProvider di sini (paling luar) supaya SEMUA halaman --
            termasuk halaman server component seperti page.tsx -- bisa
            berisi komponen client yang mengakses status login lewat
            useAuth(), karena mereka semua ada "di dalam" provider ini. */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}