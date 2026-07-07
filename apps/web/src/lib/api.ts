export function getToken() {
  return localStorage.getItem('token') || localStorage.getItem('nethra_token') || ''
}

function authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function parseJson(response: Response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

async function requestJson(method: string, path: string, body?: any) {
  const headers: Record<string, string> = {
    ...authHeaders(),
  }
  const init: RequestInit = { method, headers }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    init.body = JSON.stringify(body)
  }

  const response = await fetch(path, init)
  const data = await parseJson(response)

  if (!response.ok) {
    throw new Error(data?.error || data?.message || `${method} ${path} failed: ${response.status}`)
  }

  return data
}

async function requestResponse(method: string, path: string, body?: any) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...authHeaders(),
  }
  return fetch(path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

// ── New-style helpers (return Response) ────────────────────────
export async function apiFetch(input: RequestInfo, init?: RequestInit) {
  return fetch(input, {
    ...init,
    headers: {
      ...authHeaders(),
      ...(init?.headers as Record<string, string> || {}),
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

// ── Legacy api object (returns parsed JSON) ────────────────────
async function legacyGet(path: string) {
  return requestJson('GET', path)
}

async function legacyPost(path: string, body?: any) {
  return requestJson('POST', path, body)
}

async function legacyPut(path: string, body?: any) {
  return requestJson('PUT', path, body)
}

async function legacyDelete(path: string) {
  return requestJson('DELETE', path)
}

function buildQuery(params?: Record<string, any>) {
  if (!params) return ''
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.append(k, String(v))
  })
  const s = qs.toString()
  return s ? `?${s}` : ''
}

async function legacyList(entity: string, params?: Record<string, any>) {
  const data = await legacyGet(`/api/${entity}${buildQuery(params)}`)
  return data?.data || data || []
}

async function legacyCreate(entity: string, body: any) {
  return legacyPost(`/api/${entity}`, body)
}

async function legacyUpdate(entity: string, id: string | number, body: any) {
  return legacyPut(`/api/${entity}/${id}`, body)
}

async function legacyRemove(entity: string, id: string | number) {
  return legacyDelete(`/api/${entity}/${id}`)
}

async function legacyMe() {
  return legacyGet('/api/auth/me')
}

async function legacyLogin(email: string, password: string) {
  return legacyPost('/api/auth/login', { email, password })
}

export const api = {
  get: legacyGet,
  post: legacyPost,
  put: legacyPut,
  delete: legacyDelete,
  list: legacyList,
  create: legacyCreate,
  update: legacyUpdate,
  remove: legacyRemove,
  me: legacyMe,
  login: legacyLogin,
}

export default api
