"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Food, FoodInput, FoodTag } from "@/types/food";
import { createFood, updateFood } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type Props = {
  mode: "create" | "edit";
  initialFood?: Food;
};

const ALL_TAGS: { value: FoodTag; label: string }[] = [
  { value: "viral", label: "Viral" },
  { value: "daerah", label: "Makanan daerah" },
];

export default function RecipeForm({ mode, initialFood }: Props) {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();

  // Jaga-jaga kalau ada yang buka URL /resep/baru atau /resep/x/edit
  // langsung tanpa klik tombol (yang sudah disembunyikan untuk tamu) --
  // begitu dipastikan BELUM login (bukan lagi loading), tendang ke /login.
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  const [name, setName] = useState(initialFood?.name ?? "");
  const [region, setRegion] = useState(initialFood?.region ?? "");
  const [emoji, setEmoji] = useState(initialFood?.emoji ?? "🍽️");
  const [description, setDescription] = useState(initialFood?.description ?? "");
  const [tags, setTags] = useState<FoodTag[]>(initialFood?.tags ?? []);
  const [gradientFrom, setGradientFrom] = useState(initialFood?.gradientFrom ?? "#F3B6A8");
  const [gradientTo, setGradientTo] = useState(initialFood?.gradientTo ?? "#E39C90");
  const [ingredientsText, setIngredientsText] = useState((initialFood?.ingredients ?? []).join("\n"));
  const [stepsText, setStepsText] = useState((initialFood?.steps ?? []).join("\n"));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleTag(tag: FoodTag) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!token) {
      setError("Sesi login sudah berakhir, silakan masuk lagi.");
      setLoading(false);
      return;
    }

    const payload: FoodInput = {
      name,
      region,
      emoji,
      description,
      tags,
      gradientFrom,
      gradientTo,
      ingredients: ingredientsText.split("\n").map((s) => s.trim()).filter(Boolean),
      steps: stepsText.split("\n").map((s) => s.trim()).filter(Boolean),
    };

    try {
      const saved =
        mode === "create"
          ? await createFood(payload, token)
          : await updateFood(initialFood!.slug, payload, token);

      router.push(`/resep/${saved.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan tak terduga");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-semibold text-stone-600">Nama Makanan</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-900 outline-none focus:border-[#C1272D]"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-stone-600">Asal Daerah</label>
        <input
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          required
          className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-900 outline-none focus:border-[#C1272D]"
        />
      </div>

      <div className="flex gap-3">
        <div className="w-20">
          <label className="mb-1 block text-xs font-semibold text-stone-600">Emoji</label>
          <input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            className="w-full rounded-xl border border-stone-200 px-3 py-2 text-center text-lg text-stone-900 outline-none focus:border-[#C1272D]"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs font-semibold text-stone-600">Warna Gradien</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={gradientFrom}
              onChange={(e) => setGradientFrom(e.target.value)}
              className="h-9 w-full rounded-lg border border-stone-200"
            />
            <input
              type="color"
              value={gradientTo}
              onChange={(e) => setGradientTo(e.target.value)}
              className="h-9 w-full rounded-lg border border-stone-200"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-stone-600">Tag</label>
        <div className="flex gap-2">
          {ALL_TAGS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => toggleTag(t.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                tags.includes(t.value)
                  ? "border-[#C1272D] bg-[#C1272D] text-white"
                  : "border-stone-200 bg-white text-stone-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-stone-600">Deskripsi Singkat</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-900 outline-none focus:border-[#C1272D]"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-stone-600">
          Bahan-bahan <span className="font-normal text-stone-400">(satu baris = satu bahan)</span>
        </label>
        <textarea
          value={ingredientsText}
          onChange={(e) => setIngredientsText(e.target.value)}
          rows={4}
          className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-900 outline-none focus:border-[#C1272D]"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-stone-600">
          Langkah Memasak <span className="font-normal text-stone-400">(satu baris = satu langkah)</span>
        </label>
        <textarea
          value={stepsText}
          onChange={(e) => setStepsText(e.target.value)}
          rows={4}
          className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-900 outline-none focus:border-[#C1272D]"
        />
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[#C1272D] py-3 text-sm font-bold text-white disabled:opacity-60"
      >
        {loading ? "Menyimpan..." : mode === "create" ? "Simpan Resep" : "Perbarui Resep"}
      </button>
    </form>
  );
}