const DEFAULT_API_BASE_URL = "http://localhost:8080";

const apiBaseUrl =
  (import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  DEFAULT_API_BASE_URL;

function joinUrl(base, path) {
  const trimmedBase = base.replace(/\/+$/, "");
  const trimmedPath = path.replace(/^\/+/, "");
  return `${trimmedBase}/${trimmedPath}`;
}

function buildUrl(path) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return joinUrl(apiBaseUrl, path);
}

function isJsonResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  return contentType.includes("application/json");
}

export async function apiFetch(path, options = {}) {
  const { method = "GET", headers = {}, body } = options;
  const request = {
    method,
    headers: {
      Accept: "application/json",
      ...headers,
    },
  };

  if (body !== undefined) {
    request.headers["Content-Type"] = "application/json";
    request.body = JSON.stringify(body);
  }

  const response = await fetch(buildUrl(path), request);

  if (response.status === 204) return null;

  const data = isJsonResponse(response)
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? data.error
        : `Request failed (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    if (data && typeof data === "object" && "details" in data) {
      error.details = data.details;
    }
    throw error;
  }

  return data;
}
