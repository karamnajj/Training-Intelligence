import {
  MuscleId,
  MuscleInfo,
  MuscleExposureData,
  MuscleFreshnessState,
  Exercise,
  Workout,
  PersonalRecord,
  TrainingRadar,
  AIWorkoutPlan
} from '../types';

export const MUSCLE_CATALOG: Record<MuscleId, MuscleInfo> = {
  chest_upper: {
    id: 'chest_upper',
    name: 'Upper Chest (Clavicular Head)',
    category: 'chest',
    view: 'front',
    description: 'Upper clavicular fibers of the pectoralis major. Primary driver in incline presses, incline flyes, and low-to-high cable crossovers for upper shelf mass.'
  },
  chest_mid: {
    id: 'chest_mid',
    name: 'Mid Chest (Sternal Head)',
    category: 'chest',
    view: 'front',
    description: 'Main sternocostal fibers of the pectoralis major responsible for horizontal adduction. Targeted by flat bench presses, dumbbell presses, and pec deck flyes.'
  },
  chest_lower: {
    id: 'chest_lower',
    name: 'Lower Chest (Abdominal Head)',
    category: 'chest',
    view: 'front',
    description: 'Lower abdominal/costal head of the pectoralis major. Targeted by parallel bar dips, decline pressing, and high-to-low cable flyes.'
  },
  pectoralis_major: {
    id: 'pectoralis_major',
    name: 'Chest (Pectoralis Major)',
    category: 'chest',
    view: 'front',
    description: 'Main chest muscle complex spanning clavicular, sternal, and abdominal heads.'
  },
  anterior_deltoid: {
    id: 'anterior_deltoid',
    name: 'Front Delts (Anterior Deltoid)',
    category: 'shoulders',
    view: 'front',
    description: 'Front shoulder muscle assisting in forward arm flexion and overhead pressing.'
  },
  lateral_deltoid: {
    id: 'lateral_deltoid',
    name: 'Side Delts (Lateral Deltoid)',
    category: 'shoulders',
    view: 'both',
    description: 'Side shoulder muscle responsible for arm abduction creating shoulder width and 3D delts.'
  },
  posterior_deltoid: {
    id: 'posterior_deltoid',
    name: 'Rear Delts (Posterior Deltoid)',
    category: 'shoulders',
    view: 'back',
    description: 'Rear shoulder muscle crucial for shoulder joint integrity, horizontal abduction, and posterior 3D caps.'
  },
  biceps: {
    id: 'biceps',
    name: 'Biceps (Biceps Brachii)',
    category: 'arms',
    view: 'front',
    description: 'Front arm muscle responsible for elbow flexion, forearm supination, and peak arm fullness.'
  },
  triceps: {
    id: 'triceps',
    name: 'Triceps (Triceps Brachii)',
    category: 'arms',
    view: 'back',
    description: 'Back arm muscle comprising lateral, long, and medial heads, responsible for elbow extension and 2/3 of arm size.'
  },
  forearms: {
    id: 'forearms',
    name: 'Forearms (Brachioradialis & Flexors)',
    category: 'arms',
    view: 'front',
    description: 'Flexors, extensors, and brachioradialis controlling wrist movement and crushing grip strength.'
  },
  rectus_abdominis: {
    id: 'rectus_abdominis',
    name: 'Abs (Rectus Abdominis)',
    category: 'core',
    view: 'front',
    description: 'Front core abdominal six-pack wall providing spinal flexion and anterior trunk stability.'
  },
  obliques: {
    id: 'obliques',
    name: 'Obliques (Internal & External Obliques)',
    category: 'core',
    view: 'front',
    description: 'Side core musculature driving trunk rotation, waist taper, and lateral flexion.'
  },
  trapezius: {
    id: 'trapezius',
    name: 'Traps (Trapezius)',
    category: 'back',
    view: 'back',
    description: 'Upper back and neck muscle controlling scapular elevation, shrugs, retraction, and yoke thickness.'
  },
  latissimus_dorsi: {
    id: 'latissimus_dorsi',
    name: 'Lats (Latissimus Dorsi)',
    category: 'back',
    view: 'back',
    description: 'Broadest muscle of the back creating the classic V-taper wing span (pulling and rowing movements).'
  },
  spinal_erectors: {
    id: 'spinal_erectors',
    name: 'Lower Back (Spinal Erectors)',
    category: 'back',
    view: 'back',
    description: 'Deep muscles running along the lumbar spine providing trunk extension, deadlift lockouts, and core bracing.'
  },
  gluteus: {
    id: 'gluteus',
    name: 'Glutes (Gluteus Maximus & Medius)',
    category: 'legs',
    view: 'back',
    description: 'Primary hip extensors and stabilizers driving sprinting, squatting, hip thrusting, and deadlifting power.'
  },
  quadriceps: {
    id: 'quadriceps',
    name: 'Quads (Quadriceps Femoris)',
    category: 'legs',
    view: 'front',
    description: 'Four-headed front thigh muscle group responsible for knee extension, squat depth, and leg sweep mass.'
  },
  hamstrings: {
    id: 'hamstrings',
    name: 'Hamstrings (Biceps Femoris & Semitendinosus)',
    category: 'legs',
    view: 'back',
    description: 'Posterior thigh muscles responsible for knee flexion, RDL hip hinge power, and hamstring sweep.'
  },
  calves: {
    id: 'calves',
    name: 'Calves (Gastrocnemius & Soleus)',
    category: 'legs',
    view: 'both',
    description: 'Lower leg muscles driving plantarflexion, jumping, diamond calf development, and ankle stabilization.'
  },
  adductors: {
    id: 'adductors',
    name: 'Inner Thigh (Adductor Complex)',
    category: 'legs',
    view: 'front',
    description: 'Inner thigh muscles providing hip adduction, deep squat stability, and inner leg fullness.'
  }
};

/**
 * Returns whether a muscle belongs to the arm group (biceps, triceps, forearms).
 */
export function isArmMuscle(muscleId: MuscleId): boolean {
  return muscleId === 'biceps' || muscleId === 'triceps' || muscleId === 'forearms';
}

/**
 * Extracts the user-friendly bro science name before the bracketed scientific name.
 * e.g. "Abs (Rectus Abdominis)" -> "Abs"
 *      "Lower Back (Spinal Erectors)" -> "Lower Back"
 */
export function getMuscleBroName(nameOrId: string): string {
  const catalogName = MUSCLE_CATALOG[nameOrId as MuscleId]?.name || nameOrId;
  const beforeBracket = catalogName.split('(')[0].trim();
  return beforeBracket || catalogName;
}

export const ALL_MUSCLE_IDS = Object.keys(MUSCLE_CATALOG) as MuscleId[];

/**
 * Calculate recency decay factor based on days passed.
 * Recency factor smoothly decays from 1.0 (recent/today) down to ~0.05 after 10+ days.
 */
export function getRecencyWeight(daysAgo: number): number {
  if (daysAgo < 0) return 1.0;
  if (daysAgo <= 1) return 1.0;
  if (daysAgo <= 2) return 0.85;
  if (daysAgo <= 3) return 0.65;
  if (daysAgo <= 5) return 0.40;
  if (daysAgo <= 7) return 0.20;
  if (daysAgo <= 10) return 0.08;
  return 0.03;
}

