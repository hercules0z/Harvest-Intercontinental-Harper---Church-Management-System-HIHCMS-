import { clearAuthTokens, getAccessToken, getApiBaseUrl, getRefreshToken, setAuthTokens } from "./auth";

type ApiRequestOptions = {
  auth?: boolean;
  retryOnUnauthorized?: boolean;
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 10000;

async function fetchWithTimeout(url: string, init?: RequestInit, timeoutMs: number = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  const response = await fetchWithTimeout(`${getApiBaseUrl()}/auth/refresh/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh: refreshToken }),
  }, DEFAULT_TIMEOUT_MS);

  if (!response.ok) {
    clearAuthTokens();
    return null;
  }

  const payload = await response.json();
  if (!payload?.access) {
    clearAuthTokens();
    return null;
  }

  setAuthTokens(payload.access, refreshToken);
  return payload.access as string;
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
  options: ApiRequestOptions = { auth: true, retryOnUnauthorized: true, timeoutMs: DEFAULT_TIMEOUT_MS },
): Promise<T> {
  const shouldAttachAuth = options.auth !== false;
  const shouldRetry = options.retryOnUnauthorized !== false;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const headers = new Headers(init?.headers ?? {});
  headers.set("Content-Type", headers.get("Content-Type") ?? "application/json");

  if (shouldAttachAuth) {
    const accessToken = getAccessToken();
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  const response = await fetchWithTimeout(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
  }, timeoutMs);

  if (response.status === 401 && shouldAttachAuth && shouldRetry) {
    const newAccessToken = await refreshAccessToken();

    if (newAccessToken) {
      const retryHeaders = new Headers(init?.headers ?? {});
      retryHeaders.set("Content-Type", retryHeaders.get("Content-Type") ?? "application/json");
      retryHeaders.set("Authorization", `Bearer ${newAccessToken}`);

      const retryResponse = await fetchWithTimeout(`${getApiBaseUrl()}${path}`, {
        ...init,
        headers: retryHeaders,
      }, timeoutMs);

      if (!retryResponse.ok) {
        throw await retryResponse.json();
      }

      return retryResponse.json();
    }
  }

  if (!response.ok) {
    throw await response.json();
  }

  return response.json();
}
