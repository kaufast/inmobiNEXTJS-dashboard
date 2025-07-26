import { QueryClient, QueryFunction } from "@tanstack/react-query";

// API base URL - environment aware
const API_BASE = import.meta.env.VITE_API_URL || 
  (process.env.NODE_ENV === 'production'
    ? '' // Fallback for same-domain deployment
    : `${window.location.protocol}//${window.location.hostname}:${import.meta.env.VITE_API_PORT || '8090'}`);

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  useJsonHeaders: boolean = true
): Promise<Response> {
  const fullUrl = url.startsWith('/api') ? `${API_BASE}${url}` : url;
  
  // Determine headers and body based on data type
  let headers: Record<string, string> = {};
  let body: any = undefined;
  
  if (data) {
    if (data instanceof FormData) {
      // For FormData, don't set Content-Type - let browser set it with boundary
      body = data;
    } else if (useJsonHeaders) {
      // For regular JSON data
      headers = { "Content-Type": "application/json" };
      body = JSON.stringify(data);
    } else {
      // For other data types without JSON headers
      body = data;
    }
  }
  
  const res = await fetch(fullUrl, {
    method,
    headers,
    body,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = typeof queryKey[0] === 'string' && queryKey[0].startsWith('/api')
      ? `${API_BASE}${queryKey[0]}`
      : (queryKey[0] as string);
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