/**
 * Calculate Estimated 1RM using the validated Epley formula:
 * 1RM = Weight * (1 + Reps / 30)
 */
export function calculateEstimated1RM(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg <= 0) return 0;
  if (reps === 1) return weightKg;
  const e1rm = weightKg * (1 + reps / 30);
  return Math.round(e1rm * 10) / 10;
}

/**
 * Progressive Overload Evaluator
 * Evaluates previous performance and target parameters to give grounded, actionable targets.
 */
export function calculateProgressiveOverload(
  previousSets: Array<{ weightKg: number; reps: number }>,
  targetRepRange: { min: number; max: number } = { min: 8, max: 10 }
): {
  recommendedWeightKg: number;
  recommendedReps: number;
  strategy: 'increase_weight' | 'increase_reps' | 'maintain_and_consolidate' | 'deload_or_form';
  message: string;
  badge: string;
} {
  if (!previousSets || previousSets.length === 0) {
    return {
      recommendedWeightKg: 0,
      recommendedReps: targetRepRange.min,
      strategy: 'maintain_and_consolidate',
      message: 'Establish a baseline with solid form and controlled tempo.',
      badge: 'Baseline'
    };
  }

  const completedWorkingSets = previousSets.filter(s => s.reps > 0 && s.weightKg > 0);
  if (completedWorkingSets.length === 0) {
    return {
      recommendedWeightKg: previousSets[0]?.weightKg || 0,
      recommendedReps: targetRepRange.min,
      strategy: 'maintain_and_consolidate',
      message: 'Set initial working weight with good form.',
      badge: 'Target'
    };
  }

  const avgWeight =
    completedWorkingSets.reduce((sum, s) => sum + s.weightKg, 0) / completedWorkingSets.length;
  const allHitTopReps = completedWorkingSets.every(s => s.reps >= targetRepRange.max);

  if (allHitTopReps) {
    const bump = avgWeight >= 70 ? 2.5 : 1.25;
    const nextWeight = Math.round((avgWeight + bump) * 2) / 2;
    return {
      recommendedWeightKg: nextWeight,
      recommendedReps: targetRepRange.min,
      strategy: 'increase_weight',
      message: `You completed all sets at ${targetRepRange.max} reps! Advance weight by +${bump}kg and aim for ${targetRepRange.min} reps.`,
      badge: `+${bump}kg Target`
    };
  }

  const minRepsHit = completedWorkingSets.every(s => s.reps >= targetRepRange.min);
  if (minRepsHit) {
    const targetReps = Math.min(
      targetRepRange.max,
      Math.max(...completedWorkingSets.map(s => s.reps)) + 1
    );
    return {
      recommendedWeightKg: Math.round(avgWeight * 2) / 2,
      recommendedReps: targetReps,
      strategy: 'increase_reps',
      message: `Weight is dialed in. Keep ${Math.round(avgWeight)}kg and aim for +1 rep per set (target: ${targetReps} reps).`,
      badge: '+1 Rep Target'
    };
  }

  return {
    recommendedWeightKg: Math.round(avgWeight * 2) / 2,
    recommendedReps: targetRepRange.min,
    strategy: 'maintain_and_consolidate',
    message: `Consolidate at ${Math.round(avgWeight)}kg. Focus on clean tempo and reaching full ${targetRepRange.min} reps before adding load.`,
    badge: 'Consolidate'
  };
}

/**
 * Calculates effective muscle training exposure and freshness states from workout history.
 */
