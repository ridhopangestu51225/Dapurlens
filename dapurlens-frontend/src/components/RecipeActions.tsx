"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import DeleteButton from "./DeleteButton";

type Props = { slug: string };

export default function RecipeActions({ slug }: Props) {
  const { user, loading } = useAuth();

  // Selagi AuthContext masih mengecek token tersimpan, jangan render
  // apa-apa dulu -- lebih baik kosong sebentar daripada tombol Edit/Hapus
  // "berkedip" muncul-hilang begitu status login diketahui.
  if (loading || !user) return null;

  return (
    <div className="flex gap-2">
      <Link
        href={`/resep/${slug}/edit`}
        className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-700"
      >
        Edit
      </Link>
      <DeleteButton slug={slug} />
    </div>
  );
}