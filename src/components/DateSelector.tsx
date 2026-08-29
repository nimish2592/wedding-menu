import { CalendarDays } from 'lucide-react';
import { EventDay } from '../types';

interface DateSelectorProps {
  events: EventDay[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export default function DateSelector({ events, activeIndex, onSelect }: DateSelectorProps) {
  return (
    <div className="bg-white border-b border-amber-100 sticky top-0 z-20 shadow-sm">
      <div className="max-w-3xl mx-auto px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <CalendarDays className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Select Day</span>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {events.map((event, index) => (
            <button
              key={index}
              onClick={() => onSelect(index)}
              className={`flex-shrink-0 rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                activeIndex === index ? 'date-tab-active' : 'date-tab-inactive'
              }`}
            >
              <div className="font-semibold">{event.date}</div>
              <div className={`text-xs mt-0.5 ${activeIndex === index ? 'text-amber-100' : 'text-gray-400'}`}>
                {Object.keys(event.meals).length} meal{Object.keys(event.meals).length !== 1 ? 's' : ''}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
