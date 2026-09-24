import { Workout, WorkoutExercise } from '../types';

export interface ActiveWorkoutSession {
  id: string;
  name: string;
  notes: string;
  startedAt: string; // ISO string when workout began
  workoutDateTime: string; // YYYY-MM-DDTHH:mm
  exercises: WorkoutExercise[];
  accumulatedSeconds: number; // accumulated running seconds prior to last resumption
  lastResumedAt: number | null; // Date.now() timestamp when timer was running, or null if paused
  isTimerRunning: boolean;
  restTimerSeconds: number | null;
  restTimerTotal: number;
  restEndTimestamp: number | null;
  isRestPaused: boolean;
  restPausedRemaining: number | null;
  updatedAt: number; // Date.now()
}

export const ACTIVE_WORKOUT_STORAGE_KEY = 'training_intel_active_workout_v2';
const MAX_SESSION_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export const toDateTimeLocal = (d: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

/**
 * Retrieve active workout session from localStorage.
 * Automatically cleans up abandoned sessions older than 24 hours.
 */
export function getActiveWorkoutSession(): ActiveWorkoutSession | null {
  try {
    const raw = localStorage.getItem(ACTIVE_WORKOUT_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as ActiveWorkoutSession;
    if (!session || typeof session !== 'object' || !session.id) {
      localStorage.removeItem(ACTIVE_WORKOUT_STORAGE_KEY);
      return null;
    }
    const now = Date.now();
    if (session.updatedAt && (now - session.updatedAt > MAX_SESSION_AGE_MS)) {
      localStorage.removeItem(ACTIVE_WORKOUT_STORAGE_KEY);
      return null;
    }
    return session;
  } catch (err) {
    console.warn('Failed to parse active workout session:', err);
    return null;
  }
}

/**
 * Save current active workout session to localStorage.
 */
export function saveActiveWorkoutSession(session: ActiveWorkoutSession): void {
  try {
    session.updatedAt = Date.now();
    localStorage.setItem(ACTIVE_WORKOUT_STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.warn('Failed to persist active workout session:', err);
  }
}

/**
 * Clear the active workout session (on finish or user confirmation to discard).
 */
export function clearActiveWorkoutSession(): void {
  try {
    localStorage.removeItem(ACTIVE_WORKOUT_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear active workout session:', err);
  }
}

/**
 * Compute the precise elapsed wall-clock seconds from a stored session.
 */
export function computeCurrentElapsedSeconds(session: ActiveWorkoutSession): number {
  const accumulated = Math.max(0, session.accumulatedSeconds || 0);
  if (!session.isTimerRunning || !session.lastResumedAt) {
    return accumulated;
  }
  const currentSlice = Math.max(0, Math.floor((Date.now() - session.lastResumedAt) / 1000));
  return accumulated + currentSlice;
}

/**
 * Convert a stored ActiveWorkoutSession into a Partial<Workout> for initialization.
 */
export function sessionToPartialWorkout(session: ActiveWorkoutSession): Partial<Workout> {
  return {
    id: session.id,
    name: session.name,
    startedAt: session.startedAt,
    notes: session.notes,
    exercises: session.exercises,
    durationSeconds: computeCurrentElapsedSeconds(session)
  };
}

/**
 * Create and persist a new workout session.
 */
export function createAndSaveActiveSession(data: {
  id?: string;
  name: string;
  notes?: string;
  startedAt?: string;
  exercises?: WorkoutExercise[];
}): ActiveWorkoutSession {
  const now = Date.now();
  const session: ActiveWorkoutSession = {
    id: data.id || `workout_${now}`,
    name: data.name,
    notes: data.notes || '',
    startedAt: data.startedAt || new Date(now).toISOString(),
    workoutDateTime: toDateTimeLocal(new Date(data.startedAt || now)),
    exercises: data.exercises || [],
    accumulatedSeconds: 0,
    lastResumedAt: now,
    isTimerRunning: true,
    restTimerSeconds: null,
    restTimerTotal: 90,
    restEndTimestamp: null,
    isRestPaused: false,
    restPausedRemaining: null,
    updatedAt: now
  };
  saveActiveWorkoutSession(session);
  return session;
}