export function calculateMuscleExposures(
  workouts: Workout[],
  exercisesMap: Record<string, Exercise>,
  referenceDate: Date = new Date()
): Record<MuscleId, MuscleExposureData> {
  const result: Partial<Record<MuscleId, MuscleExposureData>> = {};

  // Initialize all muscles
  for (const muscleId of ALL_MUSCLE_IDS) {
    result[muscleId] = {
      muscleId,
      name: MUSCLE_CATALOG[muscleId].name,
      lastTrainedAt: null,
      daysSinceTraining: null,
      lastDirectTrainedAt: null,
      daysSinceDirectTraining: null,
      lastIndirectTrainedAt: null,
      daysSinceIndirectTraining: null,
      directSets7d: 0,
      indirectSets7d: 0,
      hasDirectTrainingRecently: false,
      isIndirectOnly: false,
      effectiveSets7d: 0,
      effectiveSets30d: 0,
      frequencyWeekly: 0,
      freshnessStatus: 'untrained',
      volumeScore: 0,
      recentExercises: [],
      recommendation: 'No recent training recorded. Fresh and primed for stimulus.'
    };
  }

  // Sort workouts newest first
  const completedWorkouts = workouts
    .filter(w => w.completedAt || w.startedAt)
    .sort((a, b) => {
      const dateA = new Date(a.completedAt || a.startedAt).getTime();
      const dateB = new Date(b.completedAt || b.startedAt).getTime();
      return dateB - dateA;
    });

  const muscleExerciseMap: Record<MuscleId, Map<string, { exerciseName: string; date: string; sets: number }>> = {} as any;
  ALL_MUSCLE_IDS.forEach(id => (muscleExerciseMap[id] = new Map()));

  for (const workout of completedWorkouts) {
    const workoutDate = new Date(workout.completedAt || workout.startedAt);
    const diffMs = referenceDate.getTime() - workoutDate.getTime();
    const daysAgo = Math.max(0, diffMs / (1000 * 60 * 60 * 24));
    const recencyWeight = getRecencyWeight(daysAgo);

    for (const exEntry of workout.exercises || []) {
      let exerciseDef = exercisesMap[exEntry.exerciseId];
      if (!exerciseDef) {
        const targetId = (exEntry.exerciseId || '').toLowerCase().trim();
        const targetName = (exEntry.exerciseName || '').toLowerCase().trim();
        const aliases: Record<string, string> = {
          barbell_squat: 'barbell_back_squat',
          squat: 'barbell_back_squat',
          back_squat: 'barbell_back_squat',
          front_squat: 'barbell_front_squat',
          bench_press: 'barbell_bench_press',
          flat_bench: 'barbell_bench_press',
          deadlift: 'barbell_deadlift',
          rdl: 'romanian_deadlift',
          pull_up: 'pullup',
          pull_ups: 'pullup',
          chin_up: 'chinup',
          lat_pull_down: 'lat_pulldown',
          calf_raise: 'standing_calf_raise',
          leg_press: 'leg_press_machine',
          tricep_curl: 'tricep_curl_dips_machine',
          tricep_dips: 'tricep_curl_dips_machine',
          dips_machine: 'tricep_curl_dips_machine',
          seated_dip_machine: 'tricep_curl_dips_machine',
          chest_supported_row: 'chest_supported_seated_back_row',
          chest_supported_seated_row: 'chest_supported_seated_back_row',
          chest_supported_seated_back_row: 'chest_supported_seated_back_row',
          seated_back_row: 'chest_supported_seated_back_row',
          back_supported_tricep_pushdown: 'back_supported_cable_tricep_pushdown',
          back_supported_pushdown: 'back_supported_cable_tricep_pushdown'
        };
        const aliasKey = aliases[targetId] || aliases[targetName];
        if (aliasKey && exercisesMap[aliasKey]) {
          exerciseDef = exercisesMap[aliasKey];
        } else {
          exerciseDef = Object.values(exercisesMap).find(e => 
            e.id.toLowerCase() === targetId ||
            e.name.toLowerCase() === targetName ||
            (targetName && e.name.toLowerCase().includes(targetName)) ||
            (targetId && e.id.toLowerCase().includes(targetId))
          );
        }
      }
      if (!exerciseDef) continue;

      const rawSets = Array.isArray(exEntry?.sets)
        ? exEntry.sets
        : (exEntry?.sets && typeof exEntry.sets === 'object'
          ? Object.values(exEntry.sets)
          : (typeof exEntry?.sets === 'number'
            ? Array.from({ length: exEntry.sets }).map(() => ({ completed: true, type: 'normal' }))
            : []));
      const workingSets = (rawSets as any[]).filter(s => s && s.completed && s.type !== 'warmup').length;
      if (workingSets === 0) continue;

      // Expand contributions if chest_mid/chest_upper to also cover pectoralis_major
      const contributions = [...exerciseDef.muscles];
      const hasChest = exerciseDef.muscles.some(m => m.muscleId === 'chest_mid' || m.muscleId === 'chest_upper');
      if (hasChest && !exerciseDef.muscles.some(m => m.muscleId === 'pectoralis_major')) {
        contributions.push({ muscleId: 'pectoralis_major', role: 'PRIMARY', contributionFactor: 0.9 });
      }

      for (const contrib of contributions) {
        const muscleId = contrib.muscleId;
        const target = result[muscleId];
        if (!target) continue;

        const isDirect = contrib.role === 'PRIMARY';

        // Record last trained date
        if (!target.lastTrainedAt || new Date(target.lastTrainedAt).getTime() < workoutDate.getTime()) {
          target.lastTrainedAt = workoutDate.toISOString();
          target.daysSinceTraining = Math.floor(daysAgo);
        }

        // Track direct vs indirect training
        if (isDirect) {
          if (!target.lastDirectTrainedAt || new Date(target.lastDirectTrainedAt).getTime() < workoutDate.getTime()) {
            target.lastDirectTrainedAt = workoutDate.toISOString();
            target.daysSinceDirectTraining = Math.floor(daysAgo);
          }
          if (daysAgo <= 7) {
            target.directSets7d = (target.directSets7d || 0) + workingSets;
          }
        } else {
          if (!target.lastIndirectTrainedAt || new Date(target.lastIndirectTrainedAt).getTime() < workoutDate.getTime()) {
            target.lastIndirectTrainedAt = workoutDate.toISOString();
            target.daysSinceIndirectTraining = Math.floor(daysAgo);
          }
          if (daysAgo <= 7) {
            target.indirectSets7d = (target.indirectSets7d || 0) + (workingSets * contrib.contributionFactor);
          }
        }

        // Effective sets contribution
        const effectiveSets = workingSets * contrib.contributionFactor;

        if (daysAgo <= 7) {
          target.effectiveSets7d += effectiveSets;
        }
        if (daysAgo <= 30) {
          target.effectiveSets30d += effectiveSets;
        }

        // Volume score calculation
        target.volumeScore += effectiveSets * recencyWeight * 10;

        // Track exercise history
        const map = muscleExerciseMap[muscleId];
        const key = `${exerciseDef.name}_${workoutDate.toISOString().slice(0, 10)}`;
        if (map.has(key)) {
          map.get(key)!.sets += workingSets;
        } else if (map.size < 6) {
          map.set(key, {
            exerciseName: exerciseDef.name,
            date: workoutDate.toISOString(),
            sets: workingSets
          });
        }
      }
    }
  }

  // Refine final states and recovery recommendations for each muscle
  for (const muscleId of ALL_MUSCLE_IDS) {
    const data = result[muscleId]!;
    data.effectiveSets7d = Math.round(data.effectiveSets7d * 10) / 10;
    data.effectiveSets30d = Math.round(data.effectiveSets30d * 10) / 10;
    data.directSets7d = Math.round((data.directSets7d || 0) * 10) / 10;
    data.indirectSets7d = Math.round((data.indirectSets7d || 0) * 10) / 10;
    data.volumeScore = Math.min(100, Math.round(data.volumeScore));
    data.frequencyWeekly = Math.round((data.effectiveSets30d / 4.3) * 10) / 10;
    data.recentExercises = Array.from(muscleExerciseMap[muscleId].values());

    const isArm = isArmMuscle(muscleId);
    const hasDirectRecently = (data.directSets7d || 0) > 0 || (data.daysSinceDirectTraining !== null && data.daysSinceDirectTraining <= 3);
    data.hasDirectTrainingRecently = hasDirectRecently;
    data.isIndirectOnly = !hasDirectRecently && (data.daysSinceTraining !== null || (data.indirectSets7d || 0) > 0);

    const broName = getMuscleBroName(muscleId);

    if (data.daysSinceTraining === null) {
      data.freshnessStatus = 'untrained';
      data.recommendation = 'No logged sessions yet. Ready for direct activation.';
    } else if (isArm && data.isIndirectOnly) {
      // FAST ARM RECOVERY (Arnold Split, Upper Anterior/Posterior splits):
      // Arms were NOT directly trained (only synergist assistance in chest pressing or back pulling).
      // They recover 2-3x faster and NEVER turn red 'high_recent_exposure'!
      const daysSinceIndirect = data.daysSinceIndirectTraining ?? data.daysSinceTraining ?? 99;

      if (daysSinceIndirect === 0) {
        // Trained earlier today as secondary synergist: light synergist fatigue, never red!
        data.freshnessStatus = 'recently_trained';
        data.recommendation = `${broName} received indirect synergist assistance today (compound pressing/pulling). Recovers rapidly; ready for direct arm work tomorrow.`;
      } else if (daysSinceIndirect <= 1) {
        // Trained yesterday (e.g. Day 1 Chest/Back of Arnold split):
        // Synergist fatigue has fully cleared! Arms are fresh and ready for Day 2 Shoulders & Arms!
        if ((data.indirectSets7d || 0) >= 8) {
          data.freshnessStatus = 'moderate';
          data.recommendation = `${broName} had secondary compound assistance yesterday. Synergist fatigue cleared fast; fully primed for direct arm blast today.`;
        } else {
          data.freshnessStatus = 'fresh';
          data.recommendation = `${broName} recovered quickly from indirect compound assistance (~${daysSinceIndirect}d ago). Fresh and primed for direct arm isolation today!`;
        }
      } else if (daysSinceIndirect <= 3) {
        data.freshnessStatus = 'fresh';
        data.recommendation = `${broName} is completely fresh (${daysSinceIndirect}d since compound assistance). Prime target for dedicated arm volume.`;
      } else {
        data.freshnessStatus = 'fresh';
        data.recommendation = `Fully recovered & supercompensated (${daysSinceIndirect}d since stimulus). Prime target for today's training session.`;
      }
    } else if (isArm && hasDirectRecently) {
      // Direct arm training occurred (curls, pushdowns, skull crushers, etc.)
      const daysSinceDirect = data.daysSinceDirectTraining ?? data.daysSinceTraining ?? 99;
      if (daysSinceDirect <= 1 && (data.directSets7d || 0) >= 6) {
        data.freshnessStatus = 'high_recent_exposure';
        data.recommendation = `${broName} underwent heavy direct isolation loading (~${daysSinceDirect === 0 ? 'today' : '1 day ago'}). Allow full systemic recovery before high intensity.`;
      } else if (daysSinceDirect <= 2 || ((data.directSets7d || 0) >= 6 && daysSinceDirect <= 3)) {
        data.freshnessStatus = 'recently_trained';
        data.recommendation = `Moderate recovery phase (~${daysSinceDirect}d ago direct session). Light accessory work or active recovery is suitable.`;
      } else if (daysSinceDirect <= 3.5 || data.effectiveSets7d >= 6) {
        data.freshnessStatus = 'moderate';
        data.recommendation = `Mostly recovered (~${daysSinceDirect}d ago). Primed for moderate to high volume direct arm training today.`;
      } else {
        data.freshnessStatus = 'fresh';
        data.recommendation = `Fully recovered & supercompensated (${daysSinceDirect}d since direct stimulus). Prime target for direct arm blast!`;
      }
    } else if (data.isIndirectOnly) {
      // Non-arm muscle that received ONLY indirect assistance (e.g. rear delts or lower back as secondary)
      const daysSinceIndirect = data.daysSinceIndirectTraining ?? data.daysSinceTraining ?? 99;
      if (daysSinceIndirect === 0) {
        data.freshnessStatus = 'recently_trained';
        data.recommendation = `${broName} assisted in compound movements today. Recovering fast without direct tissue trauma.`;
      } else if (daysSinceIndirect <= 1.5) {
        data.freshnessStatus = 'moderate';
        data.recommendation = `${broName} received indirect assistance (~1d ago). Synergist fatigue is mostly dissipated; ready for direct training.`;
      } else {
        data.freshnessStatus = 'fresh';
        data.recommendation = `Fully recovered & supercompensated (${daysSinceIndirect}d since assistance). Prime target for today's workout.`;
      }
    } else {
      // Standard direct loading for compound / main muscle groups (Chest, Lats, Quads, Hamstrings, Glutes, Delts, etc.)
      if (data.daysSinceTraining <= 1 && data.effectiveSets7d >= 6) {
        data.freshnessStatus = 'high_recent_exposure';
        data.recommendation = `${broName} underwent heavy recent loading (~${data.daysSinceTraining === 0 ? 'today' : '1 day ago'}). Allow full systemic recovery before high intensity.`;
      } else if (data.daysSinceTraining <= 2 || (data.effectiveSets7d >= 8 && data.daysSinceTraining <= 3)) {
        data.freshnessStatus = 'recently_trained';
        data.recommendation = `Moderate recovery phase (~${Math.floor(data.daysSinceTraining)} days ago). Light accessory work or active recovery is suitable.`;
      } else if (data.daysSinceTraining <= 4 || data.effectiveSets7d >= 4) {
        data.freshnessStatus = 'moderate';
        data.recommendation = `Mostly recovered (~${Math.floor(data.daysSinceTraining)} days ago). Primed for moderate to high volume training today.`;
      } else {
        data.freshnessStatus = 'fresh';
        data.recommendation = `Fully recovered & supercompensated (${Math.floor(data.daysSinceTraining)} days since stimulus). Prime target for today's training session.`;
      }
    }
  }

  return result as Record<MuscleId, MuscleExposureData>;
}

