import type { ApiErrorBody } from "@/lib/api";

/**
 * Browser-side wrapper around fetch for our API. Every outcome, including a
 * network failure, comes back as a value with a message fit to show the user,
 * so components never need their own try/catch.
 */
export type ApiResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      status: number;
      error: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };

const NETWORK_ERROR = "Couldn't reach the server. Check your connection and try again.";
const UNKNOWN_ERROR = "Something went wrong. Please try again.";

export async function apiRequest<T = undefined>(url: string, init?: RequestInit): Promise<ApiResult<T>> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    return { ok: false, status: 0, error: NETWORK_ERROR };
  }

  if (response.ok) {
    const data = response.status === 204 ? undefined : await response.json();
    return { ok: true, data: data as T };
  }

  const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
  return {
    ok: false,
    status: response.status,
    error: body?.error ?? UNKNOWN_ERROR,
    fieldErrors: body?.details?.fieldErrors,
  };
}
