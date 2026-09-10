import {
  Workout,
  WorkoutTemplate,
  UserProfile,
  PersonalRecord
} from '../types';

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'user_default',
  name: 'Alex Vance',
  experienceLevel: 'intermediate',
  primaryGoal: 'hypertrophy',
  trainingDaysPerWeek: 4,
  preferredDurationMinutes: 60,
  availableEquipment: ['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight'],
  preferredUnit: 'kg',
  targetFocusAreas: ['latissimus_dorsi', 'chest_upper', 'chest_mid', 'hamstrings'],
  notes: 'Focusing on double progression and bringing up posterior chain.'
};

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'template_push_hypertrophy',
    name: 'Upper Push (Chest, Delts & Triceps)',
    description: 'Hypertrophy-focused pressing session targeting clavicular chest, lateral shoulders, and triceps lockout.',
    category: 'Hypertrophy',
    estimatedMinutes: 55,
    exercises: [
      {
        exerciseId: 'barbell_bench_press',
        exerciseName: 'Barbell Bench Press',
        sets: 3,
        repMin: 6,
        repMax: 8,
        restSeconds: 150,
        suggestedWeightKg: 82.5,
        notes: 'Control eccentric to lower sternum.'
      },
      {
        exerciseId: 'incline_dumbbell_press',
        exerciseName: 'Incline Dumbbell Bench Press',
        sets: 3,
        repMin: 8,
        repMax: 10,
        restSeconds: 120,
        suggestedWeightKg: 28
      },
      {
        exerciseId: 'dumbbell_lateral_raise',
        exerciseName: 'Dumbbell Lateral Raise',
        sets: 4,
        repMin: 12,
        repMax: 15,
        restSeconds: 75,
        suggestedWeightKg: 12.5
      },
      {
        exerciseId: 'triceps_rope_pushdown',
        exerciseName: 'Cable Triceps Rope Pushdown',
        sets: 3,
        repMin: 10,
        repMax: 12,
        restSeconds: 90,
        suggestedWeightKg: 27.5
      }
    ]
  },
  {
    id: 'template_pull_posterior',
    name: 'Upper Pull & Rear Delts',
    description: 'Complete back width and thickness workout with bicep and posterior shoulder integration.',
    category: 'Hypertrophy',
    estimatedMinutes: 50,
    exercises: [
      {
        exerciseId: 'barbell_bent_over_row',
        exerciseName: 'Barbell Bent-Over Row',
        sets: 3,
        repMin: 6,
        repMax: 8,
        restSeconds: 150,
        suggestedWeightKg: 75
      },
      {
        exerciseId: 'lat_pulldown',
        exerciseName: 'Lat Pulldown (Wide/Neutral Grip)',
        sets: 3,
        repMin: 8,
        repMax: 10,
        restSeconds: 120,
        suggestedWeightKg: 65
      },
      {
        exerciseId: 'face_pulls',
        exerciseName: 'Cable Face Pull',
        sets: 3,
        repMin: 12,
        repMax: 15,
        restSeconds: 75,
        suggestedWeightKg: 22.5
      },
      {
        exerciseId: 'barbell_bicep_curl',
        exerciseName: 'Barbell Bicep Curl',
        sets: 3,
        repMin: 8,
        repMax: 10,
        restSeconds: 90,
        suggestedWeightKg: 32.5
      }
    ]
  },
  {
    id: 'template_legs_power',
    name: 'Lower Body Strength & Quads',
    description: 'Heavy compound squatting supplemented by hamstring hinging and calf isolation.',
    category: 'Strength',
    estimatedMinutes: 60,
    exercises: [
      {
        exerciseId: 'barbell_back_squat',
        exerciseName: 'Barbell Back Squat',
        sets: 4,
        repMin: 5,
        repMax: 6,
        restSeconds: 180,
        suggestedWeightKg: 105
      },
      {
        exerciseId: 'romanian_deadlift',
        exerciseName: 'Romanian Deadlift (RDL)',
        sets: 3,
        repMin: 8,
        repMax: 10,
        restSeconds: 150,
        suggestedWeightKg: 95
      },
      {
        exerciseId: 'leg_extension',
        exerciseName: 'Seated Leg Extension',
        sets: 3,
        repMin: 12,
        repMax: 15,
        restSeconds: 90,
        suggestedWeightKg: 55
      },
      {
        exerciseId: 'standing_calf_raise',
        exerciseName: 'Standing Calf Raise',
        sets: 4,
        repMin: 12,
        repMax: 15,
        restSeconds: 60,
        suggestedWeightKg: 70
      }
    ]
  },
  {
    id: 'template_full_body_power',
    name: 'Full Body Compound Foundations',
    description: 'High-efficiency total body session cycling major compound movement patterns.',
    category: 'Athletic',
    estimatedMinutes: 55,
    exercises: [
      {
        exerciseId: 'barbell_back_squat',
        exerciseName: 'Barbell Back Squat',
        sets: 3,
        repMin: 6,
        repMax: 8,
        restSeconds: 150,
        suggestedWeightKg: 95
      },
      {
        exerciseId: 'barbell_bench_press',
        exerciseName: 'Barbell Bench Press',
        sets: 3,
        repMin: 6,
        repMax: 8,
        restSeconds: 150,
        suggestedWeightKg: 80
      },
      {
        exerciseId: 'chest_supported_row',
        exerciseName: 'Chest-Supported T-Bar / Dumbbell Row',
        sets: 3,
        repMin: 8,
        repMax: 10,
        restSeconds: 120,
        suggestedWeightKg: 45
      },
      {
        exerciseId: 'overhead_barbell_press',
        exerciseName: 'Overhead Barbell Press (OHP)',
        sets: 3,
        repMin: 8,
        repMax: 8,
        restSeconds: 120,
        suggestedWeightKg: 47.5
      }
    ]
  }
];

