import React from 'react';
import { THEME_PALETTES, ThemePaletteId, applyThemePalette } from '../../lib/theme';
import { nativeHaptics } from '../../lib/nativeBridge';
import { X, Check, Palette, Sparkles } from 'lucide-react';

interface ThemePaletteModalProps {
  currentPalette: ThemePaletteId;
  onSelectPalette: (id: ThemePaletteId) => void;
  onClose: () => void;
}

export const ThemePaletteModal: React.FC<ThemePaletteModalProps> = ({
  currentPalette,
  onSelectPalette,
  onClose
}) => {
  const handleSelect = (id: ThemePaletteId) => {
    applyThemePalette(id);
    onSelectPalette(id);
    nativeHaptics.selection();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                Color Palette Theme
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personalize your training interface & visual vibe
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close theme modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Palette Options Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {THEME_PALETTES.map(palette => {
              const isSelected = currentPalette === palette.id;
              return (
                <button
                  key={palette.id}
                  onClick={() => handleSelect(palette.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 relative cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                          {palette.name}
                        </span>
                        {palette.id === 'monochrome' && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                            B&W
                          </span>
                        )}
                        {palette.id === 'emerald' && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                            Green
                          </span>
                        )}
                        {palette.id === 'pink' && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300">
                            Pink
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug line-clamp-1">
                        {palette.tagline}
                      </p>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Swatches Visual Bar */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {palette.previewSwatches.map((color, idx) => (
                      <span
                        key={idx}
                        className="w-4 h-4 rounded-full border border-black/10 dark:border-white/10 shadow-xs shrink-0"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                    <span
                      className="ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${palette.primaryHex}20`,
                        color: palette.primaryHex
                      }}
                    >
                      Accent
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
            <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
            <span>
              Palettes dynamically adapt both Light and Dark mode styling across active workouts, charts, and buttons.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
