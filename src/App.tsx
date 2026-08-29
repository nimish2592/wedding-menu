import { useState, useMemo, useCallback, useEffect } from 'react';
import { defaultMenuData } from './data/menuData';
import {
  MenuData, MealType, ViewMode, CATEGORY_EMOJIS, MEAL_TYPES,
  validateCategoryWithGrid, CategoryValidation, GridName,
} from './types';
import Header from './components/Header';
import DateSelector from './components/DateSelector';
import MealSelector from './components/MealSelector';
import ViewControls from './components/ViewControls';
import SearchBar from './components/SearchBar';
import CategoryCard from './components/CategoryCard';
import CompareView from './components/CompareView';
import FileUpload from './components/FileUpload';
import Toast, { useToast } from './components/Toast';
import PasswordModal from './components/PasswordModal';
import PackageSelector from './components/PackageSelector';
import GridRulesUpload from './components/GridRulesUpload';
import { useMenuSelections } from './hooks/useMenuSelections';
import { usePackageSelections } from './hooks/usePackageSelections';
import { generateMenuPDF } from './utils/pdfExport';

const UNLOCK_KEY = 'isEditUnlocked';

function buildBaseSelectionMap(data: MenuData): Record<string, Record<string, string[]>> {
  const map: Record<string, Record<string, string[]>> = {};
  for (const event of data.events) {
    map[event.date] = {};
    for (const [meal, mealData] of Object.entries(event.meals)) {
      if (mealData) {
        map[event.date][meal] = mealData.selection as unknown as Record<string, string[]>;
      }
    }
  }
  return map;
}