export function getSeedWorkouts(): Workout[] {
  return [
    {
      id: 'workout_1788937113526_889u4',
      name: 'Heavy Push & Chest Focus',
      startedAt: '2026-09-08T22:15:00.000Z',
      completedAt: '2026-09-08T23:25:00.000Z',
      durationSeconds: 4200,
      notes: 'Felt strong on flat bench, locked out 100kg for 10 clean reps.',
      totalVolumeKg: 4870,
      totalSets: 12,
      musclesTrained: ['chest_mid', 'chest_upper', 'triceps', 'anterior_deltoid', 'lateral_deltoid'],
      rpeAverage: 8.5,
      exercises: [
        {
          id: 'ex_push_1',
          exerciseId: 'barbell_bench_press',
          exerciseName: 'Barbell Bench Press',
          notes: 'Top working set at 100kg x 10 reps',
          sets: [
            { id: 's1_1', setNumber: 1, type: 'normal', weightKg: 80, reps: 12, completed: true, rpe: 7.5 },
            { id: 's1_2', setNumber: 2, type: 'normal', weightKg: 90, reps: 10, completed: true, rpe: 8 },
            { id: 's1_3', setNumber: 3, type: 'normal', weightKg: 100, reps: 10, completed: true, rpe: 9 }
          ]
        },
        {
          id: 'ex_push_2',
          exerciseId: 'incline_dumbbell_press',
          exerciseName: 'Incline Dumbbell Bench Press',
          sets: [
            { id: 's2_1', setNumber: 1, type: 'normal', weightKg: 28, reps: 10, completed: true, rpe: 8 },
            { id: 's2_2', setNumber: 2, type: 'normal', weightKg: 30, reps: 10, completed: true, rpe: 8.5 },
            { id: 's2_3', setNumber: 3, type: 'normal', weightKg: 32, reps: 8, completed: true, rpe: 9 }
          ]
        },
        {
          id: 'ex_push_3',
          exerciseId: 'dumbbell_lateral_raise',
          exerciseName: 'Dumbbell Lateral Raise',
          sets: [
            { id: 's3_1', setNumber: 1, type: 'normal', weightKg: 12.5, reps: 15, completed: true, rpe: 8 },
            { id: 's3_2', setNumber: 2, type: 'normal', weightKg: 12.5, reps: 14, completed: true, rpe: 8.5 },
            { id: 's3_3', setNumber: 3, type: 'normal', weightKg: 15, reps: 12, completed: true, rpe: 9 }
          ]
        },
        {
          id: 'ex_push_4',
          exerciseId: 'triceps_rope_pushdown',
          exerciseName: 'Cable Triceps Rope Pushdown',
          sets: [
            { id: 's4_1', setNumber: 1, type: 'normal', weightKg: 27.5, reps: 12, completed: true, rpe: 8 },
            { id: 's4_2', setNumber: 2, type: 'normal', weightKg: 30, reps: 10, completed: true, rpe: 8.5 },
            { id: 's4_3', setNumber: 3, type: 'normal', weightKg: 32.5, reps: 10, completed: true, rpe: 9 }
          ]
        }
      ]
    },
    {
      id: 'workout_1788937004112_771b2',
      name: 'Lat Width & Back Hypertrophy',
      startedAt: '2026-09-07T20:30:00.000Z',
      completedAt: '2026-09-07T21:40:00.000Z',
      durationSeconds: 4200,
      notes: 'Great lat stretch and controlled rowing eccentric.',
      totalVolumeKg: 4620,
      totalSets: 12,
      musclesTrained: ['latissimus_dorsi', 'trapezius', 'posterior_deltoid', 'biceps'],
      rpeAverage: 8.2,
      exercises: [
        {
          id: 'ex_pull_1',
          exerciseId: 'barbell_bent_over_row',
          exerciseName: 'Barbell Bent-Over Row',
          sets: [
            { id: 'p1_1', setNumber: 1, type: 'normal', weightKg: 70, reps: 10, completed: true, rpe: 7.5 },
            { id: 'p1_2', setNumber: 2, type: 'normal', weightKg: 75, reps: 8, completed: true, rpe: 8 },
            { id: 'p1_3', setNumber: 3, type: 'normal', weightKg: 80, reps: 8, completed: true, rpe: 8.5 }
          ]
        },
        {
          id: 'ex_pull_2',
          exerciseId: 'lat_pulldown',
          exerciseName: 'Lat Pulldown (Wide/Neutral Grip)',
          sets: [
            { id: 'p2_1', setNumber: 1, type: 'normal', weightKg: 65, reps: 10, completed: true, rpe: 7.5 },
            { id: 'p2_2', setNumber: 2, type: 'normal', weightKg: 70, reps: 10, completed: true, rpe: 8 },
            { id: 'p2_3', setNumber: 3, type: 'normal', weightKg: 75, reps: 8, completed: true, rpe: 8.5 }
          ]
        },
        {
          id: 'ex_pull_3',
          exerciseId: 'face_pulls',
          exerciseName: 'Cable Face Pull',
          sets: [
            { id: 'p3_1', setNumber: 1, type: 'normal', weightKg: 22.5, reps: 15, completed: true, rpe: 8 },
            { id: 'p3_2', setNumber: 2, type: 'normal', weightKg: 25, reps: 15, completed: true, rpe: 8 },
            { id: 'p3_3', setNumber: 3, type: 'normal', weightKg: 25, reps: 12, completed: true, rpe: 8.5 }
          ]
        },
        {
          id: 'ex_pull_4',
          exerciseId: 'barbell_bicep_curl',
          exerciseName: 'Barbell Bicep Curl',
          sets: [
            { id: 'p4_1', setNumber: 1, type: 'normal', weightKg: 30, reps: 10, completed: true, rpe: 8 },
            { id: 'p4_2', setNumber: 2, type: 'normal', weightKg: 32.5, reps: 10, completed: true, rpe: 8.5 },
            { id: 'p4_3', setNumber: 3, type: 'normal', weightKg: 35, reps: 8, completed: true, rpe: 9 }
          ]
        }
      ]
    }
  ];
}

