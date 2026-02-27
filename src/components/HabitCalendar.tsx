'use client';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Habit } from '@/lib/api';

interface HabitCalendarProps {
    habits: Habit[];
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

function formatDateStr(year: number, month: number, day: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
    // getDay() returns 0=Sun..6=Sat; shift so Mon=0, Tue=1, ..., Sun=6
    const dow = new Date(year, month, 1).getDay();
    return (dow + 6) % 7;
}

export default function HabitCalendar({ habits }: HabitCalendarProps) {
    const today = new Date();
    const todayStr = formatDateStr(today.getFullYear(), today.getMonth(), today.getDate());

    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [direction, setDirection] = useState<1 | -1>(1);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

    const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

    const prevMonth = () => {
        setDirection(-1);
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
        setSelectedDay(null);
    };

    const nextMonth = () => {
        if (isCurrentMonth) return;
        setDirection(1);
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
        setSelectedDay(null);
    };

    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDow = getFirstDayOfWeek(viewYear, viewMonth);

    const dayHabitMap = useMemo(() => {
        const map = new Map<string, Habit[]>();
        for (const habit of habits) {
            for (const ds of habit.completions) {
                if (!map.has(ds)) map.set(ds, []);
                map.get(ds)!.push(habit);
            }
        }
        return map;
    }, [habits]);

    const cells: (number | null)[] = [
        ...Array(firstDow).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    const totalCompletions = useMemo(() => {
        let count = 0;
        for (let d = 1; d <= daysInMonth; d++) {
            count += dayHabitMap.get(formatDateStr(viewYear, viewMonth, d))?.length ?? 0;
        }
        return count;
    }, [dayHabitMap, viewYear, viewMonth, daysInMonth]);

    const perfectDays = useMemo(() => {
        if (habits.length === 0) return 0;
        let count = 0;
        for (let d = 1; d <= daysInMonth; d++) {
            const ds = formatDateStr(viewYear, viewMonth, d);
            if (ds > todayStr) continue;
            if ((dayHabitMap.get(ds)?.length ?? 0) === habits.length) count++;
        }
        return count;
    }, [dayHabitMap, viewYear, viewMonth, daysInMonth, habits.length, todayStr]);

    const selectedHabitsAll = selectedDay
        ? habits.map(h => ({ habit: h, done: h.completions.includes(selectedDay) }))
        : [];
    const selectedDoneCount = selectedHabitsAll.filter(x => x.done).length;

    return (
        <div
            className="rounded-2xl overflow-hidden w-full"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
            {/* Header */}
            <div
                className="px-6 py-4 flex items-center justify-between"
                style={{ borderBottom: '1px solid var(--border)' }}
            >
                <div>
                    <AnimatePresence mode="wait">
                        <motion.h2
                            key={`${viewYear}-${viewMonth}`}
                            initial={{ opacity: 0, y: direction * -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: direction * 6 }}
                            transition={{ duration: 0.15 }}
                            className="text-lg font-bold text-white"
                        >
                            {MONTH_NAMES[viewMonth]} {viewYear}
                        </motion.h2>
                    </AnimatePresence>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {totalCompletions} check-ins · {perfectDays} perfect day{perfectDays !== 1 ? 's' : ''}
                    </p>
                </div>

                <div className="flex items-center gap-1">
                    <motion.button
                        whileTap={{ scale: 0.88 }}
                        onClick={prevMonth}
                        className="w-8 h-8 flex items-center justify-center rounded-xl"
                        style={{ background: 'var(--card-hover)', color: 'var(--text-muted)' }}
                        aria-label="Previous month"
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.88 }}
                        onClick={nextMonth}
                        disabled={isCurrentMonth}
                        className="w-8 h-8 flex items-center justify-center rounded-xl"
                        style={{
                            background: isCurrentMonth ? 'transparent' : 'var(--card-hover)',
                            color: isCurrentMonth ? 'var(--border)' : 'var(--text-muted)',
                            cursor: isCurrentMonth ? 'default' : 'pointer',
                        }}
                        aria-label="Next month"
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M5 11L9 7L5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </motion.button>
                </div>
            </div>

            <div className="p-4 flex flex-col gap-3">
                {/* Weekday labels */}
                <div className="grid grid-cols-7">
                    {WEEKDAYS.map(d => (
                        <div
                            key={d}
                            className="text-center font-semibold uppercase tracking-widest"
                            style={{ fontSize: '10px', color: 'var(--text-muted)' }}
                        >
                            {d}
                        </div>
                    ))}
                </div>

                {/* Days grid */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${viewYear}-${viewMonth}`}
                        initial={{ opacity: 0, x: direction * 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: direction * -24 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="grid grid-cols-7 gap-1.5"
                    >
                        {cells.map((day, idx) => {
                            if (day === null) {
                                return <div key={`empty-${idx}`} className="aspect-square" />;
                            }

                            const ds = formatDateStr(viewYear, viewMonth, day);
                            const completedHabits = dayHabitMap.get(ds) ?? [];
                            const isFuture = ds > todayStr;
                            const isToday = ds === todayStr;
                            const isSelected = ds === selectedDay;
                            const isPerfect = habits.length > 0 && completedHabits.length === habits.length && !isFuture;

                            return (
                                <motion.button
                                    key={ds}
                                    onClick={() => !isFuture && setSelectedDay(isSelected ? null : ds)}
                                    whileHover={!isFuture ? { scale: 1.06 } : {}}
                                    whileTap={!isFuture ? { scale: 0.94 } : {}}
                                    className="aspect-square flex flex-col items-center justify-start rounded-xl pt-1.5 pb-1 gap-1 relative"
                                    style={{
                                        cursor: isFuture ? 'default' : 'pointer',
                                        background: isSelected
                                            ? '#2d2d30'
                                            : isToday
                                                ? '#1e1e21'
                                                : 'transparent',
                                        border: isToday
                                            ? `1.5px solid ${isSelected ? '#52525b' : '#3f3f46'}`
                                            : isSelected
                                                ? '1.5px solid #52525b'
                                                : isPerfect
                                                    ? '1px solid #f59e0b44'
                                                    : '1px solid transparent',
                                        boxShadow: isPerfect && !isSelected ? '0 0 0 1px #f59e0b22 inset' : 'none',
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: '11px',
                                            fontWeight: isToday ? 800 : 500,
                                            lineHeight: 1,
                                            color: isFuture
                                                ? '#3f3f46'
                                                : isToday
                                                    ? '#f59e0b'
                                                    : completedHabits.length > 0
                                                        ? '#e4e4e7'
                                                        : '#52525b',
                                        }}
                                    >
                                        {day}
                                    </span>

                                    {!isFuture && completedHabits.length > 0 && (
                                        <div className="flex flex-wrap justify-center gap-px w-full px-1">
                                            {completedHabits.slice(0, 5).map(h => (
                                                <span
                                                    key={h.id}
                                                    className="rounded-full flex-shrink-0"
                                                    style={{
                                                        width: 4,
                                                        height: 4,
                                                        backgroundColor: h.color,
                                                        boxShadow: `0 0 4px ${h.color}77`,
                                                    }}
                                                />
                                            ))}
                                            {completedHabits.length > 5 && (
                                                <span style={{ fontSize: '7px', color: 'var(--text-muted)', lineHeight: '4px' }}>
                                                    +{completedHabits.length - 5}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </motion.button>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>

                {/* Legend */}
                {habits.length > 0 && (
                    <div
                        className="flex flex-wrap gap-x-4 gap-y-1.5 pt-3"
                        style={{ borderTop: '1px solid var(--border)' }}
                    >
                        {habits.map(h => (
                            <div key={h.id} className="flex items-center gap-1.5">
                                <span
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: h.color, boxShadow: `0 0 5px ${h.color}55` }}
                                />
                                <span className="text-xs truncate max-w-[120px]" style={{ color: 'var(--text-muted)' }}>
                                    {h.name}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Day detail panel */}
            <AnimatePresence>
                {selectedDay && (
                    <motion.div
                        key="detail"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        style={{ borderTop: '1px solid var(--border)', overflow: 'hidden' }}
                    >
                        <div className="px-6 py-4">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-semibold text-white">
                                    {new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                                <span
                                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                                    style={{
                                        background: selectedDoneCount === habits.length && habits.length > 0
                                            ? '#f59e0b22'
                                            : '#27272a',
                                        color: selectedDoneCount === habits.length && habits.length > 0
                                            ? '#f59e0b'
                                            : 'var(--text-muted)',
                                    }}
                                >
                                    {selectedDoneCount}/{habits.length} done
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                {selectedHabitsAll.map(({ habit, done }) => (
                                    <div
                                        key={habit.id}
                                        className="flex items-center gap-2.5 py-1.5 px-3 rounded-lg"
                                        style={{
                                            background: done ? `${habit.color}14` : '#18181b',
                                            border: `1px solid ${done ? `${habit.color}33` : 'transparent'}`,
                                        }}
                                    >
                                        <span
                                            className="w-2 h-2 rounded-full flex-shrink-0"
                                            style={{
                                                backgroundColor: done ? habit.color : '#3f3f46',
                                                boxShadow: done ? `0 0 6px ${habit.color}66` : 'none',
                                            }}
                                        />
                                        <span className="text-sm flex-1 truncate" style={{ color: done ? '#e4e4e7' : '#52525b' }}>
                                            {habit.name}
                                        </span>
                                        {done && (
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                <path d="M2.5 6L5 8.5L9.5 3.5" stroke={habit.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}