/**
 * Builds the comprehensive Training Radar insight & today's training opportunities.
 */
export function buildTrainingRadar(
  workouts: Workout[],
  exercisesMap: Record<string, Exercise>
): TrainingRadar {
  const exposures = calculateMuscleExposures(workouts, exercisesMap);
  const exposureList = Object.values(exposures);

  const highExposureMuscles = exposureList.filter(
    m => m.freshnessStatus === 'high_recent_exposure' || m.freshnessStatus === 'recently_trained'
  );

  const recoveredMuscles = exposureList.filter(
    m => m.freshnessStatus === 'fresh' && m.daysSinceTraining !== null
  );

  const neglectedMuscles = exposureList
    .filter(
      m => m.freshnessStatus === 'untrained' || (m.daysSinceTraining !== null && m.daysSinceTraining >= 6)
    )
    .sort((a, b) => {
      // Untrained always first
      if (a.freshnessStatus === 'untrained' && b.freshnessStatus !== 'untrained') return -1;
      if (b.freshnessStatus === 'untrained' && a.freshnessStatus !== 'untrained') return 1;
      // Then longest since last trained
      const daysA = a.daysSinceTraining ?? 999;
      const daysB = b.daysSinceTraining ?? 999;
      if (daysB !== daysA) return daysB - daysA;
      // Then lowest 30d volume
      return a.effectiveSets30d - b.effectiveSets30d;
    });

  // 7-day stats
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentWorkouts = workouts.filter(w => {
    const d = new Date(w.completedAt || w.startedAt);
    return d >= sevenDaysAgo;
  });

  const weeklyWorkoutsCount = recentWorkouts.length;
  const weeklyVolumeKg = recentWorkouts.reduce((sum, w) => sum + (w.totalVolumeKg || 0), 0);
  const weeklyTotalSets = recentWorkouts.reduce((sum, w) => sum + (w.totalSets || 0), 0);

  // Calculate push vs pull volume
  let pushSets = 0;
  let pullSets = 0;
  let legSets = 0;
  let upperSets = 0;

  for (const w of recentWorkouts) {
    for (const ex of (w.exercises || [])) {
      const def = exercisesMap[ex.exerciseId];
      if (!def) continue;
      const rawSets = Array.isArray(ex?.sets)
        ? ex.sets
        : (ex?.sets && typeof ex.sets === 'object'
          ? Object.values(ex.sets)
          : (typeof ex?.sets === 'number'
            ? Array.from({ length: ex.sets }).map(() => ({ completed: true }))
            : []));
      const count = (rawSets as any[]).filter(s => s && s.completed).length;
      if (def.movementPattern.startsWith('push')) pushSets += count;
      if (def.movementPattern.startsWith('pull')) pullSets += count;
      if (['squat', 'hinge', 'lunge'].includes(def.movementPattern)) legSets += count;
      if (['chest', 'back', 'shoulders', 'arms'].includes(def.category)) upperSets += count;
    }
  }

  const pushPullRatio = pullSets === 0 ? (pushSets > 0 ? 2 : 1) : Math.round((pushSets / pullSets) * 100) / 100;
  const upperLowerRatio = legSets === 0 ? (upperSets > 0 ? 2 : 1) : Math.round((upperSets / legSets) * 100) / 100;

  // --- CLASSIFY MUSCLE RECOVERY & UNTRAINED STATES ---
  // A muscle is "red" on the body diagram if its freshness status is 'high_recent_exposure'.
  // If an arm muscle was only indirectly involved as a synergist, it is NEVER flagged as red fatigued!
  const isRedFatigued = (mId: MuscleId): boolean => {
    const exp = exposures[mId];
    if (!exp) return false;
    if (isArmMuscle(mId) && exp.isIndirectOnly) {
      return false;
    }
    return exp.freshnessStatus === 'high_recent_exposure';
  };

  // A muscle is "untrained" if it has never been trained in the logbook (0 sets, daysSinceTraining === null)
  const isUntrained = (mId: MuscleId): boolean => {
    const exp = exposures[mId];
    if (!exp) return true;
    return exp.freshnessStatus === 'untrained' || exp.daysSinceTraining === null || exp.effectiveSets30d === 0;
  };

  const allUntrainedMuscles = ALL_MUSCLE_IDS.filter(id => isUntrained(id));

  // Define anatomical groupings
  const legMuscles: MuscleId[] = ['quadriceps', 'hamstrings', 'gluteus', 'calves', 'adductors'];
  const pullMuscles: MuscleId[] = ['latissimus_dorsi', 'trapezius', 'posterior_deltoid', 'biceps', 'spinal_erectors'];
  const pushMuscles: MuscleId[] = ['chest_mid', 'chest_upper', 'chest_lower', 'pectoralis_major', 'anterior_deltoid', 'lateral_deltoid', 'triceps'];
  const armMuscles: MuscleId[] = ['lateral_deltoid', 'posterior_deltoid', 'anterior_deltoid', 'biceps', 'triceps', 'forearms'];
  const coreMuscles: MuscleId[] = ['rectus_abdominis', 'obliques'];

  // Check untrained status by anatomical region (filtering out any fatigued muscles)
  const untrainedLegs = legMuscles.filter(m => isUntrained(m) && !isRedFatigued(m));
  const untrainedPull = pullMuscles.filter(m => isUntrained(m) && !isRedFatigued(m));
  const untrainedPush = pushMuscles.filter(m => isUntrained(m) && !isRedFatigued(m));
  const untrainedCore = coreMuscles.filter(m => isUntrained(m) && !isRedFatigued(m));

  // Determine Today's Prime Target based on sports-science recovery and split balance
  let suggestedFocusMuscles: MuscleId[] = [];
  let suggestedTitle = 'Full Body Hypertrophy';
  let suggestedRationale = 'Balanced stimulus across prime movement patterns.';
  let estDuration = 50;

  if (allUntrainedMuscles.length > 0) {
    // RULE 1: UNTRAINED MUSCLES HAVE ABSOLUTE TOP PRIORITY
    // Prioritize major movement anchors that have 0 history
    const hasUntrainedMajorLegs = untrainedLegs.some(m => ['quadriceps', 'gluteus', 'hamstrings'].includes(m));
    const hasUntrainedMajorPull = untrainedPull.some(m => ['latissimus_dorsi', 'biceps'].includes(m));
    const hasUntrainedMajorPush = untrainedPush.some(m => ['chest_mid', 'chest_upper', 'triceps'].includes(m));

    if (hasUntrainedMajorLegs) {
      // Focus on untrained lower body + any untrained core / calves
      const targetList = Array.from(new Set([...untrainedLegs, ...untrainedCore]));
      suggestedFocusMuscles = targetList.filter(m => !isRedFatigued(m));
      suggestedTitle = 'Prime Target: Untrained Lower Body & Core';
      suggestedRationale = `You have not yet trained your lower body (${untrainedLegs.map(m => MUSCLE_CATALOG[m]?.name || m).slice(0, 3).join(', ')}). Activating these groups today establishes foundational systemic power and prevents muscular imbalances.`;
      estDuration = 55;
    } else if (hasUntrainedMajorPull) {
      // Focus on untrained upper back / pull + any untrained core
      const targetList = Array.from(new Set([...untrainedPull, ...untrainedCore]));
      suggestedFocusMuscles = targetList.filter(m => !isRedFatigued(m));
      suggestedTitle = 'Prime Target: Untrained Posterior Chain & Pull';
      suggestedRationale = `You have no logged history for upper body pulling. Targeting your Latissimus Dorsi, Upper Back, and Biceps today is essential for developing structural pulling strength and posture.`;
      estDuration = 50;
    } else if (hasUntrainedMajorPush) {
      // Focus on untrained push + any untrained core
      const targetList = Array.from(new Set([...untrainedPush, ...untrainedCore]));
      suggestedFocusMuscles = targetList.filter(m => !isRedFatigued(m));
      suggestedTitle = 'Prime Target: Untrained Upper Body Push';
      suggestedRationale = `You have no logged history for upper body pressing. Stimulating your Pectorals, Deltoids, and Triceps today will build foundational pushing strength and upper body pressing mass.`;
      estDuration = 50;
    } else {
      // Major compound pillars have been touched, but specific muscles (e.g. calves, core, forearms, rear delts, adductors) have NEVER been trained!
      const allCleanUntrained = allUntrainedMuscles.filter(m => !isRedFatigued(m));

      // Pair with the single cleanest, longest-rested compound muscle group
      const pillarOptions = [
        { name: 'Lower Body', muscles: legMuscles },
        { name: 'Upper Body Pull', muscles: pullMuscles },
        { name: 'Upper Body Push', muscles: pushMuscles }
      ];

      const scoredPillars = pillarOptions.map(p => {
        const cleanMuscles = p.muscles.filter(m => !isRedFatigued(m));
        const daysList = cleanMuscles.map(m => exposures[m]?.daysSinceTraining ?? 99);
        const minDays = daysList.length > 0 ? Math.min(...daysList) : 0;
        const avgDays = daysList.length > 0 ? daysList.reduce((a, b) => a + b, 0) / daysList.length : 0;
        const hasRed = p.muscles.some(m => isRedFatigued(m));
        return { ...p, cleanMuscles, minDays, avgDays, hasRed };
      });

      const availablePillars = scoredPillars.filter(p => !p.hasRed && p.cleanMuscles.length > 0);
      availablePillars.sort((a, b) => b.minDays - a.minDays);

      const companionPillar = availablePillars[0] || scoredPillars.sort((a, b) => b.avgDays - a.avgDays)[0];
      const companionMuscles = (companionPillar ? companionPillar.cleanMuscles : []).filter(m => !isRedFatigued(m));

      const combined = Array.from(new Set([...allCleanUntrained, ...companionMuscles]));
      suggestedFocusMuscles = combined.filter(m => !isRedFatigued(m));

      const untrainedNames = allCleanUntrained.map(m => MUSCLE_CATALOG[m]?.name || m).slice(0, 3).join(', ');
      suggestedTitle = `Prime Target: Untrained ${allCleanUntrained.length === 1 ? MUSCLE_CATALOG[allCleanUntrained[0]]?.name || 'Muscles' : 'Gaps'} & ${companionPillar?.name || 'Recovery'}`;
      suggestedRationale = `The highlighted muscles (${untrainedNames}) have 0 recorded sets in your training history. Today's session prioritizes them alongside your fully rested ${companionPillar?.name || 'movement patterns'} to eliminate structural weak points.`;
      estDuration = 45;
    }
  } else {
    // RULE 2: ALL MUSCLES HAVE BEEN TRAINED AT LEAST ONCE - ROTATE TO LONGEST RESTED
    const pillars = [
      {
        id: 'legs',
        name: 'Lower Body',
        allMuscles: ['quadriceps', 'hamstrings', 'gluteus', 'calves', 'adductors'] as MuscleId[],
        title: 'Lower Body Quad & Posterior Hypertrophy',
        duration: 55
      },
      {
        id: 'shoulders_arms',
        name: 'Shoulders & Arms',
        allMuscles: ['lateral_deltoid', 'posterior_deltoid', 'biceps', 'triceps', 'forearms'] as MuscleId[],
        title: 'Shoulders & Arms Hypertrophy (Delts & Arms Blast)',
        duration: 50
      },
      {
        id: 'pull',
        name: 'Upper Body Pull',
        allMuscles: ['latissimus_dorsi', 'trapezius', 'posterior_deltoid', 'biceps', 'spinal_erectors'] as MuscleId[],
        title: 'Posterior Chain Pull & Rear Delts',
        duration: 50
      },
      {
        id: 'push',
        name: 'Upper Body Push',
        allMuscles: ['chest_mid', 'chest_upper', 'anterior_deltoid', 'lateral_deltoid', 'triceps'] as MuscleId[],
        title: 'Upper Body Push & Shoulder Width',
        duration: 50
      }
    ];

    const pillarEvaluations = pillars.map(p => {
      let minDays: number = 999;
      let hasRed = false;

      for (const mId of p.allMuscles) {
        if (isRedFatigued(mId)) {
          hasRed = true;
        }
        const exp = exposures[mId];
        // For arm muscles, direct training is what determines direct fatigue recovery
        const days = (isArmMuscle(mId) && exp?.isIndirectOnly)
          ? (exp?.daysSinceDirectTraining ?? 999)
          : (exp?.daysSinceTraining ?? 999);
        if (days < minDays) minDays = days;
      }

      return {
        pillar: p,
        hasRed,
        minDays,
        cleanMuscles: p.allMuscles.filter(m => !isRedFatigued(m))
      };
    });

    // Exclude any pillar that has red/fatigued muscles or was trained in the last 48 hours
    const fullyRecovered = pillarEvaluations.filter(e => !e.hasRed && e.minDays >= 2 && e.cleanMuscles.length > 0);

    if (fullyRecovered.length > 0) {
      fullyRecovered.sort((a, b) => b.minDays - a.minDays);
      const selected = fullyRecovered[0];
      const daysText = selected.minDays >= 999 ? 'never' : selected.minDays === 0 ? 'earlier today' : selected.minDays === 1 ? 'yesterday' : `${selected.minDays} days ago`;

      suggestedFocusMuscles = selected.cleanMuscles;
      suggestedTitle = selected.pillar.title;
      suggestedRationale = `${selected.pillar.name} was last trained ${daysText} and is fully recovered. Prime opportunity for progressive overload while your recently trained muscle groups supercompensate.`;
      estDuration = selected.pillar.duration;
    } else {
      // All 3 compound pillars have recent training fatigue. Look for non-fatigued secondary muscles (e.g. core, calves, arms)
      const nonFatiguedMuscles = ALL_MUSCLE_IDS.filter(m => !isRedFatigued(m));
      if (nonFatiguedMuscles.length > 0) {
        suggestedFocusMuscles = nonFatiguedMuscles.slice(0, 5);
        suggestedTitle = 'Active Recovery & Core Stabilization';
        suggestedRationale = 'Your major compound pressing, pulling, and leg drivers are actively repairing from high recent stimulus. Today focus on core stability, mobility, and active recovery.';
        estDuration = 35;
      } else {
        suggestedFocusMuscles = [];
        suggestedTitle = 'Systemic Rest & Recovery Day';
        suggestedRationale = 'High systemic fatigue detected across all kinetic chains. Complete rest is recommended today to facilitate central nervous system recovery and muscle protein synthesis.';
        estDuration = 0;
      }
    }
  }

  // HARD INVARIANT SANITIZATION: ABSOLUTELY ZERO RED MUSCLES ALLOWED IN PRIME TARGET
  suggestedFocusMuscles = suggestedFocusMuscles.filter(mId => !isRedFatigued(mId));

  // --- STREAK & CONSISTENCY CALCULATION WITH REST DAY FREEZE ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Set of all distinct training dates formatted YYYY-MM-DD
  const trainedDatesSet = new Set<string>();
  for (const w of workouts) {
    const raw = w.completedAt || w.startedAt;
    if (!raw) continue;
    const d = new Date(raw);
    if (isNaN(d.getTime())) continue;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    trainedDatesSet.add(`${y}-${m}-${day}`);
  }

  const getDayAtOffset = (offsetDays: number): { date: Date; dateStr: string } => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offsetDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return { date: d, dateStr: `${y}-${m}-${day}` };
  };

  const todayStr = getDayAtOffset(0).dateStr;
  const workedOutToday = trainedDatesSet.has(todayStr);

  let streak = 0;
  let isFrozen = false;
  let freezeReason = '';
  let restDaysInStreak = 0;
  const frozenRestDateStrs = new Set<string>();

  if (trainedDatesSet.size > 0) {
    let startOffset = 999;

    if (workedOutToday) {
      streak = 1;
      startOffset = 1; // Check yesterday backwards
    } else {
      const yesterdayStr = getDayAtOffset(1).dateStr;
      const dayBeforeYesterdayStr = getDayAtOffset(2).dateStr;

      if (trainedDatesSet.has(yesterdayStr)) {
        // User worked out yesterday; streak is active from yesterday
        streak = 1;
        startOffset = 2; // Yesterday was counted, check 2 days ago backwards
      } else if (trainedDatesSet.has(dayBeforeYesterdayStr)) {
        // Missed yesterday, but worked out 2 days ago!
        // Allow user to miss one day as a rest day freeze.
        // The streak doesn't increase, but doesn't go away either.
        streak = 1;
        isFrozen = true;
        freezeReason = 'Streak protected by Rest Day Freeze. Log today to extend your streak!';
        restDaysInStreak = 1;
        frozenRestDateStrs.add(yesterdayStr);
        startOffset = 3; // Day before yesterday was counted, check 3 days ago backwards
      } else {
        // Both yesterday and 2 days ago were missed -> streak broke
        streak = 0;
      }
    }

    if (startOffset < 365) {
      let currOffset = startOffset;
      while (currOffset < 365) {
        const currDayStr = getDayAtOffset(currOffset).dateStr;
        if (trainedDatesSet.has(currDayStr)) {
          streak++;
          currOffset++;
        } else {
          // Check if previous day was trained (allowing 1 rest day freeze)
          const prevDayStr = getDayAtOffset(currOffset + 1).dateStr;
          if (trainedDatesSet.has(prevDayStr)) {
            restDaysInStreak++;
            frozenRestDateStrs.add(currDayStr);
            streak++; // Day before was trained
            currOffset += 2;
          } else {
            // Two consecutive missed days: streak chain ends
            break;
          }
        }
      }
    }
  }

  // Compute 7-day current week breakdown (Mon to Sun)
  const currentDayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon ...
  const distanceToMonday = (currentDayOfWeek + 6) % 7;
  const mondayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - distanceToMonday);

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const daysThisWeek = dayLabels.map((dayName, idx) => {
    const d = new Date(mondayDate.getFullYear(), mondayDate.getMonth(), mondayDate.getDate() + idx);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dStr = `${y}-${m}-${day}`;
    const isToday = dStr === todayStr;
    const trained = trainedDatesSet.has(dStr);
    const isRestDayFreeze = !trained && frozenRestDateStrs.has(dStr);

    return {
      dayName,
      dateStr: dStr,
      trained,
      isToday,
      isRestDayFreeze
    };
  });

  // Milestones: 3, 5, 7, 10, 14, 21, 30, 60, 90
  const milestones = [3, 5, 7, 10, 14, 21, 30, 60, 90];
  const nextMilestone = milestones.find(m => m > streak) || (streak + 5);
  const daysToMilestone = Math.max(1, nextMilestone - streak);

  let streakMessage = '';
  if (workedOutToday) {
    streakMessage = streak > 1
      ? `🔥 ${streak}-Day Streak Locked In! Rest day freeze ready if needed tomorrow.`
      : `🔥 1-Day Streak Ignited! First session complete. Rest day freeze protects your momentum!`;
  } else if (isFrozen) {
    streakMessage = `❄️ ${streak}-Day Streak Frozen (Rest Day)! Your streak is protected. Log today to extend it to ${streak + 1} days!`;
  } else if (streak > 0) {
    streakMessage = `⚡ ${streak}-Day Streak Active! Log today's session to extend your streak to ${streak + 1} days (or take a rest day freeze)!`;
  } else {
    streakMessage = `🎯 Start your consistency streak today! Rest days won't break your momentum.`;
  }

  return {
    summary: `Training Radar detected ${highExposureMuscles.length} fatigued muscle groups and ${recoveredMuscles.length + neglectedMuscles.length} fresh opportunities.`,
    suggestedFocusToday: {
      muscles: suggestedFocusMuscles,
      title: suggestedTitle,
      rationale: suggestedRationale,
      estimatedDurationMinutes: estDuration
    },
    highExposureMuscles,
    recoveredMuscles,
    neglectedMuscles,
    pushPullRatio,
    upperLowerRatio,
    weeklyWorkoutsCount,
    weeklyVolumeKg,
    weeklyTotalSets,
    streakDays: streak,
    streakState: {
      currentStreak: streak,
      workedOutToday,
      isFrozen,
      freezeReason,
      restDaysInStreak,
      streakMessage,
      daysThisWeek,
      nextMilestone,
      daysToMilestone
    }
  };
}

