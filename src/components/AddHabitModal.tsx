'use client';
import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PRESET_COLORS } from './HabitCard';
import { HabitType, CounterDirection, CreateHabitPayload } from '@/lib/api';

interface AddHabitModalProps {
    onAdd: (payload: CreateHabitPayload) => Promise<void>;
    onClose: () => void;
}

const TYPE_OPTIONS: { value: HabitType; label: string; description: string; emoji: string }[] = [
    { value: 'boolean', label: 'Simple', description: 'Mark as done or not done', emoji: '✓' },
    { value: 'counter', label: 'Counter', description: 'Increment a count toward a goal', emoji: '#' },
    { value: 'gauge',   label: 'Gauge',   description: 'Log a value to hit a target', emoji: '◎' },
];

export default function AddHabitModal({ onAdd, onClose }: AddHabitModalProps) {
    const [name, setName] = useState('');
    const [color, setColor] = useState(PRESET_COLORS[0]);
    const [type, setType] = useState<HabitType>('boolean');
    const [goal, setGoal] = useState('');
    const [direction, setDirection] = useState<CounterDirection>('gte');
    const [unit, setUnit] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const needsGoal = type !== 'boolean';

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        const goalValue = needsGoal ? Number(goal) : null;
        if (needsGoal && (goal === '' || isNaN(goalValue!))) {
            setError('Please enter a valid goal number');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await onAdd({
                name: name.trim(),
                color,
                type,
                goal: goalValue,
                direction: type === 'counter' ? direction : null,
                unit: unit.trim() || null,
            });
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create habit');
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 flex items-center justify-center px-4"
                style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
                onClick={onClose}
            >
                <motion.div
                    key="modal"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    onClick={e => e.stopPropagation()}
                    className="w-full max-w-sm rounded-2xl p-6"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                >
                    <h2 className="text-lg font-semibold text-white mb-5">Add a new habit</h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name */}
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1.5 font-medium uppercase tracking-wider">
                                Habit name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="e.g. Morning run, Read 20 pages…"
                                autoFocus
                                maxLength={100}
                                required
                            />
                        </div>

                        {/* Type selector */}
                        <div>
                            <label className="block text-xs text-zinc-400 mb-2 font-medium uppercase tracking-wider">
                                Habit type
                            </label>
                            <div className="flex flex-col gap-2">
                                {TYPE_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setType(opt.value)}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                                        style={{
                                            background: type === opt.value ? `${color}18` : '#18181b',
                                            border: `1px solid ${type === opt.value ? `${color}55` : 'var(--border)'}`,
                                        }}
                                    >
                                        <span
                                            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                                            style={{
                                                background: type === opt.value ? color : '#27272a',
                                                color: type === opt.value ? '#000' : 'var(--text-muted)',
                                            }}
                                        >
                                            {opt.emoji}
                                        </span>
                                        <div>
                                            <p className="text-sm font-medium text-white leading-none mb-0.5">{opt.label}</p>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{opt.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Goal config (counter + gauge) */}
                        <AnimatePresence>
                            {needsGoal && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.18 }}
                                    className="overflow-hidden"
                                >
                                    <div className="flex flex-col gap-3">
                                        {/* Direction toggle (counter only) */}
                                        {type === 'counter' && (
                                            <div>
                                                <label className="block text-xs text-zinc-400 mb-1.5 font-medium uppercase tracking-wider">
                                                    Direction
                                                </label>
                                                <div className="flex gap-2">
                                                    {([
                                                        { value: 'gte', label: '≥ Goal', hint: 'Reach or exceed' },
                                                        { value: 'lte', label: '≤ Goal', hint: 'Stay at or below' },
                                                    ] as { value: CounterDirection; label: string; hint: string }[]).map(d => (
                                                        <button
                                                            key={d.value}
                                                            type="button"
                                                            onClick={() => setDirection(d.value)}
                                                            className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                                                            style={{
                                                                background: direction === d.value ? `${color}22` : '#18181b',
                                                                color: direction === d.value ? color : 'var(--text-muted)',
                                                                border: `1px solid ${direction === d.value ? `${color}55` : 'var(--border)'}`,
                                                            }}
                                                        >
                                                            <span className="block text-sm font-bold">{d.label}</span>
                                                            <span className="block mt-0.5 opacity-70">{d.hint}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex gap-3">
                                            {/* Goal value */}
                                            <div className="flex-1">
                                                <label className="block text-xs text-zinc-400 mb-1.5 font-medium uppercase tracking-wider">
                                                    {type === 'gauge' ? 'Target' : 'Goal'}
                                                </label>
                                                <input
                                                    type="number"
                                                    value={goal}
                                                    onChange={e => setGoal(e.target.value)}
                                                    placeholder={type === 'gauge' ? '1800' : type === 'counter' && direction === 'lte' ? '0' : '8'}
                                                    min={0}
                                                    required={needsGoal}
                                                />
                                            </div>

                                            {/* Unit */}
                                            <div className="flex-1">
                                                <label className="block text-xs text-zinc-400 mb-1.5 font-medium uppercase tracking-wider">
                                                    Unit <span className="normal-case opacity-50">(optional)</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={unit}
                                                    onChange={e => setUnit(e.target.value)}
                                                    placeholder={type === 'gauge' ? 'kcal' : 'glasses'}
                                                    maxLength={20}
                                                />
                                            </div>
                                        </div>

                                        {/* Fulfilment hint */}
                                        <p className="text-xs rounded-lg px-3 py-2" style={{ background: '#18181b', color: 'var(--text-muted)' }}>
                                            {type === 'counter' && direction === 'gte' &&
                                                `✓ Fulfilled when count reaches ${goal || '?'} ${unit || ''}`}
                                            {type === 'counter' && direction === 'lte' &&
                                                `✓ Fulfilled when count stays at or below ${goal || '?'} ${unit || ''}`}
                                            {type === 'gauge' &&
                                                `✓ Fulfilled within ±5% of ${goal || '?'} ${unit || ''} (${goal ? Math.round(Number(goal) * 0.95) : '?'} – ${goal ? Math.round(Number(goal) * 1.05) : '?'})`}
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Color picker */}
                        <div>
                            <label className="block text-xs text-zinc-400 mb-2 font-medium uppercase tracking-wider">
                                Chain color
                            </label>
                            <div className="flex gap-2 flex-wrap">
                                {PRESET_COLORS.map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setColor(c)}
                                        className="w-7 h-7 rounded-full transition-all"
                                        style={{
                                            backgroundColor: c,
                                            outline: color === c ? `2px solid ${c}` : '2px solid transparent',
                                            outlineOffset: '2px',
                                            boxShadow: color === c ? `0 0 10px ${c}88` : 'none',
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-400">{error}</p>}

                        <div className="flex gap-3 pt-1">
                            <motion.button
                                type="submit"
                                whileTap={{ scale: 0.96 }}
                                disabled={loading || !name.trim() || (needsGoal && goal === '')}
                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-black disabled:opacity-50 transition-all"
                                style={{ background: color }}
                            >
                                {loading ? 'Creating…' : 'Start the chain'}
                            </motion.button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                                style={{
                                    background: 'transparent',
                                    color: 'var(--text-muted)',
                                    border: '1px solid var(--border)',
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}