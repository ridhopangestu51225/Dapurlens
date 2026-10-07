"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@/types/user";
import { getMe, loginUser, registerUser } from "@/lib/api";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean; // true selagi mengecek token tersimpan saat halaman pertama dimuat
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
};

// createContext butuh nilai default -- kita isi `null`, lalu AuthProvider
// di bawah yang akan menyuplai nilai SUNGGUHAN ke semua children-nya.
const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "dapurlens_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Jalan SEKALI saat aplikasi pertama dibuka di browser: cek apakah ada
  // token tersimpan dari sesi login sebelumnya (localStorage bertahan
  // walau tab/browser ditutup, beda dengan useState yang reset tiap reload).
  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_KEY);
    if (!savedToken) {
      setLoading(false);
      return;
    }

    getMe(savedToken)
      .then((userData) => {
        setUser(userData);
        setToken(savedToken);
      })
      .catch(() => {
        // Token tersimpan ternyata sudah kedaluwarsa/invalid -> bersihkan.
        localStorage.removeItem(STORAGE_KEY);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const res = await loginUser(email, password);
    localStorage.setItem(STORAGE_KEY, res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  }

  async function register(email: string, name: string, password: string) {
    const res = await registerUser(email, name, password);
    localStorage.setItem(STORAGE_KEY, res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook supaya komponen lain tinggal `const { user } = useAuth();`
// tanpa perlu tahu soal useContext/AuthContext sama sekali.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}