const ACCESS_TOKEN_KEY = "hipcms_access_token";
const REFRESH_TOKEN_KEY = "hipcms_refresh_token";

function inBrowser() {
  return typeof window !== "undefined";
}

export function getAccessToken() {
  if (!inBrowser()) {
    return null;
  }
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  if (!inBrowser()) {
    return null;
  }
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setAuthTokens(accessToken: string, refreshToken: string) {
  if (!inBrowser()) {
    return;
  }
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearAuthTokens() {
  if (!inBrowser()) {
    return;
  }
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";
}