function _legacySeedWorkouts(): Workout[] {
  const now = new Date();
  const d1 = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000); // 1 day ago (Push)
  const d3 = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago (Pull)
  const d5 = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days ago (Legs)
  const d8 = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000); // 8 days ago (Upper Push)
  const d10 = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 days ago (Pull Thickness)
  const d12 = new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000); // 12 days ago (Lower Hypertrophy)
  const d15 = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000); // 15 days ago (Full Body Anchor)

  return [
    {
      id: 'workout_seed_1',
      name: 'Heavy Push & Shoulder Width',
      startedAt: new Date(d1.getTime() - 54 * 60 * 1000).toISOString(),
      completedAt: d1.toISOString(),
      durationSeconds: 3240, // 54 mins
      notes: 'Hit all 8 reps on Bench Press at 82.5kg. Ready to progress weight.',
      totalVolumeKg: 4215,
      totalSets: 13,
      musclesTrained: ['chest_mid', 'chest_upper', 'anterior_deltoid', 'lateral_deltoid', 'triceps'],
      rpeAverage: 8.2,
      exercises: [
        {
          id: 'we_1',
          exerciseId: 'barbell_bench_press',
          exerciseName: 'Barbell Bench Press (Flat)',
          sets: [
            { id: 's1', setNumber: 1, type: 'warmup', weightKg: 50, reps: 10, completed: true },
            { id: 's2', setNumber: 2, type: 'normal', weightKg: 82.5, reps: 8, completed: true, isPR: true },
            { id: 's3', setNumber: 3, type: 'normal', weightKg: 82.5, reps: 8, completed: true },
            { id: 's4', setNumber: 4, type: 'normal', weightKg: 82.5, reps: 8, completed: true }
          ]
        },
        {
          id: 'we_2',
          exerciseId: 'incline_dumbbell_press',
          exerciseName: 'Incline Dumbbell Bench Press',
          sets: [
            { id: 's5', setNumber: 1, type: 'normal', weightKg: 28, reps: 10, completed: true },
            { id: 's6', setNumber: 2, type: 'normal', weightKg: 28, reps: 9, completed: true },
            { id: 's7', setNumber: 3, type: 'normal', weightKg: 28, reps: 8, completed: true }
          ]
        },
        {
          id: 'we_3',
          exerciseId: 'dumbbell_lateral_raise',
          exerciseName: 'Dumbbell Lateral Raise',
          sets: [
            { id: 's8', setNumber: 1, type: 'normal', weightKg: 12.5, reps: 15, completed: true },
            { id: 's9', setNumber: 2, type: 'normal', weightKg: 12.5, reps: 14, completed: true },
            { id: 's10', setNumber: 3, type: 'normal', weightKg: 12.5, reps: 13, completed: true }
          ]
        },
        {
          id: 'we_4',
          exerciseId: 'triceps_rope_pushdown',
          exerciseName: 'Cable Triceps Rope Pushdown',
          sets: [
            { id: 's11', setNumber: 1, type: 'normal', weightKg: 27.5, reps: 12, completed: true },
            { id: 's12', setNumber: 2, type: 'normal', weightKg: 27.5, reps: 11, completed: true },
            { id: 's13', setNumber: 3, type: 'normal', weightKg: 27.5, reps: 10, completed: true }
          ]
        }
      ]
    },
    {
      id: 'workout_seed_2',
      name: 'Lat Width & Posterior Chain',
      startedAt: new Date(d3.getTime() - 48 * 60 * 1000).toISOString(),
      completedAt: d3.toISOString(),
      durationSeconds: 2880,
      notes: 'Strong mind-muscle connection on chest supported rows and face pulls.',
      totalVolumeKg: 3890,
      totalSets: 12,
      musclesTrained: ['latissimus_dorsi', 'trapezius', 'posterior_deltoid', 'biceps'],
      rpeAverage: 7.8,
      exercises: [
        {
          id: 'we_21',
          exerciseId: 'barbell_bent_over_row',
          exerciseName: 'Barbell Bent-Over Row',
          sets: [
            { id: 's21', setNumber: 1, type: 'normal', weightKg: 75, reps: 8, completed: true, isPR: true },
            { id: 's22', setNumber: 2, type: 'normal', weightKg: 75, reps: 8, completed: true },
            { id: 's23', setNumber: 3, type: 'normal', weightKg: 75, reps: 7, completed: true }
          ]
        },
        {
          id: 'we_22',
          exerciseId: 'lat_pulldown',
          exerciseName: 'Lat Pulldown (Wide/Neutral Grip)',
          sets: [
            { id: 's24', setNumber: 1, type: 'normal', weightKg: 65, reps: 10, completed: true },
            { id: 's25', setNumber: 2, type: 'normal', weightKg: 65, reps: 9, completed: true },
            { id: 's26', setNumber: 3, type: 'normal', weightKg: 65, reps: 8, completed: true }
          ]
        },
        {
          id: 'we_23',
          exerciseId: 'face_pulls',
          exerciseName: 'Cable Face Pull',
          sets: [
            { id: 's27', setNumber: 1, type: 'normal', weightKg: 22.5, reps: 15, completed: true },
            { id: 's28', setNumber: 2, type: 'normal', weightKg: 22.5, reps: 15, completed: true },
            { id: 's29', setNumber: 3, type: 'normal', weightKg: 22.5, reps: 14, completed: true }
          ]
        },
        {
          id: 'we_24',
          exerciseId: 'barbell_bicep_curl',
          exerciseName: 'Barbell Bicep Curl',
          sets: [
            { id: 's30', setNumber: 1, type: 'normal', weightKg: 32.5, reps: 10, completed: true },
            { id: 's31', setNumber: 2, type: 'normal', weightKg: 32.5, reps: 9, completed: true },
            { id: 's32', setNumber: 3, type: 'normal', weightKg: 32.5, reps: 8, completed: true }
          ]
        }
      ]
    },
    {
      id: 'workout_seed_3',
      name: 'Lower Body Strength & Calves',
      startedAt: new Date(d5.getTime() - 62 * 60 * 1000).toISOString(),
      completedAt: d5.toISOString(),
      durationSeconds: 3720,
      notes: 'New 5RM on Back Squat (105kg). Felt explosive out of the hole.',
      totalVolumeKg: 5480,
      totalSets: 14,
      musclesTrained: ['quadriceps', 'gluteus', 'hamstrings', 'calves'],
      rpeAverage: 8.5,
      exercises: [
        {
          id: 'we_31',
          exerciseId: 'barbell_back_squat',
          exerciseName: 'Barbell Back Squat',
          sets: [
            { id: 's41', setNumber: 1, type: 'warmup', weightKg: 70, reps: 8, completed: true },
            { id: 's42', setNumber: 2, type: 'normal', weightKg: 105, reps: 6, completed: true, isPR: true },
            { id: 's43', setNumber: 3, type: 'normal', weightKg: 105, reps: 6, completed: true },
            { id: 's44', setNumber: 4, type: 'normal', weightKg: 105, reps: 5, completed: true }
          ]
        },
        {
          id: 'we_32',
          exerciseId: 'romanian_deadlift',
          exerciseName: 'Romanian Deadlift (RDL)',
          sets: [
            { id: 's45', setNumber: 1, type: 'normal', weightKg: 95, reps: 8, completed: true, isPR: true },
            { id: 's46', setNumber: 2, type: 'normal', weightKg: 95, reps: 8, completed: true },
            { id: 's47', setNumber: 3, type: 'normal', weightKg: 95, reps: 8, completed: true }
          ]
        },
        {
          id: 'we_33',
          exerciseId: 'leg_extension',
          exerciseName: 'Seated Leg Extension',
          sets: [
            { id: 's48', setNumber: 1, type: 'normal', weightKg: 55, reps: 12, completed: true },
            { id: 's49', setNumber: 2, type: 'normal', weightKg: 55, reps: 12, completed: true },
            { id: 's50', setNumber: 3, type: 'normal', weightKg: 55, reps: 10, completed: true }
          ]
        },
        {
          id: 'we_34',
          exerciseId: 'standing_calf_raise',
          exerciseName: 'Standing Calf Raise',
          sets: [
            { id: 's51', setNumber: 1, type: 'normal', weightKg: 70, reps: 15, completed: true },
            { id: 's52', setNumber: 2, type: 'normal', weightKg: 70, reps: 14, completed: true },
            { id: 's53', setNumber: 3, type: 'normal', weightKg: 70, reps: 13, completed: true },
            { id: 's54', setNumber: 4, type: 'normal', weightKg: 70, reps: 12, completed: true }
          ]
        }
      ]
    },
    {
      id: 'workout_seed_4',
      name: 'Upper Push & Overhead Focus',
      startedAt: new Date(d8.getTime() - 50 * 60 * 1000).toISOString(),
      completedAt: d8.toISOString(),
      durationSeconds: 3000,
      notes: 'Shoulder stability feeling great on overhead pressing.',
      totalVolumeKg: 3950,
      totalSets: 12,
      musclesTrained: ['chest_mid', 'anterior_deltoid', 'triceps', 'lateral_deltoid'],
      rpeAverage: 7.9,
      exercises: [
        {
          id: 'we_41',
          exerciseId: 'barbell_bench_press',
          exerciseName: 'Barbell Bench Press (Flat)',
          sets: [
            { id: 's61', setNumber: 1, type: 'normal', weightKg: 80, reps: 8, completed: true },
            { id: 's62', setNumber: 2, type: 'normal', weightKg: 80, reps: 8, completed: true },
            { id: 's63', setNumber: 3, type: 'normal', weightKg: 80, reps: 7, completed: true }
          ]
        },
        {
          id: 'we_42',
          exerciseId: 'overhead_barbell_press',
          exerciseName: 'Overhead Barbell Press (OHP)',
          sets: [
            { id: 's64', setNumber: 1, type: 'normal', weightKg: 47.5, reps: 8, completed: true, isPR: true },
            { id: 's65', setNumber: 2, type: 'normal', weightKg: 47.5, reps: 8, completed: true },
            { id: 's66', setNumber: 3, type: 'normal', weightKg: 47.5, reps: 7, completed: true }
          ]
        },
        {
          id: 'we_43',
          exerciseId: 'dumbbell_lateral_raise',
          exerciseName: 'Dumbbell Lateral Raise',
          sets: [
            { id: 's67', setNumber: 1, type: 'normal', weightKg: 12.5, reps: 12, completed: true },
            { id: 's68', setNumber: 2, type: 'normal', weightKg: 12.5, reps: 12, completed: true },
            { id: 's69', setNumber: 3, type: 'normal', weightKg: 12.5, reps: 11, completed: true }
          ]
        },
        {
          id: 'we_44',
          exerciseId: 'triceps_rope_pushdown',
          exerciseName: 'Cable Triceps Rope Pushdown',
          sets: [
            { id: 's70', setNumber: 1, type: 'normal', weightKg: 25, reps: 12, completed: true },
            { id: 's71', setNumber: 2, type: 'normal', weightKg: 25, reps: 12, completed: true },
            { id: 's72', setNumber: 3, type: 'normal', weightKg: 25, reps: 11, completed: true }
          ]
        }
      ]
    },
    {
      id: 'workout_seed_5',
      name: 'Back Thickness & Biceps Peak',
      startedAt: new Date(d10.getTime() - 52 * 60 * 1000).toISOString(),
      completedAt: d10.toISOString(),
      durationSeconds: 3120,
      notes: 'Chest-supported row double progression target reached.',
      totalVolumeKg: 4120,
      totalSets: 13,
      musclesTrained: ['latissimus_dorsi', 'trapezius', 'posterior_deltoid', 'biceps'],
      rpeAverage: 8.0,
      exercises: [
        {
          id: 'we_51',
          exerciseId: 'chest_supported_row',
          exerciseName: 'Chest-Supported Row',
          sets: [
            { id: 's81', setNumber: 1, type: 'normal', weightKg: 45, reps: 10, completed: true },
            { id: 's82', setNumber: 2, type: 'normal', weightKg: 45, reps: 10, completed: true },
            { id: 's83', setNumber: 3, type: 'normal', weightKg: 45, reps: 9, completed: true }
          ]
        },
        {
          id: 'we_52',
          exerciseId: 'lat_pulldown',
          exerciseName: 'Lat Pulldown',
          sets: [
            { id: 's84', setNumber: 1, type: 'normal', weightKg: 65, reps: 10, completed: true },
            { id: 's85', setNumber: 2, type: 'normal', weightKg: 65, reps: 10, completed: true },
            { id: 's86', setNumber: 3, type: 'normal', weightKg: 65, reps: 9, completed: true }
          ]
        },
        {
          id: 'we_53',
          exerciseId: 'barbell_bicep_curl',
          exerciseName: 'Barbell Bicep Curl',
          sets: [
            { id: 's87', setNumber: 1, type: 'normal', weightKg: 32.5, reps: 10, completed: true },
            { id: 's88', setNumber: 2, type: 'normal', weightKg: 32.5, reps: 10, completed: true },
            { id: 's89', setNumber: 3, type: 'normal', weightKg: 32.5, reps: 9, completed: true }
          ]
        },
        {
          id: 'we_54',
          exerciseId: 'face_pulls',
          exerciseName: 'Cable Face Pull',
          sets: [
            { id: 's90', setNumber: 1, type: 'normal', weightKg: 22.5, reps: 15, completed: true },
            { id: 's91', setNumber: 2, type: 'normal', weightKg: 22.5, reps: 15, completed: true },
            { id: 's92', setNumber: 3, type: 'normal', weightKg: 22.5, reps: 15, completed: true },
            { id: 's93', setNumber: 4, type: 'normal', weightKg: 22.5, reps: 14, completed: true }
          ]
        }
      ]
    },
    {
      id: 'workout_seed_6',
      name: 'Quad Hypertrophy & Hamstring Isolation',
      startedAt: new Date(d12.getTime() - 58 * 60 * 1000).toISOString(),
      completedAt: d12.toISOString(),
      durationSeconds: 3480,
      notes: 'High pump session on leg press and extensions.',
      totalVolumeKg: 5820,
      totalSets: 14,
      musclesTrained: ['quadriceps', 'gluteus', 'hamstrings', 'calves'],
      rpeAverage: 8.3,
      exercises: [
        {
          id: 'we_61',
          exerciseId: 'barbell_back_squat',
          exerciseName: 'Barbell Back Squat',
          sets: [
            { id: 's101', setNumber: 1, type: 'warmup', weightKg: 70, reps: 8, completed: true },
            { id: 's102', setNumber: 2, type: 'normal', weightKg: 100, reps: 8, completed: true },
            { id: 's103', setNumber: 3, type: 'normal', weightKg: 100, reps: 8, completed: true },
            { id: 's104', setNumber: 4, type: 'normal', weightKg: 100, reps: 7, completed: true }
          ]
        },
        {
          id: 'we_62',
          exerciseId: 'romanian_deadlift',
          exerciseName: 'Romanian Deadlift (RDL)',
          sets: [
            { id: 's105', setNumber: 1, type: 'normal', weightKg: 90, reps: 10, completed: true },
            { id: 's106', setNumber: 2, type: 'normal', weightKg: 90, reps: 10, completed: true },
            { id: 's107', setNumber: 3, type: 'normal', weightKg: 90, reps: 9, completed: true }
          ]
        },
        {
          id: 'we_63',
          exerciseId: 'leg_extension',
          exerciseName: 'Seated Leg Extension',
          sets: [
            { id: 's108', setNumber: 1, type: 'normal', weightKg: 50, reps: 15, completed: true },
            { id: 's109', setNumber: 2, type: 'normal', weightKg: 50, reps: 14, completed: true },
            { id: 's110', setNumber: 3, type: 'normal', weightKg: 50, reps: 12, completed: true }
          ]
        },
        {
          id: 'we_64',
          exerciseId: 'standing_calf_raise',
          exerciseName: 'Standing Calf Raise',
          sets: [
            { id: 's111', setNumber: 1, type: 'normal', weightKg: 70, reps: 15, completed: true },
            { id: 's112', setNumber: 2, type: 'normal', weightKg: 70, reps: 15, completed: true },
            { id: 's113', setNumber: 3, type: 'normal', weightKg: 70, reps: 14, completed: true },
            { id: 's114', setNumber: 4, type: 'normal', weightKg: 70, reps: 14, completed: true }
          ]
        }
      ]
    },
    {
      id: 'workout_seed_7',
      name: 'Full Body Overload Baseline',
      startedAt: new Date(d15.getTime() - 65 * 60 * 1000).toISOString(),
      completedAt: d15.toISOString(),
      durationSeconds: 3900,
      notes: 'Initial training cycle baseline testing.',
      totalVolumeKg: 6200,
      totalSets: 15,
      musclesTrained: ['chest_mid', 'quadriceps', 'latissimus_dorsi', 'anterior_deltoid'],
      rpeAverage: 8.0,
      exercises: [
        {
          id: 'we_71',
          exerciseId: 'barbell_bench_press',
          exerciseName: 'Barbell Bench Press (Flat)',
          sets: [
            { id: 's121', setNumber: 1, type: 'normal', weightKg: 80, reps: 8, completed: true },
            { id: 's122', setNumber: 2, type: 'normal', weightKg: 80, reps: 8, completed: true },
            { id: 's123', setNumber: 3, type: 'normal', weightKg: 80, reps: 8, completed: true }
          ]
        },
        {
          id: 'we_72',
          exerciseId: 'barbell_back_squat',
          exerciseName: 'Barbell Back Squat',
          sets: [
            { id: 's124', setNumber: 1, type: 'normal', weightKg: 100, reps: 6, completed: true },
            { id: 's125', setNumber: 2, type: 'normal', weightKg: 100, reps: 6, completed: true },
            { id: 's126', setNumber: 3, type: 'normal', weightKg: 100, reps: 6, completed: true }
          ]
        },
        {
          id: 'we_73',
          exerciseId: 'barbell_bent_over_row',
          exerciseName: 'Barbell Bent-Over Row',
          sets: [
            { id: 's127', setNumber: 1, type: 'normal', weightKg: 70, reps: 8, completed: true },
            { id: 's128', setNumber: 2, type: 'normal', weightKg: 70, reps: 8, completed: true },
            { id: 's129', setNumber: 3, type: 'normal', weightKg: 70, reps: 8, completed: true }
          ]
        },
        {
          id: 'we_74',
          exerciseId: 'overhead_barbell_press',
          exerciseName: 'Overhead Barbell Press (OHP)',
          sets: [
            { id: 's130', setNumber: 1, type: 'normal', weightKg: 45, reps: 8, completed: true },
            { id: 's131', setNumber: 2, type: 'normal', weightKg: 45, reps: 8, completed: true },
            { id: 's132', setNumber: 3, type: 'normal', weightKg: 45, reps: 7, completed: true }
          ]
        }
      ]
    }
  ];
}

