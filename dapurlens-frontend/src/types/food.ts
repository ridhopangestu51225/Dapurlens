export type FoodTag = "viral" | "daerah" | "western";

export interface Food {
  slug: string;
  name: string;
  region: string;
  tags: FoodTag[];
  emoji: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
  ingredients: string[];
  steps: string[];
}


export type Foodinput = Omit<Food, "slug" | "emoji" | "gradientFrom" | "gradientTo">;