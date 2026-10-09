"use client";

import { ChangeEvent, useRef, useState } from "react";
import Link from "next/link";
import { recognizeFood } from "@/lib/api";
import { RecognitionResult } from "@/types/food";

type Status = "idle" | "loading" | "done" | "error";

export default function ScanPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File asli disimpan di STATE, bukan dibaca ulang dari fileInputRef saat
  // submit -- soalnya elemen <input> ini hilang dari DOM begitu previewUrl
  // terisi (input cuma dirender saat !previewUrl). Kalau tetap mengandalkan
  // ref setelah elemennya ter-unmount, hasilnya tidak konsisten.
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    // createObjectURL membuat URL sementara untuk pratinjau TANPA upload.
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setErrorMsg(null);
    setStatus("idle");
  }

  async function handleScan() {
    if (!selectedFile) return;

    setStatus("loading");
    setErrorMsg(null);

    try {
      const res = await recognizeFood(selectedFile);
      setResult(res);
      setStatus("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan");
      setStatus("error");
    }
  }

  function reset() {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setErrorMsg(null);
    setStatus("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <main className="mx-auto min-h-screen max-w-md bg-stone-50 px-5 pb-10 pt-6">
      <Link href="/" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-[#C1272D]">
        &larr; Kembali
      </Link>

      <h1 className="mb-1 font-serif text-2xl font-bold text-stone-900">Pindai Makanan</h1>
      <p className="mb-5 text-sm text-stone-500">
        Ambil atau unggah foto makanan untuk mencari tahu namanya.
      </p>

      {!previewUrl ? (
        <label className="flex h-56 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stone-300 bg-white text-stone-400">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="7" width="18" height="13" rx="2" />
            <circle cx="12" cy="13.5" r="3.5" />
            <path d="M8 7l1.5-2h5L16 7" />
          </svg>
          <span className="text-sm font-semibold">Ketuk untuk ambil/pilih foto</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            // capture="environment" membuka kamera belakang langsung di HP.
            // Browser desktop mengabaikannya dan menampilkan file picker biasa.
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element -- pratinjau dari blob URL lokal */}
          <img src={previewUrl} alt="Pratinjau foto" className="h-56 w-full object-cover" />
        </div>
      )}

      {previewUrl && status !== "loading" && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={reset}
            className="flex-1 rounded-xl border border-stone-200 bg-white py-2.5 text-sm font-semibold text-stone-600"
          >
            Ganti Foto
          </button>
          <button
            onClick={handleScan}
            className="flex-1 rounded-xl bg-[#C1272D] py-2.5 text-sm font-bold text-white"
          >
            Pindai
          </button>
        </div>
      )}

      {status === "loading" && (
        <div className="mt-4 flex items-center justify-center gap-2 py-4 text-sm text-stone-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-[#C1272D]" />
          Menganalisis foto...
        </div>
      )}

      {status === "error" && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{errorMsg}</p>
      )}

      {/* Hasil: cocok */}
      {status === "done" && result?.matched && result.food && (
        <Link
          href={`/resep/${result.food.slug}`}
          className="mt-4 block overflow-hidden rounded-2xl border border-stone-200 bg-white"
        >
          <div
            className="flex h-32 items-center justify-center text-5xl"
            style={{ background: `linear-gradient(135deg, ${result.food.gradientFrom}, ${result.food.gradientTo})` }}
          >
            {result.food.emoji}
          </div>
          <div className="p-4">
            <p className="mb-1 text-xs font-bold text-emerald-600">
              Cocok {Math.round(result.confidence * 100)}%
            </p>
            <h2 className="font-serif text-lg font-bold text-stone-900">{result.food.name}</h2>
            <p className="text-sm text-stone-500">{result.food.region}</p>
            <p className="mt-2 text-xs font-bold text-[#C1272D]">Lihat resep lengkap &rarr;</p>
          </div>
        </Link>
      )}

      {/* Hasil: ragu-ragu, ada beberapa kemungkinan */}
      {status === "done" && !result?.matched && result && result.candidates.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-stone-700">{result.message}</p>
          <div className="space-y-2">
            {result.candidates.map((c) => (
              <Link
                key={c.slug}
                href={`/resep/${c.slug}`}
                className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-3"
              >
                <span className="text-sm font-semibold text-stone-800">{c.name}</span>
                <span className="text-xs text-stone-400">{Math.round(c.confidence * 100)}%</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Hasil: tidak dikenali sama sekali */}
      {status === "done" && !result?.matched && result && result.candidates.length === 0 && (
        <div className="mt-4 rounded-xl bg-stone-100 p-4 text-center">
          <p className="text-sm text-stone-600">{result.message}</p>
          <Link href="/" className="mt-2 inline-block text-xs font-bold text-[#C1272D]">
            Cari manual lewat jelajah resep
          </Link>
        </div>
      )}
    </main>
  );
}