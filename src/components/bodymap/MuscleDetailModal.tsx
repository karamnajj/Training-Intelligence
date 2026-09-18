import React from 'react';
import { MuscleId, MuscleExposureData } from '../../types';
import { MUSCLE_CATALOG, FRESHNESS_COLORS, getMuscleBroName, isArmMuscle } from '../../lib/muscleMath';
import { X, Calendar, Activity, Zap, ShieldAlert, Award, ArrowRight, Clock } from 'lucide-react';

interface MuscleDetailModalProps {
  muscleId: MuscleId | null;
  muscleData: MuscleExposureData | null;
  onClose: () => void;
  onSelectForWorkout?: (muscleId: MuscleId) => void;
}

export const MuscleDetailModal: React.FC<MuscleDetailModalProps> = ({
  muscleId,
  muscleData,
  onClose,
  onSelectForWorkout
}) => {
  if (!muscleId || !muscleData) return null;

  const info = MUSCLE_CATALOG[muscleId];
  const colorScheme = FRESHNESS_COLORS[muscleData.freshnessStatus];
  const isArm = isArmMuscle(muscleId);
  const broName = getMuscleBroName(info.name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="muscle-title"
      >
        {/* Header with color indicator */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <span
                className="w-3.5 h-3.5 rounded-full ring-2 ring-offset-2 ring-slate-100 dark:ring-slate-800"
                style={{ backgroundColor: colorScheme.fill }}
              />
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${colorScheme.badgeClass}`}>
                {colorScheme.label}
              </span>
              {isArm && muscleData.isIndirectOnly && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Fast Synergist Recovery
                </span>
              )}
              <span className="text-xs text-slate-600 dark:text-slate-300 capitalize">
                {info.category} • {info.view}
              </span>
            </div>
            <h3 id="muscle-title" className="text-xl font-bold text-slate-900 dark:text-white">
              {info.name}
            </h3>
          </div>
          <button
            id="close-muscle-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close muscle details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Anatomical summary */}
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {info.description}
          </p>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-center">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Last Trained
              </span>
              <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                {muscleData.daysSinceTraining === null
                  ? 'Never'
                  : Math.floor(muscleData.daysSinceTraining) === 0
                  ? 'Today'
                  : `${Math.floor(muscleData.daysSinceTraining)}d ago`}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-center">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1">
                <Activity className="w-3.5 h-3.5" /> 7-Day Sets
              </span>
              <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                {muscleData.effectiveSets7d} <span className="text-xs font-normal text-slate-600 dark:text-slate-300">eff.</span>
              </p>
              {typeof muscleData.directSets7d === 'number' && (
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {muscleData.directSets7d} direct • {muscleData.indirectSets7d || 0} synergist
                </p>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-center">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1">
                <Zap className="w-3.5 h-3.5" /> Frequency
              </span>
              <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                {muscleData.frequencyWeekly}x <span className="text-xs font-normal text-slate-600 dark:text-slate-300">/wk</span>
              </p>
            </div>
          </div>

          {/* Recovery Assessment / Recommendation */}
          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wide">
                  Intelligence Recommendation
                </h4>
                <p className="mt-1 text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
                  {muscleData.recommendation}
                </p>
                {isArm && muscleData.isIndirectOnly && (
                  <p className="mt-1.5 text-xs text-emerald-700 dark:text-emerald-300 font-medium bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                    💡 <strong>Arnold & Split Friendly:</strong> This arm group was only loaded indirectly through compound pressing/pulling. It does not accumulate heavy localized tissue damage, clearing synergist fatigue rapidly so your dedicated arm session isn't hindered.
                  </p>
                )}
                <span className="block mt-1.5 text-[11px] text-blue-700 dark:text-blue-300 italic">
                  * Recovery is an algorithmic estimate based on recorded sets, direct vs synergist roles, and recency decay.
                </span>
              </div>
            </div>
          </div>

          {/* Recent Exercises History */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              Recent Stimulus Exercises
            </h4>
            {muscleData.recentExercises && muscleData.recentExercises.length > 0 ? (
              <div className="space-y-2">
                {muscleData.recentExercises.map((ex, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-sm"
                  >
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {ex.exerciseName}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <span>{ex.sets} sets</span>
                      <span>•</span>
                      <span>{new Date(ex.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-600 dark:text-slate-300 italic p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-center">
                No recent exercises recorded targeting this muscle directly.
              </p>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-600 dark:text-slate-300">
            30-Day Effective Sets: <strong>{muscleData.effectiveSets30d}</strong>
          </span>
          {onSelectForWorkout && (
            <button
              id="plan-workout-with-muscle-btn"
              onClick={() => {
                onSelectForWorkout(muscleId);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition-all"
            >
              Train {broName} Today <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
