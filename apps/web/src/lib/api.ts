export function getToken() {
  return localStorage.getItem('token') || ''
}

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` }
}

export async function apiFetch(input: RequestInfo, init?: RequestInit) {
  return fetch(input, {
    ...init,
    headers: {
      ...authHeaders(),
      ...(init?.headers || {}),
    },
  })
}

export async function apiGet(path: string) {
  return apiFetch(path)
}

export async function apiPost(path: string, body?: any) {
  return apiFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

export async function apiPut(path: string, body: any) {
  return apiFetch(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export async function apiDelete(path: string) {
  return apiFetch(path, { method: 'DELETE' })
}

// Backward-compatible api object used by existing auth.tsx
export const api = {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
  fetch: apiFetch,
}
