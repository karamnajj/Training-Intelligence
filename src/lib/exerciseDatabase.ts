import { Exercise } from '../types';

export const EXERCISE_DATABASE: Exercise[] = [
  // CHEST & PUSH HORIZONTAL (UPPER, MID, LOWER CHEST DIVISIONS)
  {
    id: 'barbell_bench_press',
    name: 'Barbell Bench Press (Flat)',
    category: 'chest',
    movementPattern: 'push_horizontal',
    equipment: 'barbell',
    mechanics: 'compound',
    description: 'The premier compound exercise for upper body horizontal pushing power and sternal mid-chest mass.',
    muscles: [
      { muscleId: 'chest_mid', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'chest_upper', role: 'SECONDARY', contributionFactor: 0.4 },
      { muscleId: 'chest_lower', role: 'SECONDARY', contributionFactor: 0.4 },
      { muscleId: 'anterior_deltoid', role: 'SECONDARY', contributionFactor: 0.6 },
      { muscleId: 'triceps', role: 'SECONDARY', contributionFactor: 0.6 }
    ],
    tips: ['Keep shoulder blades retracted and depressed.', 'Control the eccentric phase smoothly to lower sternum.']
  },
  {
    id: 'incline_barbell_bench_press',
    name: 'Incline Barbell Bench Press',
    category: 'chest',
    movementPattern: 'push_horizontal',
    equipment: 'barbell',
    mechanics: 'compound',
    description: 'Heavy compound pressing set at 30-45° targeting clavicular upper chest mass and front deltoids.',
    muscles: [
      { muscleId: 'chest_upper', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'chest_mid', role: 'SECONDARY', contributionFactor: 0.4 },
      { muscleId: 'anterior_deltoid', role: 'SECONDARY', contributionFactor: 0.7 },
      { muscleId: 'triceps', role: 'SECONDARY', contributionFactor: 0.6 }
    ],
    tips: ['Touch the bar to upper chest / clavicular notch with controlled descent.']
  },
  {
    id: 'incline_dumbbell_press',
    name: 'Incline Dumbbell Bench Press',
    category: 'chest',
    movementPattern: 'push_horizontal',
    equipment: 'dumbbell',
    mechanics: 'compound',
    description: 'Targeted upper clavicular chest pressing with independent dumbbell stabilization and deep stretch.',
    muscles: [
      { muscleId: 'chest_upper', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'chest_mid', role: 'SECONDARY', contributionFactor: 0.35 },
      { muscleId: 'anterior_deltoid', role: 'SECONDARY', contributionFactor: 0.7 },
      { muscleId: 'triceps', role: 'SECONDARY', contributionFactor: 0.5 }
    ],
    tips: ['Set bench angle between 30° and 45°.', 'Converge dumbbells naturally without clashing at top.']
  },
  {
    id: 'flat_dumbbell_press',
    name: 'Flat Dumbbell Bench Press',
    category: 'chest',
    movementPattern: 'push_horizontal',
    equipment: 'dumbbell',
    mechanics: 'compound',
    description: 'Free-weight dumbbell pressing providing deep sternal mid-chest stretch and peak adduction.',
    muscles: [
      { muscleId: 'chest_mid', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'chest_upper', role: 'SECONDARY', contributionFactor: 0.35 },
      { muscleId: 'chest_lower', role: 'SECONDARY', contributionFactor: 0.35 },
      { muscleId: 'anterior_deltoid', role: 'SECONDARY', contributionFactor: 0.5 },
      { muscleId: 'triceps', role: 'SECONDARY', contributionFactor: 0.5 }
    ]
  },
  {
    id: 'decline_barbell_bench_press',
    name: 'Decline Barbell Bench Press',
    category: 'chest',
    movementPattern: 'push_horizontal',
    equipment: 'barbell',
    mechanics: 'compound',
    description: 'Decline angle pressing putting direct focus on lower costal/abdominal chest fibers with reduced shoulder strain.',
    muscles: [
      { muscleId: 'chest_lower', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'chest_mid', role: 'SECONDARY', contributionFactor: 0.5 },
      { muscleId: 'triceps', role: 'SECONDARY', contributionFactor: 0.6 },
      { muscleId: 'anterior_deltoid', role: 'SECONDARY', contributionFactor: 0.4 }
    ]
  },
  {
    id: 'decline_dumbbell_press',
    name: 'Decline Dumbbell Press',
    category: 'chest',
    movementPattern: 'push_horizontal',
    equipment: 'dumbbell',
    mechanics: 'compound',
    description: 'Targeted lower chest dumbbell press with enhanced adduction and deep eccentric stretch.',
    muscles: [
      { muscleId: 'chest_lower', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'chest_mid', role: 'SECONDARY', contributionFactor: 0.45 },
      { muscleId: 'triceps', role: 'SECONDARY', contributionFactor: 0.5 }
    ]
  },
  {
    id: 'cable_chest_fly',
    name: 'Cable Chest Fly (Mid Chest)',
    category: 'chest',
    movementPattern: 'isolation',
    equipment: 'cable',
    mechanics: 'isolation',
    description: 'Constant continuous tension through complete horizontal adduction targeting the sternal mid chest.',
    muscles: [
      { muscleId: 'chest_mid', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'chest_upper', role: 'SECONDARY', contributionFactor: 0.3 },
      { muscleId: 'chest_lower', role: 'SECONDARY', contributionFactor: 0.3 },
      { muscleId: 'anterior_deltoid', role: 'SECONDARY', contributionFactor: 0.3 }
    ],
    tips: ['Maintain a slight bend in elbows throughout.', 'Focus on bringing inner biceps towards sternum.']
  },
  {
    id: 'low_to_high_cable_fly',
    name: 'Low-to-High Cable Fly (Upper Chest)',
    category: 'chest',
    movementPattern: 'isolation',
    equipment: 'cable',
    mechanics: 'isolation',
    description: 'Upward scooping cable trajectory directly isolating the upper clavicular chest fibers.',
    muscles: [
      { muscleId: 'chest_upper', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'anterior_deltoid', role: 'SECONDARY', contributionFactor: 0.4 }
    ]
  },
  {
    id: 'high_to_low_cable_fly',
    name: 'High-to-Low Cable Fly (Lower Chest)',
    category: 'chest',
    movementPattern: 'isolation',
    equipment: 'cable',
    mechanics: 'isolation',
    description: 'Downward angle cable fly directly targeting the lower costal pectoralis fibers.',
    muscles: [
      { muscleId: 'chest_lower', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'chest_mid', role: 'SECONDARY', contributionFactor: 0.4 }
    ]
  },
  {
    id: 'chest_dips',
    name: 'Parallel Bar Dips (Chest Focused)',
    category: 'chest',
    movementPattern: 'push_vertical',
    equipment: 'bodyweight',
    mechanics: 'compound',
    description: 'High-intensity compound push hitting the lower costal pectorals, triceps, and anterior delts.',
    muscles: [
      { muscleId: 'chest_lower', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'chest_mid', role: 'SECONDARY', contributionFactor: 0.5 },
      { muscleId: 'triceps', role: 'PRIMARY', contributionFactor: 0.9 },
      { muscleId: 'anterior_deltoid', role: 'SECONDARY', contributionFactor: 0.5 }
    ],
    tips: ['Lean torso slightly forward to bias lower chest over triceps.']
  },
  {
    id: 'pushups',
    name: 'Standard Push-Up',
    category: 'chest',
    movementPattern: 'push_horizontal',
    equipment: 'bodyweight',
    mechanics: 'compound',
    description: 'Foundational bodyweight push establishing scapular rhythm, mid chest activation, and core integration.',
    muscles: [
      { muscleId: 'chest_mid', role: 'PRIMARY', contributionFactor: 0.9 },
      { muscleId: 'chest_upper', role: 'SECONDARY', contributionFactor: 0.4 },
      { muscleId: 'chest_lower', role: 'SECONDARY', contributionFactor: 0.4 },
      { muscleId: 'anterior_deltoid', role: 'SECONDARY', contributionFactor: 0.5 },
      { muscleId: 'triceps', role: 'SECONDARY', contributionFactor: 0.5 },
      { muscleId: 'rectus_abdominis', role: 'STABILIZER', contributionFactor: 0.3 }
    ]
  },

  // SHOULDERS & PUSH VERTICAL
  {
    id: 'overhead_barbell_press',
    name: 'Overhead Barbell Press (OHP)',
    category: 'shoulders',
    movementPattern: 'push_vertical',
    equipment: 'barbell',
    mechanics: 'compound',
    description: 'Strict standing barbell press developing overhead power, anterior deltoids, and core stability.',
    muscles: [
      { muscleId: 'anterior_deltoid', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'lateral_deltoid', role: 'SECONDARY', contributionFactor: 0.5 },
      { muscleId: 'triceps', role: 'SECONDARY', contributionFactor: 0.6 },
      { muscleId: 'trapezius', role: 'SECONDARY', contributionFactor: 0.4 },
      { muscleId: 'rectus_abdominis', role: 'STABILIZER', contributionFactor: 0.3 }
    ],
    tips: ['Squeeze glutes and brace core to prevent hyperextending lower back.', 'Lock out directly overhead.']
  },
  {
    id: 'seated_dumbbell_shoulder_press',
    name: 'Seated Dumbbell Shoulder Press',
    category: 'shoulders',
    movementPattern: 'push_vertical',
    equipment: 'dumbbell',
    mechanics: 'compound',
    description: 'Stabilized overhead press focusing direct mechanical tension on front and lateral delts.',
    muscles: [
      { muscleId: 'anterior_deltoid', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'lateral_deltoid', role: 'SECONDARY', contributionFactor: 0.6 },
      { muscleId: 'triceps', role: 'SECONDARY', contributionFactor: 0.5 }
    ]
  },
  {
    id: 'dumbbell_lateral_raise',
    name: 'Dumbbell Lateral Raise',
    category: 'shoulders',
    movementPattern: 'isolation',
    equipment: 'dumbbell',
    mechanics: 'isolation',
    description: 'Pure isolation movement targeting the lateral head of the deltoid for maximum shoulder width.',
    muscles: [
      { muscleId: 'lateral_deltoid', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'trapezius', role: 'STABILIZER', contributionFactor: 0.3 }
    ],
    tips: ['Raise dumbbells in the scapular plane (15-30° forward).', 'Lead with elbows, not wrists.']
  },
  {
    id: 'cable_lateral_raise',
    name: 'Cable Lateral Raise',
    category: 'shoulders',
    movementPattern: 'isolation',
    equipment: 'cable',
    mechanics: 'isolation',
    description: 'Constant resistance profile lateral raise maintaining high tension even at the bottom.',
    muscles: [
      { muscleId: 'lateral_deltoid', role: 'PRIMARY', contributionFactor: 1.0 }
    ]
  },
  {
    id: 'face_pulls',
    name: 'Cable Face Pull',
    category: 'shoulders',
    movementPattern: 'pull_horizontal',
    equipment: 'cable',
    mechanics: 'isolation',
    description: 'Essential bulletproofing exercise for rear delts, external rotators, and postural upper back.',
    muscles: [
      { muscleId: 'posterior_deltoid', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'trapezius', role: 'SECONDARY', contributionFactor: 0.7 },
      { muscleId: 'biceps', role: 'STABILIZER', contributionFactor: 0.2 }
    ],
    tips: ['Pull rope towards forehead while externally rotating thumbs back.']
  },
  {
    id: 'rear_delt_reverse_fly',
    name: 'Dumbbell / Machine Rear Delt Fly',
    category: 'shoulders',
    movementPattern: 'isolation',
    equipment: 'dumbbell',
    mechanics: 'isolation',
    description: 'Direct horizontal abduction isolating the posterior head of the deltoid.',
    muscles: [
      { muscleId: 'posterior_deltoid', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'trapezius', role: 'SECONDARY', contributionFactor: 0.4 }
    ]
  },

  // BACK & PULL VERTICAL / HORIZONTAL
  {
    id: 'barbell_deadlift',
    name: 'Conventional Barbell Deadlift',
    category: 'back',
    movementPattern: 'hinge',
    equipment: 'barbell',
    mechanics: 'compound',
    description: 'The supreme test of posterior chain kinetic strength, spinal bracing, and total body power.',
    muscles: [
      { muscleId: 'spinal_erectors', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'gluteus', role: 'PRIMARY', contributionFactor: 0.9 },
      { muscleId: 'hamstrings', role: 'PRIMARY', contributionFactor: 0.8 },
      { muscleId: 'trapezius', role: 'SECONDARY', contributionFactor: 0.7 },
      { muscleId: 'latissimus_dorsi', role: 'SECONDARY', contributionFactor: 0.6 },
      { muscleId: 'forearms', role: 'SECONDARY', contributionFactor: 0.7 },
      { muscleId: 'quadriceps', role: 'SECONDARY', contributionFactor: 0.5 }
    ],
    tips: ['Drag the bar close to shins and engage lats before breaking off floor.']
  },
  {
    id: 'barbell_bent_over_row',
    name: 'Barbell Bent-Over Row',
    category: 'back',
    movementPattern: 'pull_horizontal',
    equipment: 'barbell',
    mechanics: 'compound',
    description: 'Heavy horizontal rowing building dense mid-back thickness, lat volume, and isometric lower back stability.',
    muscles: [
      { muscleId: 'latissimus_dorsi', role: 'PRIMARY', contributionFactor: 0.9 },
      { muscleId: 'trapezius', role: 'PRIMARY', contributionFactor: 0.9 },
      { muscleId: 'posterior_deltoid', role: 'SECONDARY', contributionFactor: 0.6 },
      { muscleId: 'biceps', role: 'SECONDARY', contributionFactor: 0.6 },
      { muscleId: 'spinal_erectors', role: 'STABILIZER', contributionFactor: 0.6 }
    ],
    tips: ['Maintain a rigid 45° torso angle without jerky hip extension.']
  },
  {
    id: 'lat_pulldown',
    name: 'Lat Pulldown (Wide/Neutral Grip)',
    category: 'back',
    movementPattern: 'pull_vertical',
    equipment: 'cable',
    mechanics: 'compound',
    description: 'Primary vertical pulling cable exercise building lat width and scapular depression.',
    muscles: [
      { muscleId: 'latissimus_dorsi', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'trapezius', role: 'SECONDARY', contributionFactor: 0.5 },
      { muscleId: 'biceps', role: 'SECONDARY', contributionFactor: 0.6 },
      { muscleId: 'posterior_deltoid', role: 'SECONDARY', contributionFactor: 0.3 }
    ],
    tips: ['Drive elbows straight down towards your back pockets.']
  },
  {
    id: 'pull_ups',
    name: 'Pull-Ups / Chin-Ups',
    category: 'back',
    movementPattern: 'pull_vertical',
    equipment: 'bodyweight',
    mechanics: 'compound',
    description: 'Calisthenic upper body pulling benchmark demanding high relative strength.',
    muscles: [
      { muscleId: 'latissimus_dorsi', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'biceps', role: 'SECONDARY', contributionFactor: 0.7 },
      { muscleId: 'trapezius', role: 'SECONDARY', contributionFactor: 0.5 },
      { muscleId: 'rectus_abdominis', role: 'STABILIZER', contributionFactor: 0.4 }
    ]
  },
  {
    id: 'chest_supported_row',
    name: 'Chest-Supported T-Bar / Dumbbell Row',
    category: 'back',
    movementPattern: 'pull_horizontal',
    equipment: 'machine',
    mechanics: 'compound',
    description: 'Eliminates lower back fatigue to allow maximum overload on upper back, rhomboids, and lats.',
    muscles: [
      { muscleId: 'trapezius', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'latissimus_dorsi', role: 'PRIMARY', contributionFactor: 0.8 },
      { muscleId: 'posterior_deltoid', role: 'SECONDARY', contributionFactor: 0.6 },
      { muscleId: 'biceps', role: 'SECONDARY', contributionFactor: 0.5 }
    ]
  },
  {
    id: 'seated_cable_row',
    name: 'Seated Cable Row (Close / Wide)',
    category: 'back',
    movementPattern: 'pull_horizontal',
    equipment: 'cable',
    mechanics: 'compound',
    description: 'Smooth horizontal pull targeting mid-back thickness, rhomboids, and latissimus dorsi.',
    muscles: [
      { muscleId: 'latissimus_dorsi', role: 'PRIMARY', contributionFactor: 0.9 },
      { muscleId: 'trapezius', role: 'PRIMARY', contributionFactor: 0.8 },
      { muscleId: 'biceps', role: 'SECONDARY', contributionFactor: 0.5 },
      { muscleId: 'spinal_erectors', role: 'STABILIZER', contributionFactor: 0.4 }
    ]
  },

  // LEGS — QUADS, HAMSTRINGS, GLUTES, CALVES
  {
    id: 'barbell_back_squat',
    name: 'Barbell Back Squat',
    category: 'legs',
    movementPattern: 'squat',
    equipment: 'barbell',
    mechanics: 'compound',
    description: 'The golden standard of lower body power, quadriceps hypertrophy, and systemic hormonal stimulus.',
    muscles: [
      { muscleId: 'quadriceps', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'gluteus', role: 'PRIMARY', contributionFactor: 0.8 },
      { muscleId: 'adductors', role: 'SECONDARY', contributionFactor: 0.6 },
      { muscleId: 'spinal_erectors', role: 'SECONDARY', contributionFactor: 0.5 },
      { muscleId: 'hamstrings', role: 'SECONDARY', contributionFactor: 0.4 },
      { muscleId: 'calves', role: 'STABILIZER', contributionFactor: 0.3 }
    ],
    tips: ['Hit parallel depth or lower while keeping heels planted and knees tracking over toes.']
  },
  {
    id: 'romanian_deadlift',
    name: 'Romanian Deadlift (RDL)',
    category: 'legs',
    movementPattern: 'hinge',
    equipment: 'barbell',
    mechanics: 'compound',
    description: 'Premier hinge exercise focusing intense eccentric stretch and hypertrophy on hamstrings and glutes.',
    muscles: [
      { muscleId: 'hamstrings', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'gluteus', role: 'PRIMARY', contributionFactor: 0.9 },
      { muscleId: 'spinal_erectors', role: 'SECONDARY', contributionFactor: 0.6 },
      { muscleId: 'forearms', role: 'STABILIZER', contributionFactor: 0.4 }
    ],
    tips: ['Push hips back horizontally like closing a car door with your glutes.', 'Keep bar tight against thighs.']
  },
  {
    id: 'leg_press',
    name: '45-Degree Leg Press',
    category: 'legs',
    movementPattern: 'squat',
    equipment: 'machine',
    mechanics: 'compound',
    description: 'Heavy quad and glute loading without spinal compressive fatigue.',
    muscles: [
      { muscleId: 'quadriceps', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'gluteus', role: 'SECONDARY', contributionFactor: 0.7 },
      { muscleId: 'adductors', role: 'SECONDARY', contributionFactor: 0.5 }
    ]
  },
  {
    id: 'bulgarian_split_squat',
    name: 'Bulgarian Split Squat',
    category: 'legs',
    movementPattern: 'lunge',
    equipment: 'dumbbell',
    mechanics: 'compound',
    description: 'Unilateral leg punishment eliminating side imbalances while deeply stimulating glutes and quads.',
    muscles: [
      { muscleId: 'quadriceps', role: 'PRIMARY', contributionFactor: 0.9 },
      { muscleId: 'gluteus', role: 'PRIMARY', contributionFactor: 0.9 },
      { muscleId: 'adductors', role: 'SECONDARY', contributionFactor: 0.5 },
      { muscleId: 'hamstrings', role: 'SECONDARY', contributionFactor: 0.4 }
    ]
  },
  {
    id: 'leg_extension',
    name: 'Seated Leg Extension',
    category: 'legs',
    movementPattern: 'isolation',
    equipment: 'machine',
    mechanics: 'isolation',
    description: 'Direct quad isolation loading the rectus femoris in its fully shortened peak contraction.',
    muscles: [
      { muscleId: 'quadriceps', role: 'PRIMARY', contributionFactor: 1.0 }
    ],
    tips: ['Pause for 1 second at full top extension.']
  },
  {
    id: 'lying_leg_curl',
    name: 'Lying Hamstring Curl',
    category: 'legs',
    movementPattern: 'isolation',
    equipment: 'machine',
    mechanics: 'isolation',
    description: 'Knee-flexion hamstring isolation ensuring full posterior thigh development.',
    muscles: [
      { muscleId: 'hamstrings', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'calves', role: 'STABILIZER', contributionFactor: 0.2 }
    ]
  },
  {
    id: 'standing_calf_raise',
    name: 'Standing Calf Raise',
    category: 'legs',
    movementPattern: 'isolation',
    equipment: 'machine',
    mechanics: 'isolation',
    description: 'Full ankle range of motion targeting gastrocnemius with maximum deep stretch at the bottom.',
    muscles: [
      { muscleId: 'calves', role: 'PRIMARY', contributionFactor: 1.0 }
    ],
    tips: ['Pause for 2 seconds at bottom stretch to eliminate Achilles tendon recoil.']
  },
  {
    id: 'hip_thrust',
    name: 'Barbell Hip Thrust',
    category: 'legs',
    movementPattern: 'hinge',
    equipment: 'barbell',
    mechanics: 'compound',
    description: 'Highest peak glute activation exercise in resistance training.',
    muscles: [
      { muscleId: 'gluteus', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'hamstrings', role: 'SECONDARY', contributionFactor: 0.5 },
      { muscleId: 'adductors', role: 'SECONDARY', contributionFactor: 0.3 }
    ]
  },

  // ARMS — BICEPS, TRICEPS, FOREARMS
  {
    id: 'barbell_bicep_curl',
    name: 'Barbell Bicep Curl',
    category: 'arms',
    movementPattern: 'isolation',
    equipment: 'barbell',
    mechanics: 'isolation',
    description: 'Foundational mass builder for the long and short heads of the biceps brachii.',
    muscles: [
      { muscleId: 'biceps', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'forearms', role: 'SECONDARY', contributionFactor: 0.4 }
    ],
    tips: ['Keep elbows pinned at sides; do not sway torso.']
  },
  {
    id: 'incline_dumbbell_curl',
    name: 'Incline Dumbbell Curl',
    category: 'arms',
    movementPattern: 'isolation',
    equipment: 'dumbbell',
    mechanics: 'isolation',
    description: 'Deep eccentric stretch on the long head of the bicep from an inclined shoulder position.',
    muscles: [
      { muscleId: 'biceps', role: 'PRIMARY', contributionFactor: 1.0 }
    ]
  },
  {
    id: 'hammer_curl',
    name: 'Dumbbell Hammer Curl',
    category: 'arms',
    movementPattern: 'isolation',
    equipment: 'dumbbell',
    mechanics: 'isolation',
    description: 'Neutral grip curl targeting brachialis and brachioradialis for upper arm thickness and forearm size.',
    muscles: [
      { muscleId: 'biceps', role: 'PRIMARY', contributionFactor: 0.8 },
      { muscleId: 'forearms', role: 'PRIMARY', contributionFactor: 0.8 }
    ]
  },
  {
    id: 'triceps_rope_pushdown',
    name: 'Cable Triceps Rope Pushdown',
    category: 'arms',
    movementPattern: 'isolation',
    equipment: 'cable',
    mechanics: 'isolation',
    description: 'Constant cable tension targeting lateral and medial triceps heads with flared bottom lockout.',
    muscles: [
      { muscleId: 'triceps', role: 'PRIMARY', contributionFactor: 1.0 }
    ]
  },
  {
    id: 'skull_crushers',
    name: 'EZ-Bar Skull Crushers (Lying Triceps Extension)',
    category: 'arms',
    movementPattern: 'isolation',
    equipment: 'barbell',
    mechanics: 'isolation',
    description: 'High-stretch triceps builder emphasizing the long head across the elbow joint.',
    muscles: [
      { muscleId: 'triceps', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'forearms', role: 'STABILIZER', contributionFactor: 0.3 }
    ]
  },
  {
    id: 'overhead_cable_triceps_ext',
    name: 'Overhead Cable Triceps Extension',
    category: 'arms',
    movementPattern: 'isolation',
    equipment: 'cable',
    mechanics: 'isolation',
    description: 'Places the triceps long head in its most lengthened position for superior hypertrophy.',
    muscles: [
      { muscleId: 'triceps', role: 'PRIMARY', contributionFactor: 1.0 }
    ]
  },

  // CORE & ABDOMINALS
  {
    id: 'hanging_leg_raise',
    name: 'Hanging Leg / Knee Raise',
    category: 'core',
    movementPattern: 'core',
    equipment: 'bodyweight',
    mechanics: 'compound',
    description: 'Demanding lower abdominal and hip flexor movement with grip and shoulder engagement.',
    muscles: [
      { muscleId: 'rectus_abdominis', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'obliques', role: 'SECONDARY', contributionFactor: 0.6 },
      { muscleId: 'forearms', role: 'STABILIZER', contributionFactor: 0.4 }
    ],
    tips: ['Curl pelvis upward at the top instead of just swinging legs.']
  },
  {
    id: 'cable_woodchopper',
    name: 'Cable Rotational Woodchopper',
    category: 'core',
    movementPattern: 'core',
    equipment: 'cable',
    mechanics: 'isolation',
    description: 'Rotational kinetic core training firing the internal and external obliques.',
    muscles: [
      { muscleId: 'obliques', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'rectus_abdominis', role: 'SECONDARY', contributionFactor: 0.5 }
    ]
  },
  {
    id: 'cable_crunch',
    name: 'Kneeling Cable Rope Crunch',
    category: 'core',
    movementPattern: 'core',
    equipment: 'cable',
    mechanics: 'isolation',
    description: 'Direct progressive overload abdominal crunch allowing incremental weight additions.',
    muscles: [
      { muscleId: 'rectus_abdominis', role: 'PRIMARY', contributionFactor: 1.0 }
    ]
  },

  // -------------------------------------------------------------------------
  // EXTENSIVE GYM MACHINES (CHEST, BACK, LEGS, SHOULDERS, ARMS, CORE)
  // -------------------------------------------------------------------------
  {
    id: 'seated_machine_chest_press',
    name: 'Seated Machine Chest Press',
    category: 'chest',
    movementPattern: 'push_horizontal',
    equipment: 'machine',
    mechanics: 'compound',
    description: 'Guided converged machine pressing providing maximum mid-pectoralis tension with zero stabilizer fatigue.',
    muscles: [
      { muscleId: 'chest_mid', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'chest_upper', role: 'SECONDARY', contributionFactor: 0.35 },
      { muscleId: 'chest_lower', role: 'SECONDARY', contributionFactor: 0.35 },
      { muscleId: 'anterior_deltoid', role: 'SECONDARY', contributionFactor: 0.6 },
      { muscleId: 'triceps', role: 'SECONDARY', contributionFactor: 0.5 }
    ],
    tips: ['Adjust seat height so handles align with mid-to-lower sternum.', 'Drive elbows inward at peak contraction.']
  },
  {
    id: 'incline_machine_chest_press',
    name: 'Incline Machine Chest Press',
    category: 'chest',
    movementPattern: 'push_horizontal',
    equipment: 'machine',
    mechanics: 'compound',
    description: 'Plate-loaded or selectorized upward pressing trajectory targeting the clavicular upper chest.',
    muscles: [
      { muscleId: 'chest_upper', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'chest_mid', role: 'SECONDARY', contributionFactor: 0.35 },
      { muscleId: 'anterior_deltoid', role: 'PRIMARY', contributionFactor: 0.8 },
      { muscleId: 'triceps', role: 'SECONDARY', contributionFactor: 0.5 }
    ]
  },
  {
    id: 'pec_deck_fly',
    name: 'Pec Deck / Machine Fly',
    category: 'chest',
    movementPattern: 'isolation',
    equipment: 'machine',
    mechanics: 'isolation',
    description: 'Constant tension horizontal adduction placing direct tension on the sternal mid chest without triceps involvement.',
    muscles: [
      { muscleId: 'chest_mid', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'chest_upper', role: 'SECONDARY', contributionFactor: 0.3 },
      { muscleId: 'anterior_deltoid', role: 'SECONDARY', contributionFactor: 0.3 }
    ],
    tips: ['Keep a slight bend in the elbows and maintain a proud chest throughout.']
  },
  {
    id: 'machine_shoulder_press',
    name: 'Seated Machine Shoulder Press',
    category: 'shoulders',
    movementPattern: 'push_vertical',
    equipment: 'machine',
    mechanics: 'compound',
    description: 'Fixed-track vertical pressing allowing safe, high-intensity loading on anterior and lateral deltoids.',
    muscles: [
      { muscleId: 'anterior_deltoid', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'lateral_deltoid', role: 'SECONDARY', contributionFactor: 0.7 },
      { muscleId: 'triceps', role: 'SECONDARY', contributionFactor: 0.6 },
      { muscleId: 'trapezius', role: 'SECONDARY', contributionFactor: 0.4 }
    ]
  },
  {
    id: 'machine_lateral_raise',
    name: 'Machine Lateral Raise',
    category: 'shoulders',
    movementPattern: 'isolation',
    equipment: 'machine',
    mechanics: 'isolation',
    description: 'Pad-leveraged side deltoid isolation maintaining constant resistance curve at the bottom stretch.',
    muscles: [
      { muscleId: 'lateral_deltoid', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'trapezius', role: 'SECONDARY', contributionFactor: 0.3 }
    ],
    tips: ['Press outward through elbows rather than gripping tightly with hands.']
  },
  {
    id: 'smith_machine_incline_press',
    name: 'Smith Machine Incline Bench Press',
    category: 'chest',
    movementPattern: 'push_horizontal',
    equipment: 'smith_machine',
    mechanics: 'compound',
    description: 'Fixed-plane incline barbell pressing enabling safe failure training for upper chest hypertrophy.',
    muscles: [
      { muscleId: 'chest_upper', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'chest_mid', role: 'SECONDARY', contributionFactor: 0.35 },
      { muscleId: 'anterior_deltoid', role: 'PRIMARY', contributionFactor: 0.8 },
      { muscleId: 'triceps', role: 'SECONDARY', contributionFactor: 0.5 }
    ]
  },
  {
    id: 'smith_machine_squat',
    name: 'Smith Machine Squat',
    category: 'legs',
    movementPattern: 'squat',
    equipment: 'smith_machine',
    mechanics: 'compound',
    description: 'Guided vertical track squat allowing forward foot placement to isolate quadriceps with reduced lumbar strain.',
    muscles: [
      { muscleId: 'quadriceps', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'gluteus', role: 'PRIMARY', contributionFactor: 0.8 },
      { muscleId: 'adductors', role: 'SECONDARY', contributionFactor: 0.5 }
    ],
    tips: ['Place feet 6-10 inches in front of bar line for maximum quad-dominant knee flexion.']
  },
  {
    id: 'smith_machine_rdl',
    name: 'Smith Machine Romanian Deadlift',
    category: 'legs',
    movementPattern: 'hinge',
    equipment: 'smith_machine',
    mechanics: 'compound',
    description: 'Fixed-bar hip hinge maximizing deep eccentric stretch on hamstrings and glutes.',
    muscles: [
      { muscleId: 'hamstrings', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'gluteus', role: 'PRIMARY', contributionFactor: 0.9 },
      { muscleId: 'spinal_erectors', role: 'SECONDARY', contributionFactor: 0.5 }
    ]
  },
  {
    id: 'hack_squat_machine',
    name: 'Hack Squat Machine',
    category: 'legs',
    movementPattern: 'squat',
    equipment: 'machine',
    mechanics: 'compound',
    description: 'Angled back-supported sled squat providing pure quad overloading at deep knee flexion angles.',
    muscles: [
      { muscleId: 'quadriceps', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'gluteus', role: 'SECONDARY', contributionFactor: 0.6 },
      { muscleId: 'adductors', role: 'SECONDARY', contributionFactor: 0.4 }
    ],
    tips: ['Keep heels firmly planted on the platform; control the descent to full depth.']
  },
  {
    id: 'seated_leg_curl_machine',
    name: 'Seated Hamstring Leg Curl',
    category: 'legs',
    movementPattern: 'isolation',
    equipment: 'machine',
    mechanics: 'isolation',
    description: 'Seated knee flexion training hamstrings at lengthened hip position for superior hypertrophy.',
    muscles: [
      { muscleId: 'hamstrings', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'calves', role: 'STABILIZER', contributionFactor: 0.2 }
    ],
    tips: ['Keep thighs firmly clamped down under the thigh pad to prevent hip lifting.']
  },
  {
    id: 'machine_adductor',
    name: 'Machine Hip Adductor (Inner Thigh)',
    category: 'legs',
    movementPattern: 'isolation',
    equipment: 'machine',
    mechanics: 'isolation',
    description: 'Direct inner thigh adductor strengthening crucial for squat power and groin balance.',
    muscles: [
      { muscleId: 'adductors', role: 'PRIMARY', contributionFactor: 1.0 }
    ]
  },
  {
    id: 'machine_abductor',
    name: 'Machine Hip Abductor (Outer Glute)',
    category: 'legs',
    movementPattern: 'isolation',
    equipment: 'machine',
    mechanics: 'isolation',
    description: 'Seated outer hip abduction firing the gluteus medius and minimus for hip stability and pelvic width.',
    muscles: [
      { muscleId: 'gluteus', role: 'PRIMARY', contributionFactor: 1.0 }
    ]
  },
  {
    id: 'seated_calf_raise_machine',
    name: 'Seated Calf Raise Machine',
    category: 'legs',
    movementPattern: 'isolation',
    equipment: 'machine',
    mechanics: 'isolation',
    description: 'Bent-knee plantarflexion targeting the deep soleus muscle underneath the gastrocnemius.',
    muscles: [
      { muscleId: 'calves', role: 'PRIMARY', contributionFactor: 1.0 }
    ],
    tips: ['Pause for 2 full seconds at the bottom stretch before pushing through the balls of the feet.']
  },
  {
    id: 'plate_loaded_iso_lat_row',
    name: 'Plate-Loaded ISO-Lateral Row Machine',
    category: 'back',
    movementPattern: 'pull_horizontal',
    equipment: 'machine',
    mechanics: 'compound',
    description: 'Independent arm horizontal pulling machine providing deep lat stretch and unilateral focus.',
    muscles: [
      { muscleId: 'latissimus_dorsi', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'trapezius', role: 'SECONDARY', contributionFactor: 0.7 },
      { muscleId: 'biceps', role: 'SECONDARY', contributionFactor: 0.5 },
      { muscleId: 'posterior_deltoid', role: 'SECONDARY', contributionFactor: 0.4 }
    ]
  },
  {
    id: 'assisted_pullup_dip_machine',
    name: 'Assisted Pull-Up & Dip Machine',
    category: 'back',
    movementPattern: 'pull_vertical',
    equipment: 'machine',
    mechanics: 'compound',
    description: 'Counter-balanced knee pad machine allowing strict high-rep vertical pulling and chest/tricep dipping.',
    muscles: [
      { muscleId: 'latissimus_dorsi', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'biceps', role: 'SECONDARY', contributionFactor: 0.6 },
      { muscleId: 'trapezius', role: 'SECONDARY', contributionFactor: 0.4 }
    ]
  },
  {
    id: 'machine_preacher_curl',
    name: 'Machine Preacher Bicep Curl',
    category: 'arms',
    movementPattern: 'isolation',
    equipment: 'machine',
    mechanics: 'isolation',
    description: 'Strict elbow-locked bicep curl eliminating momentum and maintaining resistance at peak lockout.',
    muscles: [
      { muscleId: 'biceps', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'forearms', role: 'SECONDARY', contributionFactor: 0.4 }
    ]
  },
  {
    id: 'machine_triceps_dip_press',
    name: 'Machine Triceps Dip Press',
    category: 'arms',
    movementPattern: 'push_vertical',
    equipment: 'machine',
    mechanics: 'compound',
    description: 'Seated downward lever press directly engaging all three heads of the triceps with chest assist.',
    muscles: [
      { muscleId: 'triceps', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'chest_lower', role: 'SECONDARY', contributionFactor: 0.5 },
      { muscleId: 'anterior_deltoid', role: 'SECONDARY', contributionFactor: 0.4 }
    ]
  },
  {
    id: 'machine_abdominal_crunch',
    name: 'Seated Machine Abdominal Crunch',
    category: 'core',
    movementPattern: 'core',
    equipment: 'machine',
    mechanics: 'isolation',
    description: 'Biomechanical seated spinal flexion machine with chest pad to progressively overload rectus abdominis.',
    muscles: [
      { muscleId: 'rectus_abdominis', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'obliques', role: 'SECONDARY', contributionFactor: 0.4 }
    ]
  },
  {
    id: 'smith_machine_shrug',
    name: 'Smith Machine Shrug',
    category: 'back',
    movementPattern: 'pull_vertical',
    equipment: 'smith_machine',
    mechanics: 'isolation',
    description: 'Heavy vertical elevation of the clavicles along a locked vertical axis for upper trapezius thickness.',
    muscles: [
      { muscleId: 'trapezius', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'forearms', role: 'STABILIZER', contributionFactor: 0.4 }
    ]
  },
  // EXPANDED SELECTION: SMITH MACHINE MASTER CLASS
  {
    id: 'smith_machine_shoulder_press',
    name: 'Smith Machine Overhead Shoulder Press',
    category: 'shoulders',
    movementPattern: 'push_vertical',
    equipment: 'smith_machine',
    mechanics: 'compound',
    description: 'Fixed-track overhead barbell pressing providing supreme anterior and lateral deltoid mechanical tension without wasting energy on stabilization.',
    muscles: [
      { muscleId: 'anterior_deltoid', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'lateral_deltoid', role: 'PRIMARY', contributionFactor: 0.7 },
      { muscleId: 'triceps', role: 'SECONDARY', contributionFactor: 0.6 },
      { muscleId: 'chest_upper', role: 'SECONDARY', contributionFactor: 0.35 }
    ],
    tips: [
      'Position bench so bar descends smoothly just in front of your nose to upper chest.',
      'Maintain an upright posture and drive straight upward through the palms without flaring wrists.'
    ]
  },
  {
    id: 'smith_machine_flat_bench_press',
    name: 'Smith Machine Flat Bench Press',
    category: 'chest',
    movementPattern: 'push_horizontal',
    equipment: 'smith_machine',
    mechanics: 'compound',
    description: 'Fixed-plane horizontal press enabling aggressive overload to concentric failure on mid and lower sternal chest fibers.',
    muscles: [
      { muscleId: 'chest_mid', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'chest_upper', role: 'SECONDARY', contributionFactor: 0.4 },
      { muscleId: 'chest_lower', role: 'SECONDARY', contributionFactor: 0.4 },
      { muscleId: 'anterior_deltoid', role: 'SECONDARY', contributionFactor: 0.5 },
      { muscleId: 'triceps', role: 'SECONDARY', contributionFactor: 0.6 }
    ],
    tips: [
      'Touch the bar to lower-mid sternum with a 1-second controlled stretch.'
    ]
  },
  {
    id: 'smith_machine_decline_bench_press',
    name: 'Smith Machine Decline Bench Press',
    category: 'chest',
    movementPattern: 'push_horizontal',
    equipment: 'smith_machine',
    mechanics: 'compound',
    description: 'Decline-angled guided barbell press focusing mechanical tension on lower pectoralis major with reduced anterior shoulder strain.',
    muscles: [
      { muscleId: 'chest_lower', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'chest_mid', role: 'SECONDARY', contributionFactor: 0.5 },
      { muscleId: 'triceps', role: 'SECONDARY', contributionFactor: 0.6 },
      { muscleId: 'anterior_deltoid', role: 'SECONDARY', contributionFactor: 0.3 }
    ]
  },
  {
    id: 'smith_machine_close_grip_bench_press',
    name: 'Smith Machine Close-Grip Bench Press',
    category: 'arms',
    movementPattern: 'push_horizontal',
    equipment: 'smith_machine',
    mechanics: 'compound',
    description: 'Shoulder-width grip guided pressing isolating the lateral and medial heads of the triceps while minimizing wrist shearing.',
    muscles: [
      { muscleId: 'triceps', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'chest_mid', role: 'SECONDARY', contributionFactor: 0.4 },
      { muscleId: 'anterior_deltoid', role: 'SECONDARY', contributionFactor: 0.4 }
    ],
    tips: [
      'Keep elbows tucked tight against your ribcage during the descent.'
    ]
  },
  {
    id: 'smith_machine_bent_over_row',
    name: 'Smith Machine Bent-Over Row',
    category: 'back',
    movementPattern: 'pull_horizontal',
    equipment: 'smith_machine',
    mechanics: 'compound',
    description: 'Guided horizontal pulling eliminating horizontal sway to lock isolation on lats, rhomboids, and mid-trapezius.',
    muscles: [
      { muscleId: 'latissimus_dorsi', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'trapezius', role: 'PRIMARY', contributionFactor: 0.8 },
      { muscleId: 'biceps', role: 'SECONDARY', contributionFactor: 0.5 },
      { muscleId: 'spinal_erectors', role: 'SECONDARY', contributionFactor: 0.4 }
    ],
    tips: [
      'Hinge hips back at 45 degrees; pull bar smoothly towards lower abdomen.'
    ]
  },
  {
    id: 'smith_machine_hip_thrust',
    name: 'Smith Machine Hip Thrust',
    category: 'legs',
    movementPattern: 'hinge',
    equipment: 'smith_machine',
    mechanics: 'compound',
    description: 'Bench-supported pelvic thrust along a fixed track with effortless un-racking for maximum gluteus maximus contraction.',
    muscles: [
      { muscleId: 'gluteus', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'hamstrings', role: 'SECONDARY', contributionFactor: 0.5 },
      { muscleId: 'adductors', role: 'SECONDARY', contributionFactor: 0.3 }
    ],
    tips: [
      'Lock shins vertical at top of extension and hold peak contraction for 1 second.'
    ]
  },
  {
    id: 'smith_machine_bulgarian_split_squat',
    name: 'Smith Machine Bulgarian Split Squat',
    category: 'legs',
    movementPattern: 'lunge',
    equipment: 'smith_machine',
    mechanics: 'compound',
    description: 'Rear-foot elevated split squat with fixed-plane track stability eliminating balance hurdles to fully fatigue the front quad and glute.',
    muscles: [
      { muscleId: 'quadriceps', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'gluteus', role: 'PRIMARY', contributionFactor: 0.9 },
      { muscleId: 'hamstrings', role: 'SECONDARY', contributionFactor: 0.4 },
      { muscleId: 'adductors', role: 'SECONDARY', contributionFactor: 0.4 }
    ],
    tips: [
      'Place front foot forward so your shin stays perpendicular to floor at bottom depth.'
    ]
  },
  {
    id: 'smith_machine_standing_calf_raise',
    name: 'Smith Machine Standing Calf Raise',
    category: 'legs',
    movementPattern: 'isolation',
    equipment: 'smith_machine',
    mechanics: 'isolation',
    description: 'Heavy gastrocnemius plantarflexion with balls of feet elevated on a step or bumper plate for maximum calf stretch and contraction.',
    muscles: [
      { muscleId: 'calves', role: 'PRIMARY', contributionFactor: 1.0 }
    ],
    tips: [
      'Pause for 2 full seconds in the deep heel-drop stretch before pressing up onto toes.'
    ]
  },
  {
    id: 'smith_machine_behind_the_neck_press',
    name: 'Smith Machine Behind-The-Neck Press',
    category: 'shoulders',
    movementPattern: 'push_vertical',
    equipment: 'smith_machine',
    mechanics: 'compound',
    description: 'Vertical overhead press lowered behind the head along the fixed Smith track targeting the lateral and posterior deltoids.',
    muscles: [
      { muscleId: 'lateral_deltoid', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'anterior_deltoid', role: 'PRIMARY', contributionFactor: 0.8 },
      { muscleId: 'trapezius', role: 'SECONDARY', contributionFactor: 0.5 },
      { muscleId: 'triceps', role: 'SECONDARY', contributionFactor: 0.5 }
    ],
    tips: [
      'Lower bar only to top of ear-line and maintain a smooth, controlled cadence.'
    ]
  },
  {
    id: 'smith_machine_upright_row',
    name: 'Smith Machine Upright Row',
    category: 'shoulders',
    movementPattern: 'pull_vertical',
    equipment: 'smith_machine',
    mechanics: 'compound',
    description: 'Guided vertical pulling motion targeting lateral deltoids and upper trapezius with stabilized bar path.',
    muscles: [
      { muscleId: 'lateral_deltoid', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'trapezius', role: 'PRIMARY', contributionFactor: 0.85 },
      { muscleId: 'biceps', role: 'SECONDARY', contributionFactor: 0.4 },
      { muscleId: 'forearms', role: 'SECONDARY', contributionFactor: 0.3 }
    ],
    tips: [
      'Use a wide grip beyond shoulder width to optimize lateral deltoid activation.'
    ]
  },

  // EXPANDED SELECTION: SHOULDERS, CHEST, BACK & ARMS HYPERTROPHY
  {
    id: 'arnold_press',
    name: 'Arnold Dumbbell Press',
    category: 'shoulders',
    movementPattern: 'push_vertical',
    equipment: 'dumbbell',
    mechanics: 'compound',
    description: 'Rotational overhead dumbbell press hitting anterior, lateral, and stabilizing shoulder fibers through an expansive arc.',
    muscles: [
      { muscleId: 'anterior_deltoid', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'lateral_deltoid', role: 'PRIMARY', contributionFactor: 0.8 },
      { muscleId: 'triceps', role: 'SECONDARY', contributionFactor: 0.5 }
    ],
    tips: [
      'Rotate palms smoothly from facing chest at bottom to facing forward at overhead lockout.'
    ]
  },
  {
    id: 'cable_y_raise',
    name: 'Cable Y-Raise (Scapular Plane)',
    category: 'shoulders',
    movementPattern: 'isolation',
    equipment: 'cable',
    mechanics: 'isolation',
    description: 'Dual cable lateral elevation pulling in a 30-degree forward Y angle for optimal side delt alignment and lower trap synergy.',
    muscles: [
      { muscleId: 'lateral_deltoid', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'trapezius', role: 'SECONDARY', contributionFactor: 0.5 }
    ],
    tips: [
      'Cross low cables and raise hands upward and outward in a wide Y shape.'
    ]
  },
  {
    id: 'dumbbell_front_raise',
    name: 'Dumbbell Front Raise',
    category: 'shoulders',
    movementPattern: 'isolation',
    equipment: 'dumbbell',
    mechanics: 'isolation',
    description: 'Isolated anterior deltoid flexion raising dumbbells to eye level with strict form.',
    muscles: [
      { muscleId: 'anterior_deltoid', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'chest_upper', role: 'SECONDARY', contributionFactor: 0.4 }
    ],
    tips: [
      'Avoid swinging or hip thrust; initiate pull strictly from the front deltoids.'
    ]
  },
  {
    id: 'cable_front_raise',
    name: 'Cable Straight-Bar Front Raise',
    category: 'shoulders',
    movementPattern: 'isolation',
    equipment: 'cable',
    mechanics: 'isolation',
    description: 'Continuous resistance anterior deltoid isolation maintaining uniform tension at the initial liftoff.',
    muscles: [
      { muscleId: 'anterior_deltoid', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'chest_upper', role: 'SECONDARY', contributionFactor: 0.35 }
    ]
  },
  {
    id: 'single_arm_cable_lateral_raise',
    name: 'Behind-The-Back Single-Arm Cable Lateral Raise',
    category: 'shoulders',
    movementPattern: 'isolation',
    equipment: 'cable',
    mechanics: 'isolation',
    description: 'Cable side raise routed behind the hips providing maximum stretch on the lateral deltoid head at the bottom.',
    muscles: [
      { muscleId: 'lateral_deltoid', role: 'PRIMARY', contributionFactor: 1.0 }
    ],
    tips: [
      'Set pulley around wrist or hip height; pull up and slightly outward.'
    ]
  },
  {
    id: 'seated_bent_over_dumbbell_rear_delt_raise',
    name: 'Seated Bent-Over Dumbbell Rear Delt Raise',
    category: 'shoulders',
    movementPattern: 'isolation',
    equipment: 'dumbbell',
    mechanics: 'isolation',
    description: 'Seated horizontal abduction targeting the posterior deltoid head with torso rested against thighs.',
    muscles: [
      { muscleId: 'posterior_deltoid', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'trapezius', role: 'SECONDARY', contributionFactor: 0.5 }
    ]
  },
  {
    id: 'landmine_single_arm_press',
    name: 'Landmine Single-Arm Shoulder Press',
    category: 'shoulders',
    movementPattern: 'push_vertical',
    equipment: 'barbell',
    mechanics: 'compound',
    description: 'Natural arc pressing using a landmine barbell sleeve, extremely friendly for rotator cuff and clavicular joints.',
    muscles: [
      { muscleId: 'anterior_deltoid', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'chest_upper', role: 'SECONDARY', contributionFactor: 0.5 },
      { muscleId: 'triceps', role: 'SECONDARY', contributionFactor: 0.5 }
    ]
  },
  {
    id: 'single_arm_dumbbell_row',
    name: 'Single-Arm Dumbbell Row',
    category: 'back',
    movementPattern: 'pull_horizontal',
    equipment: 'dumbbell',
    mechanics: 'compound',
    description: 'Unilateral bench-supported heavy dumbbell row providing full lat stretch at bottom and strong lat/rhomboid contraction at top.',
    muscles: [
      { muscleId: 'latissimus_dorsi', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'trapezius', role: 'PRIMARY', contributionFactor: 0.8 },
      { muscleId: 'biceps', role: 'SECONDARY', contributionFactor: 0.5 },
      { muscleId: 'forearms', role: 'SECONDARY', contributionFactor: 0.4 }
    ],
    tips: [
      'Drive your elbow back towards your hip pocket to load lats rather than bicep.'
    ]
  },
  {
    id: 'cable_straight_arm_pulldown',
    name: 'Cable Straight-Arm Lat Pulldown',
    category: 'back',
    movementPattern: 'pull_vertical',
    equipment: 'cable',
    mechanics: 'isolation',
    description: 'Pure shoulder extension exercise isolating the latissimus dorsi without bicep fatigue.',
    muscles: [
      { muscleId: 'latissimus_dorsi', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'trapezius', role: 'SECONDARY', contributionFactor: 0.4 },
      { muscleId: 'triceps', role: 'SECONDARY', contributionFactor: 0.3 }
    ],
    tips: [
      'Maintain a slight forward torso lean and pull bar in a wide arc down to mid-thighs.'
    ]
  },
  {
    id: 'chest_supported_t_bar_row',
    name: 'Chest-Supported T-Bar Row',
    category: 'back',
    movementPattern: 'pull_horizontal',
    equipment: 'machine',
    mechanics: 'compound',
    description: 'Heavy mid-back rowing with chest firmly braced against pad to completely eliminate lower back fatigue and momentum.',
    muscles: [
      { muscleId: 'trapezius', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'latissimus_dorsi', role: 'PRIMARY', contributionFactor: 0.9 },
      { muscleId: 'biceps', role: 'SECONDARY', contributionFactor: 0.5 }
    ]
  },
  {
    id: 'incline_dumbbell_fly',
    name: 'Incline Dumbbell Chest Fly',
    category: 'chest',
    movementPattern: 'isolation',
    equipment: 'dumbbell',
    mechanics: 'isolation',
    description: 'Deep adduction and eccentric stretch for upper clavicular pectoralis major.',
    muscles: [
      { muscleId: 'chest_upper', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'chest_mid', role: 'SECONDARY', contributionFactor: 0.4 },
      { muscleId: 'anterior_deltoid', role: 'SECONDARY', contributionFactor: 0.4 }
    ]
  },
  {
    id: 'cable_bayesian_bicep_curl',
    name: 'Bayesian Cable Bicep Curl',
    category: 'arms',
    movementPattern: 'isolation',
    equipment: 'cable',
    mechanics: 'isolation',
    description: 'Facing away from the low pulley to keep the shoulder in hyperextension, producing extreme long-head bicep stretch tension.',
    muscles: [
      { muscleId: 'biceps', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'forearms', role: 'SECONDARY', contributionFactor: 0.3 }
    ],
    tips: [
      'Take 1-2 steps forward from the stack, let arms be pulled back behind torso before curling.'
    ]
  },
  {
    id: 'preacher_curl_ez_bar',
    name: 'EZ-Bar Preacher Curl',
    category: 'arms',
    movementPattern: 'isolation',
    equipment: 'barbell',
    mechanics: 'isolation',
    description: 'Arm-anchored bicep curl on preacher bench placing maximal tension at the lengthened bottom position and short head.',
    muscles: [
      { muscleId: 'biceps', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'forearms', role: 'SECONDARY', contributionFactor: 0.4 }
    ]
  },
  {
    id: 'dumbbell_concentration_curl',
    name: 'Dumbbell Concentration Curl',
    category: 'arms',
    movementPattern: 'isolation',
    equipment: 'dumbbell',
    mechanics: 'isolation',
    description: 'Seated single-arm curl with elbow braced against inner thigh for absolute isolation of the bicep peak.',
    muscles: [
      { muscleId: 'biceps', role: 'PRIMARY', contributionFactor: 1.0 }
    ]
  },
  {
    id: 'seated_dumbbell_hammer_curl',
    name: 'Seated Incline Dumbbell Hammer Curl',
    category: 'arms',
    movementPattern: 'isolation',
    equipment: 'dumbbell',
    mechanics: 'isolation',
    description: 'Neutral-grip bicep curling on an incline targeting the brachialis and brachioradialis for arm thickness.',
    muscles: [
      { muscleId: 'biceps', role: 'PRIMARY', contributionFactor: 0.9 },
      { muscleId: 'forearms', role: 'PRIMARY', contributionFactor: 0.8 }
    ]
  },
  {
    id: 'cable_overhead_rope_tricep_extension',
    name: 'Cable Overhead Rope Triceps Extension',
    category: 'arms',
    movementPattern: 'isolation',
    equipment: 'cable',
    mechanics: 'isolation',
    description: 'Overhead cable extension placing the long head of the triceps under deep stretch throughout.',
    muscles: [
      { muscleId: 'triceps', role: 'PRIMARY', contributionFactor: 1.0 }
    ],
    tips: [
      'Flare rope ends apart at full overhead lockout for peak contraction.'
    ]
  },
  {
    id: 'barbell_hip_thrust',
    name: 'Barbell Hip Thrust',
    category: 'legs',
    movementPattern: 'hinge',
    equipment: 'barbell',
    mechanics: 'compound',
    description: 'The golden standard glute hypertrophy compound exercise loading maximum barbell weight at full hip extension.',
    muscles: [
      { muscleId: 'gluteus', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'hamstrings', role: 'SECONDARY', contributionFactor: 0.5 },
      { muscleId: 'adductors', role: 'SECONDARY', contributionFactor: 0.3 }
    ]
  },
  {
    id: 'dumbbell_bulgarian_split_squat',
    name: 'Dumbbell Bulgarian Split Squat',
    category: 'legs',
    movementPattern: 'lunge',
    equipment: 'dumbbell',
    mechanics: 'compound',
    description: 'Unilateral rear-foot elevated split squat with dumbbells held at sides for pure leg strength, balance, and hypertrophy.',
    muscles: [
      { muscleId: 'quadriceps', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'gluteus', role: 'PRIMARY', contributionFactor: 0.9 },
      { muscleId: 'hamstrings', role: 'SECONDARY', contributionFactor: 0.4 },
      { muscleId: 'adductors', role: 'SECONDARY', contributionFactor: 0.4 }
    ]
  },
  {
    id: 'tricep_curl_dips_machine',
    name: 'Tricep Curl (Dips Machine)',
    category: 'arms',
    movementPattern: 'push_vertical',
    equipment: 'machine',
    mechanics: 'compound',
    description: 'Seated machine dip press (also referred to as tricep dip curl machine) where dual handles are driven downward with lap belt or thigh restraint to heavily load the triceps while minimizing shoulder strain.',
    muscles: [
      { muscleId: 'triceps', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'chest_lower', role: 'SECONDARY', contributionFactor: 0.4 },
      { muscleId: 'chest_mid', role: 'SECONDARY', contributionFactor: 0.3 },
      { muscleId: 'anterior_deltoid', role: 'SECONDARY', contributionFactor: 0.4 }
    ],
    tips: [
      'Fasten the lap belt or adjust the thigh pad securely so your body stays anchored to the seat.',
      'Tuck elbows in close to the torso to channel maximal force through the triceps rather than pecs.',
      'Descend with smooth control to approximately 90 degrees before driving down into lockout.'
    ]
  },
  {
    id: 'chest_supported_seated_back_row',
    name: 'Chest-Supported Seated Back Row',
    category: 'back',
    movementPattern: 'pull_horizontal',
    equipment: 'machine',
    mechanics: 'compound',
    description: 'Horizontal seated back row with chest pinned firmly against an angled support pad, eliminating spinal loading and lower back fatigue for pure lat, rhomboid, rear delt, and mid-trap hypertrophy.',
    muscles: [
      { muscleId: 'latissimus_dorsi', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'trapezius', role: 'PRIMARY', contributionFactor: 0.8 },
      { muscleId: 'posterior_deltoid', role: 'SECONDARY', contributionFactor: 0.7 },
      { muscleId: 'biceps', role: 'SECONDARY', contributionFactor: 0.5 },
      { muscleId: 'forearms', role: 'SECONDARY', contributionFactor: 0.3 }
    ],
    tips: [
      'Adjust seat and chest pad height so the handles align directly with your mid-torso.',
      'Pull through your elbows rather than wrists, feeling the full contraction across your lats and mid-back.',
      'Keep chest glued against the pad throughout the negative stretch without arching away.'
    ]
  },
  {
    id: 'back_supported_cable_tricep_pushdown',
    name: 'Back-Supported Cable Tricep Pushdown',
    category: 'arms',
    movementPattern: 'isolation',
    equipment: 'cable',
    mechanics: 'isolation',
    description: 'Ultra-stable tricep pushdown executed with back braced against an incline bench or vertical pad, completely neutralizing body sway and shoulder momentum for hyper-pure triceps tension.',
    muscles: [
      { muscleId: 'triceps', role: 'PRIMARY', contributionFactor: 1.0 },
      { muscleId: 'forearms', role: 'SECONDARY', contributionFactor: 0.2 }
    ],
    tips: [
      'Set an incline bench or vertical pad directly behind you to brace your spine and hips rigidly.',
      'Pin upper arms tight to your ribs and extend elbows fully to contract all three triceps heads.',
      'Hold the bottom squeeze for a full second before controlling the negative back to 90 degrees.'
    ]
  },
  {
    id: 'seated_machine_tricep_curl',
    name: 'Seated Machine Tricep Curl (Extension)',
    category: 'arms',
    movementPattern: 'isolation',
    equipment: 'machine',
    mechanics: 'isolation',
    description: 'Arm-supported selectorized tricep curl/extension machine with angled elbow pads, locking the humerus in place to isolate the lateral and medial heads through full extension.',
    muscles: [
      { muscleId: 'triceps', role: 'PRIMARY', contributionFactor: 1.0 }
    ],
    tips: [
      'Line up your elbow joint with the machine rotational pivot cam.',
      'Keep your upper arms flat against the pad and squeeze triceps hard at peak contraction.'
    ]
  }
];

export const EXERCISES_MAP: Record<string, Exercise> = EXERCISE_DATABASE.reduce(
  (acc, ex) => {
    acc[ex.id] = ex;
    return acc;
  },
  {} as Record<string, Exercise>
);
