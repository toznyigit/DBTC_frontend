'use client';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CalendarGridProps {
    completions: string[];
    color: string;
}

function formatDateStr(d: Date): string {
    return d.toISOString().slice(0, 10);
}

function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
    const dow = new Date(year, month, 1).getDay(); // 0 = Sunday
    return (dow + 6) % 7;
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

export default function CalendarGrid({ completions, color }: CalendarGridProps) {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());

    const completionSet = useMemo(() => new Set(completions), [completions]);
    const todayStr = formatDateStr(today);

    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDow = getFirstDayOfWeek(viewYear, viewMonth);

    // Count completions this month for the summary pill
    const completionsThisMonth = useMemo(() => {
        let count = 0;
        for (let d = 1; d <= daysInMonth; d++) {
            const ds = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            if (completionSet.has(ds)) count++;
        }
        return count;
    }, [completionSet, viewYear, viewMonth, daysInMonth]);

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };

    const nextMonth = () => {
        const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();
        if (isCurrentMonth) return; // don't allow future months
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

    // Build grid cells: leading empty cells + day cells
    const cells: (number | null)[] = [
        ...Array(firstDow).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    // Pad to complete last row
    while (cells.length % 7 !== 0) cells.push(null);

    return (
        <div className="flex flex-col gap-2">
            {/* Month navigation header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={`${viewYear}-${viewMonth}`}
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            transition={{ duration: 0.15 }}
                            className="text-xs font-semibold text-zinc-300"
                        >
                            {MONTH_NAMES[viewMonth]} {viewYear}
                        </motion.span>
                    </AnimatePresence>

                    {/* Completions pill */}
                    {completionsThisMonth > 0 && (
                        <motion.span
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                            style={{
                                background: `${color}22`,
                                color: color,
                                border: `1px solid ${color}44`,
                                fontSize: '10px',
                            }}
                        >
                            {completionsThisMonth}/{daysInMonth}
                        </motion.span>
                    )}
                </div>

                <div className="flex gap-1">
                    <button
                        onClick={prevMonth}
                        className="w-6 h-6 flex items-center justify-center rounded-md transition-colors text-zinc-500 hover:text-zinc-200"
                        style={{ background: 'transparent' }}
                        aria-label="Previous month"
                    >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M7.5 9L4.5 6L7.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <button
                        onClick={nextMonth}
                        disabled={isCurrentMonth}
                        className="w-6 h-6 flex items-center justify-center rounded-md transition-colors"
                        style={{
                            background: 'transparent',
                            color: isCurrentMonth ? 'var(--border)' : 'var(--text-muted)',
                            cursor: isCurrentMonth ? 'default' : 'pointer',
                        }}
                        aria-label="Next month"
                    >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M4.5 9L7.5 6L4.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Weekday labels */}
            <div className="grid grid-cols-7 gap-0.5">
                {WEEKDAYS.map(d => (
                    <div
                        key={d}
                        className="text-center font-medium"
                        style={{ fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}
                    >
                        {d}
                    </div>
                ))}
            </div>

            {/* Calendar days */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={`${viewYear}-${viewMonth}`}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 6 }}
                    transition={{ duration: 0.18 }}
                    className="grid grid-cols-7 gap-0.5"
                >
                    {cells.map((day, idx) => {
                        if (day === null) {
                            return <div key={`empty-${idx}`} />;
                        }

                        const ds = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const done = completionSet.has(ds);
                        const isToday = ds === todayStr;
                        const isFuture = ds > todayStr;

                        return (
                            <motion.div
                                key={ds}
                                title={ds}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: idx * 0.004, duration: 0.12 }}
                                className="aspect-square flex items-center justify-center rounded-md relative"
                                style={{
                                    fontSize: '10px',
                                    fontWeight: isToday ? 700 : 500,
                                    cursor: 'default',
                                    ...(done
                                        ? {
                                            background: color,
                                            color: '#000',
                                            boxShadow: `0 0 8px ${color}55`,
                                        }
                                        : isToday
                                            ? {
                                                background: 'transparent',
                                                color: color,
                                                border: `1.5px solid ${color}`,
                                            }
                                            : isFuture
                                                ? {
                                                    background: 'transparent',
                                                    color: '#3f3f46',
                                                }
                                                : {
                                                    background: '#1c1c1f',
                                                    color: '#52525b',
                                                }),
                                }}
                            >
                                {day}
                                {/* Streak connector dot — shown at bottom of completed day */}
                                {done && (
                                    <span
                                        className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-0.5 h-0.5 rounded-full"
                                        style={{ background: '#00000066' }}
                                    />
                                )}
                            </motion.div>
                        );
                    })}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}