const rawBase = (import.meta.env.VITE_API_BASE_URL || '/api').trim();
const API_BASE = rawBase.endsWith('/api')
  ? rawBase
  : rawBase.endsWith('/')
  ? `${rawBase}api`
  : rawBase === ''
  ? '/api'
  : `${rawBase}/api`;

let csrfTokenCache: string | null = null;
let csrfPromise: Promise<string> | null = null;

/**
 * Fetch or refresh CSRF token from the server
 */
export async function getCsrfToken(forceRefresh = false): Promise<string> {
  if (csrfTokenCache && !forceRefresh) {
    return csrfTokenCache;
  }

  if (csrfPromise && !forceRefresh) {
    return csrfPromise;
  }

  csrfPromise = fetch(`${API_BASE}/security/csrf`, {
    method: 'GET',
    credentials: 'include',
  })
    .then(async (res) => {
      if (!res.ok) {
        throw new Error('Failed to fetch CSRF token');
      }
      const data = await res.json();
      csrfTokenCache = data.csrfToken;
      return data.csrfToken;
    })
    .finally(() => {
      csrfPromise = null;
    });

  return csrfPromise;
}

export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Core API request wrapper
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { params, headers = {}, ...rest } = options;

  let url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, String(val));
      }
    });
    const qs = searchParams.toString();
    if (qs) {
      url += (url.includes('?') ? '&' : '?') + qs;
    }
  }

  const method = (rest.method || 'GET').toUpperCase();
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  // Add CSRF token for mutating methods
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    try {
      const token = await getCsrfToken();
      requestHeaders['x-csrf-token'] = token;
    } catch {
      // Proceed; backend will reject if token is required
    }
  }

  const response = await fetch(url, {
    ...rest,
    method,
    headers: requestHeaders,
    credentials: 'include',
  });

  // Handle CSRF token expiration / invalid
  if (response.status === 403) {
    const errorData = await response.json().catch(() => ({}));
    if (
      typeof errorData.message === 'string' &&
      errorData.message.toLowerCase().includes('csrf')
    ) {
      // Refresh CSRF token and retry once
      const newToken = await getCsrfToken(true);
      requestHeaders['x-csrf-token'] = newToken;
      const retryResponse = await fetch(url, {
        ...rest,
        method,
        headers: requestHeaders,
        credentials: 'include',
      });
      if (!retryResponse.ok) {
        const retryData = await retryResponse.json().catch(() => ({}));
        throw new ApiError(
          retryData.message || 'Request failed after CSRF refresh',
          retryResponse.status,
          retryData
        );
      }
      return retryResponse.status === 204 ? (null as T) : retryResponse.json();
    }
    throw new ApiError(errorData.message || 'Forbidden', 403, errorData);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let message = '';

    if (Array.isArray(errorData.errors) && errorData.errors.length > 0) {
      message = errorData.errors
        .map((e: any) => (typeof e === 'string' ? e : e.message || e.msg || ''))
        .filter(Boolean)
        .join('. ');
    } else if (typeof errorData.errors === 'string') {
      message = errorData.errors;
    }

    if (!message && errorData.message) {
      message = errorData.message;
    } else if (
      message &&
      errorData.message &&
      !message.includes(errorData.message) &&
      !['Validation failed', 'Validation error'].includes(errorData.message)
    ) {
      message = `${errorData.message}: ${message}`;
    }

    if (!message) {
      message = errorData.error || `HTTP ${response.status} Error`;
    }

    throw new ApiError(message, response.status, errorData);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}
