const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || `Error ${res.status}`);
  }

  return data;
}

export const api = {
  login: (email, password) => request("/auth/login", { method: "POST", body: { email, password } }),
  me: () => request("/auth/me"),
  updateMe: (data) => request("/auth/me", { method: "PATCH", body: data }),

  users: {
    list: () => request("/users"),
  },

  products: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/products${qs ? `?${qs}` : ""}`);
    },
    get: (id) => request(`/products/${id}`),
    create: (data) => request("/products", { method: "POST", body: data }),
    update: (id, data) => request(`/products/${id}`, { method: "PUT", body: data }),
    remove: (id) => request(`/products/${id}`, { method: "DELETE" }),
  },

  categories: {
    list: () => request("/categories"),
  },

  customers: {
    list: () => request("/customers"),
    get: (id) => request(`/customers/${id}`),
    create: (data) => request("/customers", { method: "POST", body: data }),
    update: (id, data) => request(`/customers/${id}`, { method: "PUT", body: data }),
  },

  orders: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/orders${qs ? `?${qs}` : ""}`);
    },
    get: (id) => request(`/orders/${id}`),
    create: (data) => request("/orders", { method: "POST", body: data }),
    updateStatus: (id, status) => request(`/orders/${id}/status`, { method: "PATCH", body: { status } }),
  },

  shipments: {
    list: () => request("/shipments"),
  },

  dashboard: {
    summary: () => request("/dashboard/summary"),
    salesByCategory: () => request("/dashboard/sales-by-category"),
  },
};
