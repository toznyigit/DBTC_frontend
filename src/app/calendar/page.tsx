'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { useHabits } from '@/lib/use-habits';
import HabitCalendar from '@/components/HabitCalendar';

export default function CalendarPage() {
    const { user, loading: authLoading, logout } = useAuth();
    const { habits, loading: habitsLoading, error, fetchHabits } = useHabits();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) fetchHabits();
    }, [user, fetchHabits]);

    if (authLoading || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
            {/* Header */}
            <header
                className="sticky top-0 z-30"
                style={{
                    background: 'rgba(9,9,11,0.85)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid var(--border)',
                }}
            >
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 transition-opacity hover:opacity-70"
                        >
                            <span className="text-xl">⛓️</span>
                            <span className="font-bold text-white text-sm tracking-tight hidden sm:block">
                                Don&apos;t Break The Chain
                            </span>
                        </Link>

                        {/* Nav tabs */}
                        <nav className="flex items-center gap-1">
                            <Link
                                href="/dashboard"
                                className="text-xs px-3 py-1.5 rounded-lg transition-all"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                Habits
                            </Link>
                            <span
                                className="text-xs px-3 py-1.5 rounded-lg font-medium"
                                style={{
                                    color: 'var(--accent)',
                                    background: 'rgba(245,158,11,0.1)',
                                    border: '1px solid rgba(245,158,11,0.2)',
                                }}
                            >
                                Calendar
                            </span>
                        </nav>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs text-zinc-500 hidden sm:block">{user.email}</span>
                        <button
                            onClick={logout}
                            className="text-xs px-3 py-1.5 rounded-lg transition-all"
                            style={{
                                color: 'var(--text-muted)',
                                border: '1px solid var(--border)',
                                background: 'transparent',
                            }}
                        >
                            Log out
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {habitsLoading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : error ? (
                    <div className="text-center py-24">
                        <p className="text-red-400 text-sm">{error}</p>
                        <button onClick={fetchHabits} className="mt-3 text-xs text-zinc-400 underline">
                            Try again
                        </button>
                    </div>
                ) : habits.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-24 flex flex-col items-center gap-4"
                    >
                        <span className="text-6xl">📅</span>
                        <h2 className="text-xl font-semibold text-white">No habits to show</h2>
                        <p className="text-sm text-zinc-500 max-w-xs">
                            Add some habits first and your completions will appear here.
                        </p>
                        <Link
                            href="/dashboard"
                            className="mt-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-black"
                            style={{ background: 'var(--accent)' }}
                        >
                            Go to habits
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <HabitCalendar habits={habits} />
                    </motion.div>
                )}
            </main>
        </div>
    );
}