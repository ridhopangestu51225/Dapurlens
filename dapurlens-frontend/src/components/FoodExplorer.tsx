"use client";

import { useState } from "react";
import { Food, FoodTag } from "@/types/food";
import FoodCard from "./FoodCard";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

type Props = { foods: Food[] };
type FilterValue = "all" | FoodTag;

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "viral", label: "Viral" },
  { value: "daerah", label: "Makanan daerah" },
];

const SECTION_LABELS: Record<FilterValue, string> = {
  all: "Semua resep",
  viral: "Resep Viral 🔥",
  daerah: "Resep Khas Daerah",
};

export default function FoodExplorer({ foods }: Props) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const { user, loading, logout } = useAuth();

  const filteredFoods = foods.filter((food) => {
    const matchesFilter = activeFilter === "all" || food.tags.includes(activeFilter);
    const matchesQuery =
      query.trim() === "" ||
      food.name.toLowerCase().includes(query.toLowerCase()) ||
      food.region.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  const sectionLabel = query.trim() ? `Hasil untuk "${query.trim()}"` : SECTION_LABELS[activeFilter];

  return (
    <div className="min-h-screen bg-stone-50 pb-10">
      <div
        className="relative overflow-hidden px-5 pb-7 pt-8"
        style={{
          background: "linear-gradient(160deg, #E23744 0%, #C1272D 45%, #7A1418 100%)",
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(255,255,255,0.10) 0px, rgba(255,255,255,0.10) 2px, transparent 3px), linear-gradient(160deg, #E23744 0%, #C1272D 45%, #7A1418 100%)",
          backgroundSize: "26px 26px, 100% 100%",
        }}
      >
        <h1 className="mb-1 font-serif text-2xl font-bold text-white">
          DapurLens<span className="text-amber-300">.</span>
        </h1>
        {!loading && (
  <div className="pt-1 text-right">
    {user ? (
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/80">Halo, {user.name.split(" ")[0]}</span>
        <button onClick={logout} className="text-xs font-bold text-amber-300">
          Keluar
        </button>
      </div>
    ) : (
      <Link href="/login" className="text-xs font-bold text-amber-300">
        Masuk
      </Link>
    )}
  </div>
)}
        <p className="mb-5 text-sm text-white/80">Cari nama masakan, temukan resepnya</p>

        <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-lg shadow-black/10">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-stone-400">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Cari nama masakan atau daerah..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400"
          />
        </div>
      </div>

      <div className="px-5 pt-5">
        <div className="mb-5 flex gap-2 overflow-x-auto">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                activeFilter === filter.value
                  ? "border-[#C1272D] bg-[#C1272D] text-white shadow-sm shadow-[#C1272D]/30"
                  : "border-stone-200 bg-white text-stone-700"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="mb-3 flex items-center justify-between">
          <p className="text-base font-bold text-stone-900">{sectionLabel}</p>
          <Link href="/resep/baru" className="text-xs font-bold text-[#C1272D]">
            + Tambah resep
          </Link>
        </div>

        {filteredFoods.length === 0 ? (
          <p className="py-16 text-center text-sm text-stone-500">Tidak ditemukan — coba kata kunci lain.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredFoods.map((food) => (
              <FoodCard key={food.slug} food={food} />
            ))}
          </div>
        )}

        <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-dashed border-stone-300 bg-white p-3.5">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-stone-400">
            <rect x="3" y="7" width="14" height="12" rx="2" />
            <path d="M17 10l4-2v9l-4-2" />
          </svg>
          <p className="text-xs leading-relaxed text-stone-500">
            <span className="font-bold text-stone-800">Pindai dari foto</span> — fitur kamera (Modul Visi) untuk mengenali makanan langsung dari foto akan menyusul di tahap berikutnya.
          </p>
        </div>
      </div>
    </div>
  );
}
