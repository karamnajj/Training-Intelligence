import { Workout, WorkoutExercise, WorkoutSet, PersonalRecord } from '../types';
import { isBodyweightExercise } from './exerciseDatabase';

export interface SetPRInfo {
  isPR: boolean;
  prType?: 'weight' | 'reps' | 'both';
  label?: string;
  detail?: string;
  previousBest?: {
    weightKg?: number;
    reps?: number;
  };
}

export interface WorkoutPRSummary {
  workoutId: string;
  prCount: number;
  weightPRCount: number;
  repPRCount: number;
  hasPR: boolean;
  // Map of setKey ("exId_setIdx" or set.id) -> SetPRInfo
  setPRs: Record<string, SetPRInfo>;
}

/**
 * Normalizes sets of an exercise into a standard array of WorkoutSet.
 */
function normalizeSets(sets: any): any[] {
  if (Array.isArray(sets)) return sets;
  if (sets && typeof sets === 'object') return Object.values(sets);
  return [];
}

/**
 * Computes PRs chronologically across an array of workouts.
 * Returns a map of workoutId -> WorkoutPRSummary.
 */
export function computeAllWorkoutsPRs(workouts: Workout[]): Map<string, WorkoutPRSummary> {
  const result = new Map<string, WorkoutPRSummary>();
  if (!workouts || workouts.length === 0) return result;

  // Sort workouts chronologically so older workouts establish baselines
  const sorted = [...workouts].sort((a, b) => {
    const timeA = new Date(a.completedAt || a.startedAt || 0).getTime();
    const timeB = new Date(b.completedAt || b.startedAt || 0).getTime();
    return timeA - timeB;
  });

  // Running tracking per exercise:
  // exerciseId -> highest weight completed with reps > 0
  const maxWeightMap = new Map<string, number>();
  // exerciseId -> highest reps completed for bodyweight (0kg or isBodyweight)
  const maxBwRepsMap = new Map<string, number>();
  // exerciseId -> Map<weightKg, highest reps achieved at this weight>
  const maxRepsAtWeightMap = new Map<string, Map<number, number>>();

  for (const w of sorted) {
    let prCount = 0;
    let weightPRCount = 0;
    let repPRCount = 0;
    const setPRs: Record<string, SetPRInfo> = {};

    for (const ex of w.exercises || []) {
      const exId = ex.exerciseId;
      const exName = ex.exerciseName || exId;
      const setsArr = normalizeSets(ex.sets);

      for (let sIdx = 0; sIdx < setsArr.length; sIdx++) {
        const s = setsArr[sIdx];
        if (!s || !s.completed) continue;

        const weight = Number(s.weightKg) || 0;
        const reps = Number(s.reps) || 0;
        if (reps <= 0) continue;

        const isBWCompatible = isBodyweightExercise(exId, exName);
        const isBW = isBWCompatible && Boolean(s.isBodyweight || weight === 0);
        const setKey = s.id || `${exId}_${sIdx}`;

        let isWeightPR = false;
        let isRepPR = false;
        let detail = '';

        if (!isBW && weight > 0) {
          // Weighted exercise set
          const prevMaxWeight = maxWeightMap.get(exId);
          if (prevMaxWeight === undefined) {
            // First time establishing a weighted mark for this exercise
            isWeightPR = true;
            detail = `First logged weight: ${weight} kg`;
          } else if (weight > prevMaxWeight) {
            isWeightPR = true;
            detail = `New max weight: ${weight} kg (previous: ${prevMaxWeight} kg)`;
          }

          // Check rep PR at this weight (only if not already a weight PR, or if hitting high reps at new weight)
          let repsMap = maxRepsAtWeightMap.get(exId);
          if (!repsMap) {
            repsMap = new Map<number, number>();
            maxRepsAtWeightMap.set(exId, repsMap);
          }
          const prevMaxRepsAtWeight = repsMap.get(weight);

          if (!isWeightPR && prevMaxRepsAtWeight !== undefined && reps > prevMaxRepsAtWeight) {
            isRepPR = true;
            detail = `New rep PR at ${weight} kg: ${reps} reps (previous: ${prevMaxRepsAtWeight})`;
          }

          // Update running bests
          if (prevMaxWeight === undefined || weight > prevMaxWeight) {
            maxWeightMap.set(exId, weight);
          }
          if (prevMaxRepsAtWeight === undefined || reps > prevMaxRepsAtWeight) {
            repsMap.set(weight, reps);
          }
        } else {
          // Bodyweight exercise set (0kg added)
          const prevMaxBwReps = maxBwRepsMap.get(exId);
          if (prevMaxBwReps === undefined) {
            isRepPR = true;
            detail = `First logged bodyweight: ${reps} reps`;
          } else if (reps > prevMaxBwReps) {
            isRepPR = true;
            detail = `New bodyweight rep PR: ${reps} reps (previous: ${prevMaxBwReps})`;
          }

          if (prevMaxBwReps === undefined || reps > prevMaxBwReps) {
            maxBwRepsMap.set(exId, reps);
          }
        }

        if (isWeightPR || isRepPR) {
          prCount++;
          if (isWeightPR && isRepPR) {
            weightPRCount++;
            repPRCount++;
            setPRs[setKey] = {
              isPR: true,
              prType: 'both',
              label: 'PR (Weight & Reps)',
              detail
            };
          } else if (isWeightPR) {
            weightPRCount++;
            setPRs[setKey] = {
              isPR: true,
              prType: 'weight',
              label: 'Weight PR',
              detail
            };
          } else {
            repPRCount++;
            setPRs[setKey] = {
              isPR: true,
              prType: 'reps',
              label: 'Rep PR',
              detail
            };
          }

          // Also stamp onto the set object for convenience
          s.isPR = true;
          s.prType = isWeightPR && isRepPR ? 'both' : (isWeightPR ? 'weight' : 'reps');
        }
      }
    }

    result.set(w.id, {
      workoutId: w.id,
      prCount,
      weightPRCount,
      repPRCount,
      hasPR: prCount > 0,
      setPRs
    });
  }

  return result;
}

