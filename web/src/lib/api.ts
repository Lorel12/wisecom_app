const API_BASE =
  typeof window === "undefined" ? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000" : "";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const res = await fetch(`${API_BASE}/api${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body && !isFormData ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (res.status === 204) return undefined as T;

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : undefined;

  if (!res.ok) {
    throw new ApiError(data?.error ?? "Erreur inconnue.", res.status);
  }
  return data as T;
}

function serialize(body: unknown): BodyInit | undefined {
  if (body === undefined) return undefined;
  if (typeof FormData !== "undefined" && body instanceof FormData) return body;
  return JSON.stringify(body);
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body: serialize(body) }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body: serialize(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
