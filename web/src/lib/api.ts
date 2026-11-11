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

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  let data: unknown;
  if (isJson) {
    try {
      data = await res.json();
    } catch {
      data = undefined;
    }
  }

  if (!res.ok) {
    const errorMessage =
      typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
        ? data.error
        : `Le serveur a répondu avec l'erreur HTTP ${res.status} pour /api${path} (${contentType || "type de réponse inconnu"}). Vérifiez l'URL et l'état du service API sur Render.`;
    throw new ApiError(errorMessage, res.status);
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
