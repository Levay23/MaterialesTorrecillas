export const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
export const API_BASE = import.meta.env.PROD 
  ? "https://levayjorge21-materiales.hf.space/api" 
  : `${BASE_URL}/api`;

export async function apiFetch<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error((err as any).error || "Request failed");
  }
  return res.json();
}

export function formatCOP(value: number | null | undefined): string {
  if (value === null || value === undefined) return "$0";
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("es-CO", { year: "numeric", month: "short", day: "numeric" }).format(new Date(date));
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("es-CO", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(date));
}
