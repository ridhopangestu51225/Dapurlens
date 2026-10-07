import Link from "next/link";
import { Food } from "@/types/food";

type Props = { food: Food };

export default function FoodCard({ food }: Props) {
  const badgeLabel = food.tags.includes("viral") ? "Viral" : food.tags.includes("daerah") ? "Khas daerah" : null;
  const badgeColor = food.tags.includes("viral") ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800";

  return (
    <Link
      href={`/resep/${food.slug}`}
      className="group block overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div
        className="relative flex h-28 items-center justify-center text-4xl"
        style={{ background: `linear-gradient(135deg, ${food.gradientFrom}, ${food.gradientTo})` }}
      >
        {badgeLabel && (
          <span className={`absolute left-2 top-2 rounded-full px-2.5 py-1 text-xs font-bold ${badgeColor}`}>
            {badgeLabel}
          </span>
        )}
        <span>{food.emoji}</span>
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-stone-900">{food.name}</h3>
        <p className="mb-1.5 text-xs text-stone-500">{food.region}</p>
        <p className="mb-2 line-clamp-2 text-xs text-stone-500">{food.description}</p>
        <span className="text-xs font-bold text-red-600">Lihat resep</span>
      </div>
    </Link>
  );
}
