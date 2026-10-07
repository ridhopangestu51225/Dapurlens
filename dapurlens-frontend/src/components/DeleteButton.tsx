"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteFood } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type Props = {
  slug: string;
};

export default function DeleteButton({ slug }: Props) {
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const sure = window.confirm("Yakin ingin menghapus resep ini? Tindakan ini tidak bisa dibatalkan.");
    if (!sure || !token) return;

    setLoading(true);
    try {
      await deleteFood(slug, token);
      router.push("/");
      router.refresh();
    } catch {
      window.alert("Gagal menghapus resep. Coba lagi.");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 disabled:opacity-60"
    >
      {loading ? "Menghapus..." : "Hapus"}
    </button>
  );
}