const DEFAULT_API_BASE = 'http://localhost:5000';

export const API_BASE =
  (typeof process !== 'undefined' &&
    process.env &&
    process.env.REACT_APP_API_URL) ||
  DEFAULT_API_BASE;

async function jsonFetch(path, options) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.error || data?.message || 'Request failed';
    throw new Error(msg);
  }
  return data;
}

export function listProducts({ search = '', category = '', sort = 'featured', page = 1, limit = 24 } = {}) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (category) params.set('category', category);
  if (sort) params.set('sort', sort);
  params.set('page', String(page));
  params.set('limit', String(limit));
  return jsonFetch(`/api/products?${params.toString()}`);
}

export function getProduct(id) {
  return jsonFetch(`/api/products/${id}`);
}

export function seedProducts({ force = false } = {}) {
  const params = new URLSearchParams();
  if (force) params.set('force', 'true');
  return jsonFetch(`/api/products/seed?${params.toString()}`, { method: 'POST' });
}

