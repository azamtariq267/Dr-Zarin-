const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const getToken = () => localStorage.getItem("zc_token");

export async function api(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) },
    body: options.body && typeof options.body !== "string" ? JSON.stringify(options.body) : options.body,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { const err = new Error(data.message || `Request failed (${res.status})`); err.data = data; err.status = res.status; throw err; }
  return data;
}
export { API_BASE };
