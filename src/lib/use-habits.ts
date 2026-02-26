'use client';
import { useState, useCallback } from 'react';
import { habitsApi, Habit } from '@/lib/api';

export function useHabits() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHabits = useCallback(async () => {
        try {
            setLoading(true);
            const { habits } = await habitsApi.list();
            setHabits(habits);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load habits');
        } finally {
            setLoading(false);
        }
    }, []);

    const addHabit = async (name: string, color: string) => {
        const { habit } = await habitsApi.create(name, color);
        setHabits(prev => [...prev, habit]);
    };

    const deleteHabit = async (id: string) => {
        await habitsApi.delete(id);
        setHabits(prev => prev.filter(h => h.id !== id));
    };

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
                    }
                    : h
            )
        );
        return result;
    };

    return { habits, loading, error, fetchHabits, addHabit, deleteHabit, toggleCheckin };
}
