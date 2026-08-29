import { UtensilsCrossed, LayoutGrid, Star, AlertTriangle, XCircle, ShieldCheck, IndianRupee, Lock, Layers } from 'lucide-react';
import { MealData, MealType, MEAL_ICONS, CategoryValidation, GridName, GRID_COLORS } from '../types';
import { GridDefinition } from '../types/gridMatrix';

interface MenuSummaryProps {
  date: string;
  meal: MealType;
  mealData: MealData;
  catalog: Record<string, string[]>;
  validations: Record<string, CategoryValidation>;
  gridName: GridName | null;
  gridMatrix: Record<string, GridDefinition>;
}

export default function MenuSummary({ date, meal, mealData, catalog, validations, gridName, gridMatrix }: MenuSummaryProps) {
  const selection = mealData.selection;
  const totalSelected = Object.values(selection).reduce((sum, items) => sum + items.length, 0);
  const categoriesUsed = Object.keys(selection).filter((cat) => selection[cat].length > 0).length;
  const totalCategories = Object.keys(catalog).length;
  const completeness = Math.round((categoriesUsed / totalCategories) * 100);

  const exceededCategories = Object.entries(validations).filter(([, v]) => v.state === 'exceeded');
  const atLimitCategories = Object.entries(validations).filter(([, v]) => v.state === 'warning');
  const violationCount = exceededCategories.length;

  const gridDef = gridName ? (gridMatrix[gridName] ?? null) : null;
  const gridColors = gridName ? GRID_COLORS[gridName] : null;

  const breakdownCategories = Object.entries(validations).filter(
    ([, v]) => v.breakdown && Object.keys(v.breakdown).length > 0
  );

  const completenessColor =
    completeness >= 80
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : completeness >= 40
      ? 'text-amber-700 bg-amber-50 border-amber-200'
      : 'text-orange-700 bg-orange-50 border-orange-200';

  const completenessBarColor =
    completeness >= 80 ? 'bg-emerald-500' : completeness >= 40 ? 'bg-amber-500' : 'bg-orange-400';

  return (
    <div className="px-4 mb-4 space-y-3">
      {gridDef && gridName && gridColors && (
        <div className={`rounded-2xl border p-3 flex flex-wrap items-center gap-3 ${gridColors.bg} ${gridColors.border}`}>
          <span className={`font-serif font-semibold text-sm ${gridColors.text}`}>
            {gridName}
          </span>
          {gridDef.price && (
            <span className={`inline-flex items-center gap-1 text-xs font-semibold ${gridColors.text}`}>
              <IndianRupee className="w-3 h-3" />
              {gridDef.price.toLocaleString('en-IN')} / person
            </span>
          )}
          {gridDef.isEditable && (
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium border rounded-full px-2 py-0.5 ${gridColors.badge}`}>
              Editable
            </span>
          )}
          {breakdownCategories.length > 0 && (
            <div className="ml-auto flex flex-wrap gap-2">
              {breakdownCategories.map(([cat, v]) => (
                <span key={cat} className={`inline-flex items-center gap-1.5 text-[10px] font-medium border rounded-full px-2 py-0.5 ${gridColors.badge}`}>
                  <Layers className="w-2.5 h-2.5" />
                  {cat}: {Object.entries(v.breakdown!).map(([k, n]) => `${n} ${k}`).join(' + ')}
                </span>
              ))}
            </div>
          )}
        </div>
      )}


      <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-4">
        <h3 className="font-serif text-sm text-gray-500 mb-3 uppercase tracking-wide flex items-center gap-2">
          <span>{MEAL_ICONS[meal]}</span>
          {date} · {meal} Summary
          {gridName && gridColors && (
            <span className={`ml-auto text-[10px] border rounded-full px-2 py-0.5 font-medium normal-case tracking-normal ${gridColors.badge}`}>
              {gridName}
            </span>
          )}
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center bg-amber-50 rounded-xl p-3">
            <UtensilsCrossed className="w-5 h-5 text-amber-600 mx-auto mb-1" />
            <div className="text-2xl font-serif font-bold text-gray-800">{totalSelected}</div>
            <div className="text-xs text-gray-500">Total Dishes</div>
          </div>
          <div className="text-center bg-emerald-50 rounded-xl p-3">
            <LayoutGrid className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
            <div className="text-2xl font-serif font-bold text-gray-800">{categoriesUsed}</div>
            <div className="text-xs text-gray-500">Categories</div>
          </div>
          <div className={`text-center rounded-xl p-3 border ${completenessColor}`}>
            <Star className="w-5 h-5 mx-auto mb-1 opacity-80" />
            <div className="text-2xl font-serif font-bold">{completeness}%</div>
            <div className="text-xs opacity-70">Complete</div>
          </div>
        </div>

        {gridDef && gridName && (
          <div className="mt-4 border-t border-gray-50 pt-3">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">
              {gridName} — Category Limits
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {Object.entries(gridDef.categories).map(([cat, cfg]) => {
                const val = validations[cat];
                if (!val) return null;
                const isBlocked = cfg.limit === 0;
                const isFixed = cfg.fixed && cfg.fixed.length > 0;
                const count = val.selected;
                const limit = cfg.limit;
                const isOver = !isFixed && !isBlocked && limit > 0 && count > limit;
                const isAtLimit = !isFixed && !isBlocked && limit > 0 && count === limit;

                const rowColor = isOver
                  ? 'bg-red-50 border-red-100 text-red-700'
                  : isAtLimit
                  ? 'bg-amber-50 border-amber-100 text-amber-700'
                  : isBlocked
                  ? 'bg-gray-50 border-gray-100 text-gray-400'
                  : isFixed
                  ? 'bg-blue-50 border-blue-100 text-blue-600'
                  : 'bg-gray-50 border-gray-100 text-gray-600';

                return (
                  <div key={cat} className={`flex items-center justify-between rounded-lg border px-2 py-1 ${rowColor}`}>
                    <div className="flex items-center gap-1 min-w-0">
                      {isBlocked && <Lock className="w-2.5 h-2.5 flex-shrink-0" />}
                      <span className="text-[10px] font-medium truncate">{cat}</span>
                    </div>
                    <span className="text-[10px] font-bold flex-shrink-0 ml-1">
                      {isFixed ? 'Fixed' : isBlocked ? '—' : `${count}/${limit}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Menu completeness</span>
            <span>{categoriesUsed} / {totalCategories} categories</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${completenessBarColor}`}
              style={{ width: `${completeness}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
