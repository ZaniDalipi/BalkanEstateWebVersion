/**
 * Get the API URL for making requests
 * In Next.js, client-side requests use the proxy (/api)
 * Server-side requests go directly to the backend
 */
export const getApiUrl = (): string => {
  if (typeof window !== 'undefined') {
    // Client-side: use Next.js proxy
    return '/api';
  }
  // Server-side: direct backend URL
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';
};

export const API_URL = getApiUrl();
