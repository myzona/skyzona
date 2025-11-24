const windowOrigin =
  typeof window !== "undefined" && window.location
    ? window.location.origin.replace(/\/$/, "")
    : undefined;

const normalizeBase = (value: string) => value.replace(/\/$/, "");
const ensurePath = (value: string) => (value.startsWith("/") ? value : `/${value}`);
const joinBaseAndPath = (base: string, path: string) =>
  `${normalizeBase(base)}${ensurePath(path)}`;

const rawApiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
const apiBaseUrl = rawApiBaseUrl ?? (windowOrigin ? joinBaseAndPath(windowOrigin, "/api/v1") : "");

if (!apiBaseUrl) {
  throw new Error(
    "VITE_API_BASE_URL was not set and the UI is not served from the same origin as the API.",
  );
}

const environment =
  (import.meta.env.VITE_ENVIRONMENT as string | undefined)?.trim() ?? "production";

const buildTimeApiKey: string | null =
  typeof import.meta.env.VITE_SKYVERN_API_KEY === "string"
    ? import.meta.env.VITE_SKYVERN_API_KEY
    : null;

const rawArtifactApiBaseUrl =
  (import.meta.env.VITE_ARTIFACT_API_BASE_URL as string | undefined)?.trim();
const artifactApiBaseUrl =
  rawArtifactApiBaseUrl ?? (windowOrigin ? joinBaseAndPath(windowOrigin, "/artifacts") : "");

if (!artifactApiBaseUrl) {
  console.warn("artifactApiBaseUrl environment variable was not set");
}

const rawApiPathPrefix = (import.meta.env.VITE_API_PATH_PREFIX as string | undefined)?.trim();
const apiPathPrefix = rawApiPathPrefix ? ensurePath(rawApiPathPrefix) : "";

const API_KEY_STORAGE_KEY = "skyvern.apiKey";

const lsKeys = {
  browserSessionId: "skyvern.browserSessionId",
  apiKey: API_KEY_STORAGE_KEY,
};

const rawWssBaseUrl = (import.meta.env.VITE_WSS_BASE_URL as string | undefined)?.trim();
const derivedWsOrigin = windowOrigin ? windowOrigin.replace(/^http/, "ws") : undefined;
const wssBaseUrl =
  rawWssBaseUrl ?? (derivedWsOrigin ? joinBaseAndPath(derivedWsOrigin, "/api/v1") : "");

if (!wssBaseUrl) {
  console.warn("wssBaseUrl environment variable was not set");
}

let newWssBaseUrl = wssBaseUrl;
if (wssBaseUrl) {
  try {
    const url = new URL(wssBaseUrl);
    if (url.pathname.startsWith("/api")) {
      url.pathname = url.pathname.replace(/^\/api/, "");
    }
    newWssBaseUrl = url.toString();
  } catch (e) {
    newWssBaseUrl = wssBaseUrl.replace("/api", "");
  }
} else {
  newWssBaseUrl = "";
}

// Base URL for the Runs API (strip a leading `/api` segment: /api/v1 -> /v1)
const runsApiBaseUrl = (() => {
  try {
    const url = new URL(apiBaseUrl);
    if (url.pathname.startsWith("/api")) {
      url.pathname = url.pathname.replace(/^\/api/, "");
    }
    return `${url.origin}${url.pathname}`;
  } catch (e) {
    return apiBaseUrl.replace("/api", "");
  }
})();

let runtimeApiKey: string | null | undefined;

function readPersistedApiKey(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage.getItem(API_KEY_STORAGE_KEY);
}

function getRuntimeApiKey(): string | null {
  if (runtimeApiKey !== undefined) {
    return runtimeApiKey;
  }

  const persisted = readPersistedApiKey();
  const candidate = persisted ?? buildTimeApiKey;

  // Treat YOUR_API_KEY as missing. We may inherit this from .env.example
  // in some cases of misconfiguration.
  runtimeApiKey = candidate === "YOUR_API_KEY" ? null : candidate;
  return runtimeApiKey;
}

function persistRuntimeApiKey(value: string): void {
  runtimeApiKey = value;
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(API_KEY_STORAGE_KEY, value);
  }
}

function clearRuntimeApiKey(): void {
  runtimeApiKey = null;
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(API_KEY_STORAGE_KEY);
  }
}

const useNewRunsUrl = true as const;

export {
  apiBaseUrl,
  runsApiBaseUrl,
  environment,
  artifactApiBaseUrl,
  apiPathPrefix,
  lsKeys,
  wssBaseUrl,
  newWssBaseUrl,
  getRuntimeApiKey,
  persistRuntimeApiKey,
  clearRuntimeApiKey,
  useNewRunsUrl,
};
