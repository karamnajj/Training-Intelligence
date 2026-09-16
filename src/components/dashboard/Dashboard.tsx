import React from 'react';
import {
  TrainingRadar,
  MuscleExposureData,
  Workout,
  PersonalRecord,
  UserProfile,
  MuscleId
} from '../../types';
import { BodyMap } from '../bodymap/BodyMap';
import { MUSCLE_CATALOG } from '../../lib/muscleMath';
import {
  Zap,
  Sparkles,
  Plus,
  Play,
  Flame
} from 'lucide-react';

interface DashboardProps {
  radar: TrainingRadar;
  musclesData: Record<MuscleId, MuscleExposureData>;
  userProfile: UserProfile;
  onStartEmptyWorkout: () => void;
  onStartRecommendedWorkout: () => void;
  onNavigateToAI: () => void;
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
  onNavigateToAI
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. TOP SECTION: ATHLETE STATUS & MINIMAL WORKOUT LAUNCH BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
            {userProfile.name?.charAt(0) || 'A'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {userProfile.name}
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                {userProfile.primaryGoal}
              </span>
            </div>
            {/* Streak directly under account name */}
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                <Flame className="w-3.5 h-3.5 fill-current text-orange-500" />
                {radar.streakDays}d streak
                {radar.streakState?.workedOutToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5" title="Workout completed today" />
                )}
              </span>
              {radar.streakState?.isFrozen && (
                <span
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-[10px] font-bold text-sky-700 dark:text-sky-300"
                  title="Rest Day Freeze: Streak is protected! Log today to keep your streak blazing."
                >
                  <span className="text-[11px]">❄️</span> Rest Day Freeze
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Action Workout Launch Buttons */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            id="start-empty-workout-header-btn"
            onClick={onStartEmptyWorkout}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs transition-all active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Blank Workout</span>
          </button>

          <button
            id="start-ai-recommended-btn"
            onClick={onStartRecommendedWorkout}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm shadow-blue-500/20 transition-all active:scale-[0.98]"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Start Today's Focus</span>
          </button>
        </div>
      </div>

      {/* 2. PRIMARY CENTERPIECE: ANATOMICAL RECOVERY BODY DIAGRAM & TODAY'S FOCUS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT / CENTER (8 Cols): Anatomical Recovery Body Map */}
        <div className="lg:col-span-8">
          <BodyMap musclesData={musclesData} />
        </div>

        {/* RIGHT (4 Cols): Today's Session Opportunity & AI Readiness */}
        <div className="lg:col-span-4 space-y-4">
          {/* Today's Recommendation Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white border border-blue-800/40 shadow-md relative overflow-hidden flex flex-col justify-between">
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[11px] font-bold uppercase tracking-wider">
                  <Zap className="w-3 h-3 text-blue-400" />
                  Today's Prime Target
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  ~{radar.suggestedFocusToday.estimatedDurationMinutes}m
                </span>
              </div>

              <h2 className="text-lg font-black text-white leading-snug">
                {radar.suggestedFocusToday.title}
              </h2>

              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                {radar.suggestedFocusToday.rationale}
              </p>

              {/* Target Muscles Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {radar.suggestedFocusToday.muscles.map(mId => {
                  const exp = musclesData[mId];
                  const isUntrained = exp?.freshnessStatus === 'untrained' || (!exp?.lastTrainedAt && (exp?.effectiveSets30d || 0) === 0);
                  return (
                    <span
                      key={mId}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 ${
                        isUntrained
                          ? 'bg-amber-500/20 border border-amber-400/40 text-amber-300'
                          : 'bg-emerald-500/20 border border-emerald-400/30 text-emerald-300'
                      }`}
                    >
                      {MUSCLE_CATALOG[mId]?.name || mId}
                      {isUntrained && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1 rounded bg-amber-400/30 text-amber-200">
                          Untrained
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="relative z-10 mt-4 pt-3 border-t border-white/10 space-y-2">
              <button
                onClick={onStartRecommendedWorkout}
                className="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Launch Recommended Session
              </button>
            </div>

            {/* Subtle background glow */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* AI Trainer Coach Insight */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> AI Coach Insight
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {radar.highExposureMuscles.length > 0
                ? `Your ${radar.highExposureMuscles[0].name} is recovering. Stimulating ${radar.recoveredMuscles.slice(0, 2).map(m => m.name).join(' & ')} today will optimize your hypertrophy curve.`
                : 'All anatomical groups are fresh and primed for maximum mechanical tension and strength progression.'}
            </p>

            <button
              onClick={onNavigateToAI}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 pt-1 self-start"
            >
              Ask AI Trainer &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

