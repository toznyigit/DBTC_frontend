'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { useHabits } from '@/lib/use-habits';
import HabitCard from '@/components/HabitCard';
import AddHabitModal from '@/components/AddHabitModal';

export default function DashboardPage() {
    const { user, loading: authLoading, logout } = useAuth();
    const { habits, loading: habitsLoading, error, fetchHabits, addHabit, deleteHabit, toggleCheckin } = useHabits();
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();

    // Redirect if not authed
    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/login');
        }
    }, [user, authLoading, router]);

    // Load habits once authenticated
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

    const totalStreakDays = habits.reduce((sum, h) => sum + h.streak, 0);
    const completedToday = habits.filter(h => h.completions.includes(new Date().toISOString().slice(0, 10))).length;

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
            {/* Header */}
            <header
                className="sticky top-0 z-30"
                style={{ background: 'rgba(9,9,11,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}
            >
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">⛓️</span>
                            <span className="font-bold text-white text-sm tracking-tight hidden sm:block">
                                Don&apos;t Break The Chain
                            </span>
                        </div>

                        {/* Nav tabs */}
                        <nav className="flex items-center gap-1">
                            <span
                                className="text-xs px-3 py-1.5 rounded-lg font-medium"
                                style={{
                                    color: 'var(--accent)',
                                    background: 'rgba(245,158,11,0.1)',
                                    border: '1px solid rgba(245,158,11,0.2)',
                                }}
                            >
                                Habits
                            </span>
                            <Link
                                href="/calendar"
                                className="text-xs px-3 py-1.5 rounded-lg transition-all"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                Calendar
                            </Link>
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
                {/* Hero stats bar */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl p-5 mb-6 flex flex-wrap items-center gap-6"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                >
                    <div>
                        <p className="text-3xl font-extrabold text-amber-400">{habits.length}</p>
                        <p className="text-xs text-zinc-500 uppercase tracking-widest mt-0.5">Active habits</p>
                    </div>
                    <div style={{ width: 1, height: 40, background: 'var(--border)' }} />
                    <div>
                        <p className="text-3xl font-extrabold text-white">{completedToday}</p>
                        <p className="text-xs text-zinc-500 uppercase tracking-widest mt-0.5">Done today</p>
                    </div>
                    <div style={{ width: 1, height: 40, background: 'var(--border)' }} />
                    <div>
                        <p className="text-3xl font-extrabold text-white">{totalStreakDays}</p>
                        <p className="text-xs text-zinc-500 uppercase tracking-widest mt-0.5">Total streak days</p>
                    </div>

                    <div className="ml-auto">
                        <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setShowModal(true)}
                            id="add-habit-btn"
                            className="px-4 py-2 rounded-xl text-sm font-semibold text-black"
                            style={{ background: 'var(--accent)' }}
                        >
                            + New habit
                        </motion.button>
                    </div>
                </motion.div>

                {/* Habits grid */}
                {habitsLoading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : error ? (
                    <div className="text-center py-24">
                        <p className="text-red-400 text-sm">{error}</p>
                        <button
                            onClick={fetchHabits}
                            className="mt-3 text-xs text-zinc-400 underline"
                        >
                            Try again
                        </button>
                    </div>
                ) : habits.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-24 flex flex-col items-center gap-4"
                    >
                        <span className="text-6xl">🔗</span>
                        <h2 className="text-xl font-semibold text-white">No habits yet</h2>
                        <p className="text-sm text-zinc-500 max-w-xs">
                            Add your first habit and start building a chain you&apos;ll never want to break.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setShowModal(true)}
                            className="mt-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-black"
                            style={{ background: 'var(--accent)' }}
                        >
                            Add your first habit
                        </motion.button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <AnimatePresence>
                            {habits.map(habit => (
                                <HabitCard
                                    key={habit.id}
                                    habit={habit}
                                    onCheckin={toggleCheckin}
                                    onDelete={deleteHabit}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>

            {/* Add Habit Modal */}
            {showModal && (
                <AddHabitModal
                    onAdd={addHabit}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
}