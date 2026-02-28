'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Habit } from '@/lib/api';
import ChainGrid from './ChainGrid';
import CalendarGrid from './CalendarGrid';
import StreakBadge from './StreakBadge';

type GridView = 'calendar' | 'chain';

const PRESET_COLORS = [
    '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4',
    '#22c55e', '#ec4899', '#f97316', '#64748b',
];

interface HabitCardProps {
    habit: Habit;
    onCheckin: (id: string) => Promise<{ completed: boolean }>;
    onDelete: (id: string) => Promise<void>;
    onLogEntry: (id: string, value: number) => Promise<{ completed: boolean }>;
    gridView: GridView;
}

function todayStr(): string {
    return new Date().toISOString().slice(0, 10);
}

/** Determines whether today's logged value fulfils the habit */
function isFulfilled(habit: Habit): boolean {
    if (habit.type === 'boolean') {
        return habit.completions.includes(todayStr());
    }
    if (habit.todayValue === null || habit.goal === null) return false;
    if (habit.type === 'counter') {
        return habit.direction === 'gte'
            ? habit.todayValue >= habit.goal
            : habit.todayValue <= habit.goal;
    }
    if (habit.type === 'gauge') {
        const lower = habit.goal * 0.95;
        const upper = habit.goal * 1.05;
        return habit.todayValue >= lower && habit.todayValue <= upper;
    }
    return false;
}

/** Progress ratio 0–1 for the progress bar */
function progressRatio(habit: Habit): number {
    if (habit.goal === null || habit.todayValue === null) return 0;
    if (habit.type === 'counter') {
        if (habit.direction === 'lte') {
            // Goal is a ceiling; full when at 0, empty when at goal or above
            if (habit.goal === 0) return habit.todayValue === 0 ? 1 : 0;
            return Math.max(0, 1 - habit.todayValue / habit.goal);
        }
        return Math.min(1, habit.todayValue / habit.goal);
    }
    if (habit.type === 'gauge') {
        return Math.min(1, habit.todayValue / habit.goal);
    }
    return 0;
}

