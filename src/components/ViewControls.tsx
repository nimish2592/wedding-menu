import { Eye, BookOpen, GitCompare, ChevronDown, ChevronUp } from 'lucide-react';
import { ViewMode } from '../types';

interface ViewControlsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  isCompareMode: boolean;
  onCompareModeToggle: () => void;
  allExpanded: boolean;
  onToggleAll: () => void;
}

export default function ViewControls({
  viewMode,
  onViewModeChange,
  isCompareMode,
  onCompareModeToggle,
  allExpanded,
  onToggleAll,
}: ViewControlsProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-2 flex-wrap">
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        <button
          onClick={() => onViewModeChange('final')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
            viewMode === 'final'
              ? 'bg-white text-amber-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          Final View
        </button>
        <button
          onClick={() => onViewModeChange('full')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
            viewMode === 'full'
              ? 'bg-white text-amber-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Full Menu
        </button>
      </div>

      <button
        onClick={onCompareModeToggle}
        className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium border transition-all duration-200 ${
          isCompareMode
            ? 'bg-amber-600 text-white border-amber-600'
            : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
        }`}
      >
        <GitCompare className="w-3.5 h-3.5" />
        Compare Meals
      </button>

      <button
        onClick={onToggleAll}
        className="ml-auto flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all duration-200"
      >
        {allExpanded ? (
          <>
            <ChevronUp className="w-3.5 h-3.5" />
            Collapse All
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5" />
            Expand All
          </>
        )}
      </button>
    </div>
  );
}
