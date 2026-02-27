'use client';
import { useState, useCallback } from 'react';
import { habitsApi, Habit, CreateHabitPayload } from '@/lib/api';

export function useHabits() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHabits = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const { habits } = await habitsApi.list();
            setHabits(habits);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load habits');
        } finally {
            setLoading(false);
        }
    }, []);

    const addHabit = async (payload: CreateHabitPayload) => {
        const { habit } = await habitsApi.create(payload);
        setHabits(prev => [...prev, habit]);
    };

    const deleteHabit = async (id: string) => {
        await habitsApi.delete(id);
        setHabits(prev => prev.filter(h => h.id !== id));
    };

    // Boolean habits: toggle done/undone
    const toggleCheckin = async (id: string) => {
        const result = await habitsApi.checkin(id);
        setHabits(prev =>
            prev.map(h =>
                h.id === id
                    ? {
                        ...h,
                        streak: result.streak,
                        longestStreak: result.longestStreak,
                        completions: result.completions,
                        todayValue: result.todayValue,
                    }
                    : h
            )
        );
        return result;
    };

    // Counter/gauge habits: log a value (additive — backend accumulates)
    const logEntry = async (id: string, value: number) => {
        const result = await habitsApi.logEntry(id, value);
        setHabits(prev =>
            prev.map(h =>
                h.id === id
                    ? {
                        ...h,
                        streak: result.streak,
                        longestStreak: result.longestStreak,
                        completions: result.completions,
                        todayValue: result.todayValue,
                    }
                    : h
            )
        );
        return result;
    };

    return { habits, loading, error, fetchHabits, addHabit, deleteHabit, toggleCheckin, logEntry };
}