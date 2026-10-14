export const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:8080').replace(/\/$/, '');

let csrfToken;

async function getCsrfToken() {
  const response = await fetch(`${API_BASE}/api/v1/auth/csrf`, { credentials: 'include' });
  if (!response.ok) throw new Error('Unable to initialize a secure API session.');
  const data = await response.json();
  csrfToken = data.token;
  return csrfToken;
}

export async function apiRequest(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const headers = new Headers(options.headers || {});
  const requestOptions = { ...options, method, headers, credentials: 'include' };

  if (options.body && !(options.body instanceof FormData) && typeof options.body !== 'string') {
    headers.set('Content-Type', 'application/json');
    requestOptions.body = JSON.stringify(options.body);
  }

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    headers.set('X-XSRF-TOKEN', await getCsrfToken());
  }

  let response = await fetch(`${API_BASE}${path}`, requestOptions);
  if (response.status === 403 && !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    csrfToken = undefined;
    headers.set('X-XSRF-TOKEN', await getCsrfToken());
    response = await fetch(`${API_BASE}${path}`, requestOptions);
  }
  if (!response.ok) {
    let message = `Request failed (${response.status}).`;
    try {
      const problem = await response.json();
      message = problem.detail || problem.message || message;
    } catch {
      // Keep the HTTP status message for non-JSON error responses.
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  const contentType = response.headers.get('content-type') || '';
  return contentType.includes('application/json') ? response.json() : response.blob();
}

export function clearCsrfToken() {
  csrfToken = undefined;
}