const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API}${path}`, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(body.error || `HTTP ${res.status}`);
    }

    return res.json() as Promise<T>;
}

// --- Auth ---
export const authApi = {
    register: (email: string, password: string) =>
        request<{ user: User }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    login: (email: string, password: string) =>
        request<{ user: User }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    logout: () =>
        request<{ message: string }>('/auth/logout', { method: 'POST' }),

    me: () =>
        request<{ user: User }>('/auth/me'),
};

// --- Habits ---
export const habitsApi = {
    list: () =>
        request<{ habits: Habit[] }>('/habits'),

    create: (name: string, color: string) =>
        request<{ habit: Habit }>('/habits', {
            method: 'POST',
            body: JSON.stringify({ name, color }),
        }),

    delete: (id: string) =>
        request<{ message: string }>(`/habits/${id}`, { method: 'DELETE' }),

    checkin: (id: string) =>
        request<CheckinResponse>(`/habits/${id}/checkin`, { method: 'POST' }),
};

// --- Types ---
export interface User {
    id: string;
    email: string;
}

export interface Habit {
    id: string;
    name: string;
    color: string;
    created_at: string;
    streak: number;
    longestStreak: number;
    completions: string[];
}

export interface CheckinResponse {
    completed: boolean;
    streak: number;
    longestStreak: number;
    completions: string[];
}