export default function App() {
  const [menuData, setMenuData] = useState<MenuData>(defaultMenuData);
  const [activeEventIndex, setActiveEventIndex] = useState(0);
  const [activeMeal, setActiveMeal] = useState<MealType>('Lunch');
  const [viewMode, setViewMode] = useState<ViewMode>('final');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showGridRulesUpload, setShowGridRulesUpload] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(
    () => localStorage.getItem(UNLOCK_KEY) === 'true'
  );
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(Object.keys(defaultMenuData.catalog).slice(0, 4))
  );

  const { toasts, addToast, dismiss } = useToast();

  const {
    selectedPackages,
    getPackage,
    setPackage,
    activeGridMatrix,
    uploadGridMatrix,
    resetGridMatrix,
    isCustomGridMatrix,
  } = usePackageSelections();

  useEffect(() => {
    if (isUnlocked) {
      localStorage.setItem(UNLOCK_KEY, 'true');
    } else {
      localStorage.removeItem(UNLOCK_KEY);
    }
  }, [isUnlocked]);

  const baseSelections = useMemo(() => buildBaseSelectionMap(menuData), [menuData]);

  const {
    getSelection,
    setMealCategoryItems,
    save,
    undoLastChange,
    resetToOriginal,
    exportJSON,
    isDirty,
    lastSaved,
    canUndo,
  } = useMenuSelections(baseSelections);

  const ALL_CATEGORIES = Object.keys(menuData.catalog);
  const activeEvent = menuData.events[activeEventIndex];
  const allExpanded = expandedCategories.size === ALL_CATEGORIES.length;

  const activeGridName: GridName | null = activeEvent
    ? getPackage(activeEvent.date, activeMeal)
    : null;
  const isMealEditable = activeGridName !== null;

  const currentSelection = useMemo(() => {
    if (!activeEvent) return {};
    return Object.fromEntries(
      ALL_CATEGORIES.map((cat) => [
        cat,
        getSelection(activeEvent.date, activeMeal, cat),
      ])
    );
  }, [activeEvent, activeMeal, ALL_CATEGORIES, getSelection]);

  const categoryValidations = useMemo((): Record<string, CategoryValidation> => {
    if (!activeEvent) return {};
    return Object.fromEntries(
      ALL_CATEGORIES.map((cat) => [
        cat,
        validateCategoryWithGrid(cat, currentSelection[cat] ?? [], activeGridName, activeGridMatrix),
      ])
    );
  }, [ALL_CATEGORIES, currentSelection, activeEvent, activeGridName, activeGridMatrix]);

  const violationCount = useMemo(
    () => Object.values(categoryValidations).filter((v) => v.state === 'exceeded').length,
    [categoryValidations]
  );

  const handleToggleAll = useCallback(() => {
    setExpandedCategories(allExpanded ? new Set() : new Set(ALL_CATEGORIES));
  }, [allExpanded, ALL_CATEGORIES]);

  const handleCategoryToggle = useCallback((category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(category) ? next.delete(category) : next.add(category);
      return next;
    });
  }, []);

  const handleDateSelect = (index: number) => {
    setActiveEventIndex(index);
    setSearchQuery('');
    const newEvent = menuData.events[index];
    const firstAvailableMeal = MEAL_TYPES.find((m) => m in newEvent.meals);
    if (firstAvailableMeal && !(activeMeal in newEvent.meals)) {
      setActiveMeal(firstAvailableMeal);
    }
  };

  const handleLoad = (data: MenuData) => {
    setMenuData(data);
    setActiveEventIndex(0);
    const firstEvent = data.events[0];
    const firstMeal = MEAL_TYPES.find((m) => m in (firstEvent?.meals ?? {}));
    setActiveMeal(firstMeal ?? 'Lunch');
    setExpandedCategories(new Set(Object.keys(data.catalog).slice(0, 4)));
    setIsEditMode(false);
  };

  const handleSave = () => {
    const label = save();
    addToast(`Menu saved at ${label}`, 'success');
  };

  const handleUndo = () => {
    const ok = undoLastChange();
    if (ok) addToast('Last change undone', 'info');
  };

  const handleReset = () => {
    if (!activeEvent) return;
    resetToOriginal(activeEvent.date, activeMeal);
    addToast('Reset to original menu', 'info');
  };

  const handleDownloadPDF = () => {
    const meals = menuData.events.flatMap((event) =>
      MEAL_TYPES.filter((m) => m in event.meals).map((meal) => ({
        date: event.date,
        meal,
        selection: Object.fromEntries(
          ALL_CATEGORIES.map((cat) => [cat, getSelection(event.date, meal, cat)])
        ),
        gridName: getPackage(event.date, meal),
      }))
    );
    generateMenuPDF(menuData.meta, meals);
    addToast('PDF downloaded', 'success');
  };

  const handleExportJSON = () => {
    exportJSON();
    addToast('Selections exported as JSON', 'success');
  };

  const handleUnlockClick = () => {
    if (isUnlocked) {
      if (isEditMode && isDirty) {
        if (!window.confirm('You have unsaved changes. Exit without saving?')) return;
      }
      setIsEditMode((v) => !v);
      if (isEditMode) {
        addToast('Switched to view mode', 'info');
      } else {
        addToast('Edit mode enabled — modify selections within grid limits', 'info');
        setViewMode('final');
      }
    } else {
      setShowPasswordModal(true);
    }
  };

  const handleUnlockSuccess = () => {
    setIsUnlocked(true);
    setShowPasswordModal(false);
    setIsEditMode(true);
    setViewMode('final');
    addToast('Edit mode unlocked — modify selections within grid limits', 'success');
  };

  const handleLockClick = () => {
    if (isDirty) {
      if (!window.confirm('You have unsaved changes. Lock and discard?')) return;
    }
    setIsEditMode(false);
    setIsUnlocked(false);
    addToast('Edit mode locked', 'info');
  };

  const handlePackageChange = (gridName: GridName) => {
    if (!activeEvent) return;
    const prevGrid = getPackage(activeEvent.date, activeMeal);
    setPackage(activeEvent.date, activeMeal, gridName);
    if (prevGrid && prevGrid !== gridName) {
      addToast(`Package changed to ${gridName} — check for limit violations`, 'info');
    }
  };

  const searchResultCount = useMemo(() => {
    if (!searchQuery.trim()) return undefined;
    const q = searchQuery.toLowerCase();
    return ALL_CATEGORIES.reduce((total, cat) => {
      const items = viewMode === 'final'
        ? (currentSelection[cat] ?? [])
        : menuData.catalog[cat];
      return total + items.filter((item) => item.toLowerCase().includes(q)).length;
    }, 0);
  }, [searchQuery, viewMode, currentSelection, menuData.catalog, ALL_CATEGORIES]);

  const visibleCategories = useMemo(() => {
    if (!searchQuery.trim()) return ALL_CATEGORIES;
    const q = searchQuery.toLowerCase();
    return ALL_CATEGORIES.filter((cat) => {
      const items = viewMode === 'final'
        ? (currentSelection[cat] ?? [])
        : menuData.catalog[cat];
      return cat.toLowerCase().includes(q) || items.some((i) => i.toLowerCase().includes(q));
    });
  }, [searchQuery, viewMode, currentSelection, menuData.catalog, ALL_CATEGORIES]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fdf8f0' }}>
      <Header
        meta={menuData.meta}
        onUploadClick={() => setShowUpload(true)}
        onGridRulesUploadClick={() => setShowGridRulesUpload(true)}
        isEditMode={isEditMode}
        isUnlocked={isUnlocked}
        onUnlockClick={handleUnlockClick}
        onLockClick={handleLockClick}
        isDirty={isDirty}
        canUndo={canUndo}
        lastSaved={lastSaved}
        onSave={handleSave}
        onUndo={handleUndo}
        onReset={handleReset}
        onDownloadPDF={handleDownloadPDF}
        onExportJSON={handleExportJSON}
        isCustomGridMatrix={isCustomGridMatrix}
      />

      {isEditMode && !isMealEditable && activeEvent && (
        <div className="max-w-3xl mx-auto px-4 pt-3">
          <div className="bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 flex items-center gap-2 text-sm text-orange-700">
            <span className="font-semibold">No package set:</span>
            Select a package for {activeMeal} on {activeEvent.date} to enable editing.
          </div>
        </div>
      )}

      <DateSelector
        events={menuData.events}
        activeIndex={activeEventIndex}
        onSelect={handleDateSelect}
      />

      {activeEvent && (
        <MealSelector
          activeEvent={activeEvent}
          activeMeal={activeMeal}
          onSelect={(meal) => { setActiveMeal(meal); setSearchQuery(''); setIsCompareMode(false); }}
        />
      )}

      <main className="pb-6">
        <div className="max-w-3xl mx-auto">
          <ViewControls
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            isCompareMode={isCompareMode}
            onCompareModeToggle={() => { setIsCompareMode((v) => !v); setIsEditMode(false); }}
            allExpanded={allExpanded}
            onToggleAll={handleToggleAll}
          />
          {!isCompareMode && (
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              resultCount={searchResultCount}
            />
          )}
        </div>

        {isCompareMode ? (
          <CompareView
            events={menuData.events}
            catalog={menuData.catalog}
            initialLeftEventIndex={activeEventIndex}
            initialLeftMeal={activeMeal}
            selectedPackages={selectedPackages}
            gridMatrix={activeGridMatrix}
          />
        ) : !activeEvent ? (
          <div className="max-w-3xl mx-auto px-4">
            <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-8 text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="font-serif text-lg text-gray-700">No event data available</p>
              <p className="text-sm text-gray-400 mt-1">Upload a menu file to get started</p>
            </div>
          </div>
        ) : !activeEvent.meals[activeMeal] ? (
          <div className="max-w-3xl mx-auto px-4">
            <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-8 text-center">
              <div className="text-4xl mb-3">🍽️</div>
              <p className="font-serif text-lg text-gray-700">
                Menu not available for {activeMeal}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                No dishes have been selected for this meal on {activeEvent.date}
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <PackageSelector
              date={activeEvent.date}
              meal={activeMeal}
              selected={activeGridName}
              gridMatrix={activeGridMatrix}
              onChange={handlePackageChange}
              isEditMode={isEditMode}
              violationCount={violationCount}
            />


            {visibleCategories.length === 0 && searchQuery ? (
              <div className="px-4">
                <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-8 text-center">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="font-serif text-lg text-gray-700 mb-1">No dishes found</p>
                  <p className="text-sm text-gray-400">Try a different keyword</p>
                </div>
              </div>
            ) : (
              <div className="px-4 space-y-3">
                {visibleCategories.map((category) => {
                  const catValidation = categoryValidations[category] ?? {
                    state: 'none' as const, selected: 0, limit: null, excess: 0, gridName: null,
                  };
                  const catIsEditable =
                    isEditMode &&
                    isMealEditable &&
                    (catValidation.limit !== null ||
                      catValidation.state === 'fixed' ||
                      catValidation.state === 'blocked');

                  return (
                    <CategoryCard
                      key={category}
                      category={category}
                      emoji={CATEGORY_EMOJIS[category] ?? '🍽️'}
                      allItems={menuData.catalog[category]}
                      selectedItems={currentSelection[category] ?? []}
                      limit={menuData.limits[category]}
                      validation={catValidation}
                      viewMode={viewMode}
                      searchQuery={searchQuery}
                      isExpanded={expandedCategories.has(category)}
                      onToggle={() => handleCategoryToggle(category)}
                      isEditMode={isEditMode}
                      isEditable={catIsEditable}
                      onItemsChange={
                        catIsEditable
                          ? (items) => setMealCategoryItems(activeEvent.date, activeMeal, category, items)
                          : undefined
                      }
                    />
                  );
                })}
              </div>
            )}

            {!isEditMode && viewMode === 'final' && !searchQuery && (
              <div className="px-4 mt-5 mb-2">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                  <span className="text-xl leading-none mt-0.5">ℹ️</span>
                  <div>
                    <p className="font-serif text-sm font-semibold text-amber-800">Viewing Finalized Menu</p>
                    <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                      Showing selected dishes for <strong>{activeEvent.date} · {activeMeal}</strong>.
                      Switch to <strong>Full Menu</strong> to see the complete catalog, or click <strong>Unlock Edit</strong> to make changes.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {showUpload && (
        <FileUpload
          onClose={() => setShowUpload(false)}
          onLoad={handleLoad}
        />
      )}

      {showGridRulesUpload && (
        <GridRulesUpload
          onClose={() => setShowGridRulesUpload(false)}
          onUpload={(matrix) => {
            uploadGridMatrix(matrix);
            addToast('Grid rules updated', 'success');
          }}
          onReset={() => {
            resetGridMatrix();
            addToast('Grid rules reset to defaults', 'info');
          }}
          isCustom={isCustomGridMatrix}
        />
      )}

      {showPasswordModal && (
        <PasswordModal
          onSuccess={handleUnlockSuccess}
          onCancel={() => setShowPasswordModal(false)}
        />
      )}

      <Toast toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
