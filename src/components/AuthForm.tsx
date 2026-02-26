'use client';
import { useState, FormEvent } from 'react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface AuthFormProps {
    mode: 'login' | 'register';
}

export default function AuthForm({ mode }: AuthFormProps) {
    const { login, register } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const isLogin = mode === 'login';

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(email, password);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4"
            style={{ background: 'var(--bg)' }}>
            {/* Logo / brand */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-10"
            >
                <div className="text-5xl mb-3">⛓️</div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Don&apos;t Break The Chain</h1>
                <p className="text-zinc-400 mt-2 text-sm">Build habits. Guard your streak. Never miss twice.</p>
            </motion.div>

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="w-full max-w-sm rounded-2xl p-8"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
                <h2 className="text-xl font-semibold text-white mb-6">
                    {isLogin ? 'Welcome back' : 'Create your account'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs text-zinc-400 mb-1.5 font-medium uppercase tracking-wider">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-zinc-400 mb-1.5 font-medium uppercase tracking-wider">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder={isLogin ? '••••••••' : 'min. 6 characters'}
                            required
                            minLength={6}
                            autoComplete={isLogin ? 'current-password' : 'new-password'}
                        />
                    </div>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-sm text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg px-3 py-2"
                        >
                            {error}
                        </motion.p>
                    )}

                    <motion.button
                        type="submit"
                        whileTap={{ scale: 0.97 }}
                        disabled={loading}
                        className="w-full py-2.5 rounded-xl font-semibold text-sm text-black transition-all disabled:opacity-50"
                        style={{ background: 'var(--accent)' }}
                    >
                        {loading ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
                    </motion.button>
                </form>

                <p className="text-center text-sm text-zinc-500 mt-6">
                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                    <Link
                        href={isLogin ? '/register' : '/login'}
                        className="font-medium"
                        style={{ color: 'var(--accent)' }}
                    >
                        {isLogin ? 'Sign up' : 'Sign in'}
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
