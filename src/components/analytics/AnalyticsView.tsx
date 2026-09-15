import React, { useState } from 'react';
import {
  Workout,
  PersonalRecord,
  MuscleExposureData,
  TrainingRadar,
  MuscleId,
  UserProfile
} from '../../types';
import { MUSCLE_CATALOG } from '../../lib/muscleMath';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Award,
  TrendingUp,
  Activity,
  Layers,
  Calendar,
  Filter,
  BarChart3,
  Flame
} from 'lucide-react';

interface AnalyticsViewProps {
  workouts: Workout[];
  personalRecords: PersonalRecord[];
  musclesData: Record<MuscleId, MuscleExposureData>;
  radar: TrainingRadar;
  userProfile?: UserProfile;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  workouts,
  personalRecords,
  musclesData,
  radar,
  userProfile
}) => {
  const [selectedExerciseForPR, setSelectedExerciseForPR] = useState<string>('all');

  // Prepare Volume Over Time data (Last 10 workouts)
  const volumeChartData = workouts
    .slice(0, 10)
    .reverse()
    .map(w => ({
      date: new Date(w.completedAt || w.startedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      }),
      volumeKg: w.totalVolumeKg || 0,
      sets: w.totalSets || 0,
      name: w.name
    }));

  // Prepare Muscle 7-Day Exposure Bar Data
  const muscleVolumeData = (Object.values(musclesData) as MuscleExposureData[])
    .map(m => ({
      name: MUSCLE_CATALOG[m.muscleId]?.name.split(' ')[0] || m.muscleId,
      sets7d: m.effectiveSets7d,
      sets30d: m.effectiveSets30d,
      status: m.freshnessStatus
    }))
    .sort((a, b) => b.sets7d - a.sets7d);

  // Push vs Pull vs Legs ratio calculated from workouts
  let pushVol = 0;
  let pullVol = 0;
  let legsVol = 0;

  for (const w of workouts) {
    for (const ex of w.exercises || []) {
      const exName = (ex.exerciseName || ex.exerciseId || '').toLowerCase();
      const rawSets: any[] = Array.isArray(ex?.sets)
        ? ex.sets
        : (ex?.sets && typeof ex.sets === 'object'
          ? Object.values(ex.sets)
          : (typeof ex?.sets === 'number'
            ? Array.from({ length: ex.sets }).map(() => ({ completed: true, weightKg: (ex as any).suggestedWeightKg || (ex as any).weightKg || 0, reps: (ex as any).repMin || (ex as any).reps || 10 }))
            : []));
      const exVol = rawSets.reduce(
        (sum, s) => sum + (s && s.completed && s.type !== 'warmup' ? (Number(s.weightKg) || 0) * (Number(s.reps) || 0) : 0),
        0
      );
      if (
        exName.includes('press') ||
        exName.includes('push') ||
        exName.includes('chest') ||
        exName.includes('tricep') ||
        exName.includes('lateral raise') ||
        exName.includes('dip')
      ) {
        pushVol += exVol;
      } else if (
        exName.includes('row') ||
        exName.includes('pull') ||
        exName.includes('chin') ||
        exName.includes('lat') ||
        exName.includes('bicep') ||
        exName.includes('curl') ||
        exName.includes('face pull')
      ) {
        pullVol += exVol;
      } else {
        legsVol += exVol;
      }
    }
  }

  const movementBalanceData = [
    { name: 'Push Volume', value: pushVol || 1, color: '#3b82f6' },
    { name: 'Pull Volume', value: pullVol || 1, color: '#10b981' },
    { name: 'Legs Volume', value: legsVol || 1, color: '#8b5cf6' }
  ];

  // Filtered PR list
  const filteredPRs = personalRecords.filter(pr => {
    if (selectedExerciseForPR === 'all') return true;
    return pr.exerciseId === selectedExerciseForPR;
  });

  // Unique exercise list for PR filtering
  const prExerciseOptions = Array.from(
    new Map(personalRecords.map(pr => [pr.exerciseId, pr.exerciseName])).entries()
  ).map(([id, name]) => ({ id, name }));

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Performance Analytics & Strength Records
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Quantitative tracking across training tonnage, anatomical stimulus distribution, and estimated 1RMs.
        </p>
      </div>

      {/* Top Key Training Vitals & Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* 1. Habit Streak */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" /> Streak
            </span>
            {radar.streakState?.workedOutToday ? (
              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                Today ✓
              </span>
            ) : radar.streakState?.isFrozen ? (
              <span className="text-[9px] font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 border border-sky-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                ❄️ Frozen (Rest)
              </span>
            ) : null}
          </div>
          <p className="mt-1.5 text-xl font-black text-slate-900 dark:text-white">
            {radar.streakDays}{' '}
            <span className="text-xs font-medium text-slate-400">days</span>
          </p>
          <div className="flex items-center gap-1 mt-2">
            {(radar.streakState?.daysThisWeek || []).map((day, idx) => (
              <div
                key={idx}
                title={`${day.dayName}: ${day.trained ? 'Trained' : day.isRestDayFreeze ? 'Rest Day (Streak Frozen)' : 'Rest'}${day.isToday ? ' (Today)' : ''}`}
                className={`w-2.5 h-1.5 rounded-full transition-colors ${
                  day.trained
                    ? 'bg-orange-500'
                    : day.isRestDayFreeze
                    ? 'bg-sky-400 dark:bg-sky-500'
                    : day.isToday
                    ? 'bg-orange-400/40 ring-1 ring-orange-500'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
          {radar.streakState?.streakMessage && (
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {radar.streakState.streakMessage}
            </p>
          )}
        </div>

        {/* 2. Frequency */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-500" /> 7D Frequency
          </span>
          <p className="mt-1.5 text-xl font-black text-slate-900 dark:text-white">
            {radar.weeklyWorkoutsCount}{' '}
            <span className="text-xs font-medium text-slate-400">/ {userProfile?.trainingDaysPerWeek || 4}d</span>
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block truncate">
            Target: {userProfile?.trainingDaysPerWeek || 4} days/wk
          </span>
        </div>

        {/* 3. Weekly Volume */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-blue-500" /> Weekly Load
          </span>
          <p className="mt-1.5 text-xl font-black text-slate-900 dark:text-white">
            {radar.weeklyVolumeKg.toLocaleString()}{' '}
            <span className="text-xs font-medium text-slate-400">kg</span>
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block truncate">
            {radar.weeklyTotalSets} effective sets
          </span>
        </div>

        {/* 4. Push / Pull Ratio */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-purple-500" /> Push / Pull
          </span>
          <p className="mt-1.5 text-xl font-black text-blue-600 dark:text-blue-400">
            {radar.pushPullRatio}x
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block truncate">
            {radar.pushPullRatio >= 0.8 && radar.pushPullRatio <= 1.3
              ? 'Balanced'
              : radar.pushPullRatio > 1.3
              ? 'Push dominant'
              : 'Pull dominant'}
          </span>
        </div>

        {/* 5. Lifetime Tonnage */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-slate-400" /> Total Tonnage
          </span>
          <p className="mt-1.5 text-xl font-black text-slate-900 dark:text-white">
            {workouts.reduce((acc, w) => acc + (w.totalVolumeKg || 0), 0).toLocaleString()}{' '}
            <span className="text-xs font-medium text-slate-400">kg</span>
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block truncate">
            {workouts.length} total workouts
          </span>
        </div>

        {/* 6. Personal Records */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-500" /> Records (PRs)
          </span>
          <p className="mt-1.5 text-xl font-black text-amber-500">
            {personalRecords.length}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block truncate">
            Verified 1RM records
          </span>
        </div>
      </div>

      {/* Chart Row 1: Volume Progression & Movement Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Volume Over Time (2 cols) */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                Training Volume Progression (kg)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total load lifted per session over your recent workout timeline.
              </p>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full pt-4">
            {volumeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeChartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      border: '1px solid #334155',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="volumeKg" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Volume (kg)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Log at least one workout to display volume charts.
              </div>
            )}
          </div>
        </div>

        {/* Push vs Pull Distribution (1 col) */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-500" />
              Volume Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Structural balance between Push, Pull, and Lower-body loading.
            </p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={movementBalanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {movementBalanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            {movementBalanceData.map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {item.value.toLocaleString()} kg
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Row 2: 7-Day Sets per Muscle Group */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500" />
            7-Day Effective Sets per Muscle Group
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Scientifically optimal hypertrophy volume benchmark is 10–20 hard sets per muscle per week.
          </p>
        </div>

        <div className="h-64 sm:h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={muscleVolumeData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  border: '1px solid #334155',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="sets7d" fill="#10b981" radius={[4, 4, 0, 0]} name="7-Day Effective Sets" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Personal Records Table */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Verified Personal Records Leaderboard
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Estimated 1-Rep Max calculations based on the Brzycki formula.
            </p>
          </div>

          {/* Exercise Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedExerciseForPR}
              onChange={e => setSelectedExerciseForPR(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="all">All Exercises</option>
              {prExerciseOptions.map(opt => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* PR Records Grid/Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">Exercise</th>
                <th className="py-3 px-3">Max Weight Lifted</th>
                <th className="py-3 px-3">Reps Achieved</th>
                <th className="py-3 px-3 font-bold text-blue-600 dark:text-blue-400">Estimated 1RM</th>
                <th className="py-3 px-3">Achieved On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPRs.map((pr, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    {pr.exerciseName}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                    {pr.maxWeightKg} kg
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                    {pr.maxReps} reps
                  </td>
                  <td className="py-3 px-3 font-mono font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                    {pr.estimated1RMKg} kg
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {new Date(pr.achievedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
