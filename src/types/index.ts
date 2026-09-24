export type MuscleId =
  | 'chest_upper'
  | 'chest_mid'
  | 'chest_lower'
  | 'pectoralis_major'
  | 'anterior_deltoid'
  | 'lateral_deltoid'
  | 'posterior_deltoid'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'rectus_abdominis'
  | 'obliques'
  | 'trapezius'
  | 'rhomboids'
  | 'latissimus_dorsi'
  | 'spinal_erectors'
  | 'gluteus'
  | 'quadriceps'
  | 'hamstrings'
  | 'calves'
  | 'adductors';

export type MuscleRole = 'PRIMARY' | 'SECONDARY' | 'STABILIZER';

export type MuscleFreshnessState =
  | 'fresh'
  | 'moderate'
  | 'recently_trained'
  | 'high_recent_exposure'
  | 'untrained';

export interface MuscleInfo {
  id: MuscleId;
  name: string;
  category: 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core';
  view: 'front' | 'back' | 'both';
  description: string;
}

export interface MuscleExposureData {
  muscleId: MuscleId;
  name: string;
  lastTrainedAt: string | null; // ISO string
  daysSinceTraining: number | null;
  lastDirectTrainedAt?: string | null;
  daysSinceDirectTraining?: number | null;
  lastIndirectTrainedAt?: string | null;
  daysSinceIndirectTraining?: number | null;
  directSets7d?: number;
  indirectSets7d?: number;
  hasDirectTrainingRecently?: boolean;
  isIndirectOnly?: boolean;
  effectiveSets7d: number;
  effectiveSets30d: number;
  frequencyWeekly: number;
  freshnessStatus: MuscleFreshnessState;
  volumeScore: number; // 0 to 100
  recentExercises: Array<{
    exerciseName: string;
    date: string;
    sets: number;
  }>;
  recommendation: string;
}

export type MovementPattern =
  | 'push_horizontal'
  | 'push_vertical'
  | 'pull_horizontal'
  | 'pull_vertical'
  | 'squat'
  | 'hinge'
  | 'lunge'
  | 'isolation'
  | 'carry'
  | 'core';

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'cable'
  | 'machine'
  | 'bodyweight'
  | 'kettlebell'
  | 'smith_machine';

export interface ExerciseMuscleContribution {
  muscleId: MuscleId;
  role: MuscleRole;
  contributionFactor: number; // 0.1 to 1.0
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  movementPattern: MovementPattern;
  equipment: Equipment;
  mechanics: 'compound' | 'isolation';
  description: string;
  muscles: ExerciseMuscleContribution[];
  instructions?: string[];
  tips?: string[];
}

export type SetType = 'warmup' | 'normal' | 'drop' | 'failure';

export interface WorkoutSet {
  id: string;
  setNumber: number;
  type: SetType;
  weightKg: number;
  reps: number;
  rpe?: number; // Rate of Perceived Exertion (6 to 10)
  completed: boolean;
  completedAt?: string;
  isPR?: boolean;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: WorkoutSet[];
  notes?: string;
  targetRestSeconds?: number;
}

export interface Workout {
  id: string;
  userId?: string;
  name: string;
  startedAt: string; // ISO string
  completedAt?: string; // ISO string
  durationSeconds: number;
  exercises: WorkoutExercise[];
  notes?: string;
  totalVolumeKg: number;
  totalSets: number;
  musclesTrained: MuscleId[];
  rpeAverage?: number;
}

export interface WorkoutTemplate {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  category: string;
  estimatedMinutes?: number;
  estimatedDurationMinutes?: number;
  targetMuscles?: MuscleId[];
  exercises: Array<{
    exerciseId: string;
    exerciseName: string;
    sets?: number;
    targetSets?: number;
    repMin: number;
    repMax: number;
    restSeconds?: number;
    suggestedWeightKg?: number;
    notes?: string;
  }>;
}

export interface UserProfile {
  id: string;
  name: string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  primaryGoal: 'hypertrophy' | 'strength' | 'endurance' | 'recomposition' | 'general_fitness';
  trainingDaysPerWeek: number;
  preferredDurationMinutes?: number;
  availableEquipment?: Equipment[];
  preferredUnit?: 'kg' | 'lbs';
  weightUnit?: 'kg' | 'lbs';
  targetFocusAreas?: MuscleId[];
  focusMuscles?: MuscleId[];
  notes?: string;
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  maxWeightKg: number;
  maxReps: number;
  estimated1RMKg: number;
  achievedAt: string;
  workoutId: string;
  userId?: string;
}

export interface TrainingRadar {
  summary: string;
  suggestedFocusToday: {
    muscles: MuscleId[];
    title: string;
    rationale: string;
    estimatedDurationMinutes: number;
  };
  highExposureMuscles: MuscleExposureData[];
  recoveredMuscles: MuscleExposureData[];
  neglectedMuscles: MuscleExposureData[];
  pushPullRatio: number;
  upperLowerRatio: number;
  weeklyWorkoutsCount: number;
  weeklyVolumeKg: number;
  weeklyTotalSets: number;
  streakDays: number;
  streakState?: {
    currentStreak: number;
    workedOutToday: boolean;
    isFrozen?: boolean;
    freezeReason?: string;
    restDaysInStreak?: number;
    streakMessage: string;
    daysThisWeek: Array<{
      dayName: string;
      dateStr: string;
      trained: boolean;
      isToday: boolean;
      isRestDayFreeze?: boolean;
    }>;
    nextMilestone: number;
    daysToMilestone: number;
  };
}

export interface AIWorkoutPlan {
  name: string;
  targetFocus: string;
  durationMinutes: number;
  rationale: string;
  warmupTip: string;
  exercises: Array<{
    exerciseId: string;
    exerciseName: string;
    sets: number;
    repMin: number;
    repMax: number;
    restSeconds: number;
    suggestedWeightKg: number;
    coachingNote: string;
  }>;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  recommendedWorkout?: AIWorkoutPlan;
  referencedMuscles?: MuscleId[];
  suggestedActions?: string[];
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: AuthUser;
  profile: UserProfile;
}

export interface TrainingDataArchive {
  version: string;
  exportedAt: string;
  appName: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
  profile: UserProfile;
  workouts: Workout[];
  templates: WorkoutTemplate[];
  personalRecords: PersonalRecord[];
}
