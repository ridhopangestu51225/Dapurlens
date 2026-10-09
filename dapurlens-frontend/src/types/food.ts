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

export type FoodInput = Omit<Food, "slug" | "emoji" | "gradientFrom" | "gradientTo">;

export interface RecognitionCandidate {
  slug: string;
  name: string;
  confidence: number;
}

export interface RecognitionResult {
  matched: boolean;
  food: Food | null;
  confidence: number;
  candidates: RecognitionCandidate[];
  message: string;
}