'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi, User } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AuthContextValue {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        authApi.me()
            .then(({ user }) => setUser(user))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    const login = async (email: string, password: string) => {
        const { user, token } = await authApi.login(email, password);
        setUser(user);
        // Store token in localStorage as backup
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
        }
        router.push('/dashboard');
    };

    const register = async (email: string, password: string) => {
        const { user, token } = await authApi.register(email, password);
        setUser(user);
        // Store token in localStorage as backup
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
        }
        router.push('/dashboard');
    };

    const logout = async () => {
        await authApi.logout();
        setUser(null);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
        }
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
