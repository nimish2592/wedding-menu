import { MealType, MEAL_TYPES, MEAL_ICONS, EventDay } from '../types';

interface MealSelectorProps {
  activeEvent: EventDay;
  activeMeal: MealType;
  onSelect: (meal: MealType) => void;
}

export default function MealSelector({ activeEvent, activeMeal, onSelect }: MealSelectorProps) {
  const availableMeals = MEAL_TYPES.filter((meal) => meal in activeEvent.meals);

  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-amber-100">
      <div className="max-w-3xl mx-auto px-4 py-2.5">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {MEAL_TYPES.map((meal) => {
            const isAvailable = availableMeals.includes(meal);
            const isActive = activeMeal === meal;
            const mealData = activeEvent.meals[meal];
            const totalDishes = mealData
              ? Object.values(mealData.selection).reduce((s, arr) => s + arr.length, 0)
              : 0;

            return (
              <button
                key={meal}
                onClick={() => isAvailable && onSelect(meal)}
                disabled={!isAvailable}
                className={`flex-shrink-0 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-md'
                    : isAvailable
                    ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                    : 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
                }`}
              >
                <span className="text-base leading-none">{MEAL_ICONS[meal]}</span>
                <div className="text-left">
                  <div className="font-semibold leading-tight">{meal}</div>
                  {isAvailable && (
                    <div className={`text-xs leading-tight ${isActive ? 'text-amber-100' : 'text-amber-500'}`}>
                      {totalDishes} dishes
                    </div>
                  )}
                  {!isAvailable && (
                    <div className="text-xs leading-tight text-gray-300">Not available</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