/**
 * Barbell Plate Calculator
 * Calculates weight breakdown per side for standard 20kg (45lb) olympic barbell.
 */
export function calculateBarbellPlates(
  targetWeight: number,
  unit: 'kg' | 'lbs' = 'kg',
  barWeight: number = unit === 'kg' ? 20 : 45
): {
  platesPerSide: Array<{ weight: number; count: number }>;
  actualWeight: number;
  remainder: number;
} {
  const availablePlates =
    unit === 'kg' ? [25, 20, 15, 10, 5, 2.5, 1.25] : [45, 35, 25, 10, 5, 2.5];

  if (targetWeight <= barWeight) {
    return { platesPerSide: [], actualWeight: barWeight, remainder: 0 };
  }

  let weightNeededPerSide = (targetWeight - barWeight) / 2;
  const platesPerSide: Array<{ weight: number; count: number }> = [];

  for (const plate of availablePlates) {
    if (weightNeededPerSide >= plate) {
      const count = Math.floor(weightNeededPerSide / plate);
      platesPerSide.push({ weight: plate, count });
      weightNeededPerSide -= count * plate;
    }
  }

  const calculatedSide = platesPerSide.reduce((sum, p) => sum + p.weight * p.count, 0);
  const actualWeight = barWeight + calculatedSide * 2;
  const remainder = Math.round((targetWeight - actualWeight) * 10) / 10;

  return { platesPerSide, actualWeight, remainder };
}

