import { useRef, useState, useCallback } from 'react';
import { X, Upload, FileJson, FileSpreadsheet, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import * as XLSX from 'xlsx';
import { MenuData, MealType, MEAL_TYPES } from '../types';
import { defaultMenuData } from '../data/menuData';

interface FileUploadProps {
  onClose: () => void;
  onLoad: (data: MenuData) => void;
}

type ParseStatus = 'idle' | 'parsing' | 'success' | 'error';

function parseJSON(text: string): MenuData {
  const raw = JSON.parse(text);
  if (!raw.meta || !raw.catalog || !raw.events) {
    throw new Error('Invalid JSON structure: missing meta, catalog, or events');
  }
  return raw as MenuData;
}

function normalizeDateKey(sheet: string): string {
  return sheet
    .replace(/th|st|nd|rd/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectMealType(value: string): MealType | null {
  const v = value.trim().toLowerCase();
  for (const meal of MEAL_TYPES) {
    if (v === meal.toLowerCase() || v.includes(meal.toLowerCase())) {
      return meal;
    }
  }
  return null;
}

function parseExcel(buffer: ArrayBuffer, baseCatalog: Record<string, string[]>): MenuData {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const catalogCategories = Object.keys(baseCatalog);

  const events: MenuData['events'] = workbook.SheetNames.map((sheetName) => {
    const ws = workbook.Sheets[sheetName];
    const rows: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as string[][];

    const meals: Partial<Record<MealType, { selection: Record<string, string[]> }>> = {};
    let currentMeal: MealType | null = null;
    let currentCategory: string | null = null;

    for (const row of rows) {
      const cellA = String(row[0] ?? '').trim();
      if (!cellA) continue;

      const meal = detectMealType(cellA);
      if (meal) {
        currentMeal = meal;
        currentCategory = null;
        if (!meals[currentMeal]) meals[currentMeal] = { selection: {} };
        continue;
      }

      const matchedCategory = catalogCategories.find(
        (cat) => cat.toLowerCase() === cellA.toLowerCase()
      );
      if (matchedCategory) {
        currentCategory = matchedCategory;
        if (currentMeal && !meals[currentMeal]!.selection[currentCategory]) {
          meals[currentMeal]!.selection[currentCategory] = [];
        }
        continue;
      }

      if (currentMeal && currentCategory) {
        meals[currentMeal]!.selection[currentCategory].push(cellA);
      }
    }

    return {
      date: normalizeDateKey(sheetName),
      meals,
    };
  });

  return {
    meta: defaultMenuData.meta,
    catalog: baseCatalog,
    events,
    limits: defaultMenuData.limits,
  };
}

export default function FileUpload({ onClose, onLoad }: FileUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<ParseStatus>('idle');
  const [message, setMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback(async (file: File) => {
    setStatus('parsing');
    setMessage('');
    try {
      if (file.name.endsWith('.json')) {
        const text = await file.text();
        const data = parseJSON(text);
        setStatus('success');
        setMessage(`Loaded ${data.events.length} event days successfully.`);
        setTimeout(() => { onLoad(data); onClose(); }, 1000);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const buffer = await file.arrayBuffer();
        const data = parseExcel(buffer, defaultMenuData.catalog);
        setStatus('success');
        setMessage(`Loaded ${data.events.length} sheet(s) as event days.`);
        setTimeout(() => { onLoad(data); onClose(); }, 1000);
      } else {
        throw new Error('Unsupported file type. Please upload a .json or .xlsx file.');
      }
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Failed to parse file.');
    }
  }, [onLoad, onClose]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-serif text-lg font-semibold text-gray-900">Upload Final Menu</h2>
            <p className="text-xs text-gray-500 mt-0.5">Supports JSON or Excel (.xlsx)</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-amber-500 bg-amber-50'
                : 'border-amber-200 hover:border-amber-400 hover:bg-amber-50/50'
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".json,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />

            {status === 'parsing' ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-amber-600 font-medium">Parsing file...</p>
              </div>
            ) : status === 'success' ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                <p className="text-sm text-emerald-700 font-medium">{message}</p>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                <p className="font-serif text-base text-gray-700 mb-1">Drop your menu file here</p>
                <p className="text-xs text-gray-400">or click to browse</p>
                <div className="flex items-center justify-center gap-3 mt-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5">
                    <FileJson className="w-3.5 h-3.5 text-amber-500" />
                    .json
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                    .xlsx / .xls
                  </div>
                </div>
              </>
            )}
          </div>

          {status === 'error' && (
            <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-700">{message}</p>
            </div>
          )}

          <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-xs text-amber-800 mb-1">Excel Format Guide</p>
                <ul className="text-xs text-amber-700 space-y-0.5">
                  <li>• Each sheet = one event date (e.g., "19 April")</li>
                  <li>• Row A1: Meal type (Lunch / Dinner / High Tea)</li>
                  <li>• Next row: Category name (e.g., Snacks)</li>
                  <li>• Following rows: One dish per row</li>
                  <li>• New meal type row to switch meal</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
