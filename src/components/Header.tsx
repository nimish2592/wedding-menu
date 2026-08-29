import { Leaf, CheckCircle2, MapPin, Upload, Pencil, Eye, Save, FileDown, Undo2, RotateCcw, Download, Lock, Unlock, Grid3x3 as Grid3X3 } from 'lucide-react';
import { MenuMeta } from '../types';

interface HeaderProps {
  meta: MenuMeta;
  onUploadClick: () => void;
  onGridRulesUploadClick: () => void;
  isEditMode: boolean;
  isUnlocked: boolean;
  onUnlockClick: () => void;
  onLockClick: () => void;
  isDirty: boolean;
  canUndo: boolean;
  lastSaved: number | null;
  onSave: () => void;
  onUndo: () => void;
  onReset: () => void;
  onDownloadPDF: () => void;
  onExportJSON: () => void;
  isCustomGridMatrix: boolean;
}

export default function Header({
  meta,
  onUploadClick,
  onGridRulesUploadClick,
  isEditMode,
  isUnlocked,
  onUnlockClick,
  onLockClick,
  isDirty,
  canUndo,
  lastSaved,
  onSave,
  onUndo,
  onReset,
  onDownloadPDF,
  onExportJSON,
  isCustomGridMatrix,
}: HeaderProps) {
  const savedLabel = lastSaved
    ? new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="relative bg-white border-b border-amber-100 overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-32 h-32 border-8 border-amber-600 rounded-full -translate-x-16 -translate-y-16" />
        <div className="absolute top-0 right-0 w-24 h-24 border-8 border-amber-600 rounded-full translate-x-12 -translate-y-12" />
        <div className="absolute bottom-0 left-1/2 w-40 h-40 border-8 border-amber-600 rounded-full -translate-x-1/2 translate-y-20" />
      </div>

      <div className="relative px-4 pt-5 pb-4 sm:px-6 sm:pt-7 sm:pb-5 max-w-3xl mx-auto">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <div className="h-px w-6 bg-amber-400" />
              <span className="text-amber-600 text-xs font-medium tracking-widest uppercase">
                {isEditMode ? 'Edit Mode Active' : 'Finalized Menu for Family'}
              </span>
              <div className="h-px w-6 bg-amber-400" />
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl text-gray-900 mb-1 leading-tight">
              {meta.event_name}
            </h1>

            <div className="flex items-center justify-center gap-1.5 text-gray-500 text-sm mb-3">
              <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span>{meta.venue}</span>
            </div>

          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {!isUnlocked ? (
            <button
              onClick={onUnlockClick}
              className="inline-flex items-center gap-2 text-sm font-medium rounded-xl px-4 py-2 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Lock className="w-4 h-4" />
              Unlock Edit
            </button>
          ) : (
            <>
              <button
                onClick={isEditMode ? onLockClick : onUnlockClick}
                className={`inline-flex items-center gap-2 text-sm font-medium rounded-xl px-4 py-2 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 ${
                  isEditMode
                    ? 'bg-gray-800 hover:bg-gray-900 text-white'
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                }`}
              >
                {isEditMode ? <Eye className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                {isEditMode ? 'Exit Edit Mode' : 'Edit Menu'}
              </button>

              <button
                onClick={onLockClick}
                className="inline-flex items-center gap-2 text-sm font-medium rounded-xl px-4 py-2 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600"
                title="Lock edit mode"
              >
                <Lock className="w-4 h-4" />
                Lock Edit
              </button>
            </>
          )}

          {isEditMode && (
            <>
              <button
                onClick={onSave}
                disabled={!isDirty}
                className={`inline-flex items-center gap-2 text-sm font-medium rounded-xl px-4 py-2 transition-all duration-200 shadow-sm active:scale-95 ${
                  isDirty
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-md'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4" />
                Save Menu
              </button>

              {canUndo && (
                <button
                  onClick={onUndo}
                  className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-xl px-4 py-2 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                >
                  <Undo2 className="w-4 h-4" />
                  Undo
                </button>
              )}

              <button
                onClick={onReset}
                className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-gray-600 text-sm font-medium rounded-xl px-4 py-2 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </>
          )}

          <button
            onClick={onDownloadPDF}
            className="inline-flex items-center gap-2 bg-white border border-amber-200 hover:bg-amber-50 text-amber-700 text-sm font-medium rounded-xl px-4 py-2 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
          >
            <FileDown className="w-4 h-4" />
            Download PDF
          </button>

          <button
            onClick={onExportJSON}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-xl px-3 py-2 transition-all duration-200 shadow-sm active:scale-95"
            title="Export selections as JSON"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={onUploadClick}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-xl px-3 py-2 transition-all duration-200 shadow-sm active:scale-95"
            title="Upload Final Menu"
          >
            <Upload className="w-4 h-4" />
          </button>

          <button
            onClick={onGridRulesUploadClick}
            className={`inline-flex items-center gap-2 text-sm font-medium rounded-xl px-3 py-2 transition-all duration-200 shadow-sm active:scale-95 ${
              isCustomGridMatrix
                ? 'bg-teal-50 border border-teal-300 text-teal-700 hover:bg-teal-100'
                : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-600'
            }`}
            title="Upload Grid Rules"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
