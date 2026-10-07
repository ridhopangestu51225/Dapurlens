import Link from "next/link";
import RecipeForm from "@/components/RecipeForm";

export default function NewRecipePage() {
  return (
    <main className="mx-auto min-h-screen max-w-md bg-stone-50 px-5 pb-10 pt-6">
      <Link href="/" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-[#C1272D]">
        &larr; Kembali
      </Link>
      <h1 className="mb-4 font-serif text-xl font-bold text-stone-900">Tambah Resep Baru</h1>
      <RecipeForm mode="create" />
    </main>
  );
}