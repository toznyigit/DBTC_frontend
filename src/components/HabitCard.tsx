'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Habit } from '@/lib/api';
import CalendarGrid from './CalendarGrid';
import StreakBadge from './StreakBadge';

const PRESET_COLORS = [
    '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4',
    '#22c55e', '#ec4899', '#f97316', '#64748b',
];

interface HabitCardProps {
    habit: Habit;
    onCheckin: (id: string) => Promise<{ completed: boolean }>;
    onDelete: (id: string) => Promise<void>;
}

function todayStr(): string {
    return new Date().toISOString().slice(0, 10);
}

export default function HabitCard({ habit, onCheckin, onDelete }: HabitCardProps) {
    const [bursting, setBursting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const completedToday = habit.completions.includes(todayStr());

    const handleCheckin = async () => {
        setBursting(true);
        setTimeout(() => setBursting(false), 500);
        await onCheckin(habit.id);
    };

    const handleDelete = async () => {
        if (!confirmDelete) {
            setConfirmDelete(true);
            setTimeout(() => setConfirmDelete(false), 3000);
            return;
        }
        setDeleting(true);
        await onDelete(habit.id);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl p-5 flex flex-col gap-4"
            style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
            }}
        >
            {/* Header row */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                    {/* Color dot */}
                    <div
                        className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: habit.color, boxShadow: `0 0 8px ${habit.color}66` }}
                    />
                    <h3 className="text-base font-semibold text-white truncate">{habit.name}</h3>
                </div>

                {/* Delete */}
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-xs px-2.5 py-1 rounded-lg transition-all flex-shrink-0"
                    style={{
                        background: confirmDelete ? '#7f1d1d' : 'transparent',
                        color: confirmDelete ? '#fca5a5' : 'var(--text-muted)',
                        border: `1px solid ${confirmDelete ? '#991b1b' : 'transparent'}`,
                    }}
                >
                    {deleting ? '…' : confirmDelete ? 'Confirm?' : '✕'}
                </button>
            </div>

            {/* Streak badges */}
            <StreakBadge streak={habit.streak} longestStreak={habit.longestStreak} />

            {/* Calendar grid */}
            <CalendarGrid completions={habit.completions} color={habit.color} />

            {/* Check-in button */}
            <motion.button
                onClick={handleCheckin}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${bursting ? 'checkin-burst' : ''}`}
                style={
                    completedToday
                        ? {
                            background: `${habit.color}22`,
                            color: habit.color,
                            border: `1px solid ${habit.color}44`,
                        }
                        : {
                            background: habit.color,
                            color: '#000',
                            border: 'none',
                        }
                }
            >
                {completedToday ? '✓ Done today — great job!' : "Mark today's chain link"}
            </motion.button>
        </motion.div>
    );
}

export { PRESET_COLORS };