import { useRef, useState, useCallback } from 'react';
import { X, Upload, FileJson, AlertCircle, CheckCircle2, Info, RotateCcw } from 'lucide-react';
import { GridDefinition } from '../types/gridMatrix';

interface GridRulesUploadProps {
  onClose: () => void;
  onUpload: (matrix: Record<string, GridDefinition>) => void;
  onReset: () => void;
  isCustom: boolean;
}

type Status = 'idle' | 'parsing' | 'success' | 'error';

function validateGridMatrix(raw: unknown): Record<string, GridDefinition> {
  if (typeof raw !== 'object' || raw === null) throw new Error('Invalid JSON: expected an object');

  const obj = raw as Record<string, unknown>;

  if ('gridMatrix' in obj) {
    return validateGridMatrix(obj.gridMatrix);
  }

  const result: Record<string, GridDefinition> = {};
  for (const [gridName, def] of Object.entries(obj)) {
    if (typeof def !== 'object' || def === null || !('categories' in def)) {
      throw new Error(`Grid "${gridName}" is missing a "categories" field`);
    }
    const d = def as Record<string, unknown>;
    const cats = d.categories as Record<string, unknown>;
    if (typeof cats !== 'object' || cats === null) {
      throw new Error(`Grid "${gridName}".categories must be an object`);
    }
    result[gridName] = {
      price: typeof d.price === 'number' ? d.price : undefined,
      isEditable: typeof d.isEditable === 'boolean' ? d.isEditable : undefined,
      type: (d.type as GridDefinition['type']) ?? undefined,
      categories: cats as GridDefinition['categories'],
    };
  }

  if (Object.keys(result).length === 0) {
    throw new Error('No grid definitions found in the uploaded file');
  }

  return result;
}

export default function GridRulesUpload({ onClose, onUpload, onReset, isCustom }: GridRulesUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [gridNames, setGridNames] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.json')) {
      setStatus('error');
      setMessage('Only .json files are supported for grid rules.');
      return;
    }
    setStatus('parsing');
    setMessage('');
    try {
      const text = await file.text();
      const raw = JSON.parse(text);
      const matrix = validateGridMatrix(raw);
      const names = Object.keys(matrix);
      setGridNames(names);
      setStatus('success');
      setMessage(`Loaded ${names.length} grid definition${names.length !== 1 ? 's' : ''}: ${names.join(', ')}`);
      setTimeout(() => { onUpload(matrix); onClose(); }, 1000);
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Failed to parse grid rules file.');
    }
  }, [onUpload, onClose]);

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

  const handleReset = () => {
    onReset();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-serif text-lg font-semibold text-gray-900">Upload Grid Rules</h2>
            <p className="text-xs text-gray-500 mt-0.5">Replace grid package rules with a JSON file</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {isCustom && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-amber-800">Custom grid rules active</p>
                <p className="text-xs text-amber-600 mt-0.5">Uploaded rules are overriding the defaults.</p>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs font-medium text-amber-700 border border-amber-300 bg-white rounded-lg px-3 py-1.5 hover:bg-amber-100 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>
          )}

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
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />

            {status === 'parsing' ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-amber-600 font-medium">Parsing rules...</p>
              </div>
            ) : status === 'success' ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                <p className="text-sm text-emerald-700 font-medium">{message}</p>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                <p className="font-serif text-base text-gray-700 mb-1">Drop your grid rules JSON here</p>
                <p className="text-xs text-gray-400">or click to browse</p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5">
                    <FileJson className="w-3.5 h-3.5 text-amber-500" />
                    .json only
                  </div>
                </div>
              </>
            )}
          </div>

          {status === 'error' && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-700">{message}</p>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-xs text-gray-600 mb-2">Expected JSON format</p>
                <pre className="text-[10px] text-gray-500 leading-relaxed overflow-x-auto bg-white border border-gray-100 rounded-lg p-2">{`{
  "gridMatrix": {
    "Grid 1": {
      "price": 1250,
      "categories": {
        "Snacks": { "limit": 2 },
        "Soup": { "limit": 1 }
      }
    },
    "Grid 2": { ... }
  }
}`}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
