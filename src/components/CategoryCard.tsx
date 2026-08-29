import { ChevronDown, ChevronUp, Check, AlertTriangle, XCircle, Pencil, Lock } from 'lucide-react';
import { ViewMode, CategoryValidation } from '../types';
import CategoryEditor from './CategoryEditor';

interface CategoryCardProps {
  category: string;
  emoji: string;
  allItems: string[];
  selectedItems: string[];
  limit: number | undefined;
  validation: CategoryValidation;
  viewMode: ViewMode;
  searchQuery: string;
  isExpanded: boolean;
  onToggle: () => void;
  isEditMode?: boolean;
  isEditable?: boolean;
  onItemsChange?: (items: string[]) => void;
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-amber-200 text-amber-900 rounded px-0.5 not-italic">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

const VALIDATION_STYLES = {
  exceeded: {
    border: 'border-red-300',
    headerBg: 'bg-red-50/60 hover:bg-red-50',
    badge: 'bg-red-100 text-red-700 border-red-200',
    bar: 'bg-red-500',
    countText: 'text-red-600 font-bold',
  },
  warning: {
    border: 'border-amber-300',
    headerBg: 'bg-amber-50/60 hover:bg-amber-50',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    bar: 'bg-amber-400',
    countText: 'text-amber-700 font-semibold',
  },
  ok: {
    border: 'border-amber-100',
    headerBg: 'hover:bg-amber-50/50',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    bar: 'bg-emerald-500',
    countText: 'text-gray-500',
  },
  none: {
    border: 'border-amber-100',
    headerBg: 'hover:bg-amber-50/50',
    badge: '',
    bar: 'bg-amber-300',
    countText: 'text-gray-500',
  },
  fixed: {
    border: 'border-blue-200',
    headerBg: 'bg-blue-50/40 hover:bg-blue-50/70',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    bar: 'bg-blue-300',
    countText: 'text-blue-600',
  },
  blocked: {
    border: 'border-gray-200',
    headerBg: 'bg-gray-50/40 hover:bg-gray-50/70',
    badge: 'bg-gray-100 text-gray-500 border-gray-200',
    bar: 'bg-gray-200',
    countText: 'text-gray-400',
  },
};

export default function CategoryCard({
  category,
  emoji,
  allItems,
  selectedItems,
  limit,
  validation,
  viewMode,
  searchQuery,
  isExpanded,
  onToggle,
  isEditMode = false,
  isEditable = false,
  onItemsChange,
}: CategoryCardProps) {
  const displayItems =
    viewMode === 'final'
      ? selectedItems.filter((item) =>
          searchQuery ? item.toLowerCase().includes(searchQuery.toLowerCase()) : true
        )
      : allItems.filter((item) =>
          searchQuery ? item.toLowerCase().includes(searchQuery.toLowerCase()) : true
        );

  const { state, selected, limit: gridLimit, excess, fixedItems } = validation;
  const styles = VALIDATION_STYLES[state] ?? VALIDATION_STYLES.none;
  const effectiveLimit = gridLimit ?? limit;
  const progress = effectiveLimit ? Math.min((selected / effectiveLimit) * 100, 100) : 0;
  const overflowIndex = state === 'exceeded' && gridLimit !== null ? gridLimit : null;

  if (viewMode === 'final' && selectedItems.length === 0 && !searchQuery) {
    return (
      <div className={`category-card opacity-60 border ${styles.border}`}>
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{emoji}</span>
            <span className="font-serif text-base text-gray-700">{category}</span>
          </div>
          <span className="text-xs text-gray-400 bg-gray-50 rounded-full px-2 py-0.5">Not selected</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`category-card animate-fade-in border transition-colors duration-300 ${styles.border}`}>
      <button
        onClick={onToggle}
        className={`w-full text-left px-4 py-3.5 flex items-center justify-between transition-colors duration-150 ${styles.headerBg}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl flex-shrink-0">{emoji}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-serif text-base font-semibold text-gray-800 leading-tight">{category}</span>
              {isEditMode && isEditable && state !== 'blocked' && state !== 'fixed' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold border rounded-full px-1.5 py-0.5 leading-none bg-blue-50 text-blue-600 border-blue-200">
                  <Pencil className="w-2.5 h-2.5" />
                  Editable
                </span>
              )}
              {isEditMode && state === 'fixed' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium border rounded-full px-1.5 py-0.5 leading-none bg-blue-50 text-blue-600 border-blue-200">
                  <Lock className="w-2.5 h-2.5" />
                  Fixed
                </span>
              )}
              {isEditMode && state === 'blocked' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium border rounded-full px-1.5 py-0.5 leading-none bg-gray-100 text-gray-400 border-gray-200">
                  <Lock className="w-2.5 h-2.5" />
                  N/A
                </span>
              )}
              {isEditMode && !isEditable && state !== 'fixed' && state !== 'blocked' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium border rounded-full px-1.5 py-0.5 leading-none bg-gray-50 text-gray-400 border-gray-200">
                  Read-only
                </span>
              )}
              {state === 'exceeded' && (
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold border rounded-full px-1.5 py-0.5 leading-none ${styles.badge}`}>
                  <XCircle className="w-2.5 h-2.5" />
                  Exceeded by {excess}
                </span>
              )}
              {state === 'warning' && (
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold border rounded-full px-1.5 py-0.5 leading-none ${styles.badge}`}>
                  <AlertTriangle className="w-2.5 h-2.5" />
                  Limit reached
                </span>
              )}
            </div>
            <div className={`text-xs mt-0.5 ${styles.countText}`}>
              {selected} selected
              {gridLimit !== null ? (
                <>
                  <span className="text-gray-400 font-normal"> / {gridLimit} allowed</span>
                  {validation.gridName && (
                    <span className="text-gray-300 font-normal"> · {validation.gridName}</span>
                  )}
                </>
              ) : effectiveLimit ? (
                <span className="text-gray-400 font-normal"> / {effectiveLimit} allowed</span>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-1.5">
            {effectiveLimit && (
              <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${styles.bar}`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {effectiveLimit && (
        <div className="px-4 pb-1 sm:hidden">
          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${styles.bar}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}

      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-amber-50 overflow-visible">
          {isEditMode && isEditable && onItemsChange ? (
            <CategoryEditor
              category={category}
              allItems={allItems}
              selectedItems={selectedItems}
              validation={validation}
              onChange={onItemsChange}
            />
          ) : (
          <>
          {state === 'exceeded' && gridLimit !== null && (
            <div className="mt-2 mb-3 flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">
                <strong>{excess} item{excess > 1 ? 's' : ''} over the limit.</strong>{' '}
                Remove {excess === 1 ? 'it' : 'them'} to comply with {validation.gridName ?? 'the grid'}.
              </p>
            </div>
          )}
          {displayItems.length === 0 ? (
            <div className="text-center py-4 text-gray-400 text-sm">
              {searchQuery ? 'No matches in this category' : 'Menu not finalized yet'}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 mt-2">
              {displayItems.map((item) => {
                const isSelected = selectedItems.includes(item);
                const isOverflow =
                  viewMode === 'final' &&
                  overflowIndex !== null &&
                  selectedItems.indexOf(item) >= overflowIndex;

                if (viewMode === 'final') {
                  return isOverflow ? (
                    <span key={item} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-red-50 border border-red-200 text-red-600">
                      <XCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
                      <span>{highlightText(item, searchQuery)}</span>
                    </span>
                  ) : (
                    <span key={item} className="item-chip-selected">
                      <Check className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                      <span>{highlightText(item, searchQuery)}</span>
                    </span>
                  );
                }

                return (
                  <span
                    key={item}
                    className={isSelected ? 'item-chip-selected' : 'item-chip-unselected'}
                  >
                    {isSelected && <Check className="w-3 h-3 text-emerald-600 flex-shrink-0" />}
                    <span>{highlightText(item, searchQuery)}</span>
                  </span>
                );
              })}
            </div>
          )}
          </>
          )}
        </div>
      )}
    </div>
  );
}