// ─── Boolean checkin button ───────────────────────────────────────────────────
function BooleanControl({
    habit,
    bursting,
    onCheckin,
}: {
    habit: Habit;
    bursting: boolean;
    onCheckin: () => void;
}) {
    const done = habit.completions.includes(todayStr());
    return (
        <motion.button
            onClick={onCheckin}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${bursting ? 'checkin-burst' : ''}`}
            style={
                done
                    ? { background: `${habit.color}22`, color: habit.color, border: `1px solid ${habit.color}44` }
                    : { background: habit.color, color: '#000', border: 'none' }
            }
        >
            {done ? '✓ Done today — great job!' : "Mark today's chain link"}
        </motion.button>
    );
}

// ─── Counter control ─────────────────────────────────────────────────────────
function CounterControl({
    habit,
    onLog,
}: {
    habit: Habit;
    onLog: (delta: number) => void;
}) {
    const value = habit.todayValue ?? 0;
    const goal = habit.goal ?? 0;
    const fulfilled = isFulfilled(habit);
    const ratio = progressRatio(habit);
    const unit = habit.unit || '';

    return (
        <div className="flex flex-col gap-2">
            {/* Progress bar */}
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#27272a' }}>
                <motion.div
                    className="h-full rounded-full"
                    style={{ background: habit.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${ratio * 100}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                />
            </div>

            <div className="flex items-center justify-between gap-3">
                {/* Current count */}
                <div className="flex items-baseline gap-1">
                    <AnimatePresence mode="popLayout">
                        <motion.span
                            key={value}
                            initial={{ y: -8, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 8, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="text-2xl font-extrabold"
                            style={{ color: fulfilled ? habit.color : 'var(--text)' }}
                        >
                            {value}
                        </motion.span>
                    </AnimatePresence>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {unit && `${unit} `}
                        {habit.direction === 'gte' ? `/ ${goal}${unit ? ' ' + unit : ''}` : `(goal ≤ ${goal}${unit ? ' ' + unit : ''})`}
                    </span>
                </div>

                {/* +/- buttons */}
                <div className="flex items-center gap-1.5">
                    {value > 0 && (
                        <motion.button
                            whileTap={{ scale: 0.88 }}
                            onClick={() => onLog(-1)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold transition-all"
                            style={{ background: '#27272a', color: 'var(--text-muted)' }}
                            aria-label="Decrease"
                        >
                            −
                        </motion.button>
                    )}
                    <motion.button
                        whileTap={{ scale: 0.88 }}
                        onClick={() => onLog(1)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold transition-all"
                        style={{ background: fulfilled ? `${habit.color}33` : habit.color, color: fulfilled ? habit.color : '#000' }}
                        aria-label="Increase"
                    >
                        +
                    </motion.button>
                </div>
            </div>

            {fulfilled && (
                <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs font-medium text-center py-1 rounded-lg"
                    style={{ background: `${habit.color}18`, color: habit.color }}
                >
                    ✓ Goal reached today!
                </motion.p>
            )}
        </div>
    );
}

// ─── Gauge control ────────────────────────────────────────────────────────────
function GaugeControl({
    habit,
    onLog,
}: {
    habit: Habit;
    onLog: (value: number) => void;
}) {
    const [input, setInput] = useState('');
    const value = habit.todayValue ?? 0;
    const goal = habit.goal ?? 0;
    const fulfilled = isFulfilled(habit);
    const ratio = progressRatio(habit);
    const unit = habit.unit || '';
    const lower = Math.round(goal * 0.95);
    const upper = Math.round(goal * 1.05);

    const handleAdd = () => {
        const n = Number(input);
        if (!input || isNaN(n) || n === 0) return;
        onLog(n);
        setInput('');
    };

    return (
        <div className="flex flex-col gap-2">
            {/* Progress bar with target zone */}
            <div className="relative w-full h-2 rounded-full overflow-hidden" style={{ background: '#27272a' }}>
                {/* ±5% target zone indicator */}
                <div
                    className="absolute top-0 h-full opacity-30 rounded-full"
                    style={{
                        left: `${95}%`,
                        width: `${10}%`,
                        background: habit.color,
                    }}
                />
                <motion.div
                    className="h-full rounded-full"
                    style={{ background: habit.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(ratio * 100, 100)}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                />
            </div>

            {/* Current / goal display */}
            <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-1">
                    <AnimatePresence mode="popLayout">
                        <motion.span
                            key={value}
                            initial={{ y: -6, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 6, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="text-2xl font-extrabold"
                            style={{ color: fulfilled ? habit.color : 'var(--text)' }}
                        >
                            {value}
                        </motion.span>
                    </AnimatePresence>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {unit} / target {goal}{unit ? ' ' + unit : ''}
                    </span>
                </div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {lower}–{upper}
                </span>
            </div>

            {/* Log input */}
            <div className="flex gap-2">
                <input
                    type="number"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    placeholder={`Add ${unit || 'value'}…`}
                    className="flex-1"
                    style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}
                />
                <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={handleAdd}
                    disabled={!input || isNaN(Number(input))}
                    className="px-4 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
                    style={{ background: habit.color, color: '#000' }}
                >
                    Log
                </motion.button>
            </div>

            {fulfilled && (
                <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs font-medium text-center py-1 rounded-lg"
                    style={{ background: `${habit.color}18`, color: habit.color }}
                >
                    ✓ On target today!
                </motion.p>
            )}
        </div>
    );
}

// ─── Main HabitCard ───────────────────────────────────────────────────────────
export default function HabitCard({ habit, onCheckin, onDelete, onLogEntry, gridView }: HabitCardProps) {
    const [bursting, setBursting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleCheckin = async () => {
        setBursting(true);
        setTimeout(() => setBursting(false), 500);
        await onCheckin(habit.id);
    };

    const handleLog = async (value: number) => {
        setBursting(true);
        setTimeout(() => setBursting(false), 400);
        await onLogEntry(habit.id, value);
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

    // Type badge
    const typeBadge: Record<string, string> = { boolean: '✓', counter: '#', gauge: '◎' };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl p-5 flex flex-col gap-4"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div
                        className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: habit.color, boxShadow: `0 0 8px ${habit.color}66` }}
                    />
                    <h3 className="text-base font-semibold text-white truncate">{habit.name}</h3>
                    {/* Type badge */}
                    <span
                        className="text-xs px-1.5 py-0.5 rounded font-mono flex-shrink-0"
                        style={{ background: '#27272a', color: 'var(--text-muted)' }}
                    >
                        {typeBadge[habit.type]}
                    </span>
                </div>

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

            {/* Streak */}
            <StreakBadge streak={habit.streak} longestStreak={habit.longestStreak} />

            {/* Grid view toggle and display */}
            <div className="flex-1">
                <AnimatePresence mode="wait">
                    {gridView === 'calendar' ? (
                        <motion.div
                            key="calendar"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <CalendarGrid completions={habit.completions} color={habit.color} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="chain"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChainGrid completions={habit.completions} color={habit.color} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Per-type interaction */}
            {habit.type === 'boolean' && (
                <BooleanControl habit={habit} bursting={bursting} onCheckin={handleCheckin} />
            )}
            {habit.type === 'counter' && (
                <CounterControl habit={habit} onLog={handleLog} />
            )}
            {habit.type === 'gauge' && (
                <GaugeControl habit={habit} onLog={handleLog} />
            )}
        </motion.div>
    );
}

export { PRESET_COLORS };