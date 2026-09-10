import React, { useState } from 'react';
import { Workout, MuscleId } from '../../types';
import { MUSCLE_CATALOG } from '../../lib/muscleMath';
import { EditWorkoutModal } from './EditWorkoutModal';
import {
  Calendar,
  Clock,
  Activity,
  RotateCcw,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  Search,
  Dumbbell,
  Plus
} from 'lucide-react';

interface HistoryViewProps {
  workouts: Workout[];
  onRepeatWorkout: (workout: Workout) => void;
  onUpdateWorkout: (workout: Workout) => void;
  onDeleteWorkout: (id: string) => void;
  onStartNewWorkout: () => void;
  onRestoreHistory?: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  workouts,
  onRepeatWorkout,
  onUpdateWorkout,
  onDeleteWorkout,
  onStartNewWorkout,
  onRestoreHistory
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(
    workouts[0]?.id || null
  );
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);

  const filteredWorkouts = workouts.filter(w => {
    const matchesName = w.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExercises = w.exercises?.some(e =>
      e.exerciseName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return matchesName || matchesExercises;
  });

  const toggleExpand = (id: string) => {
    setExpandedWorkoutId(prev => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Workout History & Logbook
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-bold text-xs border border-blue-200 dark:border-blue-900/60">
              {workouts.length} {workouts.length === 1 ? 'Session' : 'Sessions'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Complete historical audit of all recorded sessions, set loads, exercise dates, and notes.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {onRestoreHistory && (
            <button
              onClick={onRestoreHistory}
              title="Synchronize and refresh workouts from database"
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs shadow-2xs transition-all active:scale-[0.98]"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Sync Logbook</span>
            </button>
          )}

          <button
            onClick={onStartNewWorkout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" /> Log New Workout
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter history by workout title or exercise name..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Workouts Timeline Feed */}
      <div className="space-y-4">
        {filteredWorkouts.length > 0 ? (
          filteredWorkouts.map(w => {
            const isExpanded = expandedWorkoutId === w.id;
            const workoutDate = new Date(w.completedAt || w.startedAt || Date.now());

            return (
              <div
                key={w.id}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-all"
              >
                {/* Clickable Summary Bar */}
                <div
                  onClick={() => toggleExpand(w.id)}
                  className="p-5 sm:p-6 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                        {w.name}
                      </h3>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
                        {Math.round((w.durationSeconds || 0) / 60)} min
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        {workoutDate.toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}{' '}
                        at{' '}
                        {workoutDate.toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {w.totalVolumeKg?.toLocaleString()} kg volume
                      </span>
                      <span>•</span>
                      <span>{w.totalSets} completed sets</span>
                    </div>
                  </div>

                  {/* Right Actions & Expand Caret */}
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setEditingWorkout(w)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Edit workout date, sets, and exercises"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>

                    <button
                      onClick={() => onRepeatWorkout(w)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Repeat
                    </button>

                    <button
                      onClick={() => onDeleteWorkout(w.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Delete workout record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => toggleExpand(w.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Set Details */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    {w.notes && (
                      <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200">
                        <strong>Session Notes:</strong> {w.notes}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {w.exercises?.map((ex, i) => (
                        <div
                          key={ex.id || i}
                          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
                        >
                          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                              {i + 1}. {ex.exerciseName}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {ex.sets.filter(s => s.completed).length} work sets
                            </span>
                          </div>

                          <div className="space-y-1 text-xs font-mono">
                            {ex.sets.map((s, sIdx) => (
                              <div
                                key={s.id || sIdx}
                                className="flex items-center justify-between py-1 text-slate-600 dark:text-slate-300"
                              >
                                <span>
                                  Set {s.setNumber} ({s.type})
                                </span>
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {s.weightKg} kg × {s.reps} reps
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-4">
            <Dumbbell className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No workouts matching your view.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Log a new session or click below to restore your complete recorded history.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
              {onRestoreHistory && (
                <button
                  onClick={onRestoreHistory}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-bold text-xs shadow-2xs transition-all active:scale-[0.98]"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Restore Workout History
                </button>
              )}
              <button
                onClick={onStartNewWorkout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5" />
                Log New Workout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Workout Modal */}
      {editingWorkout && (
        <EditWorkoutModal
          workout={editingWorkout}
          onSave={updated => {
            onUpdateWorkout(updated);
            setEditingWorkout(null);
          }}
          onClose={() => setEditingWorkout(null)}
        />
      )}
    </div>
  );
};
