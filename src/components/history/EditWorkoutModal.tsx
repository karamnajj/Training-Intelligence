import React, { useState, useMemo } from 'react';
import { Workout, WorkoutExercise, WorkoutSet, Exercise, MuscleId } from '../../types';
import { EXERCISES_MAP, isBodyweightExercise } from '../../lib/exerciseDatabase';
import { ExerciseSelectorModal } from '../workout/ExerciseSelectorModal';
import {
  Calendar,
  Clock,
  Trash2,
  Plus,
  X,
  Check,
  Dumbbell,
  AlertCircle,
  Save,
  Trophy
} from 'lucide-react';

interface EditWorkoutModalProps {
  workout: Workout;
  onSave: (updatedWorkout: Workout) => void;
  onClose: () => void;
  onDeleteWorkout?: (id: string) => void;
}

export const EditWorkoutModal: React.FC<EditWorkoutModalProps> = ({
  workout,
  onSave,
  onClose,
  onDeleteWorkout
}) => {
  // Convert startedAt to local YYYY-MM-DDTHH:mm string for datetime-local input
  const getInitialDateTimeLocal = (isoString?: string) => {
    const d = isoString ? new Date(isoString) : new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [workoutName, setWorkoutName] = useState(workout.name || 'Workout');
  const [dateTimeLocal, setDateTimeLocal] = useState(
    getInitialDateTimeLocal(workout.startedAt || workout.completedAt)
  );
  const [durationMinutes, setDurationMinutes] = useState(
    Math.max(5, Math.round((workout.durationSeconds || 3600) / 60))
  );
  const [workoutNotes, setWorkoutNotes] = useState(workout.notes || '');
  const [exercises, setExercises] = useState<WorkoutExercise[]>(() => {
    if (!workout.exercises) return [];
    return workout.exercises.map((ex: any, exIdx: number) => {
      let setsArr: any[] = [];
      if (Array.isArray(ex.sets)) {
        setsArr = ex.sets;
      } else if (ex.sets && typeof ex.sets === 'object') {
        setsArr = Object.values(ex.sets);
      } else if (typeof ex.sets === 'number') {
        setsArr = Array.from({ length: ex.sets }).map((_, sIdx) => ({
          id: `s_${exIdx}_${sIdx}`,
          setNumber: sIdx + 1,
          type: 'normal',
          weightKg: ex.weightKg || 0,
          reps: ex.reps || 0,
          completed: false
        }));
      }
      return {
        ...ex,
        sets: setsArr
      };
    });
  });

  const [showExerciseSelector, setShowExerciseSelector] = useState(false);

  // Recalculate totals
  const stats = useMemo(() => {
    let volume = 0;
    let completedSets = 0;
    const targetedMuscles = new Set<MuscleId>();

    exercises.forEach(ex => {
      const def = EXERCISES_MAP[ex.exerciseId];
      const setsArr = Array.isArray(ex.sets) ? ex.sets : [];
      setsArr.forEach(s => {
        if (s && s.completed && s.type !== 'warmup') {
          volume += (s.weightKg || 0) * (s.reps || 0);
          completedSets++;
          if (def?.muscles) {
            def.muscles.forEach(m => targetedMuscles.add(m.muscleId));
          }
        }
      });
    });

    return {
      volume: Math.round(volume),
      completedSets,
      targetedMuscles: Array.from(targetedMuscles)
    };
  }, [exercises]);

  const handleAddExercise = (ex: Exercise) => {
    const isBW = ex.equipment === 'bodyweight' || isBodyweightExercise(ex.id, ex.name, ex.equipment);

    setExercises(prev => [
      ...prev,
      {
        id: `we_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        exerciseId: ex.id,
        exerciseName: ex.name,
        isBodyweight: isBW,
        sets: [
          {
            id: `s_${Date.now()}_1`,
            setNumber: 1,
            type: 'normal',
            isBodyweight: isBW,
            weightKg: 0,
            reps: 0,
            completed: false
          },
          {
            id: `s_${Date.now()}_2`,
            setNumber: 2,
            type: 'normal',
            isBodyweight: isBW,
            weightKg: 0,
            reps: 0,
            completed: false
          },
          {
            id: `s_${Date.now()}_3`,
            setNumber: 3,
            type: 'normal',
            isBodyweight: isBW,
            weightKg: 0,
            reps: 0,
            completed: false
          }
        ]
      }
    ]);
  };

  const handleRemoveExercise = (exIdx: number) => {
    setExercises(prev => {
      const remaining = prev.filter((_, i) => i !== exIdx);
      const totalRemainingSets = remaining.reduce(
        (sum, e) => sum + (Array.isArray(e.sets) ? e.sets.length : 0),
        0
      );
      if (totalRemainingSets === 0 || remaining.length === 0) {
        if (onDeleteWorkout) {
          onDeleteWorkout(workout.id);
        }
        onClose();
        return [];
      }
      return remaining;
    });
  };

  const handleToggleExerciseBodyweight = (exIdx: number) => {
    setExercises(prev => {
      const updated = [...prev];
      const target = updated[exIdx];
      const def = EXERCISES_MAP[target.exerciseId];
      const isBWCompatible = isBodyweightExercise(target.exerciseId, target.exerciseName, def?.equipment);
      if (!isBWCompatible) return prev;

      const currentIsBW = target.isBodyweight ?? true;
      const nextIsBW = !currentIsBW;

      updated[exIdx] = {
        ...target,
        isBodyweight: nextIsBW,
        sets: (target.sets || []).map((s: any) => ({
          ...s,
          isBodyweight: nextIsBW,
          weightKg: nextIsBW ? 0 : (s.weightKg && s.weightKg !== 0 ? s.weightKg : 20)
        }))
      };
      return updated;
    });
  };

  const handleUpdateSetMultiple = (
    exIdx: number,
    sIdx: number,
    updates: Partial<WorkoutSet>
  ) => {
    setExercises(prev => {
      const updated = [...prev];
      updated[exIdx].sets[sIdx] = {
        ...updated[exIdx].sets[sIdx],
        ...updates
      };
      return updated;
    });
  };

  const handleAddSet = (exIdx: number) => {
    setExercises(prev => {
      const updated = [...prev];
      if (!Array.isArray(updated[exIdx].sets)) {
        updated[exIdx].sets = [];
      }
      const currentSets = updated[exIdx].sets;
      const lastSet = currentSets[currentSets.length - 1];
      const def = EXERCISES_MAP[updated[exIdx].exerciseId];
      const isBWCompatible = isBodyweightExercise(updated[exIdx].exerciseId, updated[exIdx].exerciseName, def?.equipment);
      const isBW = isBWCompatible ? (updated[exIdx].isBodyweight ?? true) : false;
      const lastSetIsBW = lastSet ? (lastSet.isBodyweight ?? isBW) : isBW;

      currentSets.push({
        id: `s_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        setNumber: currentSets.length + 1,
        type: 'normal',
        isBodyweight: isBW ? lastSetIsBW : false,
        weightKg: 0,
        reps: 0,
        completed: false
      });
      return updated;
    });
  };

  const handleRemoveSet = (exIdx: number, setIdx: number) => {
    setExercises(prev => {
      const updated = [...prev];
      const curr = Array.isArray(updated[exIdx]?.sets) ? updated[exIdx].sets : [];
      const filteredSets = curr
        .filter((_, i) => i !== setIdx)
        .map((s, idx) => ({ ...s, setNumber: idx + 1 }));

      updated[exIdx] = {
        ...updated[exIdx],
        sets: filteredSets
      };

      const remainingExercises = updated.filter(
        e => Array.isArray(e.sets) && e.sets.length > 0
      );

      const totalRemainingSets = remainingExercises.reduce(
        (sum, e) => sum + (e.sets?.length || 0),
        0
      );

      if (totalRemainingSets === 0) {
        if (onDeleteWorkout) {
          onDeleteWorkout(workout.id);
        }
        onClose();
        return [];
      }

      return remainingExercises;
    });
  };

  const handleUpdateSet = (
    exIdx: number,
    setIdx: number,
    field: keyof WorkoutSet,
    val: any
  ) => {
    setExercises(prev => {
      const updated = [...prev];
      if (!Array.isArray(updated[exIdx].sets)) {
        updated[exIdx].sets = [];
      }
      updated[exIdx].sets[setIdx] = {
        ...updated[exIdx].sets[setIdx],
        [field]: val
      };
      return updated;
    });
  };

  const handleSave = () => {
    if (!workoutName.trim()) return;

    const totalRemainingSets = exercises.reduce(
      (sum, e) => sum + (Array.isArray(e.sets) ? e.sets.length : 0),
      0
    );

    if (totalRemainingSets === 0) {
      if (onDeleteWorkout) {
        onDeleteWorkout(workout.id);
      }
      onClose();
      return;
    }

    const chosenDate = new Date(dateTimeLocal);
    const durationSec = durationMinutes * 60;
    const completedDate = new Date(chosenDate.getTime() + durationSec * 1000);

    const updatedWorkout: Workout = {
      ...workout,
      name: workoutName.trim(),
      startedAt: chosenDate.toISOString(),
      completedAt: completedDate.toISOString(),
      durationSeconds: durationSec,
      notes: workoutNotes.trim(),
      exercises: exercises,
      totalVolumeKg: stats.volume,
      totalSets: stats.completedSets,
      musclesTrained: stats.targetedMuscles
    };

    onSave(updatedWorkout);
    onClose();
  };

  // Quick Preset Handlers
  const handleSetToday = () => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    setDateTimeLocal(
      `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(
        now.getHours()
      )}:${pad(now.getMinutes())}`
    );
  };

  const handleSetYesterday = () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const pad = (n: number) => n.toString().padStart(2, '0');
    setDateTimeLocal(
      `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(
        yesterday.getDate()
      )}T12:00`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Edit Workout Record
              </h3>
              {(workout.prCount ?? 0) > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 dark:bg-amber-500/25 text-amber-700 dark:text-amber-300 font-extrabold text-xs border border-amber-500/35">
                  <Trophy className="w-3 h-3 text-amber-500 fill-amber-500" />
                  {workout.prCount} PR{workout.prCount === 1 ? '' : 's'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Change workout date, time, exercises, weights, and reps.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs sm:text-sm">
          {/* Workout Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Workout Title *
            </label>
            <input
              type="text"
              value={workoutName}
              onChange={e => setWorkoutName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date & Time and Duration Picker */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Specify Workout Date & Time
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSetToday}
                  className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-[10px] font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                >
                  Now / Today
                </button>
                <button
                  type="button"
                  onClick={handleSetYesterday}
                  className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  Yesterday
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Session Date & Start Time
                </label>
                <input
                  type="datetime-local"
                  value={dateTimeLocal}
                  onChange={e => setDateTimeLocal(e.target.value)}
                  className="w-full p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="360"
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(Math.max(1, parseInt(e.target.value) || 45))}
                  className="w-full p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Exercises & Sets Editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white">
                Logged Exercises ({exercises.length}) • {stats.volume.toLocaleString()} kg Volume
              </label>
              <button
                type="button"
                onClick={() => setShowExerciseSelector(true)}
                className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Exercise
              </button>
            </div>

            <div className="space-y-4">
              {exercises.map((ex, exIdx) => {
                const def = EXERCISES_MAP[ex.exerciseId];
                const isBWCompatible = isBodyweightExercise(ex.exerciseId, ex.exerciseName, def?.equipment);
                const isBW = isBWCompatible ? (ex.isBodyweight ?? true) : false;

                return (
                  <div
                    key={ex.id || exIdx}
                    className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                          {exIdx + 1}. {ex.exerciseName}
                        </span>
                        {/* Bodyweight toggle button - only if bodyweight compatible */}
                        {isBWCompatible && (
                          <button
                            type="button"
                            onClick={() => handleToggleExerciseBodyweight(exIdx)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[10px] transition-all border ${
                              isBW
                                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                            title={isBW ? "Bodyweight mode active. Click to switch to barbell/free weight." : "Switch to Bodyweight mode (BW)"}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isBW ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            {isBW ? 'Bodyweight (BW)' : 'Bodyweight'}
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveExercise(exIdx)}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Remove Exercise"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Sets table */}
                    <div className="space-y-1.5">
                      {(Array.isArray(ex.sets) ? ex.sets : []).map((s, sIdx) => {
                        const setBW = isBW ? (s.isBodyweight ?? true) : false;
                        return (
                          <div
                            key={s.id || sIdx}
                            className="flex items-center gap-2 text-xs"
                          >
                            <div className="w-14 flex items-center gap-1 font-bold text-slate-500 font-mono text-[11px] shrink-0">
                              <span>Set {s.setNumber}</span>
                              {s.isPR && (
                                <span
                                  className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/35 text-[9px] font-black uppercase shadow-2xs"
                                  title="Personal Record"
                                >
                                  <Trophy className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                                  PR
                                </span>
                              )}
                            </div>

                            <select
                              value={s.type}
                              onChange={e => handleUpdateSet(exIdx, sIdx, 'type', e.target.value)}
                              className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-medium"
                            >
                              <option value="normal">Normal</option>
                              <option value="warmup">Warmup</option>
                              <option value="drop">Drop</option>
                              <option value="failure">Failure</option>
                            </select>

                            <div className="flex items-center gap-1.5 flex-1">
                              <div className="relative">
                                <input
                                  type="number"
                                  step="0.5"
                                  min="0"
                                  value={s.weightKg === 0 || !s.weightKg ? '' : s.weightKg}
                                  onFocus={e => e.target.select()}
                                  onChange={e => {
                                    const raw = e.target.value;
                                    if (raw === '') {
                                      handleUpdateSet(
                                        exIdx,
                                        sIdx,
                                        'weightKg',
                                        0
                                      );
                                      return;
                                    }
                                    const cleaned = raw.replace(/^0+(?=\d)/, '');
                                    const val = parseFloat(cleaned);
                                    handleUpdateSet(
                                      exIdx,
                                      sIdx,
                                      'weightKg',
                                      isNaN(val) ? 0 : val
                                    );
                                  }}
                                  className={`w-20 pl-1.5 pr-6 py-1.5 rounded-lg bg-white dark:bg-slate-900 border font-mono font-bold text-center text-xs ${
                                    setBW && (s.weightKg === 0 || !s.weightKg)
                                      ? 'border-emerald-500/50 placeholder:text-emerald-500'
                                      : 'border-slate-200 dark:border-slate-700'
                                  }`}
                                  placeholder={setBW ? 'BW' : 'kg'}
                                />
                                {setBW && (s.weightKg === 0 || !s.weightKg) && (
                                  <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-extrabold text-emerald-500 uppercase">
                                    BW
                                  </span>
                                )}
                              </div>

                              {isBW && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentlyBW = setBW;
                                    if (!currentlyBW || (s.weightKg ?? 0) > 0) {
                                      handleUpdateSetMultiple(exIdx, sIdx, {
                                        isBodyweight: true,
                                        weightKg: 0
                                      });
                                    } else {
                                      handleUpdateSetMultiple(exIdx, sIdx, {
                                        isBodyweight: false,
                                        weightKg: 20
                                      });
                                    }
                                  }}
                                  className={`px-1.5 py-1 rounded text-[10px] font-bold border transition-colors ${
                                    setBW && (s.weightKg === 0 || !s.weightKg)
                                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/40'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white'
                                  }`}
                                  title={setBW ? "Bodyweight set. Click to enter weight." : "Set to Bodyweight (BW)"}
                                >
                                  BW
                                </button>
                              )}

                              <span className="text-slate-400 text-xs">{setBW && (s.weightKg ?? 0) > 0 ? '+kg ×' : (setBW ? 'BW ×' : 'kg ×')}</span>
                              <input
                                type="number"
                                min="1"
                                value={s.reps === 0 || !s.reps ? '' : s.reps}
                                onFocus={e => e.target.select()}
                                onChange={e => {
                                  const raw = e.target.value;
                                  if (raw === '') {
                                    handleUpdateSet(
                                      exIdx,
                                      sIdx,
                                      'reps',
                                      0
                                    );
                                    return;
                                  }
                                  const cleaned = raw.replace(/^0+(?=\d)/, '');
                                  const val = parseInt(cleaned, 10);
                                  handleUpdateSet(
                                    exIdx,
                                    sIdx,
                                    'reps',
                                    isNaN(val) ? 0 : val
                                  );
                                }}
                                className="w-16 p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold text-center text-xs"
                                placeholder="reps"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleUpdateSet(exIdx, sIdx, 'completed', !s.completed)}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                                s.completed
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                              }`}
                              title="Toggle completed"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemoveSet(exIdx, sIdx)}
                              className="p-1 text-slate-400 hover:text-rose-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => handleAddSet(exIdx)}
                        className="mt-1 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Set
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Session Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Session Notes
            </label>
            <textarea
              rows={2}
              value={workoutNotes}
              onChange={e => setWorkoutNotes(e.target.value)}
              placeholder="Session reflections..."
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Total: <strong>{stats.volume.toLocaleString()} kg</strong> •{' '}
            <strong>{stats.completedSets} sets</strong>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!workoutName.trim()}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" /> Save Changes
            </button>
          </div>
        </div>
      </div>

      {showExerciseSelector && (
        <ExerciseSelectorModal
          onSelect={handleAddExercise}
          onClose={() => setShowExerciseSelector(false)}
        />
      )}
    </div>
  );
};
