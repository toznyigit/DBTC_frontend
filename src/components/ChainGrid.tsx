'use client';
import { useMemo } from 'react';

interface ChainGridProps {
    completions: string[];
    color: string;
}

function formatDateStr(d: Date): string {
    return d.toISOString().slice(0, 10);
}

export default function ChainGrid({ completions, color }: ChainGridProps) {
    const completionSet = useMemo(() => new Set(completions), [completions]);

    // Build last 91 days (13 weeks) from today
    const days = useMemo(() => {
        const result: Date[] = [];
        const today = new Date();
        for (let i = 90; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            result.push(d);
        }
        return result;
    }, []);

    // Group by week columns (7 rows, N columns)
    const weeks = useMemo(() => {
        const cols: Date[][] = [];
        for (let i = 0; i < days.length; i += 7) {
            cols.push(days.slice(i, i + 7));
        }
        return cols;
    }, [days]);

    const today = formatDateStr(new Date());

    return (
        <div className="overflow-x-auto pb-1">
            <div className="flex gap-1" style={{ minWidth: 'fit-content' }}>
                {weeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-1">
                        {week.map(day => {
                            const dateStr = formatDateStr(day);
                            const done = completionSet.has(dateStr);
                            const isToday = dateStr === today;
                            return (
                                <div
                                    key={dateStr}
                                    title={dateStr}
                                    className="w-3 h-3 rounded-sm transition-all duration-300"
                                    style={
                                        done
                                            ? {
                                                backgroundColor: color,
                                                boxShadow: `0 0 6px ${color}66`,
                                            }
                                            : isToday
                                                ? {
                                                    backgroundColor: 'transparent',
                                                    border: `1px solid ${color}`,
                                                    opacity: 0.6,
                                                }
                                                : {
                                                    backgroundColor: '#27272a',
                                                }
                                    }
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
