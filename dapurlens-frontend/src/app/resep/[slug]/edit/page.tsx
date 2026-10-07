import Link from "next/link";
import { notFound } from "next/navigation";
import { getFoodBySlug } from "@/lib/api";
import RecipeForm from "@/components/RecipeForm";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export default async function EditRecipePage({ params }: Props) {
  const { slug } = await params;
  const food = await getFoodBySlug(slug);

  if (!food) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen max-w-md bg-stone-50 px-5 pb-10 pt-6">
      <Link href={`/resep/${slug}`} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-[#C1272D]">
        &larr; Kembali ke resep
      </Link>
      <h1 className="mb-4 font-serif text-xl font-bold text-stone-900">Edit Resep</h1>
      {/* initialFood diisi dari hasil fetch server-side di atas,
          jadi form langsung terisi data yang sudah ada (bukan form kosong). */}
      <RecipeForm mode="edit" initialFood={food} />
    </main>
  );
}