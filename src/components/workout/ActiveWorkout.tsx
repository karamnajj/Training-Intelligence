import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Workout,
  WorkoutExercise,
  WorkoutSet,
  Exercise,
  MuscleId
} from '../../types';
import { EXERCISES_MAP, isBodyweightExercise } from '../../lib/exerciseDatabase';
import {
  calculateProgressiveOverload,
  MUSCLE_CATALOG
} from '../../lib/muscleMath';
import {
  ActiveWorkoutSession,
  getActiveWorkoutSession,
  saveActiveWorkoutSession,
  clearActiveWorkoutSession,
  computeCurrentElapsedSeconds,
  toDateTimeLocal
} from '../../lib/activeWorkoutStorage';
import { checkActiveSetPR } from '../../lib/prMath';
import { nativeHaptics } from '../../lib/nativeBridge';
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
  Dumbbell,
  Play,
  Pause,
  Minimize2,
  Trophy
} from 'lucide-react';

interface ActiveWorkoutProps {
  initialWorkout?: Partial<Workout>;
  previousWorkouts: Workout[];
  onFinishWorkout: (workout: Workout) => void;
  onCancelWorkout: () => void;
  onMinimize?: () => void;
}

export const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({
  initialWorkout,
  previousWorkouts,
  onFinishWorkout,
  onCancelWorkout,
  onMinimize
}) => {
  // Retrieve saved active workout session if present
  const savedSession = useMemo(() => getActiveWorkoutSession(), []);

  // Stable workout ID & start timestamp
  const workoutIdRef = useRef<string>(
    savedSession?.id || initialWorkout?.id || `workout_${Date.now()}`
  );
  const workoutStartedAtRef = useRef<string>(
    savedSession?.startedAt || initialWorkout?.startedAt || new Date().toISOString()
  );

  // Workout Metadata State
  const [workoutName, setWorkoutName] = useState<string>(() => {
    return savedSession?.name || initialWorkout?.name || 'Live Workout Session';
  });
  const [workoutNotes, setWorkoutNotes] = useState<string>(() => {
    return savedSession?.notes ?? initialWorkout?.notes ?? '';
  });
  
  // Date and Time State
  const [workoutDateTime, setWorkoutDateTime] = useState<string>(() => {
    if (savedSession?.workoutDateTime) return savedSession.workoutDateTime;
    const startIso = savedSession?.startedAt || initialWorkout?.startedAt;
    return startIso ? toDateTimeLocal(new Date(startIso)) : toDateTimeLocal(new Date());
  });
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [showDiscardConfirmModal, setShowDiscardConfirmModal] = useState(false);

  // Exercises State
  const [exercises, setExercises] = useState<WorkoutExercise[]>(() => {
    if (savedSession?.exercises && savedSession.exercises.length > 0) {
      return savedSession.exercises;
    }
    return initialWorkout?.exercises ? [...initialWorkout.exercises] : [];
  });

  // High-Precision Workout Timer State (immune to phone sleep, background tab throttling, and reload)
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(() => {
    if (savedSession !== null && savedSession.isTimerRunning !== undefined) {
      return savedSession.isTimerRunning;
    }
    return true;
  });

  const getInitialElapsedSeconds = () => {
    if (savedSession) {
      return computeCurrentElapsedSeconds(savedSession);
    }
    if (initialWorkout?.durationSeconds && initialWorkout.durationSeconds > 0) {
      return initialWorkout.durationSeconds;
    }
    if (initialWorkout?.startedAt) {
      const diff = Math.floor((Date.now() - new Date(initialWorkout.startedAt).getTime()) / 1000);
      if (diff > 0 && diff < 86400) return diff;
    }
    return 0;
  };

  const initialElapsed = getInitialElapsedSeconds();
  const accumulatedSecondsRef = useRef<number>(
    savedSession ? savedSession.accumulatedSeconds : initialElapsed
  );
  const lastResumedAtRef = useRef<number>(
    savedSession
      ? (savedSession.isTimerRunning ? (savedSession.lastResumedAt || Date.now()) : 0)
      : Date.now()
  );
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(initialElapsed);

  // Toggle workout timer pause/resume
  const toggleWorkoutTimer = () => {
    if (isTimerRunning) {
      const currentSlice = lastResumedAtRef.current
        ? Math.max(0, Math.floor((Date.now() - lastResumedAtRef.current) / 1000))
        : 0;
      accumulatedSecondsRef.current = Math.max(0, accumulatedSecondsRef.current + currentSlice);
      lastResumedAtRef.current = 0;
      setElapsedSeconds(accumulatedSecondsRef.current);
      setIsTimerRunning(false);
    } else {
      lastResumedAtRef.current = Date.now();
      setIsTimerRunning(true);
    }
  };

  // Rest Timer State
  const getInitialRestSeconds = () => {
    if (savedSession?.restEndTimestamp) {
      if (savedSession.isRestPaused && savedSession.restPausedRemaining) {
        return savedSession.restPausedRemaining;
      }
      const msLeft = savedSession.restEndTimestamp - Date.now();
      const secLeft = Math.ceil(msLeft / 1000);
      return secLeft > 0 ? secLeft : null;
    }
    return savedSession?.restTimerSeconds ?? null;
  };

  const [restTimerSeconds, setRestTimerSeconds] = useState<number | null>(getInitialRestSeconds);
  const [restTimerTotal, setRestTimerTotal] = useState<number>(savedSession?.restTimerTotal || 90);
  const [isRestPaused, setIsRestPaused] = useState<boolean>(savedSession?.isRestPaused || false);
  const [restCompletedNotice, setRestCompletedNotice] = useState<boolean>(false);

  const restEndTimestampRef = useRef<number | null>(savedSession?.restEndTimestamp ?? null);
  const restPausedRemainingRef = useRef<number | null>(savedSession?.restPausedRemaining ?? null);

  // Modals
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [substitutingExerciseIndex, setSubstitutingExerciseIndex] = useState<number | null>(null);
  const [showPlateCalculator, setShowPlateCalculator] = useState(false);
  const [plateCalcInitialWeight, setPlateCalcInitialWeight] = useState<number>(60);
  const [showFinishModal, setShowFinishModal] = useState(false);

  // Synchronize state to persistent localStorage
  const syncToStorage = useCallback(() => {
    const session: ActiveWorkoutSession = {
      id: workoutIdRef.current,
      name: workoutName,
      notes: workoutNotes,
      startedAt: workoutStartedAtRef.current,
      workoutDateTime,
      exercises,
      accumulatedSeconds: accumulatedSecondsRef.current,
      lastResumedAt: isTimerRunning ? (lastResumedAtRef.current || Date.now()) : null,
      isTimerRunning,
      restTimerSeconds,
      restTimerTotal,
      restEndTimestamp: restEndTimestampRef.current,
      isRestPaused,
      restPausedRemaining: restPausedRemainingRef.current,
      updatedAt: Date.now()
    };
    saveActiveWorkoutSession(session);
  }, [
    workoutName,
    workoutNotes,
    workoutDateTime,
    exercises,
    isTimerRunning,
    restTimerSeconds,
    restTimerTotal,
    isRestPaused
  ]);

  // Persist whenever active state updates
  useEffect(() => {
    syncToStorage();
  }, [syncToStorage]);

  // Periodic 3-second heartbeat to keep wall-clock time fresh
  useEffect(() => {
    const timer = setInterval(() => {
      syncToStorage();
    }, 3000);
    return () => clearInterval(timer);
  }, [syncToStorage]);

  // Flush persistence on page unload / refresh / backgrounding
  useEffect(() => {
    const handleSave = () => syncToStorage();
    window.addEventListener('beforeunload', handleSave);
    window.addEventListener('pagehide', handleSave);
    document.addEventListener('visibilitychange', handleSave);
    return () => {
      window.removeEventListener('beforeunload', handleSave);
      window.removeEventListener('pagehide', handleSave);
      document.removeEventListener('visibilitychange', handleSave);
    };
  }, [syncToStorage]);

  // Only re-initialize if an entirely DIFFERENT workout ID is passed from outside
  const lastInitialWorkoutIdRef = useRef<string | undefined>(initialWorkout?.id);
  useEffect(() => {
    if (initialWorkout && initialWorkout.id && initialWorkout.id !== lastInitialWorkoutIdRef.current) {
      lastInitialWorkoutIdRef.current = initialWorkout.id;
      workoutIdRef.current = initialWorkout.id;
      if (initialWorkout.name) setWorkoutName(initialWorkout.name);
      if (initialWorkout.notes !== undefined) setWorkoutNotes(initialWorkout.notes || '');
      if (initialWorkout.startedAt) {
        workoutStartedAtRef.current = initialWorkout.startedAt;
        setWorkoutDateTime(toDateTimeLocal(new Date(initialWorkout.startedAt)));
      }
      if (Array.isArray(initialWorkout.exercises)) {
        setExercises(initialWorkout.exercises);
      }
      if (initialWorkout.durationSeconds && initialWorkout.durationSeconds > 0) {
        accumulatedSecondsRef.current = initialWorkout.durationSeconds;
        lastResumedAtRef.current = Date.now();
        setElapsedSeconds(initialWorkout.durationSeconds);
      }
    }
  }, [initialWorkout]);

  // Workout Timer Effect: High-precision wall-clock synchronization
  useEffect(() => {
    const updateElapsed = () => {
      if (!isTimerRunning) {
        setElapsedSeconds(accumulatedSecondsRef.current);
        return;
      }
      if (!lastResumedAtRef.current) {
        lastResumedAtRef.current = Date.now();
      }
      const currentSlice = Math.max(0, Math.floor((Date.now() - lastResumedAtRef.current) / 1000));
      setElapsedSeconds(accumulatedSecondsRef.current + currentSlice);
    };

    updateElapsed();

    if (!isTimerRunning) return;

    const interval = setInterval(updateElapsed, 500);

    const handleSync = () => {
      updateElapsed();
    };

    document.addEventListener('visibilitychange', handleSync);
    window.addEventListener('focus', handleSync);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, [isTimerRunning]);

  // Audio chime player for rest completion
  const playTimerChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };
      playTone(880, ctx.currentTime, 0.2);
      playTone(1174.66, ctx.currentTime + 0.16, 0.4);
    } catch {
      // audio context fallback
    }
  };

  // Rest Timer Countdown Effect: Wall-clock driven, immune to re-renders
  const isRestActive = restTimerSeconds !== null;
  useEffect(() => {
    if (!isRestActive || isRestPaused) return;

    const checkRestCountdown = () => {
      if (!restEndTimestampRef.current) return;
      const msLeft = restEndTimestampRef.current - Date.now();
      const secondsLeft = Math.ceil(msLeft / 1000);

      if (secondsLeft <= 0) {
        setRestTimerSeconds(0);
        restEndTimestampRef.current = null;
        setRestCompletedNotice(true);
        playTimerChime();
        nativeHaptics.heavy();
        try {
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([150, 100, 250]);
          }
        } catch {
          // ignore
        }
      } else {
        setRestTimerSeconds(secondsLeft);
      }
    };

    checkRestCountdown();
    const interval = setInterval(checkRestCountdown, 250);

    const handleSync = () => {
      checkRestCountdown();
    };

    document.addEventListener('visibilitychange', handleSync);
    window.addEventListener('focus', handleSync);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, [isRestActive, isRestPaused]);

  // Auto-dismiss rest completion banner after 5 seconds
  useEffect(() => {
    if (!restCompletedNotice) return;
    const timeout = setTimeout(() => {
      setRestCompletedNotice(false);
      setRestTimerSeconds(null);
    }, 5000);
    return () => clearTimeout(timeout);
  }, [restCompletedNotice]);

  const startRestTimer = (seconds: number) => {
    if (seconds <= 0) {
      dismissRestTimer();
      return;
    }
    const safeSec = Math.round(seconds);
    setRestTimerTotal(safeSec);
    setRestTimerSeconds(safeSec);
    setIsRestPaused(false);
    setRestCompletedNotice(false);
    restPausedRemainingRef.current = null;
    restEndTimestampRef.current = Date.now() + safeSec * 1000;
  };

  const addRestSeconds = (extraSeconds: number) => {
    setRestCompletedNotice(false);
    if (restTimerSeconds === null) {
      startRestTimer(extraSeconds);
      return;
    }
    if (isRestPaused) {
      const newRemaining = Math.max(1, (restPausedRemainingRef.current || restTimerSeconds) + extraSeconds);
      restPausedRemainingRef.current = newRemaining;
      setRestTimerSeconds(newRemaining);
      setRestTimerTotal(prev => prev + extraSeconds);
    } else {
      if (restEndTimestampRef.current) {
        restEndTimestampRef.current += extraSeconds * 1000;
      } else {
        restEndTimestampRef.current = Date.now() + (restTimerSeconds + extraSeconds) * 1000;
      }
      setRestTimerTotal(prev => prev + extraSeconds);
      const remaining = Math.max(1, Math.ceil((restEndTimestampRef.current - Date.now()) / 1000));
      setRestTimerSeconds(remaining);
    }
  };

  const toggleRestPause = () => {
    if (restTimerSeconds === null || restTimerSeconds <= 0) return;
    if (!isRestPaused) {
      const remaining = restEndTimestampRef.current
        ? Math.max(1, Math.ceil((restEndTimestampRef.current - Date.now()) / 1000))
        : restTimerSeconds;
      restPausedRemainingRef.current = remaining;
      setRestTimerSeconds(remaining);
      setIsRestPaused(true);
    } else {
      const remaining = restPausedRemainingRef.current || restTimerSeconds;
      restEndTimestampRef.current = Date.now() + remaining * 1000;
      restPausedRemainingRef.current = null;
      setIsRestPaused(false);
    }
  };

  const dismissRestTimer = () => {
    setRestTimerSeconds(null);
    setRestCompletedNotice(false);
    setIsRestPaused(false);
    restEndTimestampRef.current = null;
    restPausedRemainingRef.current = null;
  };

  const formatTime = (totalSeconds: number) => {
    const safe = Math.max(0, Math.floor(totalSeconds));
    const hrs = Math.floor(safe / 3600);
    const mins = Math.floor((safe % 3600) / 60);
    const secs = safe % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Find previous performance for progressive overload
  const getPreviousPerformance = (exerciseId: string) => {
    for (const w of previousWorkouts) {
      const match = w.exercises?.find(e => e.exerciseId === exerciseId);
      if (match && Array.isArray(match.sets) && match.sets.length > 0) {
        return match;
      }
    }
    return null;
  };

  // Exercise Management
  const handleAddExercise = (selected: Exercise) => {
    const isBW = selected.equipment === 'bodyweight' || isBodyweightExercise(selected.id, selected.name, selected.equipment);

    if (substitutingExerciseIndex !== null) {
      // Substitute existing exercise
      setExercises(prev => {
        const updated = [...prev];
        updated[substitutingExerciseIndex] = {
          ...updated[substitutingExerciseIndex],
          exerciseId: selected.id,
          exerciseName: selected.name,
          isBodyweight: isBW,
          sets: (updated[substitutingExerciseIndex].sets || []).map(s => ({
            ...s,
            isBodyweight: isBW,
            weightKg: isBW ? 0 : (s.weightKg || 0),
            reps: s.reps || 0
          }))
        };
        return updated;
      });
      setSubstitutingExerciseIndex(null);
    } else {
      // Add new exercise - leave weightKg and reps empty (0) for user to input
      const newEx: WorkoutExercise = {
        id: `we_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        exerciseId: selected.id,
        exerciseName: selected.name,
        targetRestSeconds: 90,
        isBodyweight: isBW,
        sets: [
          {
            id: `s_${Date.now()}_1`,
            setNumber: 1,
            type: 'normal',
            weightKg: 0,
            reps: 0,
            isBodyweight: isBW,
            completed: false
          },
          {
            id: `s_${Date.now()}_2`,
            setNumber: 2,
            type: 'normal',
            weightKg: 0,
            reps: 0,
            isBodyweight: isBW,
            completed: false
          },
          {
            id: `s_${Date.now()}_3`,
            setNumber: 3,
            type: 'normal',
            weightKg: 0,
            reps: 0,
            isBodyweight: isBW,
            completed: false
          }
        ]
      };
      setExercises(prev => [...prev, newEx]);
    }
    setShowExerciseSelector(false);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(prev => {
      const remaining = prev.filter((_, i) => i !== index);
      const totalRemainingSets = remaining.reduce(
        (sum, e) => sum + (Array.isArray(e.sets) ? e.sets.length : 0),
        0
      );
      if (totalRemainingSets === 0 || remaining.length === 0) {
        clearActiveWorkoutSession();
        onCancelWorkout();
        return [];
      }
      return remaining;
    });
  };

  const handleAddSet = (exerciseIndex: number) => {
    setExercises(prev => {
      const updated = [...prev];
      if (!Array.isArray(updated[exerciseIndex].sets)) {
        updated[exerciseIndex].sets = [];
      }
      const currentSets = updated[exerciseIndex].sets;
      const lastSet = currentSets[currentSets.length - 1];
      const newSetNumber = currentSets.length + 1;
      const def = EXERCISES_MAP[updated[exerciseIndex].exerciseId];
      const isBWCompatible = isBodyweightExercise(updated[exerciseIndex].exerciseId, updated[exerciseIndex].exerciseName, def?.equipment);
      const isBW = isBWCompatible ? (updated[exerciseIndex].isBodyweight ?? true) : false;
      const lastSetIsBW = lastSet ? (lastSet.isBodyweight ?? isBW) : isBW;

      currentSets.push({
        id: `s_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        setNumber: newSetNumber,
        type: 'normal',
        isBodyweight: isBW ? lastSetIsBW : false,
        weightKg: 0,
        reps: 0,
        completed: false
      });
      nativeHaptics.light();
      return updated;
    });
  };

  const handleToggleExerciseBodyweight = (exerciseIndex: number) => {
    setExercises(prev => {
      const updated = [...prev];
      const target = updated[exerciseIndex];
      const def = EXERCISES_MAP[target.exerciseId];
      const isBWCompatible = isBodyweightExercise(target.exerciseId, target.exerciseName, def?.equipment);
      if (!isBWCompatible) return prev;

      const currentIsBW = target.isBodyweight ?? true;
      const nextIsBW = !currentIsBW;

      updated[exerciseIndex] = {
        ...target,
        isBodyweight: nextIsBW,
        sets: (target.sets || []).map(s => ({
          ...s,
          isBodyweight: nextIsBW,
          weightKg: nextIsBW ? 0 : (s.weightKg || 0)
        }))
      };
      return updated;
    });
  };

  const handleUpdateSetMultiple = (
    exerciseIndex: number,
    setIndex: number,
    updates: Partial<WorkoutSet>
  ) => {
    setExercises(prev => {
      const updated = [...prev];
      const currentSet = { ...updated[exerciseIndex].sets[setIndex], ...updates };

      if (updates.completed === true) {
        currentSet.completedAt = new Date().toISOString();
        const targetRest = updated[exerciseIndex].targetRestSeconds || 90;
        startRestTimer(targetRest);
        if (currentSet.isPR) {
          nativeHaptics.success();
        } else {
          nativeHaptics.medium();
        }
      }

      updated[exerciseIndex].sets[setIndex] = currentSet;
      return updated;
    });
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    setExercises(prev => {
      const updated = [...prev];
      const curr = Array.isArray(updated[exerciseIndex]?.sets) ? updated[exerciseIndex].sets : [];
      const filteredSets = curr
        .filter((_, i) => i !== setIndex)
        .map((s, idx) => ({ ...s, setNumber: idx + 1 }));

      updated[exerciseIndex] = {
        ...updated[exerciseIndex],
        sets: filteredSets
      };

      // Filter out exercises that have no sets remaining
      const remainingExercises = updated.filter(
        e => Array.isArray(e.sets) && e.sets.length > 0
      );

      const totalRemainingSets = remainingExercises.reduce(
        (sum, e) => sum + (e.sets?.length || 0),
        0
      );

      // If all sets are deleted across the workout, delete/discard the whole workout
      if (totalRemainingSets === 0) {
        clearActiveWorkoutSession();
        onCancelWorkout();
        return [];
      }

      return remainingExercises;
    });
  };

  const handleUpdateExerciseRest = (exerciseIndex: number, restSeconds: number) => {
    setExercises(prev => {
      const updated = [...prev];
      updated[exerciseIndex] = {
        ...updated[exerciseIndex],
        targetRestSeconds: restSeconds
      };
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
        if (currentSet.isPR) {
          nativeHaptics.success();
        } else {
          nativeHaptics.medium();
        }
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
      const setsArr = Array.isArray(ex?.sets) ? ex.sets : [];
      setsArr.forEach(s => {
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

  // Compute live PR count for the current session
  const totalSessionPRs = useMemo(() => {
    let count = 0;
    exercises.forEach(ex => {
      const setsArr = Array.isArray(ex?.sets) ? ex.sets : [];
      setsArr.forEach((s, sIdx) => {
        if (s && s.completed) {
          const prior = setsArr.slice(0, sIdx).filter(ps => ps && ps.completed);
          const pr = checkActiveSetPR(s, ex.exerciseId, ex.exerciseName, previousWorkouts, prior);
          if (pr.isPR) count++;
        }
      });
    });
    return count;
  }, [exercises, previousWorkouts]);

  // Finish Workout
  const handleCompleteWorkout = () => {
    nativeHaptics.success();
    const chosenStartDate = new Date(workoutDateTime);
    const durationSeconds = Math.max(60, elapsedSeconds);
    const completedDate = new Date(chosenStartDate.getTime() + durationSeconds * 1000);

    const finalExercises = exercises.map(ex => {
      const sets = Array.isArray(ex.sets) ? ex.sets : [];
      return {
        ...ex,
        sets: sets.map((s, sIdx) => {
          if (!s || !s.completed) return s;
          const prior = sets.slice(0, sIdx).filter(ps => ps && ps.completed);
          const pr = checkActiveSetPR(s, ex.exerciseId, ex.exerciseName, previousWorkouts, prior);
          if (pr.isPR) {
            return {
              ...s,
              isPR: true,
              prType: pr.prType
            };
          }
          return s;
        })
      };
    });

    const finalWorkout: Workout = {
      id: workoutIdRef.current,
      name: workoutName.trim() || 'Logged Workout',
      startedAt: chosenStartDate.toISOString(),
      completedAt: completedDate.toISOString(),
      durationSeconds: durationSeconds,
      notes: workoutNotes,
      totalVolumeKg: stats.volume,
      totalSets: stats.completedSets,
      musclesTrained: stats.targetedMuscles,
      exercises: finalExercises,
      prCount: totalSessionPRs
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

    clearActiveWorkoutSession();
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
              onClick={toggleWorkoutTimer}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-mono font-bold text-xs sm:text-sm shrink-0 transition-colors ${
                isTimerRunning
                  ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30'
                  : 'bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
              }`}
              title={isTimerRunning ? 'Pause workout clock' : 'Resume workout clock'}
            >
              {isTimerRunning ? (
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 shrink-0" />
              ) : (
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0 fill-current" />
              )}
              <span>{formatTime(elapsedSeconds)}</span>
              {!isTimerRunning && (
                <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-amber-400/90 ml-0.5">
                  Paused
                </span>
              )}
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
              onClick={() => {
                if (restTimerSeconds === null && !restCompletedNotice) {
                  startRestTimer(90);
                } else if (restTimerSeconds !== null) {
                  toggleRestPause();
                }
              }}
              className={`p-1.5 sm:p-2 rounded-xl transition-colors flex items-center gap-1 ${
                restTimerSeconds !== null
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Quick Rest Timer"
            >
              <RotateCcw className={`w-4 h-4 text-amber-400 ${restTimerSeconds !== null && !isRestPaused ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline text-xs font-semibold text-amber-400">
                {restTimerSeconds !== null ? formatTime(restTimerSeconds) : 'Rest'}
              </span>
            </button>

            {onMinimize && (
              <button
                type="button"
                onClick={onMinimize}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="Minimize workout and view app"
              >
                <Minimize2 className="w-4 h-4 text-slate-300" />
              </button>
            )}

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

        {/* Live Rest Timer Bar (if active or completed notice) */}
        {(restTimerSeconds !== null || restCompletedNotice) && (
          <div className="max-w-4xl mx-auto mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            {restCompletedNotice ? (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold text-xs sm:text-sm">Rest Complete! Ready for next set</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleRestPause}
                  className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
                    isRestPaused
                      ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                      : 'bg-slate-800 text-amber-400 hover:bg-slate-700'
                  }`}
                  title={isRestPaused ? 'Resume rest countdown' : 'Pause rest countdown'}
                >
                  {isRestPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
                </button>
                <span className="font-semibold text-amber-400 flex items-center gap-1">
                  <RotateCcw className={`w-3.5 h-3.5 ${!isRestPaused ? 'animate-spin' : ''}`} /> Rest:
                </span>
                <span className="font-mono text-sm sm:text-base font-bold text-white tracking-wider">
                  {formatTime(restTimerSeconds || 0)}
                </span>
                {isRestPaused && (
                  <span className="text-[10px] font-semibold text-amber-400/90 uppercase tracking-wider bg-amber-500/10 px-1.5 py-0.5 rounded">
                    Paused
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center gap-1 sm:gap-1.5 ml-auto">
              <button
                onClick={() => addRestSeconds(30)}
                className="px-2 py-1 rounded-md bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-semibold text-[11px] flex items-center gap-0.5 transition-colors"
                title="Add 30 seconds"
              >
                <Plus className="w-3 h-3" />
                <span>30s</span>
              </button>

              {[30, 60, 90, 120, 180, 300].map(sec => (
                <button
                  key={sec}
                  onClick={() => startRestTimer(sec)}
                  className={`px-2 py-1 rounded-md font-semibold text-[11px] transition-colors ${
                    restTimerTotal === sec && !restCompletedNotice
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  title={`Start ${sec === 300 ? '5 minute' : sec >= 60 ? `${sec / 60} minute` : `${sec} second`} rest countdown`}
                >
                  {sec === 300 ? '5m' : sec === 180 ? '3m' : sec === 120 ? '2m' : `${sec}s`}
                </button>
              ))}

              <button
                onClick={dismissRestTimer}
                className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[11px] transition-colors flex items-center gap-0.5"
                title="Dismiss rest countdown"
              >
                <X className="w-3 h-3" />
                <span>{restCompletedNotice ? 'Close' : 'Skip'}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Exercises Workout Arena */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Workout Volume & Set Ticker Bar */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800 text-center transition-all">
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
            type="button"
            onClick={() => setShowDatePickerModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-500/50 font-semibold text-xs transition-all shadow-xs active:scale-95 cursor-pointer shrink-0"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>Change Date</span>
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
          const isBWCompatible = isBodyweightExercise(ex.exerciseId, ex.exerciseName, def?.equipment);
          const isBW = isBWCompatible ? (ex.isBodyweight ?? true) : false;
          const prev = getPreviousPerformance(ex.exerciseId);
          const prevSets = Array.isArray(prev?.sets) ? prev.sets : [];
          const overloadAdvice = prev && prevSets.length > 0
            ? calculateProgressiveOverload(prevSets.map(s => ({ weightKg: s.weightKg, reps: s.reps })))
            : null;
          const currentSets = Array.isArray(ex.sets) ? ex.sets : [];

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
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs text-slate-400 mt-0.5">
                      <span className="capitalize">{def?.category || 'Strength'}</span>
                      <span>•</span>
                      <span className="capitalize">{def?.equipment ? def.equipment.replace(/_/g, ' ') : (isBW ? 'Bodyweight' : 'Barbell')}</span>
                      {isBWCompatible && (
                        <>
                          <span>•</span>
                          {/* Bodyweight option toggle button - only for bodyweight compatible exercises */}
                          <button
                            type="button"
                            onClick={() => handleToggleExerciseBodyweight(exIdx)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[11px] transition-all border ${
                              isBW
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                : 'bg-slate-900/60 text-slate-400 border-slate-700/60 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                            title={isBW ? "Bodyweight mode active (BW / added weight). Click to switch to external weight." : "Switch exercise to Bodyweight (BW)"}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isBW ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                            {isBW ? 'Bodyweight (BW)' : 'Bodyweight'}
                          </button>
                        </>
                      )}
                      <span>•</span>
                      <div className="inline-flex items-center gap-1 bg-slate-900/60 border border-slate-700/60 rounded px-1.5 py-0.5 text-amber-400">
                        <RotateCcw className="w-3 h-3 text-amber-400/90 shrink-0" />
                        <select
                          aria-label={`Target rest time for ${ex.exerciseName}`}
                          value={ex.targetRestSeconds || 90}
                          onChange={e => handleUpdateExerciseRest(exIdx, parseInt(e.target.value) || 90)}
                          className="bg-transparent text-amber-400 font-semibold text-[11px] cursor-pointer focus:outline-none focus:ring-0"
                          title="Rest countdown timer after completing a set"
                        >
                          <option value={30} className="bg-slate-900 text-white">Rest: 30s</option>
                          <option value={60} className="bg-slate-900 text-white">Rest: 60s</option>
                          <option value={90} className="bg-slate-900 text-white">Rest: 90s</option>
                          <option value={120} className="bg-slate-900 text-white">Rest: 2m</option>
                          <option value={180} className="bg-slate-900 text-white">Rest: 3m</option>
                          <option value={300} className="bg-slate-900 text-white">Rest: 5m</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setPlateCalcInitialWeight(currentSets[0]?.weightKg || 60);
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
              {prev && prevSets.length > 0 && (
                <div className="px-3.5 sm:px-4 py-2 bg-blue-950/30 border-b border-blue-900/40 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Previous:</span>
                    <span className="font-mono text-slate-200">
                      {prevSets.map(s => {
                        const isBWSet = isBW && (s.isBodyweight || s.weightKg === 0);
                        if (isBWSet) {
                          return s.weightKg > 0 ? `BW+${s.weightKg}kg×${s.reps}` : `BW×${s.reps}`;
                        }
                        return `${s.weightKg}kg×${s.reps}`;
                      }).join(' | ')}
                    </span>
                  </div>
                  {overloadAdvice && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-900/50 border border-blue-500/30 text-blue-300 font-semibold text-[11px]">
                      <TrendingUp className="w-3 h-3 text-blue-400 shrink-0" />
                      <span>{overloadAdvice.badge}: {isBW && overloadAdvice.recommendedWeightKg === 0 ? 'BW' : `${overloadAdvice.recommendedWeightKg}kg`} × {overloadAdvice.recommendedReps}</span>
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
                      <th className="py-2 px-1.5 sm:px-2 min-w-[105px] sm:min-w-[125px]">
                        {isBW ? 'Weight (BW / +kg)' : 'Weight (kg)'}
                      </th>
                      <th className="py-2 px-1.5 sm:px-2 min-w-[65px]">Reps</th>
                      <th className="py-2 px-1.5 sm:px-2 text-center w-12">Done</th>
                      <th className="py-2 px-1 w-6"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {(Array.isArray(ex.sets) ? ex.sets : []).map((set, setIdx) => {
                      const prevSets = Array.isArray(prev?.sets) ? prev.sets : [];
                      const prevSet = prevSets[setIdx];
                      const setBW = isBW ? (set.isBodyweight ?? true) : false;
                      const priorSetsCompleted = (Array.isArray(ex.sets) ? ex.sets.slice(0, setIdx) : []).filter(ps => ps && ps.completed);
                      const setPRInfo = set.completed
                        ? checkActiveSetPR(set, ex.exerciseId, ex.exerciseName, previousWorkouts, priorSetsCompleted)
                        : { isPR: false };

                      return (
                        <tr
                          key={set.id || setIdx}
                          className={`transition-colors ${
                            set.completed ? 'bg-emerald-950/20' : 'hover:bg-slate-700/20'
                          }`}
                        >
                          <td className="py-2 px-1.5 sm:px-2 font-bold text-slate-300 text-xs">
                            <div className="flex items-center gap-1">
                              <span>{set.setNumber}</span>
                              {setPRInfo.isPR && (
                                <span
                                  className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-amber-500/25 text-amber-300 border border-amber-500/40 text-[9px] font-black uppercase tracking-wider animate-pulse shadow-2xs"
                                  title={setPRInfo.detail || (setPRInfo.prType === 'weight' ? 'Weight PR' : 'Rep PR')}
                                >
                                  <Trophy className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                                  PR
                                </span>
                              )}
                            </div>
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
                            <div className="relative flex items-center gap-1">
                              <div className="relative flex-1 min-w-[65px]">
                                <input
                                  type="number"
                                  step="0.5"
                                  min="0"
                                  value={
                                    set.weightKg === 0 || !set.weightKg
                                      ? ''
                                      : set.weightKg
                                  }
                                  onFocus={e => e.target.select()}
                                  onChange={e => {
                                    const raw = e.target.value;
                                    if (raw === '') {
                                      handleUpdateSet(
                                        exIdx,
                                        setIdx,
                                        'weightKg',
                                        0
                                      );
                                      return;
                                    }
                                    const cleaned = raw.replace(/^0+(?=\d)/, '');
                                    const val = parseFloat(cleaned);
                                    handleUpdateSet(
                                      exIdx,
                                      setIdx,
                                      'weightKg',
                                      isNaN(val) ? 0 : val
                                    );
                                  }}
                                  placeholder={
                                    setBW
                                      ? 'BW'
                                      : (prevSet && prevSet.weightKg > 0 ? `${prevSet.weightKg}` : 'kg')
                                  }
                                  className={`w-full ${isBW ? 'pl-2 pr-7' : 'px-2'} py-1 sm:py-1.5 rounded-lg font-mono font-bold text-xs sm:text-sm bg-slate-900 border text-white focus:outline-hidden focus:ring-1 sm:focus:ring-2 focus:ring-blue-500 ${
                                    set.completed ? 'border-emerald-700' : 'border-slate-700'
                                  } ${setBW && (set.weightKg === 0 || !set.weightKg) ? 'placeholder:text-emerald-400 placeholder:font-bold' : ''}`}
                                />
                                {setBW && (set.weightKg === 0 || !set.weightKg) && (
                                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">
                                    BW
                                  </span>
                                )}
                                {setBW && (set.weightKg ?? 0) > 0 && (
                                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-blue-400 uppercase tracking-wider">
                                    +KG
                                  </span>
                                )}
                              </div>

                              {/* Quick Bodyweight (BW) selector button per set - ONLY if exercise is bodyweight-compatible */}
                              {isBW && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentlyBW = setBW;
                                    if (!currentlyBW || (set.weightKg ?? 0) > 0) {
                                      handleUpdateSetMultiple(exIdx, setIdx, {
                                        isBodyweight: true,
                                        weightKg: 0
                                      });
                                    } else {
                                      handleUpdateSetMultiple(exIdx, setIdx, {
                                        isBodyweight: false,
                                        weightKg: prevSet?.weightKg && prevSet.weightKg > 0 ? prevSet.weightKg : 20
                                      });
                                    }
                                  }}
                                  className={`px-1.5 py-1 rounded text-[10px] font-bold transition-all border shrink-0 ${
                                    setBW && (set.weightKg === 0 || !set.weightKg)
                                      ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50 shadow-xs'
                                      : setBW && (set.weightKg ?? 0) > 0
                                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-emerald-500/20 hover:text-emerald-300'
                                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200 hover:bg-slate-700'
                                  }`}
                                  title={
                                    setBW && (set.weightKg === 0 || !set.weightKg)
                                      ? 'Bodyweight set (0kg added). Click to switch to external weight.'
                                      : 'Click to select Bodyweight (BW)'
                                  }
                                >
                                  BW
                                </button>
                              )}
                            </div>
                          </td>

                          <td className="py-2 px-1.5 sm:px-2">
                            <input
                              type="number"
                              min="1"
                              value={set.reps === 0 || !set.reps ? '' : set.reps}
                              onFocus={e => e.target.select()}
                              onChange={e => {
                                const raw = e.target.value;
                                if (raw === '') {
                                  handleUpdateSet(
                                    exIdx,
                                    setIdx,
                                    'reps',
                                    0
                                  );
                                  return;
                                }
                                const cleaned = raw.replace(/^0+(?=\d)/, '');
                                const val = parseInt(cleaned, 10);
                                handleUpdateSet(
                                  exIdx,
                                  setIdx,
                                  'reps',
                                  isNaN(val) ? 0 : val
                                );
                              }}
                              placeholder={prevSet && prevSet.reps > 0 ? `${prevSet.reps}` : 'reps'}
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
        <div className="flex justify-center pt-6 pb-2">
          <button
            type="button"
            onClick={() => setShowDiscardConfirmModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 hover:border-rose-500/50 text-xs font-semibold transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Cancel and Discard Workout</span>
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

      {/* Discard Workout Confirmation Modal */}
      {showDiscardConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <AlertCircle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Discard Workout?</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to discard this workout? All logged sets, reps, and elapsed workout time will be permanently cleared.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDiscardConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
              >
                Keep Lifting
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDiscardConfirmModal(false);
                  clearActiveWorkoutSession();
                  onCancelWorkout();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950 transition-colors"
              >
                Discard Workout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
