'use client';
import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PRESET_COLORS } from './HabitCard';

interface AddHabitModalProps {
    onAdd: (name: string, color: string) => Promise<void>;
    onClose: () => void;
}

export default function AddHabitModal({ onAdd, onClose }: AddHabitModalProps) {
    const [name, setName] = useState('');
    const [color, setColor] = useState(PRESET_COLORS[0]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);
        setError('');
        try {
            await onAdd(name.trim(), color);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create habit');
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {/* Backdrop */}
            <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 flex items-center justify-center px-4"
                style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
                onClick={onClose}
            >
                {/* Modal */}
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
                                id="habit-name"
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="e.g. Morning run, Read 20 pages…"
                                autoFocus
                                required
                            />
                        </div>

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

                        {error && (
                            <p className="text-sm text-red-400">{error}</p>
                        )}

                        <div className="flex gap-3 pt-1">
                            <motion.button
                                type="submit"
                                whileTap={{ scale: 0.96 }}
                                disabled={loading || !name.trim()}
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
