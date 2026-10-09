import { Food, FoodInput, RecognitionResult } from "@/types/food";
import { AuthResponse, User } from "@/types/user";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type ListParams = { tag?: string; q?: string };

export async function recognizeFood(file: File): Promise<RecognitionResult> {
  // FormData = cara standar browser mengirim file lewat fetch (multipart/form-data).
  // Sengaja TIDAK set header "Content-Type" manual -- browser otomatis
  // menentukan boundary multipart yang benar; kalau diset manual malah
  // sering salah dan gagal diparse di backend.
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_URL}/api/vision/recognize`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? "Gagal memindai foto");
  }
  return res.json();
}

export async function getFoods(params: ListParams = {}): Promise<Food[]> {
  const url = new URL("/api/foods", API_URL);
  if (params.tag) url.searchParams.set("tag", params.tag);
  if (params.q) url.searchParams.set("q", params.q);
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`Gagal mengambil data makanan (status ${res.status})`);
  return res.json();
}

export async function getFoodBySlug(slug: string): Promise<Food | null> {
  const res = await fetch(`${API_URL}/api/foods/${slug}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Gagal mengambil detail makanan (status ${res.status})`);
  return res.json();
}

// Fungsi-fungsi di bawah ini dipanggil dari CLIENT COMPONENT (browser),
// bukan dari server component seperti getFoods/getFoodBySlug di atas.
// Tiga fungsi mutasi (create/update/delete) sekarang WAJIB menerima "token"
// -- tanpa itu, backend akan menolak dengan 401 (lihat perubahan main.py).

export async function createFood(input: FoodInput, token: string): Promise<Food> {
  const res = await fetch(`${API_URL}/api/foods`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Format baku header otorisasi: "Bearer <token>" -- ini yang dibaca
      // OAuth2PasswordBearer di backend (lihat auth.py).
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Gagal menyimpan resep baru");
  return res.json();
}

export async function updateFood(slug: string, input: FoodInput, token: string): Promise<Food> {
  const res = await fetch(`${API_URL}/api/foods/${slug}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Gagal memperbarui resep");
  return res.json();
}

export async function deleteFood(slug: string, token: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/foods/${slug}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Gagal menghapus resep");
}

// --- Auth ---

export async function registerUser(email: string, name: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? "Gagal mendaftar");
  }
  return res.json();
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? "Gagal masuk");
  }
  return res.json();
}

export async function getMe(token: string): Promise<User> {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Token tidak valid");
  return res.json();
}