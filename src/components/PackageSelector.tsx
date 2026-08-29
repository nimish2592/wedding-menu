import { ChevronDown, Package, IndianRupee, AlertTriangle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { GridName, ALL_GRID_NAMES, GRID_COLORS, MealType } from '../types';
import { GridDefinition } from '../types/gridMatrix';

interface PackageSelectorProps {
  date: string;
  meal: MealType;
  selected: GridName | null;
  gridMatrix: Record<string, GridDefinition>;
  onChange: (gridName: GridName) => void;
  isEditMode: boolean;
  violationCount: number;
}

export default function PackageSelector({
  date,
  meal,
  selected,
  gridMatrix,
  onChange,
  isEditMode,
  violationCount,
}: PackageSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const colors = selected ? GRID_COLORS[selected] : null;
  const gridDef = selected ? gridMatrix[selected] : null;
  const availableGrids = ALL_GRID_NAMES.filter((g) => gridMatrix[g]);

  return (
    <div className="px-4 mb-3" ref={ref}>
      <div className="bg-white rounded-2xl border border-amber-100 shadow-sm px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <Package className="w-3.5 h-3.5 text-amber-500" />
          Package
        </div>

        <div className="relative flex-1 min-w-[140px] max-w-[220px]">
          <button
            onClick={() => isEditMode && setOpen((v) => !v)}
            disabled={!isEditMode}
            className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium border transition-all duration-150 ${
              colors
                ? `${colors.bg} ${colors.text} ${colors.border}`
                : 'bg-gray-50 text-gray-500 border-gray-200'
            } ${isEditMode ? 'cursor-pointer hover:shadow-sm active:scale-95' : 'cursor-default opacity-80'}`}
          >
            <span className="flex-1 text-left font-semibold">
              {selected ?? 'No package set'}
            </span>
            {gridDef?.price && (
              <span className="flex items-center gap-0.5 text-xs opacity-70">
                <IndianRupee className="w-3 h-3" />
                {gridDef.price.toLocaleString('en-IN')}
              </span>
            )}
            {isEditMode && (
              <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
            )}
          </button>

          {open && isEditMode && (
            <div className="absolute z-30 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
              {availableGrids.map((grid) => {
                const def = gridMatrix[grid];
                const gc = GRID_COLORS[grid];
                const isActive = grid === selected;
                return (
                  <button
                    key={grid}
                    onClick={() => { onChange(grid); setOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors ${
                      isActive ? `${gc.bg} ${gc.text} font-semibold` : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold leading-tight">{grid}</div>
                      {def?.price && (
                        <div className="flex items-center gap-0.5 text-xs opacity-60 mt-0.5">
                          <IndianRupee className="w-2.5 h-2.5" />
                          {def.price.toLocaleString('en-IN')} / person
                        </div>
                      )}
                    </div>
                    {isActive && (
                      <span className={`text-[10px] border rounded-full px-1.5 py-0.5 font-medium ${gc.badge}`}>
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {violationCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 rounded-full px-3 py-1 text-xs font-semibold">
              <AlertTriangle className="w-3 h-3" />
              {violationCount} {violationCount === 1 ? 'issue' : 'issues'}
            </span>
          ) : selected ? (
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full px-3 py-1 text-xs font-semibold">
              Within limits
            </span>
          ) : null}

          {!isEditMode && (
            <span className="text-[10px] text-gray-400 font-medium">
              Unlock to change
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
