import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

// NOTE: backend runs on port 7001 (configured via .env) in development.
// You can override this with NEXT_PUBLIC_API_URL (e.g. for Docker or alternate host).
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7001/api/v1',
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor: inject token and log (dev only)
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (process.env.NODE_ENV === 'development') {
            console.debug('axios request', { url: config.url, baseURL: config.baseURL });
        }
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('gw_token');
            if (token) config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response Interceptor: handle 401, 403, 404, 500
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (typeof window === 'undefined') return Promise.reject(error);

        const status = error.response?.status;

        if (status === 401) {
            // Token expired or invalid → clear and redirect to login
            localStorage.removeItem('gw_token');
            localStorage.removeItem('gw_user');
            Cookies.remove('gw_token');
            window.location.href = '/login';
        } else if (status === 403) {
            console.error('Access forbidden');
        } else if (status === 404) {
            console.error('Resource not found');
        } else if (status === 500) {
            console.error('Internal Server Error — Please check backend logs');
        } else if (status === 503) {
            console.error('Service Unavailable — Remote API (WRIS) may be timing out');
        } else if (!error.response) {
            console.error('Network error — check your internet connection or backend status', {
                url: error.config?.url,
                method: error.config?.method?.toUpperCase()
            });
        }


        return Promise.reject(error);
    }
);

export default api;

// ── Typed API helpers
export type ApiError = {
    message: string;
    status?: number;
};

export function getApiErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as any;
        return data?.error || data?.message || data?.details || error.message || 'An unexpected error occurred';
    }
    if (error instanceof Error) return error.message;
    return 'An unexpected error occurred';
}

