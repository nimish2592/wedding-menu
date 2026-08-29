import { useState, useEffect, useRef } from 'react';
import { Lock, X, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';

interface PasswordModalProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const EDIT_PASSWORD = 'pramedha';

export default function PasswordModal({ onSuccess, onCancel }: PasswordModalProps) {
  const [value, setValue] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (visible) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [visible]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value === EDIT_PASSWORD) {
      setError('');
      setVisible(false);
      setTimeout(onSuccess, 200);
    } else {
      setError('Incorrect password. Please try again.');
      setShake(true);
      setValue('');
      setTimeout(() => setShake(false), 600);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleCancel = () => {
    setVisible(false);
    setTimeout(onCancel, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') handleCancel();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onKeyDown={handleKeyDown}
    >
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleCancel}
      />

      <div
        className={`relative bg-white rounded-3xl shadow-2xl w-full max-w-sm transition-all duration-200 overflow-hidden ${
          visible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        } ${shake ? 'animate-shake' : ''}`}
        style={{
          animation: shake ? 'shake 0.5s ease-in-out' : undefined,
        }}
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />

        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-8 pt-8 pb-7">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
              <Lock className="w-7 h-7 text-amber-600" />
            </div>
            <h2 className="font-serif text-2xl text-gray-900 font-semibold">Enter Password</h2>
            <p className="text-sm text-gray-500 mt-1 text-center leading-relaxed">
              Enter your password to unlock edit mode and make changes to the menu.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                value={value}
                onChange={(e) => { setValue(e.target.value); setError(''); }}
                placeholder="Password"
                autoComplete="current-password"
                className={`w-full px-4 py-3 pr-12 rounded-xl border text-sm text-gray-800 bg-gray-50 outline-none transition-all duration-150 placeholder-gray-400 ${
                  error
                    ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                    : 'border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!value.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-95 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-amber-600 hover:bg-amber-700 text-white shadow-sm hover:shadow-md"
              >
                <ShieldCheck className="w-4 h-4" />
                Unlock
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-8px); }
          30% { transform: translateX(8px); }
          45% { transform: translateX(-6px); }
          60% { transform: translateX(6px); }
          75% { transform: translateX(-4px); }
          90% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
