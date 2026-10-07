import { notFound } from "next/navigation";
import Link from "next/link";
import { getFoodBySlug } from "@/lib/api";
import RecipeActions from "@/components/RecipeActions";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export default async function RecipeDetailPage({ params }: Props) {
  const { slug } = await params;
  const food = await getFoodBySlug(slug);

  if (!food) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen max-w-md bg-stone-50 px-5 pb-10 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-[#C1272D]">
          &larr; Kembali ke jelajah resep
        </Link>
        <div className="flex gap-2">
          <Link
            href={`/resep/${food.slug}/edit`}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-700"
          >
            Edit
          </Link>
          {/* DeleteButton harus jadi Client Component terpisah (lihat
              komponennya) karena perlu onClick — sementara halaman ini
              sendiri tetap Server Component supaya fetch data di atas
              boleh pakai await langsung. */}
          <RecipeActions slug={food.slug} />
        </div>
      </div>

      <div
        className="mb-4 flex h-40 items-center justify-center rounded-2xl text-6xl shadow-md"
        style={{ background: `linear-gradient(135deg, ${food.gradientFrom}, ${food.gradientTo})` }}
      >
        {food.emoji}
      </div>

      <div className="mb-1 flex flex-wrap gap-1.5">
        {food.tags.map((tag) => (
          <span
            key={tag}
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
              tag === "viral" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {tag === "viral" ? "Viral" : "Khas daerah"}
          </span>
        ))}
      </div>

      <h1 className="mt-2 font-serif text-2xl font-bold text-stone-900">{food.name}</h1>
      <p className="mb-1 text-sm text-stone-500">{food.region}</p>
      <p className="mb-6 text-sm text-stone-600">{food.description}</p>

      <section className="mb-6">
        <h2 className="mb-2 flex items-center gap-1.5 text-base font-bold text-stone-900">
          <span className="h-4 w-1 rounded-full bg-[#C1272D]" /> Bahan-bahan
        </h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-stone-700">
          {food.ingredients.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 flex items-center gap-1.5 text-base font-bold text-stone-900">
          <span className="h-4 w-1 rounded-full bg-[#C1272D]" /> Langkah Memasak
        </h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-stone-700">
          {food.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>
    </main>
  );
}
