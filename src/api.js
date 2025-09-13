// Robust API helper for your PHP backend.
// Update BASE to match your backend URL if needed.
const BASE = (typeof window !== "undefined" && window.__API_BASE__) || "/food_for_all/backend.php";

let accessToken = localStorage.getItem("token") || null;
let refreshToken = localStorage.getItem("refresh_token") || null;

export function setToken(t) {
  accessToken = t;
  if (t) localStorage.setItem("token", t);
  else localStorage.removeItem("token");
}

export function setRefreshToken(rt) {
  refreshToken = rt;
  if (rt) localStorage.setItem("refresh_token", rt);
  else localStorage.removeItem("refresh_token");
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
}

async function parseResponse(res) {
  try {
    const json = await res.json();
    return { payload: json, text: null };
  } catch (e) {
    try {
      const text = await res.text();
      return { payload: null, text };
    } catch (e2) {
      return { payload: null, text: null };
    }
  }
}

export async function callAction(action, method = "GET", body = null, options = {}) {
  if (!action || typeof action !== "string") {
    throw new Error("Invalid action provided: " + String(action));
  }

  const url = new URL(BASE, window.location.origin);
  url.searchParams.set("action", action);

  const opts = {
    method,
    headers: {},
    ...options
  };

  if (accessToken) {
    opts.headers["Authorization"] = "Bearer " + accessToken;
  }

  if (body instanceof FormData) {
    opts.body = body;
  } else if (method === "GET" || method === "DELETE") {
    if (body && typeof body === "object") {
      Object.keys(body).forEach(k => {
        if (body[k] !== undefined && body[k] !== null) url.searchParams.set(k, String(body[k]));
      });
    }
  } else {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body || {});
  }

  async function doFetch() {
    const res = await fetch(url.toString(), opts);
    const parsed = await parseResponse(res);
    return { res, ...parsed };
  }

  let result = await doFetch();

  // if 401 and refresh token available - attempt one refresh
  if (result.res.status === 401 && refreshToken) {
    try {
      const r = await fetch(BASE + "?action=refresh_token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken })
      });
      const jr = await r.json().catch(() => null);
      if (r.ok && jr && jr.success && jr.data?.token) {
        setToken(jr.data.token);
        if (jr.data.refresh_token) setRefreshToken(jr.data.refresh_token);
        if (accessToken) opts.headers["Authorization"] = "Bearer " + accessToken;
        result = await doFetch();
      } else {
        clearTokens();
        const err = new Error(jr?.message || "Refresh failed");
        err.status = r.status;
        err.response = jr;
        throw err;
      }
    } catch (err) {
      clearTokens();
      throw err;
    }
  }

  if (!result.res.ok) {
    const msg = result.payload?.message || result.text || `HTTP ${result.res.status}`;
    const err = new Error(msg);
    err.status = result.res.status;
    err.response = result.payload || result.text;
    throw err;
  }

  // Normalize payload: if success true and data null, return success + empty/defaults handled by callers
  return result.payload !== null ? result.payload : { success: true, data: null };
}

export default {
  callAction,
  setToken,
  setRefreshToken,
  clearTokens
};