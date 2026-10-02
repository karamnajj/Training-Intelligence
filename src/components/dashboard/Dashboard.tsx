import React, { useMemo } from 'react';
import {
  TrainingRadar,
  MuscleExposureData,
  Workout,
  PersonalRecord,
  UserProfile,
  MuscleId
} from '../../types';
import { BodyMap } from '../bodymap/BodyMap';
import {
  Play,
  Plus,
  Flame,
  Sparkles,
  ArrowRight,
  Activity,
  Layers,
  Calendar
} from 'lucide-react';

interface DashboardProps {
  radar: TrainingRadar;
  musclesData: Record<MuscleId, MuscleExposureData>;
  userProfile: UserProfile;
  onStartEmptyWorkout: () => void;
  onStartRecommendedWorkout: () => void;
  onNavigateToAI: () => void;
  onOpenProfileModal?: () => void;
  recentWorkouts?: Workout[];
  personalRecords?: PersonalRecord[];
  onStartTemplate?: (templateId: string) => void;
  onRepeatWorkout?: (workout: Workout) => void;
  onNavigateToHistory?: () => void;
  onNavigateToAnalytics?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  radar,
  musclesData,
  userProfile,
  onStartEmptyWorkout,
  onStartRecommendedWorkout,
  onNavigateToAI,
  onOpenProfileModal,
  onNavigateToAnalytics,
  onNavigateToHistory,
  recentWorkouts = [],
  personalRecords = []
}) => {
  // Calculate average recovery readiness score across all muscles (Fitbod style)
  const overallRecoveryScore = useMemo(() => {
    const list = Object.values(musclesData || {}) as MuscleExposureData[];
    if (list.length === 0) return 100;
    const scores = list.map(m => {
      if (m.freshnessStatus === 'fresh' || m.freshnessStatus === 'untrained') return 100;
      if (m.freshnessStatus === 'moderate') return 70;
      if (m.freshnessStatus === 'recently_trained') return 40;
      if (m.freshnessStatus === 'high_recent_exposure') return 20;
      return 100;
    });
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    return Math.max(0, Math.min(100, avg));
  }, [musclesData]);

  const streakDays = radar?.streakDays ?? 0;
  const workedOutToday = radar?.streakState?.workedOutToday;
  const isFrozen = radar?.streakState?.isFrozen;

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto w-full animate-in fade-in duration-300 pb-16">
      {/* ============================================================ */}
      {/* 1. TOP FITBOD HEADER BAR: STREAK & ATHLETE RECOVERY VIBE      */}
      {/* ============================================================ */}
      <div className="w-full flex items-center justify-between py-2 sm:py-3 mb-2 px-1">
        {/* Left: Athlete Identity & Overall Readiness */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenProfileModal}
            className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            title="Open Profile Settings"
          >
            {userProfile.name?.charAt(0) || 'A'}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {userProfile.name}
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                {userProfile.primaryGoal || 'Hypertrophy'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {overallRecoveryScore}% Recovered
              </span>
              <span>•</span>
              <span>Target: {userProfile.trainingDaysPerWeek || 4}d/wk</span>
            </div>
          </div>
        </div>

        {/* Right: Signature Glowing Streak Flame Badge */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl border transition-all ${
              workedOutToday
                ? 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200'
            }`}
          >
            <Flame
              className={`w-4 h-4 ${
                workedOutToday
                  ? 'text-orange-500 fill-orange-500 animate-pulse'
                  : 'text-orange-500 fill-orange-500'
              }`}
            />
            <span className="text-xs sm:text-sm font-black tracking-tight">
              {streakDays} {streakDays === 1 ? 'Day' : 'Days'}
            </span>

            {workedOutToday && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Workout logged today" />
            )}

            {isFrozen && !workedOutToday && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-300/40"
                title="Rest day freeze active"
              >
                ❄️
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. THE MAIN STAGE: FITBOD CENTERPIECE BODY MAP                */}
      {/* ============================================================ */}
      <div className="w-full flex flex-col items-center justify-center my-2 sm:my-4">
        <BodyMap
          musclesData={musclesData}
          onTrainMuscle={() => onStartRecommendedWorkout()}
          defaultView="front"
          hideHeader={false}
          className="max-w-2xl"
        />
      </div>

      {/* ============================================================ */}
      {/* 3. FITBOD MINIMALIST BOTTOM WORKOUT LAUNCH DOCK               */}
      {/* ============================================================ */}
      <div className="w-full max-w-xl mt-6 px-2 flex flex-col gap-3">
        {/* Primary Workout CTA Button */}
        <button
          id="fitbod-start-workout-main-btn"
          onClick={onStartRecommendedWorkout}
          className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-black text-sm uppercase tracking-wider flex items-center justify-between shadow-xl shadow-blue-600/25 transition-all cursor-pointer border border-blue-400/20"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
            <div className="text-left">
              <div className="font-extrabold text-sm text-white">Start Workout</div>
              <div className="text-[10px] text-blue-100 font-semibold lowercase tracking-normal">
                recovery-calibrated hypertrophy session
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-white bg-white/15 px-3 py-1 rounded-xl">
            <span>Launch</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </button>

        {/* Secondary Clean Actions Row */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            id="fitbod-blank-workout-btn"
            onClick={onStartEmptyWorkout}
            className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700/90 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200/60 dark:border-slate-700/60 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Blank Workout</span>
          </button>

          {onNavigateToAnalytics ? (
            <button
              onClick={onNavigateToAnalytics}
              className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700/90 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200/60 dark:border-slate-700/60 transition-all cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-blue-500" />
              <span>Full Analytics</span>
            </button>
          ) : (
            <button
              onClick={onNavigateToAI}
              className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700/90 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200/60 dark:border-slate-700/60 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>AI Coach</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