/**
 * Color mapping for muscle freshness states
 */
export const FRESHNESS_COLORS: Record<
  MuscleFreshnessState,
  { fill: string; stroke: string; label: string; textClass: string; badgeClass: string }
> = {
  high_recent_exposure: {
    fill: '#ef4444', // Red / Crimson
    stroke: '#b91c1c',
    label: 'High Recent Exposure',
    textClass: 'text-rose-600 dark:text-rose-400',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
  },
  recently_trained: {
    fill: '#f97316', // Orange / Amber
    stroke: '#c2410c',
    label: 'Recently Trained',
    textClass: 'text-amber-600 dark:text-amber-400',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
  },
  moderate: {
    fill: '#eab308', // Yellow / Gold
    stroke: '#a16207',
    label: 'Moderate Recovery',
    textClass: 'text-yellow-600 dark:text-yellow-400',
    badgeClass: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-800'
  },
  fresh: {
    fill: '#10b981', // Emerald / Cyan
    stroke: '#047857',
    label: 'Fresh / Ready',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
  },
  untrained: {
    fill: '#94a3b8', // Slate Gray
    stroke: '#64748b',
    label: 'No Recent Training',
    textClass: 'text-slate-500 dark:text-slate-400',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
  }
};

/**
 * Instant local workout session synthesizer based on current anatomical radar and recovery state.
 * Guarantees zero latency and instantaneous 1-tap launching for "Start Today's Focus".
 */
