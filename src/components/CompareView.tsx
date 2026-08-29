import { useState, useMemo } from 'react';
import { Check, Minus, ArrowLeftRight, SlidersHorizontal, ChevronDown, XCircle, AlertTriangle } from 'lucide-react';
import { EventDay, MealType, MEAL_ICONS, MEAL_TYPES, CATEGORY_EMOJIS, validateCategoryWithGrid, GridName, GRID_COLORS } from '../types';
import { GridDefinition } from '../types/gridMatrix';
import { SelectedPackages } from '../hooks/usePackageSelections';

interface CompareViewProps {
  events: EventDay[];
  catalog: Record<string, string[]>;
  initialLeftEventIndex: number;
  initialLeftMeal: MealType;
  selectedPackages: SelectedPackages;
  gridMatrix: Record<string, GridDefinition>;
}

interface SideSelector {
  eventIndex: number;
  meal: MealType;
}

function MealDropdown({
  events,
  value,
  onChange,
  tint,
}: {
  events: EventDay[];
  value: SideSelector;
  onChange: (v: SideSelector) => void;
  tint: 'amber' | 'teal';
}) {
  const [open, setOpen] = useState(false);
  const selectedEvent = events[value.eventIndex];

  const amber = tint === 'amber';
  const bg = amber ? 'bg-amber-50 border-amber-200' : 'bg-teal-50 border-teal-200';
  const textColor = amber ? 'text-amber-800' : 'text-teal-800';
  const activeBg = amber ? 'bg-amber-100' : 'bg-teal-100';
  const ring = amber ? 'focus:ring-amber-300' : 'focus:ring-teal-300';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 border rounded-xl px-3 py-2 text-sm font-medium transition-all ${bg} ${textColor} hover:opacity-90 focus:outline-none focus:ring-2 ${ring} min-w-[160px]`}
      >
        <span className="text-base leading-none">{MEAL_ICONS[value.meal]}</span>
        <span className="flex-1 text-left">
          <span className="block text-xs font-normal opacity-70 leading-none mb-0.5">{selectedEvent?.date}</span>
          <span className="leading-none">{value.meal}</span>
        </span>
        <ChevronDown className={`w-4 h-4 opacity-60 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 top-full mt-1 left-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden min-w-[210px]">
            {events.map((event, ei) =>
              MEAL_TYPES.map((meal) => {
                const hasMeal = meal in event.meals;
                const isActive = ei === value.eventIndex && meal === value.meal;
                return (
                  <button
                    key={`${ei}-${meal}`}
                    onClick={() => { onChange({ eventIndex: ei, meal }); setOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-left ${
                      isActive ? activeBg + ' ' + textColor + ' font-semibold' : 'hover:bg-gray-50 text-gray-700'
                    } ${!hasMeal ? 'opacity-40' : ''}`}
                  >
                    <span>{MEAL_ICONS[meal]}</span>
                    <span className="flex-1">{event.date} · {meal}</span>
                    {!hasMeal && <span className="text-xs text-gray-400 italic">empty</span>}
                    {isActive && <Check className="w-3.5 h-3.5 opacity-70" />}
                  </button>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function CompareView({
  events,
  catalog,
  initialLeftEventIndex,
  initialLeftMeal,
  selectedPackages,
  gridMatrix,
}: CompareViewProps) {
  const getDefaultRight = (): SideSelector => {
    const event = events[initialLeftEventIndex];
    const meals = MEAL_TYPES.filter((m) => m in (event?.meals ?? {}));
    const idx = meals.indexOf(initialLeftMeal);
    const nextMeal = meals[idx + 1] ?? meals[idx - 1];
    if (nextMeal && nextMeal !== initialLeftMeal) {
      return { eventIndex: initialLeftEventIndex, meal: nextMeal };
    }
    const otherEventIdx = initialLeftEventIndex === 0 ? 1 : 0;
    if (events[otherEventIdx]) {
      const otherMeals = MEAL_TYPES.filter((m) => m in (events[otherEventIdx]?.meals ?? {}));
      if (otherMeals.length > 0) {
        return { eventIndex: otherEventIdx, meal: otherMeals[0] };
      }
    }
    return { eventIndex: initialLeftEventIndex, meal: initialLeftMeal };
  };

  const [left, setLeft] = useState<SideSelector>({ eventIndex: initialLeftEventIndex, meal: initialLeftMeal });
  const [right, setRight] = useState<SideSelector>(getDefaultRight);
  const [showOnlyDiffs, setShowOnlyDiffs] = useState(false);

  const selL = events[left.eventIndex]?.meals[left.meal]?.selection ?? {};
  const selR = events[right.eventIndex]?.meals[right.meal]?.selection ?? {};

  const allCategories = useMemo(() => {
    return Object.keys(catalog);
  }, [catalog]);

  const categoriesWithData = useMemo(() => {
    return allCategories.filter((cat) => {
      return (selL[cat]?.length ?? 0) > 0 || (selR[cat]?.length ?? 0) > 0;
    });
  }, [allCategories, selL, selR]);

  const categoriesWithDiff = useMemo(() => {
    return categoriesWithData.filter((cat) => {
      const lSet = new Set(selL[cat] ?? []);
      const rSet = new Set(selR[cat] ?? []);
      if (lSet.size !== rSet.size) return true;
      for (const item of lSet) if (!rSet.has(item)) return true;
      return false;
    });
  }, [categoriesWithData, selL, selR]);

  const visibleCategories = showOnlyDiffs ? categoriesWithDiff : categoriesWithData;

  const handleSwap = () => {
    setLeft(right);
    setRight(left);
  };

  const leftLabel = `${events[left.eventIndex]?.date} · ${left.meal}`;
  const rightLabel = `${events[right.eventIndex]?.date} · ${right.meal}`;
  const isSameMeal = left.eventIndex === right.eventIndex && left.meal === right.meal;
  const diffCount = categoriesWithDiff.length;

  return (
    <div className="pb-8 animate-fade-in">
      <div className="sticky top-0 z-10 bg-[#fdf8f0] border-b border-amber-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2 justify-center">
              <MealDropdown events={events} value={left} onChange={setLeft} tint="amber" />

              <button
                onClick={handleSwap}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-all hover:scale-110 shadow-sm"
                title="Swap sides"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </button>

              <MealDropdown events={events} value={right} onChange={setRight} tint="teal" />
            </div>

            <div className="flex items-center gap-2">
              {diffCount > 0 && (
                <span className="text-xs bg-orange-50 text-orange-600 border border-orange-200 rounded-full px-2.5 py-1 font-medium">
                  {diffCount} different {diffCount === 1 ? 'category' : 'categories'}
                </span>
              )}
              <button
                onClick={() => setShowOnlyDiffs((v) => !v)}
                className={`flex items-center gap-1.5 text-xs font-medium rounded-xl px-3 py-2 border transition-all ${
                  showOnlyDiffs
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Differences only
              </button>
            </div>
          </div>
        </div>
      </div>

      {isSameMeal && (
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 text-center">
            Both sides show the same meal. Select different meals or dates to compare.
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 pt-4">
        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-[minmax(90px,1.2fr)_2fr_2fr] border-b border-amber-100">
            <div className="px-4 py-3 bg-gray-50 flex items-end">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</span>
            </div>
            <div className="px-4 py-3 bg-amber-50 border-l border-amber-100">
              <div className="text-lg leading-none mb-1">{MEAL_ICONS[left.meal]}</div>
              <div className="font-serif text-sm font-bold text-amber-800 leading-tight">{left.meal}</div>
              <div className="text-xs text-amber-600 mt-0.5 opacity-80">{events[left.eventIndex]?.date}</div>
              {(() => {
                const g = selectedPackages[events[left.eventIndex]?.date ?? '']?.[left.meal] as GridName | undefined;
                const gc = g ? GRID_COLORS[g] : null;
                return g && gc ? <span className={`inline-block mt-1 text-[10px] border rounded-full px-1.5 py-0.5 font-medium ${gc.badge}`}>{g}</span> : null;
              })()}
            </div>
            <div className="px-4 py-3 bg-teal-50 border-l border-teal-100">
              <div className="text-lg leading-none mb-1">{MEAL_ICONS[right.meal]}</div>
              <div className="font-serif text-sm font-bold text-teal-800 leading-tight">{right.meal}</div>
              <div className="text-xs text-teal-600 mt-0.5 opacity-80">{events[right.eventIndex]?.date}</div>
              {(() => {
                const g = selectedPackages[events[right.eventIndex]?.date ?? '']?.[right.meal] as GridName | undefined;
                const gc = g ? GRID_COLORS[g] : null;
                return g && gc ? <span className={`inline-block mt-1 text-[10px] border rounded-full px-1.5 py-0.5 font-medium ${gc.badge}`}>{g}</span> : null;
              })()}
            </div>
          </div>

          {visibleCategories.length === 0 && !isSameMeal && (
            <div className="py-12 text-center">
              <div className="text-3xl mb-2">🎉</div>
              <p className="font-serif text-gray-600">Both menus are identical</p>
              <p className="text-xs text-gray-400 mt-1">No differences found across all categories</p>
            </div>
          )}

          {visibleCategories.map((category) => {
            const lItems = selL[category] ?? [];
            const rItems = selR[category] ?? [];
            const lSet = new Set(lItems);
            const rSet = new Set(rItems);
            const hasDiff = lItems.some((i) => !rSet.has(i)) || rItems.some((i) => !lSet.has(i));

            const lDate = events[left.eventIndex]?.date ?? '';
            const rDate = events[right.eventIndex]?.date ?? '';
            const lGrid = (selectedPackages[lDate]?.[left.meal] as GridName | undefined) ?? null;
            const rGrid = (selectedPackages[rDate]?.[right.meal] as GridName | undefined) ?? null;
            const lVal = validateCategoryWithGrid(category, lItems, lGrid, gridMatrix);
            const rVal = validateCategoryWithGrid(category, rItems, rGrid, gridMatrix);

            const lOverflowIdx = lVal.state === 'exceeded' && lVal.limit !== null ? lVal.limit : null;
            const rOverflowIdx = rVal.state === 'exceeded' && rVal.limit !== null ? rVal.limit : null;

            return (
              <div key={category} className="grid grid-cols-[minmax(90px,1.2fr)_2fr_2fr] border-b border-gray-50 last:border-0">
                <div className="px-4 py-3 bg-gray-50/40 flex items-start gap-2">
                  <span className="text-sm leading-none mt-0.5 flex-shrink-0">{CATEGORY_EMOJIS[category] ?? '🍽️'}</span>
                  <div className="min-w-0">
                    <span className="font-serif text-xs font-semibold text-gray-700 leading-tight block">{category}</span>
                    {hasDiff && (
                      <span className="inline-block mt-1 text-[10px] bg-orange-100 text-orange-600 border border-orange-200 rounded-full px-1.5 py-0.5 font-medium leading-none">
                        Different
                      </span>
                    )}
                  </div>
                </div>

                <div className={`px-3 py-3 border-l ${lVal.state === 'exceeded' ? 'bg-red-50/30 border-red-100' : 'border-amber-50 bg-amber-50/20'}`}>
                  {lVal.state !== 'none' && lVal.limit !== null && (
                    <div className="flex items-center gap-1 mb-1.5">
                      {lVal.state === 'exceeded' ? (
                        <span className="flex items-center gap-0.5 text-[10px] text-red-600 font-bold">
                          <XCircle className="w-3 h-3" />{lItems.length}/{lVal.limit}
                        </span>
                      ) : lVal.state === 'warning' ? (
                        <span className="flex items-center gap-0.5 text-[10px] text-amber-600 font-semibold">
                          <AlertTriangle className="w-3 h-3" />{lItems.length}/{lVal.limit}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400">{lItems.length}/{lVal.limit}</span>
                      )}
                      {lVal.gridName && <span className="text-[10px] text-gray-300">· {lVal.gridName}</span>}
                    </div>
                  )}
                  {lItems.length > 0 ? (
                    <ul className="space-y-1">
                      {lItems.map((item, idx) => {
                        const exclusive = !rSet.has(item);
                        const overflow = lOverflowIdx !== null && idx >= lOverflowIdx;
                        return (
                          <li key={item} className="flex items-start gap-1.5">
                            {overflow ? (
                              <XCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-red-400" />
                            ) : (
                              <Check className={`w-3 h-3 mt-0.5 flex-shrink-0 ${exclusive ? 'text-amber-500' : 'text-gray-300'}`} />
                            )}
                            <span className={`text-xs leading-tight ${overflow ? 'text-red-500 line-through' : exclusive ? 'text-amber-800 font-semibold' : 'text-gray-400'}`}>
                              {item}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-300 text-xs italic">
                      <Minus className="w-3 h-3" /> Not available
                    </span>
                  )}
                </div>

                <div className={`px-3 py-3 border-l ${rVal.state === 'exceeded' ? 'bg-red-50/30 border-red-100' : 'border-teal-50 bg-teal-50/20'}`}>
                  {rVal.state !== 'none' && rVal.limit !== null && (
                    <div className="flex items-center gap-1 mb-1.5">
                      {rVal.state === 'exceeded' ? (
                        <span className="flex items-center gap-0.5 text-[10px] text-red-600 font-bold">
                          <XCircle className="w-3 h-3" />{rItems.length}/{rVal.limit}
                        </span>
                      ) : rVal.state === 'warning' ? (
                        <span className="flex items-center gap-0.5 text-[10px] text-amber-600 font-semibold">
                          <AlertTriangle className="w-3 h-3" />{rItems.length}/{rVal.limit}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400">{rItems.length}/{rVal.limit}</span>
                      )}
                      {rVal.gridName && <span className="text-[10px] text-gray-300">· {rVal.gridName}</span>}
                    </div>
                  )}
                  {rItems.length > 0 ? (
                    <ul className="space-y-1">
                      {rItems.map((item, idx) => {
                        const exclusive = !lSet.has(item);
                        const overflow = rOverflowIdx !== null && idx >= rOverflowIdx;
                        return (
                          <li key={item} className="flex items-start gap-1.5">
                            {overflow ? (
                              <XCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-red-400" />
                            ) : (
                              <Check className={`w-3 h-3 mt-0.5 flex-shrink-0 ${exclusive ? 'text-teal-500' : 'text-gray-300'}`} />
                            )}
                            <span className={`text-xs leading-tight ${overflow ? 'text-red-500 line-through' : exclusive ? 'text-teal-800 font-semibold' : 'text-gray-400'}`}>
                              {item}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-300 text-xs italic">
                      <Minus className="w-3 h-3" /> Not available
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
            <div className="font-serif text-sm font-bold text-amber-800 mb-2 flex items-center gap-1.5">
              <span>{MEAL_ICONS[left.meal]}</span>
              <span className="truncate">Only in {leftLabel}</span>
            </div>
            {(() => {
              const items = allCategories.flatMap((cat) => {
                const rSet = new Set(selR[cat] ?? []);
                return (selL[cat] ?? []).filter((i) => !rSet.has(i)).map((item) => ({ cat, item }));
              });
              if (items.length === 0) return <p className="text-xs text-amber-400 italic">No exclusive items</p>;
              return items.slice(0, 10).map(({ cat, item }) => (
                <div key={`${cat}-${item}`} className="text-xs text-amber-700 py-0.5 flex items-center gap-1.5">
                  <span className="text-amber-400 text-[10px]">●</span>
                  <span className="flex-1">{item}</span>
                  <span className="text-amber-400 text-[10px] shrink-0">{cat}</span>
                </div>
              ));
            })()}
          </div>

          <div className="bg-teal-50 rounded-xl border border-teal-200 p-4">
            <div className="font-serif text-sm font-bold text-teal-800 mb-2 flex items-center gap-1.5">
              <span>{MEAL_ICONS[right.meal]}</span>
              <span className="truncate">Only in {rightLabel}</span>
            </div>
            {(() => {
              const items = allCategories.flatMap((cat) => {
                const lSet = new Set(selL[cat] ?? []);
                return (selR[cat] ?? []).filter((i) => !lSet.has(i)).map((item) => ({ cat, item }));
              });
              if (items.length === 0) return <p className="text-xs text-teal-400 italic">No exclusive items</p>;
              return items.slice(0, 10).map(({ cat, item }) => (
                <div key={`${cat}-${item}`} className="text-xs text-teal-700 py-0.5 flex items-center gap-1.5">
                  <span className="text-teal-400 text-[10px]">●</span>
                  <span className="flex-1">{item}</span>
                  <span className="text-teal-400 text-[10px] shrink-0">{cat}</span>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
