'use client';
import { motion, AnimatePresence } from 'framer-motion';

interface StreakBadgeProps {
    streak: number;
    longestStreak: number;
}

function getMotivation(streak: number): string {
    if (streak === 0) return 'Start your chain today';
    if (streak === 1) return 'First link forged!';
    if (streak < 7) return 'Keep it going!';
    if (streak < 14) return "One week — don't stop now!";
    if (streak < 30) return 'You\'re on fire! 🔥';
    if (streak < 60) return 'One month strong. Legendary.';
    if (streak < 100) return 'Elite habit builder 💪';
    return 'Unstoppable. 🏆';
}

export default function StreakBadge({ streak, longestStreak }: StreakBadgeProps) {
    return (
        <div className="flex items-end gap-4">
            {/* Current streak */}
            <div className="flex flex-col items-center">
                <AnimatePresence mode="popLayout">
                    <motion.span
                        key={streak}
                        initial={{ scale: 0.5, opacity: 0, y: -10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        className="text-4xl font-extrabold leading-none"
                        style={{ color: 'var(--accent)' }}
                    >
                        {streak}
                    </motion.span>
                </AnimatePresence>
                <span className="text-xs text-zinc-500 mt-1 font-medium uppercase tracking-widest">
                    day streak
                </span>
            </div>

            {/* Divider */}
            <div className="h-8 w-px" style={{ background: 'var(--border)' }} />

            {/* Longest */}
            <div className="flex flex-col items-center">
                <span className="text-xl font-bold text-zinc-300 leading-none">{longestStreak}</span>
                <span className="text-xs text-zinc-500 mt-1 font-medium uppercase tracking-widest">best</span>
            </div>

            {/* Motivation */}
            <p className="text-xs text-zinc-400 italic ml-2 hidden sm:block">{getMotivation(streak)}</p>
        </div>
    );
}