/**
 * Checks in real-time whether a set in an active workout constitutes a PR
 * based on all prior workouts and earlier sets in the current session.
 */
export function checkActiveSetPR(
  set: WorkoutSet,
  exerciseId: string,
  exerciseName: string,
  previousWorkouts: Workout[],
  currentSessionCompletedSetsBefore: WorkoutSet[] = []
): SetPRInfo {
  if (!set || !set.completed) {
    return { isPR: false };
  }

  const weight = Number(set.weightKg) || 0;
  const reps = Number(set.reps) || 0;
  if (reps <= 0) {
    return { isPR: false };
  }

  const isBWCompatible = isBodyweightExercise(exerciseId, exerciseName);
  const isBW = isBWCompatible && Boolean(set.isBodyweight || weight === 0);

  // 1. Gather historical bests from previous workouts
  let historicalMaxWeight = 0;
  let historicalMaxBwReps = 0;
  let historicalMaxRepsAtWeight = 0;
  let hasAnyHistoricalData = false;

  for (const pw of previousWorkouts || []) {
    for (const ex of pw.exercises || []) {
      if (ex.exerciseId !== exerciseId) continue;
      const setsArr = normalizeSets(ex.sets);
      for (const s of setsArr) {
        if (!s || !s.completed) continue;
        const sReps = Number(s.reps) || 0;
        const sWeight = Number(s.weightKg) || 0;
        if (sReps <= 0) continue;

        hasAnyHistoricalData = true;
        const sBW = isBWCompatible && Boolean(s.isBodyweight || sWeight === 0);

        if (!sBW && sWeight > 0) {
          if (sWeight > historicalMaxWeight) historicalMaxWeight = sWeight;
          if (sWeight === weight && sReps > historicalMaxRepsAtWeight) {
            historicalMaxRepsAtWeight = sReps;
          }
        } else {
          if (sReps > historicalMaxBwReps) historicalMaxBwReps = sReps;
        }
      }
    }
  }

  // 2. Also incorporate prior completed sets from current workout session
  for (const cs of currentSessionCompletedSetsBefore) {
    if (!cs || !cs.completed) continue;
    const csReps = Number(cs.reps) || 0;
    const csWeight = Number(cs.weightKg) || 0;
    if (csReps <= 0) continue;

    hasAnyHistoricalData = true;
    const csBW = isBWCompatible && Boolean(cs.isBodyweight || csWeight === 0);

    if (!csBW && csWeight > 0) {
      if (csWeight > historicalMaxWeight) historicalMaxWeight = csWeight;
      if (csWeight === weight && csReps > historicalMaxRepsAtWeight) {
        historicalMaxRepsAtWeight = csReps;
      }
    } else {
      if (csReps > historicalMaxBwReps) historicalMaxBwReps = csReps;
    }
  }

  if (!isBW && weight > 0) {
    if (!hasAnyHistoricalData || weight > historicalMaxWeight) {
      return {
        isPR: true,
        prType: 'weight',
        label: 'Weight PR',
        detail: historicalMaxWeight > 0
          ? `Heaviest load ever: ${weight} kg (prior best: ${historicalMaxWeight} kg)`
          : `First logged personal record: ${weight} kg`,
        previousBest: { weightKg: historicalMaxWeight }
      };
    }

    if (historicalMaxRepsAtWeight > 0 && reps > historicalMaxRepsAtWeight) {
      return {
        isPR: true,
        prType: 'reps',
        label: 'Rep PR',
        detail: `Most reps at ${weight} kg: ${reps} reps (prior best: ${historicalMaxRepsAtWeight})`,
        previousBest: { weightKg: weight, reps: historicalMaxRepsAtWeight }
      };
    }
  } else {
    // Bodyweight
    if (!hasAnyHistoricalData || reps > historicalMaxBwReps) {
      return {
        isPR: true,
        prType: 'reps',
        label: 'Rep PR',
        detail: historicalMaxBwReps > 0
          ? `Most bodyweight reps: ${reps} reps (prior best: ${historicalMaxBwReps})`
          : `First logged bodyweight record: ${reps} reps`,
        previousBest: { reps: historicalMaxBwReps }
      };
    }
  }

  return { isPR: false };
}
