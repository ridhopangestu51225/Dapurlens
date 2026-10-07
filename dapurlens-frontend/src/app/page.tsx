import { getFoods } from "@/lib/api";
import FoodExplorer from "@/components/FoodExplorer";

export const dynamic = "force-dynamic";

export default async function Home() {
  const foods = await getFoods();

  return (
    <main className="mx-auto min-h-screen max-w-md bg-stone-50">
      <FoodExplorer foods={foods} />
    </main>
  );
}
