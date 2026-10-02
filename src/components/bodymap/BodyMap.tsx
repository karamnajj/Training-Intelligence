import React, { useState } from 'react';
import { MuscleId, MuscleExposureData } from '../../types';
import { BodyMapSVG } from './BodyMapSVG';
import { MuscleDetailModal } from './MuscleDetailModal';
import { MUSCLE_CATALOG, FRESHNESS_COLORS, formatTimeSinceTraining } from '../../lib/muscleMath';
import { Dumbbell, Sparkles, ChevronRight, Info } from 'lucide-react';

interface BodyMapProps {
  musclesData: Record<MuscleId, MuscleExposureData>;
  onTrainMuscle?: (muscleId: MuscleId) => void;
  className?: string;
  defaultView?: 'front' | 'back' | 'both';
  hideHeader?: boolean;
}

export const BodyMap: React.FC<BodyMapProps> = ({
  musclesData,
  onTrainMuscle,
  className = '',
  defaultView = 'front',
  hideHeader = false
}) => {
  const [activeView, setActiveView] = useState<'front' | 'back' | 'both'>(defaultView);
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleId | null>(null);
  const [hoveredMuscle, setHoveredMuscle] = useState<MuscleId | null>(null);
  const [modalMuscle, setModalMuscle] = useState<MuscleId | null>(null);

  const activeMuscleId = hoveredMuscle || selectedMuscle;
  const activeData = activeMuscleId ? musclesData[activeMuscleId] : null;
  const activeInfo = activeMuscleId ? MUSCLE_CATALOG[activeMuscleId] : null;

  // Approximate recovery percentage from freshness status & days since training
  const getRecoveryPercentage = (data?: MuscleExposureData | null): number => {
    if (!data) return 100;
    if (data.freshnessStatus === 'fresh' || data.freshnessStatus === 'untrained') return 100;
    if (data.freshnessStatus === 'moderate') return 70;
    if (data.freshnessStatus === 'recently_trained') return 40;
    if (data.freshnessStatus === 'high_recent_exposure') return 20;
    return 100;
  };

  const recoveryPct = getRecoveryPercentage(activeData);

  return (
    <div className={`relative flex flex-col items-center w-full ${className}`}>
      {/* 1. Fitbod Perspective Toggle Control */}
      <div className="w-full flex items-center justify-between gap-3 mb-3">
        {!hideHeader && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Muscle Recovery Status
            </span>
          </div>
        )}

        {/* Minimalist Segmented View Switcher */}
        <div className="mx-auto sm:ml-auto sm:mr-0 inline-flex items-center bg-slate-200/60 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-300/40 dark:border-slate-700/60 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveView('front')}
            className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeView === 'front'
                ? 'bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Front
          </button>
          <button
            type="button"
            onClick={() => setActiveView('back')}
            className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeView === 'back'
                ? 'bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setActiveView('both')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeView === 'both'
                ? 'bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Dual
          </button>
        </div>
      </div>

      {/* 2. Fitbod High-Precision Body Canvas */}
      <div className="w-full flex items-center justify-center py-2 relative">
        <div className="w-full max-w-xl flex items-center justify-center gap-6 sm:gap-10">
          {(activeView === 'front' || activeView === 'both') && (
            <div className="flex-1 max-w-[240px] flex flex-col items-center">
              {activeView === 'both' && (
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                  Anterior (Front)
                </span>
              )}
              <BodyMapSVG
                view="front"
                musclesData={musclesData}
                selectedMuscle={selectedMuscle}
                hoveredMuscle={hoveredMuscle}
                onHoverMuscle={setHoveredMuscle}
                onSelectMuscle={id => {
                  setSelectedMuscle(id);
                  setModalMuscle(id);
                }}
              />
            </div>
          )}

          {(activeView === 'back' || activeView === 'both') && (
            <div className="flex-1 max-w-[240px] flex flex-col items-center">
              {activeView === 'both' && (
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                  Posterior (Back)
                </span>
              )}
              <BodyMapSVG
                view="back"
                musclesData={musclesData}
                selectedMuscle={selectedMuscle}
                hoveredMuscle={hoveredMuscle}
                onHoverMuscle={setHoveredMuscle}
                onSelectMuscle={id => {
                  setSelectedMuscle(id);
                  setModalMuscle(id);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* 3. Floating Fitbod Muscle Inspector Card */}
      <div className="w-full max-w-lg mt-3">
        {activeMuscleId && activeData && activeInfo ? (
          <div
            onClick={() => setModalMuscle(activeMuscleId)}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg flex items-center justify-between gap-3 cursor-pointer hover:border-blue-500/60 transition-all animate-in fade-in duration-200"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs"
                style={{
                  backgroundColor: `${FRESHNESS_COLORS[activeData.freshnessStatus].fill}20`,
                  color: FRESHNESS_COLORS[activeData.freshnessStatus].fill
                }}
              >
                {recoveryPct}%
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                    {activeInfo.name}
                  </h4>
                  <span
                    className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${FRESHNESS_COLORS[activeData.freshnessStatus].fill}20`,
                      color: FRESHNESS_COLORS[activeData.freshnessStatus].fill
                    }}
                  >
                    {FRESHNESS_COLORS[activeData.freshnessStatus].label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  Last trained: {formatTimeSinceTraining(activeData.daysSinceTraining, activeData.lastTrainedAt, new Date(), true)} • {activeData.effectiveSets7d} sets (7d)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {onTrainMuscle && (
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    onTrainMuscle(activeMuscleId);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                >
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>Train</span>
                </button>
              )}
              <div className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600" />
            <span>Tap any muscle group to inspect live biological recovery</span>
          </div>
        )}
      </div>

      {/* 4. Fitbod Recovery Status Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Recovered (100%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs shadow-amber-500/50" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Moderate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs shadow-rose-500/50" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Fatigued</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-600" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Untrained</span>
        </div>
      </div>

      {/* Modal Detail View on Click */}
      {modalMuscle && (
        <MuscleDetailModal
          muscleId={modalMuscle}
          muscleData={musclesData[modalMuscle]}
          onClose={() => setModalMuscle(null)}
          onSelectForWorkout={onTrainMuscle}
        />
      )}
    </div>
  );
};
