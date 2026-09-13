import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Workout,
  WorkoutExercise,
  WorkoutSet,
  Exercise,
  MuscleId
} from '../../types';
import { EXERCISES_MAP } from '../../lib/exerciseDatabase';
import {
  calculateProgressiveOverload,
  MUSCLE_CATALOG
} from '../../lib/muscleMath';
import { ExerciseSelectorModal } from './ExerciseSelectorModal';
import { PlateCalculatorModal } from './PlateCalculatorModal';
import {
  Clock,
  Plus,
  Trash2,
  Check,
  Disc,
  TrendingUp,
  RotateCcw,
  Calendar,
  Settings2,
  X,
  AlertCircle,
  Dumbbell
} from 'lucide-react';

interface ActiveWorkoutProps {
  initialWorkout?: Partial<Workout>;
  previousWorkouts: Workout[];
  onFinishWorkout: (workout: Workout) => void;
  onCancelWorkout: () => void;
}

export const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({
  initialWorkout,
  previousWorkouts,
  onFinishWorkout,
  onCancelWorkout
}) => {
  // Convert date to datetime-local string
  const toDateTimeLocal = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  };

  // Workout Metadata State
  const [workoutName, setWorkoutName] = useState(initialWorkout?.name || 'Live Workout Session');
  const [workoutNotes, setWorkoutNotes] = useState(initialWorkout?.notes || '');
  
  // Date and Time State: Default is now
  const [workoutDateTime, setWorkoutDateTime] = useState<string>(
    initialWorkout?.startedAt
      ? toDateTimeLocal(new Date(initialWorkout.startedAt))
      : toDateTimeLocal(new Date())
  );
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);

  // Exercises State: default to empty (no default bench press)
  const [exercises, setExercises] = useState<WorkoutExercise[]>(
    initialWorkout?.exercises ? [...initialWorkout.exercises] : []
  );

  // Timer State
  const [startTime] = useState<Date>(
    initialWorkout?.startedAt ? new Date(initialWorkout.startedAt) : new Date()
  );
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // Rest Timer State
  const [restTimerSeconds, setRestTimerSeconds] = useState<number | null>(null);
  const [restTimerTotal, setRestTimerTotal] = useState<number>(90);
  const restIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Modals
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [substitutingExerciseIndex, setSubstitutingExerciseIndex] = useState<number | null>(null);
  const [showPlateCalculator, setShowPlateCalculator] = useState(false);
  const [plateCalcInitialWeight, setPlateCalcInitialWeight] = useState<number>(60);
  const [showFinishModal, setShowFinishModal] = useState(false);

  // Keep ActiveWorkout state synchronized whenever initialWorkout prop changes or is updated
  useEffect(() => {
    if (initialWorkout) {
      if (initialWorkout.name) setWorkoutName(initialWorkout.name);
      if (initialWorkout.notes !== undefined) setWorkoutNotes(initialWorkout.notes || '');
      if (initialWorkout.startedAt) {
        setWorkoutDateTime(toDateTimeLocal(new Date(initialWorkout.startedAt)));
      }
      if (Array.isArray(initialWorkout.exercises)) {
        setExercises(initialWorkout.exercises);
      }
    }
  }, [initialWorkout]);

  // Live Workout Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  // Rest Timer Countdown effect
  useEffect(() => {
    if (restTimerSeconds !== null && restTimerSeconds > 0) {
      restIntervalRef.current = setInterval(() => {
        setRestTimerSeconds(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(restIntervalRef.current as any);
            try {
              const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(587.33, ctx.currentTime);
              gain.gain.setValueAtTime(0.1, ctx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 0.5);
            } catch {
              // audio context fallback
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, [restTimerSeconds]);

  const startRestTimer = (seconds: number) => {
    setRestTimerTotal(seconds);
    setRestTimerSeconds(seconds);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Find previous performance for progressive overload
  const getPreviousPerformance = (exerciseId: string) => {
    for (const w of previousWorkouts) {
      const match = w.exercises?.find(e => e.exerciseId === exerciseId);
      if (match && match.sets.length > 0) {
        return match;
      }
    }
    return null;
  };

  // Exercise Management
  const handleAddExercise = (selected: Exercise) => {
    if (substitutingExerciseIndex !== null) {
      // Substitute existing exercise
      setExercises(prev => {
        const updated = [...prev];
        updated[substitutingExerciseIndex] = {
          ...updated[substitutingExerciseIndex],
          exerciseId: selected.id,
          exerciseName: selected.name
        };
        return updated;
      });
      setSubstitutingExerciseIndex(null);
    } else {
      // Add new exercise
      const newEx: WorkoutExercise = {
        id: `we_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        exerciseId: selected.id,
        exerciseName: selected.name,
        targetRestSeconds: 90,
        sets: [
          {
            id: `s_${Date.now()}_1`,
            setNumber: 1,
            type: 'normal',
            weightKg: 20,
            reps: 10,
            completed: false
          },
          {
            id: `s_${Date.now()}_2`,
            setNumber: 2,
            type: 'normal',
            weightKg: 20,
            reps: 10,
            completed: false
          },
          {
            id: `s_${Date.now()}_3`,
            setNumber: 3,
            type: 'normal',
            weightKg: 20,
            reps: 10,
            completed: false
          }
        ]
      };
      setExercises(prev => [...prev, newEx]);
    }
    setShowExerciseSelector(false);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddSet = (exerciseIndex: number) => {
    setExercises(prev => {
      const updated = [...prev];
      const currentSets = updated[exerciseIndex].sets;
      const lastSet = currentSets[currentSets.length - 1];
      const newSetNumber = currentSets.length + 1;

      currentSets.push({
        id: `s_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        setNumber: newSetNumber,
        type: 'normal',
        weightKg: lastSet ? lastSet.weightKg : 20,
        reps: lastSet ? lastSet.reps : 10,
        completed: false
      });
      return updated;
    });
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    setExercises(prev => {
      const updated = [...prev];
      updated[exerciseIndex].sets = updated[exerciseIndex].sets
        .filter((_, i) => i !== setIndex)
        .map((s, idx) => ({ ...s, setNumber: idx + 1 }));
      return updated;
    });
  };

  const handleUpdateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: keyof WorkoutSet,
    val: any
  ) => {
    setExercises(prev => {
      const updated = [...prev];
      const currentSet = { ...updated[exerciseIndex].sets[setIndex], [field]: val };

      if (field === 'completed' && val === true) {
        currentSet.completedAt = new Date().toISOString();
        const targetRest = updated[exerciseIndex].targetRestSeconds || 90;
        startRestTimer(targetRest);
      }

      updated[exerciseIndex].sets[setIndex] = currentSet;
      return updated;
    });
  };

  // Calculated totals
  const stats = useMemo(() => {
    let volume = 0;
    let completedSets = 0;
    const targetedMuscles = new Set<MuscleId>();

    exercises.forEach(ex => {
      const def = EXERCISES_MAP[ex.exerciseId];
      ex.sets.forEach(s => {
        if (s.completed && s.type !== 'warmup') {
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
      musclesCount: targetedMuscles.size,
      targetedMuscles: Array.from(targetedMuscles)
    };
  }, [exercises]);

  // Finish Workout
  const handleCompleteWorkout = () => {
    const chosenStartDate = new Date(workoutDateTime);
    const durationSeconds = Math.max(60, elapsedSeconds);
    const completedDate = new Date(chosenStartDate.getTime() + durationSeconds * 1000);

    const finalWorkout: Workout = {
      id: initialWorkout?.id || `workout_${Date.now()}`,
      name: workoutName.trim() || 'Logged Workout',
      startedAt: chosenStartDate.toISOString(),
      completedAt: completedDate.toISOString(),
      durationSeconds: durationSeconds,
      notes: workoutNotes,
      totalVolumeKg: stats.volume,
      totalSets: stats.completedSets,
      musclesTrained: stats.targetedMuscles,
      exercises: exercises
    };

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    onFinishWorkout(finalWorkout);
  };

  const parsedDate = new Date(workoutDateTime);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Sticky Top Gym Command Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 py-2.5 sm:py-3 w-full overflow-hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 font-mono font-bold text-xs sm:text-sm shrink-0"
              title="Toggle workout clock"
            >
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 shrink-0" />
              <span>{formatTime(elapsedSeconds)}</span>
            </button>
            <input
              type="text"
              value={workoutName}
              onChange={e => setWorkoutName(e.target.value)}
              className="font-bold text-sm sm:text-base md:text-lg bg-transparent border-b border-transparent hover:border-slate-700 focus:border-blue-500 focus:outline-hidden text-white min-w-0 flex-1 truncate"
              placeholder="Workout name"
            />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Workout Date Selector Button */}
            <button
              id="workout-date-btn"
              onClick={() => setShowDatePickerModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Change workout date and time"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">
                {parsedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </button>

            <button
              onClick={() => {
                setPlateCalcInitialWeight(60);
                setShowPlateCalculator(true);
              }}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Barbell Plate Calculator"
            >
              <Disc className="w-4 h-4" />
            </button>

            <button
              id="finish-workout-btn"
              onClick={() => {
                if (exercises.length === 0) {
                  setShowExerciseSelector(true);
                  return;
                }
                setShowFinishModal(true);
              }}
              className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 transition-all shrink-0"
            >
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              <span>Finish</span>
            </button>
          </div>
        </div>

        {/* Live Rest Timer Bar (if active) */}
        {restTimerSeconds !== null && (
          <div className="max-w-4xl mx-auto mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-amber-400 flex items-center gap-1">
                <RotateCcw className="w-3.5 h-3.5 animate-spin" /> Rest:
              </span>
              <span className="font-mono text-sm font-bold text-white">
                {formatTime(restTimerSeconds)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {[30, 60, 90, 120, 180].map(sec => (
                <button
                  key={sec}
                  onClick={() => startRestTimer(sec)}
                  className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                    restTimerTotal === sec
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {sec}s
                </button>
              ))}
              <button
                onClick={() => setRestTimerSeconds(null)}
                className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 hover:text-white text-[11px]"
              >
                Skip
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Exercises Workout Arena */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Workout Volume & Set Ticker Bar */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800 text-center">
          <div>
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wider">Volume</span>
            <p className="text-sm sm:text-base font-bold text-white">{stats.volume.toLocaleString()} <span className="text-[10px] sm:text-xs text-slate-400">kg</span></p>
          </div>
          <div>
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wider">Sets</span>
            <p className="text-sm sm:text-base font-bold text-blue-400">{stats.completedSets}</p>
          </div>
          <div>
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wider">Muscles</span>
            <p className="text-sm sm:text-base font-bold text-emerald-400">{stats.musclesCount}</p>
          </div>
        </div>

        {/* Date/Time Banner reminder */}
        <div className="px-4 py-2.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>
              Session Date:{' '}
              <strong className="text-white">
                {parsedDate.toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}{' '}
                at{' '}
                {parsedDate.toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </strong>
            </span>
          </div>
          <button
            onClick={() => setShowDatePickerModal(true)}
            className="text-blue-400 hover:text-blue-300 font-semibold underline text-xs"
          >
            Change Date
          </button>
        </div>

        {/* Empty State when no exercises are in session */}
        {exercises.length === 0 && (
          <div className="p-8 rounded-2xl bg-slate-800/40 border border-dashed border-slate-700/80 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">No Exercises in Session Yet</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                Choose an exercise below to start tracking your sets and reps.
              </p>
            </div>
          </div>
        )}

        {/* Exercises List */}
        {exercises.map((ex, exIdx) => {
          const def = EXERCISES_MAP[ex.exerciseId];
          const prev = getPreviousPerformance(ex.exerciseId);
          const overloadAdvice = prev
            ? calculateProgressiveOverload(prev.sets.map(s => ({ weightKg: s.weightKg, reps: s.reps })))
            : null;

          return (
            <div
              key={ex.id || exIdx}
              className="rounded-2xl bg-slate-800/80 border border-slate-700/70 shadow-lg overflow-hidden"
            >
              {/* Exercise Card Header */}
              <div className="p-3.5 sm:p-4 bg-slate-800/90 border-b border-slate-700/60 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">
                    {exIdx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-white text-sm sm:text-base truncate">
                      {ex.exerciseName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-400">
                      <span className="capitalize">{def?.category || 'Strength'}</span>
                      <span>•</span>
                      <span className="capitalize">{def?.equipment ? def.equipment.replace(/_/g, ' ') : 'Barbell'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setPlateCalcInitialWeight(ex.sets[0]?.weightKg || 60);
                      setShowPlateCalculator(true);
                    }}
                    className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1"
                    title="Calculate Plates"
                  >
                    <Disc className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Plates</span>
                  </button>

                  <button
                    onClick={() => {
                      setSubstitutingExerciseIndex(exIdx);
                      setShowExerciseSelector(true);
                    }}
                    className="px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                  >
                    Swap
                  </button>

                  <button
                    onClick={() => handleRemoveExercise(exIdx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Previous History & Overload Intelligence Banner */}
              {prev && (
                <div className="px-3.5 sm:px-4 py-2 bg-blue-950/30 border-b border-blue-900/40 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Previous:</span>
                    <span className="font-mono text-slate-200">
                      {prev.sets.map(s => `${s.weightKg}kg×${s.reps}`).join(' | ')}
                    </span>
                  </div>
                  {overloadAdvice && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-900/50 border border-blue-500/30 text-blue-300 font-semibold text-[11px]">
                      <TrendingUp className="w-3 h-3 text-blue-400 shrink-0" />
                      <span>{overloadAdvice.badge}: {overloadAdvice.recommendedWeightKg}kg × {overloadAdvice.recommendedReps}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Sets Table */}
              <div className="p-2.5 sm:p-4 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-700/40 text-[10px] sm:text-xs">
                      <th className="py-2 px-1.5 sm:px-2 w-8 sm:w-10">Set</th>
                      <th className="py-2 px-1.5 sm:px-2 w-20 sm:w-28">Type</th>
                      <th className="py-2 px-1.5 sm:px-2 min-w-[75px]">Weight (kg)</th>
                      <th className="py-2 px-1.5 sm:px-2 min-w-[65px]">Reps</th>
                      <th className="py-2 px-1.5 sm:px-2 text-center w-12">Done</th>
                      <th className="py-2 px-1 w-6"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {ex.sets.map((set, setIdx) => {
                      const prevSet = prev?.sets[setIdx];
                      return (
                        <tr
                          key={set.id || setIdx}
                          className={`transition-colors ${
                            set.completed ? 'bg-emerald-950/20' : 'hover:bg-slate-700/20'
                          }`}
                        >
                          <td className="py-2 px-1.5 sm:px-2 font-bold text-slate-300 text-xs">
                            {set.setNumber}
                          </td>

                          <td className="py-2 px-1.5 sm:px-2">
                            <select
                              value={set.type}
                              onChange={e => handleUpdateSet(exIdx, setIdx, 'type', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-1.5 sm:px-2 py-1 text-slate-300 focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-medium text-[10px] sm:text-[11px]"
                            >
                              <option value="normal">Normal</option>
                              <option value="warmup">Warmup</option>
                              <option value="drop">Drop</option>
                              <option value="failure">Failure</option>
                            </select>
                          </td>

                          <td className="py-2 px-1.5 sm:px-2">
                            <div className="relative">
                              <input
                                type="number"
                                step="0.5"
                                value={set.weightKg || ''}
                                onChange={e =>
                                  handleUpdateSet(
                                    exIdx,
                                    setIdx,
                                    'weightKg',
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                placeholder={prevSet ? `${prevSet.weightKg}` : 'kg'}
                                className={`w-full px-2 py-1 sm:py-1.5 rounded-lg font-mono font-bold text-xs sm:text-sm bg-slate-900 border text-white focus:outline-hidden focus:ring-1 sm:focus:ring-2 focus:ring-blue-500 ${
                                  set.completed ? 'border-emerald-700' : 'border-slate-700'
                                }`}
                              />
                            </div>
                          </td>

                          <td className="py-2 px-1.5 sm:px-2">
                            <input
                              type="number"
                              min="1"
                              value={set.reps || ''}
                              onChange={e =>
                                handleUpdateSet(
                                  exIdx,
                                  setIdx,
                                  'reps',
                                  parseInt(e.target.value) || 0
                                )
                              }
                              placeholder={prevSet ? `${prevSet.reps}` : 'reps'}
                              className={`w-full px-2 py-1 sm:py-1.5 rounded-lg font-mono font-bold text-xs sm:text-sm bg-slate-900 border text-white focus:outline-hidden focus:ring-1 sm:focus:ring-2 focus:ring-blue-500 ${
                                set.completed ? 'border-emerald-700' : 'border-slate-700'
                              }`}
                            />
                          </td>

                          <td className="py-2 px-1.5 sm:px-2 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateSet(exIdx, setIdx, 'completed', !set.completed)
                              }
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl mx-auto flex items-center justify-center transition-all ${
                                set.completed
                                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-950 scale-105'
                                  : 'bg-slate-700/60 hover:bg-slate-700 text-slate-400'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                            </button>
                          </td>

                          <td className="py-2 px-0.5 sm:px-1 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveSet(exIdx, setIdx)}
                              className="text-slate-500 hover:text-rose-400 p-1"
                            >
                              <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Add Set Button */}
                <button
                  type="button"
                  onClick={() => handleAddSet(exIdx)}
                  className="mt-2.5 sm:mt-3 w-full py-1.5 sm:py-2 rounded-xl bg-slate-700/40 hover:bg-slate-700/80 text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-dashed border-slate-700"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Set
                </button>
              </div>
            </div>
          );
        })}

        {/* Add Exercise Floating / Full Bar */}
        <button
          id="add-exercise-to-workout-btn"
          type="button"
          onClick={() => {
            setSubstitutingExerciseIndex(null);
            setShowExerciseSelector(true);
          }}
          className="w-full py-3.5 sm:py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-950 transition-all active:scale-[0.99]"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> Add Exercise to Workout
        </button>

        {/* Workout Notes */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Session Notes & Reflections
          </label>
          <textarea
            rows={2}
            value={workoutNotes}
            onChange={e => setWorkoutNotes(e.target.value)}
            placeholder="E.g. Felt great on bench, left shoulder fully stable, pushed squats to top of rep range."
            className="w-full p-2.5 sm:p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Cancel / Discard */}
        <div className="text-center pt-4">
          <button
            type="button"
            onClick={onCancelWorkout}
            className="text-xs text-rose-400 hover:text-rose-300 underline"
          >
            Cancel and Discard Workout
          </button>
        </div>
      </main>

      {/* Date & Time Picker Modal */}
      {showDatePickerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" /> Workout Date & Time
              </h3>
              <button
                onClick={() => setShowDatePickerModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Default is current time. You can backdate or change this to when the workout actually took place.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Specify Date & Start Time
                </label>
                <input
                  type="datetime-local"
                  value={workoutDateTime}
                  onChange={e => setWorkoutDateTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setWorkoutDateTime(toDateTimeLocal(new Date()))}
                  className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700"
                >
                  Now
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
                    setWorkoutDateTime(toDateTimeLocal(yesterday));
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700"
                >
                  Yesterday
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowDatePickerModal(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs"
            >
              Confirm Date
            </button>
          </div>
        </div>
      )}

      {/* Finish Workout Summary Modal */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-400" /> Finish Workout Session
              </h3>
              <button
                onClick={() => setShowFinishModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Overview Stats Card */}
            <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/60 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Workout Name:</span>
                <span className="font-bold text-white">{workoutName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Date & Time:</span>
                <span className="font-bold text-blue-400">
                  {parsedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} at {parsedDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Volume:</span>
                <span className="font-bold text-emerald-400">{stats.volume.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Completed Sets:</span>
                <span className="font-bold text-white">{stats.completedSets} sets</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowFinishModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Keep Lifting
              </button>
              <button
                id="confirm-finish-workout-btn"
                onClick={handleCompleteWorkout}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950 transition-all active:scale-[0.98]"
              >
                Save & Log Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Selector Modal */}
      {showExerciseSelector && (
        <ExerciseSelectorModal
          onSelect={handleAddExercise}
          onClose={() => {
            setShowExerciseSelector(false);
            setSubstitutingExerciseIndex(null);
          }}
          title={substitutingExerciseIndex !== null ? 'Substitute Exercise' : 'Add Exercise'}
        />
      )}

      {/* Plate Calculator Modal */}
      {showPlateCalculator && (
        <PlateCalculatorModal
          initialWeight={plateCalcInitialWeight}
          unit="kg"
          onClose={() => setShowPlateCalculator(false)}
        />
      )}
    </div>
  );
};