export function generateRecommendedWorkoutSession(radar: TrainingRadar): AIWorkoutPlan {
  const targetFocus = radar.suggestedFocusToday.title;
  const f = targetFocus.toLowerCase();
  let exercises: any[] = [];
  const duration = radar.suggestedFocusToday.estimatedDurationMinutes || 50;

  if (f.includes('lower') || f.includes('quad') || f.includes('leg') || f.includes('squat') || f.includes('hamstring') || f.includes('glute')) {
    exercises = [
      {
        exerciseId: 'barbell_back_squat',
        exerciseName: 'Barbell Back Squat',
        sets: 4,
        repMin: 5,
        repMax: 6,
        rir: 2,
        restSeconds: 180,
        suggestedWeightKg: 105,
        coachingNote: 'Solid intra-abdominal brace; hit parallel depth with knees tracking over mid-foot.'
      },
      {
        exerciseId: 'romanian_deadlift',
        exerciseName: 'Romanian Deadlift (RDL)',
        sets: 3,
        repMin: 8,
        repMax: 10,
        rir: 2,
        restSeconds: 150,
        suggestedWeightKg: 95,
        coachingNote: 'Pure hip hinge; maximize hamstring stretch with a neutral spine.'
      },
      {
        exerciseId: 'leg_extension',
        exerciseName: 'Seated Leg Extension',
        sets: 3,
        repMin: 12,
        repMax: 15,
        rir: 1,
        restSeconds: 90,
        suggestedWeightKg: 55,
        coachingNote: 'Hold peak contraction 1s at top to maximize rectus femoris stress.'
      },
      {
        exerciseId: 'standing_calf_raise',
        exerciseName: 'Standing Calf Raise',
        sets: 4,
        repMin: 12,
        repMax: 15,
        rir: 1,
        restSeconds: 60,
        suggestedWeightKg: 70,
        coachingNote: '2-second deep eccentric stretch at the bottom of every rep.'
      }
    ];
  } else if (f.includes('pull') || f.includes('rear delt') || f.includes('back') || f.includes('lat') || f.includes('bicep')) {
    exercises = [
      {
        exerciseId: 'barbell_bent_over_row',
        exerciseName: 'Barbell Bent-Over Row',
        sets: 3,
        repMin: 6,
        repMax: 8,
        rir: 2,
        restSeconds: 150,
        suggestedWeightKg: 75,
        coachingNote: 'Drive elbows back smoothly; squeeze lats and rhomboids at top contraction.'
      },
      {
        exerciseId: 'lat_pulldown',
        exerciseName: 'Lat Pulldown (Wide/Neutral Grip)',
        sets: 3,
        repMin: 8,
        repMax: 10,
        rir: 2,
        restSeconds: 120,
        suggestedWeightKg: 65,
        coachingNote: 'Drive elbows down into your back pockets with a 1s controlled pause at sternum.'
      },
      {
        exerciseId: 'face_pulls',
        exerciseName: 'Cable Face Pull',
        sets: 3,
        repMin: 12,
        repMax: 15,
        rir: 1,
        restSeconds: 75,
        suggestedWeightKg: 22.5,
        coachingNote: 'Externally rotate thumbs backward at peak contraction to engage rear delts.'
      },
      {
        exerciseId: 'barbell_bicep_curl',
        exerciseName: 'Barbell Bicep Curl',
        sets: 3,
        repMin: 8,
        repMax: 10,
        rir: 1,
        restSeconds: 90,
        suggestedWeightKg: 32.5,
        coachingNote: 'Strict form with full elbow extension at the bottom.'
      }
    ];
  } else if (f.includes('push') || f.includes('chest') || f.includes('shoulder')) {
    exercises = [
      {
        exerciseId: 'barbell_bench_press',
        exerciseName: 'Barbell Bench Press (Flat)',
        sets: 3,
        repMin: 6,
        repMax: 8,
        rir: 2,
        restSeconds: 150,
        suggestedWeightKg: 82.5,
        coachingNote: 'Retract and depress scapulae; smooth touch on mid-lower sternum.'
      },
      {
        exerciseId: 'incline_dumbbell_press',
        exerciseName: 'Incline Dumbbell Bench Press',
        sets: 3,
        repMin: 8,
        repMax: 10,
        rir: 2,
        restSeconds: 120,
        suggestedWeightKg: 28,
        coachingNote: 'Focus on upper clavicular stretch at the bottom of each rep.'
      },
      {
        exerciseId: 'dumbbell_lateral_raise',
        exerciseName: 'Dumbbell Lateral Raise',
        sets: 4,
        repMin: 12,
        repMax: 15,
        rir: 1,
        restSeconds: 75,
        suggestedWeightKg: 12.5,
        coachingNote: 'Lead with elbows in the scapular plane with controlled negative.'
      },
      {
        exerciseId: 'triceps_rope_pushdown',
        exerciseName: 'Cable Triceps Rope Pushdown',
        sets: 3,
        repMin: 10,
        repMax: 12,
        rir: 1,
        restSeconds: 90,
        suggestedWeightKg: 27.5,
        coachingNote: 'Spread rope outward at peak lockout; keep upper arms pinned.'
      }
    ];
  } else {
    // Balanced Compound Full Body
    exercises = [
      {
        exerciseId: 'barbell_back_squat',
        exerciseName: 'Barbell Back Squat',
        sets: 3,
        repMin: 6,
        repMax: 8,
        rir: 2,
        restSeconds: 150,
        suggestedWeightKg: 95,
        coachingNote: 'Solid brace, descend under control.'
      },
      {
        exerciseId: 'barbell_bench_press',
        exerciseName: 'Barbell Bench Press (Flat)',
        sets: 3,
        repMin: 6,
        repMax: 8,
        rir: 2,
        restSeconds: 150,
        suggestedWeightKg: 80,
        coachingNote: 'Smooth descent to sternum, explosive press.'
      },
      {
        exerciseId: 'lat_pulldown',
        exerciseName: 'Lat Pulldown (Wide/Neutral Grip)',
        sets: 3,
        repMin: 8,
        repMax: 10,
        rir: 2,
        restSeconds: 120,
        suggestedWeightKg: 65,
        coachingNote: 'Drive elbows down into torso.'
      },
      {
        exerciseId: 'romanian_deadlift',
        exerciseName: 'Romanian Deadlift (RDL)',
        sets: 3,
        repMin: 8,
        repMax: 10,
        rir: 2,
        restSeconds: 120,
        suggestedWeightKg: 90,
        coachingNote: 'Pure hip hinge with flat back.'
      }
    ];
  }

  // If focus includes core muscles and not yet in exercises, append a dedicated core finisher
  if (radar.suggestedFocusToday.muscles.some(m => m === 'rectus_abdominis' || m === 'obliques')) {
    if (!exercises.some(e => e.exerciseId === 'hanging_leg_raise' || e.exerciseId === 'cable_woodchop')) {
      exercises.push({
        exerciseId: 'hanging_leg_raise',
        exerciseName: 'Hanging Leg Raise',
        sets: 3,
        repMin: 10,
        repMax: 15,
        rir: 1,
        restSeconds: 60,
        suggestedWeightKg: 0,
        coachingNote: 'Posterior pelvic tilt at the top; controlled 2-second negative without swinging.'
      });
    }
  }

  // If focus includes calves and not yet in exercises, append calf raises
  if (radar.suggestedFocusToday.muscles.some(m => m === 'calves')) {
    if (!exercises.some(e => e.exerciseId === 'standing_calf_raise' || e.exerciseId === 'seated_calf_raise')) {
      exercises.push({
        exerciseId: 'standing_calf_raise',
        exerciseName: 'Standing Calf Raise',
        sets: 3,
        repMin: 12,
        repMax: 15,
        rir: 1,
        restSeconds: 60,
        suggestedWeightKg: 70,
        coachingNote: '2-second deep eccentric stretch at the bottom of every rep.'
      });
    }
  }

  return {
    name: targetFocus,
    targetFocus: targetFocus,
    durationMinutes: duration,
    rationale: radar.suggestedFocusToday.rationale,
    warmupTip: '5 min dynamic mobility + 2 progressive warmup sets before first working movement.',
    exercises
  };
}

