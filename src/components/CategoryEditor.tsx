import { useState, useMemo, useRef, useEffect } from 'react';
import { Check, X, Search, Plus, ChevronDown, AlertTriangle, XCircle, ShieldCheck, Lock, Layers } from 'lucide-react';
import { CategoryValidation } from '../types';

interface CategoryEditorProps {
  category: string;
  allItems: string[];
  selectedItems: string[];
  validation: CategoryValidation;
  onChange: (items: string[]) => void;
}

export default function CategoryEditor({
  category,
  allItems,
  selectedItems,
  validation,
  onChange,
}: CategoryEditorProps) {
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { state, limit, excess, gridName, fixedItems, breakdown, includesPaneer, isBlocked } = validation;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase();
    return allItems.filter(
      (item) => !selectedItems.includes(item) && item.toLowerCase().includes(q)
    );
  }, [allItems, selectedItems, search]);

  if (isBlocked || state === 'blocked') {
    return (
      <div className="pt-2 pb-3">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border bg-gray-50 border-gray-200 text-sm text-gray-500">
          <Lock className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Not available in {gridName ?? 'this grid'} — limit is 0</span>
        </div>
      </div>
    );
  }

  if (state === 'fixed' && fixedItems) {
    return (
      <div className="pt-2 pb-3">
        <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-xl border bg-blue-50 border-blue-200 text-xs text-blue-700">
          <Lock className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="font-medium">Fixed items — cannot be changed</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {fixedItems.map((item) => (
            <span key={item} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border bg-blue-50 border-blue-200 text-blue-700">
              <Lock className="w-3 h-3 flex-shrink-0" />
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  }

  const addItem = (item: string) => {
    onChange([...selectedItems, item]);
    setSearch('');
  };

  const removeItem = (item: string) => {
    onChange(selectedItems.filter((i) => i !== item));
  };

  const limitColor =
    state === 'exceeded'
      ? 'text-red-600'
      : state === 'warning'
      ? 'text-amber-600'
      : 'text-emerald-600';

  const limitBg =
    state === 'exceeded'
      ? 'bg-red-50 border-red-200'
      : state === 'warning'
      ? 'bg-amber-50 border-amber-200'
      : 'bg-emerald-50 border-emerald-200';

  return (
    <div className="pt-2 pb-3">
      {limit !== null && (
        <div className={`flex items-center flex-wrap gap-x-2 gap-y-1 mb-3 px-3 py-2 rounded-xl border text-xs ${limitBg}`}>
          {state === 'exceeded' ? (
            <XCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
          ) : state === 'warning' ? (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          ) : (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          )}
          <span className={`font-semibold ${limitColor}`}>
            {selectedItems.length} / {limit} selected
          </span>
          {state === 'exceeded' && (
            <span className="text-red-600"> — Exceeded by {excess}</span>
          )}
          {state === 'warning' && (
            <span className="text-amber-600"> — Limit reached</span>
          )}
          {state === 'ok' && selectedItems.length > 0 && limit !== null && (
            <span className="text-emerald-600"> — {limit - selectedItems.length} remaining</span>
          )}
          {gridName && (
            <span className="ml-auto text-gray-400 font-normal">{gridName}</span>
          )}
          {breakdown && (
            <div className="w-full flex flex-wrap gap-1.5 mt-1">
              {Object.entries(breakdown).map(([k, n]) => (
                <span key={k} className="inline-flex items-center gap-1 text-[10px] bg-white border border-gray-200 text-gray-500 rounded-full px-2 py-0.5">
                  <Layers className="w-2.5 h-2.5" />
                  {n} {k}
                </span>
              ))}
            </div>
          )}
          {includesPaneer !== undefined && includesPaneer > 0 && (
            <div className="w-full mt-0.5">
              <span className="text-[10px] text-gray-500">Includes {includesPaneer} Paneer dish</span>
            </div>
          )}
        </div>
      )}

      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {selectedItems.map((item, idx) => {
            const isOverflow = limit !== null && idx >= limit;
            return (
              <span
                key={item}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border transition-colors ${
                  isOverflow
                    ? 'bg-red-50 border-red-200 text-red-600'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}
              >
                {isOverflow ? (
                  <XCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
                ) : (
                  <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                )}
                <span>{item}</span>
                <button
                  onClick={() => removeItem(item)}
                  className={`ml-0.5 rounded-full p-0.5 transition-colors ${
                    isOverflow
                      ? 'hover:bg-red-100 text-red-400 hover:text-red-600'
                      : 'hover:bg-emerald-100 text-emerald-400 hover:text-emerald-600'
                  }`}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            dropdownOpen
              ? 'bg-amber-100 border-amber-400 text-amber-900'
              : 'bg-white border border-amber-200 text-gray-600 hover:border-amber-400 hover:bg-amber-50/50'
          }`}
        >
          <Plus className={`w-4 h-4 flex-shrink-0 transition-colors ${dropdownOpen ? 'text-amber-700' : 'text-amber-500'}`} />
          <span className="flex-1 text-left">Add {category} items...</span>
          <ChevronDown className={`w-4 h-4 transition-all duration-200 ${dropdownOpen ? 'rotate-180 text-amber-700' : 'text-gray-400'}`} />
        </button>

        {dropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-amber-200 rounded-2xl shadow-lg z-50 overflow-hidden min-w-max">
            <div className="p-3 border-b border-amber-100 bg-amber-50/50">
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-amber-200 rounded-lg">
                <Search className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search ${category.toLowerCase()}...`}
                  className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-500 font-medium"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="p-1 hover:bg-amber-100 rounded transition-colors">
                    <X className="w-4 h-4 text-amber-500" />
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto">
              {filteredItems.length === 0 ? (
                <div className="px-4 py-6 text-sm text-gray-400 text-center font-medium">
                  {search ? 'No matches found' : 'All items already selected'}
                </div>
              ) : (
                filteredItems.map((item) => (
                  <button
                    key={item}
                    onClick={() => addItem(item)}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-amber-100 flex items-center gap-3 transition-colors border-b border-amber-50 last:border-b-0 hover:text-gray-900 font-medium"
                  >
                    <Plus className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    {item}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
