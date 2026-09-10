import React, { useState } from 'react';
import { calculateBarbellPlates } from '../../lib/muscleMath';
import { X, Disc } from 'lucide-react';

interface PlateCalculatorModalProps {
  initialWeight?: number;
  unit?: 'kg' | 'lbs';
  onClose: () => void;
}

export const PlateCalculatorModal: React.FC<PlateCalculatorModalProps> = ({
  initialWeight = 60,
  unit = 'kg',
  onClose
}) => {
  const [targetWeight, setTargetWeight] = useState<number>(initialWeight);
  const [activeUnit, setActiveUnit] = useState<'kg' | 'lbs'>(unit);
  const [barWeight, setBarWeight] = useState<number>(unit === 'kg' ? 20 : 45);

  const { platesPerSide, actualWeight, remainder } = calculateBarbellPlates(
    targetWeight,
    activeUnit,
    barWeight
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Disc className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Olympic Barbell Plate Calculator
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Target Weight Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Target Total Weight ({unit})
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                min={barWeight}
                value={targetWeight || ''}
                onChange={e => setTargetWeight(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-1">
                {[60, 80, 100, 120, 140].map(w => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setTargetWeight(w)}
                    className="px-2.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Barbell Weight Toggle */}
          <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-600 dark:text-slate-400">Barbell Weight:</span>
            <div className="flex gap-2">
              {[20, 15, 10].map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBarWeight(b)}
                  className={`px-2.5 py-1 rounded-md font-semibold ${
                    barWeight === b
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                  }`}
                >
                  {b}{unit}
                </button>
              ))}
            </div>
          </div>

          {/* Graphical Plates Layout Representation */}
          <div className="p-4 rounded-2xl bg-slate-950 text-white border border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center mb-3">
              Plates Needed On Each Side
            </span>

            {platesPerSide.length > 0 ? (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {platesPerSide.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-blue-900/40 border border-blue-500/30 text-center min-w-[58px]"
                  >
                    <span className="text-base font-extrabold text-blue-400">
                      {p.weight}{unit}
                    </span>
                    <span className="text-xs text-slate-300 mt-0.5">
                      × {p.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-2">
                Empty bar load ({barWeight}{unit})
              </p>
            )}

            {/* Total Math Summary */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <span>Bar: {barWeight}{unit}</span>
              <span>Plates (both sides): {actualWeight - barWeight}{unit}</span>
              <span className="font-bold text-emerald-400">Total: {actualWeight}{unit}</span>
            </div>

            {remainder > 0 && (
              <p className="mt-2 text-[11px] text-amber-400 text-center">
                Note: {remainder}{unit} remainder (closest standard plate combination shown).
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