export const SEED_PERSONAL_RECORDS: PersonalRecord[] = [
  {
    exerciseId: 'barbell_bench_press',
    exerciseName: 'Barbell Bench Press',
    maxWeightKg: 100,
    maxReps: 10,
    estimated1RMKg: 133.3,
    achievedAt: '2026-09-08T23:25:00.000Z',
    workoutId: 'workout_1788937113526_889u4'
  },
  {
    exerciseId: 'incline_dumbbell_press',
    exerciseName: 'Incline Dumbbell Bench Press',
    maxWeightKg: 32,
    maxReps: 8,
    estimated1RMKg: 40.5,
    achievedAt: '2026-09-08T23:25:00.000Z',
    workoutId: 'workout_1788937113526_889u4'
  },
  {
    exerciseId: 'dumbbell_lateral_raise',
    exerciseName: 'Dumbbell Lateral Raise',
    maxWeightKg: 15,
    maxReps: 12,
    estimated1RMKg: 21,
    achievedAt: '2026-09-08T23:25:00.000Z',
    workoutId: 'workout_1788937113526_889u4'
  },
  {
    exerciseId: 'triceps_rope_pushdown',
    exerciseName: 'Cable Triceps Rope Pushdown',
    maxWeightKg: 32.5,
    maxReps: 10,
    estimated1RMKg: 43.3,
    achievedAt: '2026-09-08T23:25:00.000Z',
    workoutId: 'workout_1788937113526_889u4'
  },
  {
    exerciseId: 'barbell_bent_over_row',
    exerciseName: 'Barbell Bent-Over Row',
    maxWeightKg: 80,
    maxReps: 8,
    estimated1RMKg: 101.3,
    achievedAt: '2026-09-07T21:40:00.000Z',
    workoutId: 'workout_1788937004112_771b2'
  },
  {
    exerciseId: 'lat_pulldown',
    exerciseName: 'Lat Pulldown (Wide/Neutral Grip)',
    maxWeightKg: 75,
    maxReps: 8,
    estimated1RMKg: 95,
    achievedAt: '2026-09-07T21:40:00.000Z',
    workoutId: 'workout_1788937004112_771b2'
  },
  {
    exerciseId: 'face_pulls',
    exerciseName: 'Cable Face Pull',
    maxWeightKg: 25,
    maxReps: 15,
    estimated1RMKg: 37.5,
    achievedAt: '2026-09-07T21:40:00.000Z',
    workoutId: 'workout_1788937004112_771b2'
  },
  {
    exerciseId: 'barbell_bicep_curl',
    exerciseName: 'Barbell Bicep Curl',
    maxWeightKg: 35,
    maxReps: 8,
    estimated1RMKg: 44.3,
    achievedAt: '2026-09-07T21:40:00.000Z',
    workoutId: 'workout_1788937004112_771b2'
  }
];
