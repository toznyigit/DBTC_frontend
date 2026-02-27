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

    create: (payload: CreateHabitPayload) =>
        request<{ habit: Habit }>('/habits', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    delete: (id: string) =>
        request<{ message: string }>(`/habits/${encodeURIComponent(id)}`, { method: 'DELETE' }),

    checkin: (id: string) =>
        request<CheckinResponse>(`/habits/${encodeURIComponent(id)}/checkin`, { method: 'POST' }),

    // For counter and gauge habits: log a value for today
    logEntry: (id: string, value: number) =>
        request<CheckinResponse>(`/habits/${encodeURIComponent(id)}/log`, {
            method: 'POST',
            body: JSON.stringify({ value }),
        }),
};

// --- Types ---
export interface User {
    id: string;
    email: string;
}

/**
 * boolean — simple done/not-done (original behaviour)
 * counter — user increments a count; fulfilled when count <= goal (or >= goal depending on direction)
 * gauge   — user logs a numeric value; fulfilled when within ±5% of goal
 */
export type HabitType = 'boolean' | 'counter' | 'gauge';

/**
 * direction only applies to counter type:
 *   'lte' — fulfilled when count <= goal  (e.g. Stop Smoking: goal 0, want to stay at or below)
 *   'gte' — fulfilled when count >= goal  (e.g. Drink Water: goal 8, want to reach or exceed)
 */
export type CounterDirection = 'lte' | 'gte';

export interface Habit {
    id: string;
    name: string;
    color: string;
    created_at: string;
    // Habit type config
    type: HabitType;
    goal: number | null;               // null for boolean type
    direction: CounterDirection | null; // only for counter type
    unit: string | null;               // e.g. 'glasses', 'kcal', 'cigarettes'
    // Streak data
    streak: number;
    longestStreak: number;
    completions: string[];
    // Today's logged value (counter/gauge only); null if nothing logged today
    todayValue: number | null;
}

export interface CreateHabitPayload {
    name: string;
    color: string;
    type: HabitType;
    goal: number | null;
    direction: CounterDirection | null;
    unit: string | null;
}

export interface CheckinResponse {
    completed: boolean;
    streak: number;
    longestStreak: number;
    completions: string[];
    todayValue: number | null;
}