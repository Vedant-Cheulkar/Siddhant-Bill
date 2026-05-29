import { useState } from 'react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, isSameMonth, isToday, addMonths, subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@shared/utils/cn';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function MiniCalendar() {
  const [current, setCurrent] = useState(new Date());
  const days = eachDayOfInterval({ start: startOfMonth(current), end: endOfMonth(current) });
  const startPad = getDay(startOfMonth(current));

  return (
    <div className="select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold">{format(current, 'MMMM yyyy')}</span>
        <div className="flex gap-0.5">
          <button
            aria-label="Previous month"
            onClick={() => setCurrent((d) => subMonths(d, 1))}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-bg text-muted hover:text-fg transition-colors"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            aria-label="Next month"
            onClick={() => setCurrent((d) => addMonths(d, 1))}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-bg text-muted hover:text-fg transition-colors"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d, i) => (
          <div
            key={i}
            className={cn(
              'text-center text-2xs font-semibold py-1 uppercase tracking-wide',
              i === 0 || i === 6 ? 'text-rose-400' : 'text-muted'
            )}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}

        {days.map((day) => {
          const isWeekend = getDay(day) === 0 || getDay(day) === 6;
          const today = isToday(day);
          const sameMonth = isSameMonth(day, current);

          return (
            <div
              key={day.toISOString()}
              className={cn(
                'flex items-center justify-center text-xs py-1.5 rounded-lg cursor-default transition-colors',
                !sameMonth && 'opacity-25',
                isWeekend && !today ? 'text-rose-400' : '',
                !isWeekend && !today ? 'text-fg hover:bg-bg' : '',
                today && 'bg-accent text-white font-bold shadow-sm',
              )}
            >
              {format(day, 'd')}
            </div>
          );
        })}
      </div>
    </div>
  );
}
