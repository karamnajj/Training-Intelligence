var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");

// src/lib/exerciseDatabase.ts
var EXERCISE_DATABASE = [
  // CHEST & PUSH HORIZONTAL (UPPER, MID, LOWER CHEST DIVISIONS)
  {
    id: "barbell_bench_press",
    name: "Barbell Bench Press (Flat)",
    category: "chest",
    movementPattern: "push_horizontal",
    equipment: "barbell",
    mechanics: "compound",
    description: "The premier compound exercise for upper body horizontal pushing power and sternal mid-chest mass.",
    muscles: [
      { muscleId: "chest_mid", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "chest_upper", role: "SECONDARY", contributionFactor: 0.4 },
      { muscleId: "chest_lower", role: "SECONDARY", contributionFactor: 0.4 },
      { muscleId: "anterior_deltoid", role: "SECONDARY", contributionFactor: 0.6 },
      { muscleId: "triceps", role: "SECONDARY", contributionFactor: 0.6 }
    ],
    tips: ["Keep shoulder blades retracted and depressed.", "Control the eccentric phase smoothly to lower sternum."]
  },
  {
    id: "incline_barbell_bench_press",
    name: "Incline Barbell Bench Press",
    category: "chest",
    movementPattern: "push_horizontal",
    equipment: "barbell",
    mechanics: "compound",
    description: "Heavy compound pressing set at 30-45\xB0 targeting clavicular upper chest mass and front deltoids.",
    muscles: [
      { muscleId: "chest_upper", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "chest_mid", role: "SECONDARY", contributionFactor: 0.4 },
      { muscleId: "anterior_deltoid", role: "SECONDARY", contributionFactor: 0.7 },
      { muscleId: "triceps", role: "SECONDARY", contributionFactor: 0.6 }
    ],
    tips: ["Touch the bar to upper chest / clavicular notch with controlled descent."]
  },
  {
    id: "incline_dumbbell_press",
    name: "Incline Dumbbell Bench Press",
    category: "chest",
    movementPattern: "push_horizontal",
    equipment: "dumbbell",
    mechanics: "compound",
    description: "Targeted upper clavicular chest pressing with independent dumbbell stabilization and deep stretch.",
    muscles: [
      { muscleId: "chest_upper", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "chest_mid", role: "SECONDARY", contributionFactor: 0.35 },
      { muscleId: "anterior_deltoid", role: "SECONDARY", contributionFactor: 0.7 },
      { muscleId: "triceps", role: "SECONDARY", contributionFactor: 0.5 }
    ],
    tips: ["Set bench angle between 30\xB0 and 45\xB0.", "Converge dumbbells naturally without clashing at top."]
  },
  {
    id: "flat_dumbbell_press",
    name: "Flat Dumbbell Bench Press",
    category: "chest",
    movementPattern: "push_horizontal",
    equipment: "dumbbell",
    mechanics: "compound",
    description: "Free-weight dumbbell pressing providing deep sternal mid-chest stretch and peak adduction.",
    muscles: [
      { muscleId: "chest_mid", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "chest_upper", role: "SECONDARY", contributionFactor: 0.35 },
      { muscleId: "chest_lower", role: "SECONDARY", contributionFactor: 0.35 },
      { muscleId: "anterior_deltoid", role: "SECONDARY", contributionFactor: 0.5 },
      { muscleId: "triceps", role: "SECONDARY", contributionFactor: 0.5 }
    ]
  },
  {
    id: "decline_barbell_bench_press",
    name: "Decline Barbell Bench Press",
    category: "chest",
    movementPattern: "push_horizontal",
    equipment: "barbell",
    mechanics: "compound",
    description: "Decline angle pressing putting direct focus on lower costal/abdominal chest fibers with reduced shoulder strain.",
    muscles: [
      { muscleId: "chest_lower", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "chest_mid", role: "SECONDARY", contributionFactor: 0.5 },
      { muscleId: "triceps", role: "SECONDARY", contributionFactor: 0.6 },
      { muscleId: "anterior_deltoid", role: "SECONDARY", contributionFactor: 0.4 }
    ]
  },
  {
    id: "decline_dumbbell_press",
    name: "Decline Dumbbell Press",
    category: "chest",
    movementPattern: "push_horizontal",
    equipment: "dumbbell",
    mechanics: "compound",
    description: "Targeted lower chest dumbbell press with enhanced adduction and deep eccentric stretch.",
    muscles: [
      { muscleId: "chest_lower", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "chest_mid", role: "SECONDARY", contributionFactor: 0.45 },
      { muscleId: "triceps", role: "SECONDARY", contributionFactor: 0.5 }
    ]
  },
  {
    id: "cable_chest_fly",
    name: "Cable Chest Fly (Mid Chest)",
    category: "chest",
    movementPattern: "isolation",
    equipment: "cable",
    mechanics: "isolation",
    description: "Constant continuous tension through complete horizontal adduction targeting the sternal mid chest.",
    muscles: [
      { muscleId: "chest_mid", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "chest_upper", role: "SECONDARY", contributionFactor: 0.3 },
      { muscleId: "chest_lower", role: "SECONDARY", contributionFactor: 0.3 },
      { muscleId: "anterior_deltoid", role: "SECONDARY", contributionFactor: 0.3 }
    ],
    tips: ["Maintain a slight bend in elbows throughout.", "Focus on bringing inner biceps towards sternum."]
  },
  {
    id: "low_to_high_cable_fly",
    name: "Low-to-High Cable Fly (Upper Chest)",
    category: "chest",
    movementPattern: "isolation",
    equipment: "cable",
    mechanics: "isolation",
    description: "Upward scooping cable trajectory directly isolating the upper clavicular chest fibers.",
    muscles: [
      { muscleId: "chest_upper", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "anterior_deltoid", role: "SECONDARY", contributionFactor: 0.4 }
    ]
  },
  {
    id: "high_to_low_cable_fly",
    name: "High-to-Low Cable Fly (Lower Chest)",
    category: "chest",
    movementPattern: "isolation",
    equipment: "cable",
    mechanics: "isolation",
    description: "Downward angle cable fly directly targeting the lower costal pectoralis fibers.",
    muscles: [
      { muscleId: "chest_lower", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "chest_mid", role: "SECONDARY", contributionFactor: 0.4 }
    ]
  },
  {
    id: "chest_dips",
    name: "Parallel Bar Dips (Chest Focused)",
    category: "chest",
    movementPattern: "push_vertical",
    equipment: "bodyweight",
    mechanics: "compound",
    description: "High-intensity compound push hitting the lower costal pectorals, triceps, and anterior delts.",
    muscles: [
      { muscleId: "chest_lower", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "chest_mid", role: "SECONDARY", contributionFactor: 0.5 },
      { muscleId: "triceps", role: "PRIMARY", contributionFactor: 0.9 },
      { muscleId: "anterior_deltoid", role: "SECONDARY", contributionFactor: 0.5 }
    ],
    tips: ["Lean torso slightly forward to bias lower chest over triceps."]
  },
  {
    id: "pushups",
    name: "Standard Push-Up",
    category: "chest",
    movementPattern: "push_horizontal",
    equipment: "bodyweight",
    mechanics: "compound",
    description: "Foundational bodyweight push establishing scapular rhythm, mid chest activation, and core integration.",
    muscles: [
      { muscleId: "chest_mid", role: "PRIMARY", contributionFactor: 0.9 },
      { muscleId: "chest_upper", role: "SECONDARY", contributionFactor: 0.4 },
      { muscleId: "chest_lower", role: "SECONDARY", contributionFactor: 0.4 },
      { muscleId: "anterior_deltoid", role: "SECONDARY", contributionFactor: 0.5 },
      { muscleId: "triceps", role: "SECONDARY", contributionFactor: 0.5 },
      { muscleId: "rectus_abdominis", role: "STABILIZER", contributionFactor: 0.3 }
    ]
  },
  // SHOULDERS & PUSH VERTICAL
  {
    id: "overhead_barbell_press",
    name: "Overhead Barbell Press (OHP)",
    category: "shoulders",
    movementPattern: "push_vertical",
    equipment: "barbell",
    mechanics: "compound",
    description: "Strict standing barbell press developing overhead power, anterior deltoids, and core stability.",
    muscles: [
      { muscleId: "anterior_deltoid", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "lateral_deltoid", role: "SECONDARY", contributionFactor: 0.5 },
      { muscleId: "triceps", role: "SECONDARY", contributionFactor: 0.6 },
      { muscleId: "rhomboids", role: "SECONDARY", contributionFactor: 0.4 },
      { muscleId: "rectus_abdominis", role: "STABILIZER", contributionFactor: 0.3 }
    ],
    tips: ["Squeeze glutes and brace core to prevent hyperextending lower back.", "Lock out directly overhead."]
  },
  {
    id: "seated_dumbbell_shoulder_press",
    name: "Seated Dumbbell Shoulder Press",
    category: "shoulders",
    movementPattern: "push_vertical",
    equipment: "dumbbell",
    mechanics: "compound",
    description: "Stabilized overhead press focusing direct mechanical tension on front and lateral delts.",
    muscles: [
      { muscleId: "anterior_deltoid", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "lateral_deltoid", role: "SECONDARY", contributionFactor: 0.6 },
      { muscleId: "triceps", role: "SECONDARY", contributionFactor: 0.5 }
    ]
  },
  {
    id: "dumbbell_lateral_raise",
    name: "Dumbbell Lateral Raise",
    category: "shoulders",
    movementPattern: "isolation",
    equipment: "dumbbell",
    mechanics: "isolation",
    description: "Pure isolation movement targeting the lateral head of the deltoid for maximum shoulder width.",
    muscles: [
      { muscleId: "lateral_deltoid", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "rhomboids", role: "STABILIZER", contributionFactor: 0.3 }
    ],
    tips: ["Raise dumbbells in the scapular plane (15-30\xB0 forward).", "Lead with elbows, not wrists."]
  },
  {
    id: "cable_lateral_raise",
    name: "Cable Lateral Raise",
    category: "shoulders",
    movementPattern: "isolation",
    equipment: "cable",
    mechanics: "isolation",
    description: "Constant resistance profile lateral raise maintaining high tension even at the bottom.",
    muscles: [
      { muscleId: "lateral_deltoid", role: "PRIMARY", contributionFactor: 1 }
    ]
  },
  {
    id: "face_pulls",
    name: "Cable Face Pull",
    category: "shoulders",
    movementPattern: "pull_horizontal",
    equipment: "cable",
    mechanics: "isolation",
    description: "Essential bulletproofing exercise for rear delts, external rotators, and postural upper back.",
    muscles: [
      { muscleId: "posterior_deltoid", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "rhomboids", role: "PRIMARY", contributionFactor: 0.85 },
      { muscleId: "biceps", role: "STABILIZER", contributionFactor: 0.2 }
    ],
    tips: ["Pull rope towards forehead while externally rotating thumbs back."]
  },
  {
    id: "rear_delt_reverse_fly",
    name: "Dumbbell / Machine Rear Delt Fly",
    category: "shoulders",
    movementPattern: "isolation",
    equipment: "dumbbell",
    mechanics: "isolation",
    description: "Direct horizontal abduction isolating the posterior head of the deltoid.",
    muscles: [
      { muscleId: "posterior_deltoid", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "rhomboids", role: "SECONDARY", contributionFactor: 0.4 }
    ]
  },
  // BACK & PULL VERTICAL / HORIZONTAL
  {
    id: "barbell_deadlift",
    name: "Conventional Barbell Deadlift",
    category: "back",
    movementPattern: "hinge",
    equipment: "barbell",
    mechanics: "compound",
    description: "The supreme test of posterior chain kinetic strength, spinal bracing, and total body power.",
    muscles: [
      { muscleId: "spinal_erectors", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "gluteus", role: "PRIMARY", contributionFactor: 0.9 },
      { muscleId: "hamstrings", role: "PRIMARY", contributionFactor: 0.8 },
      { muscleId: "rhomboids", role: "SECONDARY", contributionFactor: 0.7 },
      { muscleId: "latissimus_dorsi", role: "SECONDARY", contributionFactor: 0.6 },
      { muscleId: "forearms", role: "SECONDARY", contributionFactor: 0.7 },
      { muscleId: "quadriceps", role: "SECONDARY", contributionFactor: 0.5 }
    ],
    tips: ["Drag the bar close to shins and engage lats before breaking off floor."]
  },
  {
    id: "barbell_bent_over_row",
    name: "Barbell Bent-Over Row",
    category: "back",
    movementPattern: "pull_horizontal",
    equipment: "barbell",
    mechanics: "compound",
    description: "Heavy horizontal rowing building dense mid-back thickness, lat volume, and isometric lower back stability.",
    muscles: [
      { muscleId: "rhomboids", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "latissimus_dorsi", role: "PRIMARY", contributionFactor: 0.9 },
      { muscleId: "posterior_deltoid", role: "SECONDARY", contributionFactor: 0.6 },
      { muscleId: "biceps", role: "SECONDARY", contributionFactor: 0.6 },
      { muscleId: "spinal_erectors", role: "STABILIZER", contributionFactor: 0.6 }
    ],
    tips: ["Maintain a rigid 45\xB0 torso angle without jerky hip extension."]
  },
  {
    id: "lat_pulldown",
    name: "Lat Pulldown (Wide/Neutral Grip)",
    category: "back",
    movementPattern: "pull_vertical",
    equipment: "cable",
    mechanics: "compound",
    description: "Primary vertical pulling cable exercise building lat width and scapular depression.",
    muscles: [
      { muscleId: "latissimus_dorsi", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "rhomboids", role: "SECONDARY", contributionFactor: 0.5 },
      { muscleId: "biceps", role: "SECONDARY", contributionFactor: 0.6 },
      { muscleId: "posterior_deltoid", role: "SECONDARY", contributionFactor: 0.3 }
    ],
    tips: ["Drive elbows straight down towards your back pockets."]
  },
  {
    id: "pull_ups",
    name: "Pull-Ups / Chin-Ups",
    category: "back",
    movementPattern: "pull_vertical",
    equipment: "bodyweight",
    mechanics: "compound",
    description: "Calisthenic upper body pulling benchmark demanding high relative strength.",
    muscles: [
      { muscleId: "latissimus_dorsi", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "biceps", role: "SECONDARY", contributionFactor: 0.7 },
      { muscleId: "rhomboids", role: "SECONDARY", contributionFactor: 0.5 },
      { muscleId: "rectus_abdominis", role: "STABILIZER", contributionFactor: 0.4 }
    ]
  },
  {
    id: "chest_supported_row",
    name: "Chest-Supported T-Bar / Dumbbell Row",
    category: "back",
    movementPattern: "pull_horizontal",
    equipment: "machine",
    mechanics: "compound",
    description: "Eliminates lower back fatigue to allow maximum overload on upper back, rhomboids, and lats.",
    muscles: [
      { muscleId: "rhomboids", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "latissimus_dorsi", role: "PRIMARY", contributionFactor: 0.85 },
      { muscleId: "posterior_deltoid", role: "SECONDARY", contributionFactor: 0.6 },
      { muscleId: "biceps", role: "SECONDARY", contributionFactor: 0.5 }
    ]
  },
  {
    id: "seated_cable_row",
    name: "Seated Cable Row (Close / Wide)",
    category: "back",
    movementPattern: "pull_horizontal",
    equipment: "cable",
    mechanics: "compound",
    description: "Smooth horizontal pull targeting mid-back thickness, rhomboids, and latissimus dorsi.",
    muscles: [
      { muscleId: "latissimus_dorsi", role: "PRIMARY", contributionFactor: 0.95 },
      { muscleId: "rhomboids", role: "PRIMARY", contributionFactor: 0.95 },
      { muscleId: "biceps", role: "SECONDARY", contributionFactor: 0.5 },
      { muscleId: "spinal_erectors", role: "STABILIZER", contributionFactor: 0.4 }
    ]
  },
  // LEGS — QUADS, HAMSTRINGS, GLUTES, CALVES
  {
    id: "barbell_back_squat",
    name: "Barbell Back Squat",
    category: "legs",
    movementPattern: "squat",
    equipment: "barbell",
    mechanics: "compound",
    description: "The golden standard of lower body power, quadriceps hypertrophy, and systemic hormonal stimulus.",
    muscles: [
      { muscleId: "quadriceps", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "gluteus", role: "PRIMARY", contributionFactor: 0.8 },
      { muscleId: "adductors", role: "SECONDARY", contributionFactor: 0.6 },
      { muscleId: "spinal_erectors", role: "SECONDARY", contributionFactor: 0.5 },
      { muscleId: "hamstrings", role: "SECONDARY", contributionFactor: 0.4 },
      { muscleId: "calves", role: "STABILIZER", contributionFactor: 0.3 }
    ],
    tips: ["Hit parallel depth or lower while keeping heels planted and knees tracking over toes."]
  },
  {
    id: "romanian_deadlift",
    name: "Romanian Deadlift (RDL)",
    category: "legs",
    movementPattern: "hinge",
    equipment: "barbell",
    mechanics: "compound",
    description: "Premier hinge exercise focusing intense eccentric stretch and hypertrophy on hamstrings and glutes.",
    muscles: [
      { muscleId: "hamstrings", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "gluteus", role: "PRIMARY", contributionFactor: 0.9 },
      { muscleId: "spinal_erectors", role: "SECONDARY", contributionFactor: 0.6 },
      { muscleId: "forearms", role: "STABILIZER", contributionFactor: 0.4 }
    ],
    tips: ["Push hips back horizontally like closing a car door with your glutes.", "Keep bar tight against thighs."]
  },
  {
    id: "leg_press",
    name: "45-Degree Leg Press",
    category: "legs",
    movementPattern: "squat",
    equipment: "machine",
    mechanics: "compound",
    description: "Heavy quad and glute loading without spinal compressive fatigue.",
    muscles: [
      { muscleId: "quadriceps", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "gluteus", role: "SECONDARY", contributionFactor: 0.7 },
      { muscleId: "adductors", role: "SECONDARY", contributionFactor: 0.5 }
    ]
  },
  {
    id: "bulgarian_split_squat",
    name: "Bulgarian Split Squat",
    category: "legs",
    movementPattern: "lunge",
    equipment: "dumbbell",
    mechanics: "compound",
    description: "Unilateral leg punishment eliminating side imbalances while deeply stimulating glutes and quads.",
    muscles: [
      { muscleId: "quadriceps", role: "PRIMARY", contributionFactor: 0.9 },
      { muscleId: "gluteus", role: "PRIMARY", contributionFactor: 0.9 },
      { muscleId: "adductors", role: "SECONDARY", contributionFactor: 0.5 },
      { muscleId: "hamstrings", role: "SECONDARY", contributionFactor: 0.4 }
    ]
  },
  {
    id: "leg_extension",
    name: "Seated Leg Extension",
    category: "legs",
    movementPattern: "isolation",
    equipment: "machine",
    mechanics: "isolation",
    description: "Direct quad isolation loading the rectus femoris in its fully shortened peak contraction.",
    muscles: [
      { muscleId: "quadriceps", role: "PRIMARY", contributionFactor: 1 }
    ],
    tips: ["Pause for 1 second at full top extension."]
  },
  {
    id: "lying_leg_curl",
    name: "Lying Hamstring Curl",
    category: "legs",
    movementPattern: "isolation",
    equipment: "machine",
    mechanics: "isolation",
    description: "Knee-flexion hamstring isolation ensuring full posterior thigh development.",
    muscles: [
      { muscleId: "hamstrings", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "calves", role: "STABILIZER", contributionFactor: 0.2 }
    ]
  },
  {
    id: "standing_calf_raise",
    name: "Standing Calf Raise",
    category: "legs",
    movementPattern: "isolation",
    equipment: "machine",
    mechanics: "isolation",
    description: "Full ankle range of motion targeting gastrocnemius with maximum deep stretch at the bottom.",
    muscles: [
      { muscleId: "calves", role: "PRIMARY", contributionFactor: 1 }
    ],
    tips: ["Pause for 2 seconds at bottom stretch to eliminate Achilles tendon recoil."]
  },
  {
    id: "hip_thrust",
    name: "Barbell Hip Thrust",
    category: "legs",
    movementPattern: "hinge",
    equipment: "barbell",
    mechanics: "compound",
    description: "Highest peak glute activation exercise in resistance training.",
    muscles: [
      { muscleId: "gluteus", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "hamstrings", role: "SECONDARY", contributionFactor: 0.5 },
      { muscleId: "adductors", role: "SECONDARY", contributionFactor: 0.3 }
    ]
  },
  // ARMS — BICEPS, TRICEPS, FOREARMS
  {
    id: "barbell_bicep_curl",
    name: "Barbell Bicep Curl",
    category: "arms",
    movementPattern: "isolation",
    equipment: "barbell",
    mechanics: "isolation",
    description: "Foundational mass builder for the long and short heads of the biceps brachii.",
    muscles: [
      { muscleId: "biceps", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "forearms", role: "SECONDARY", contributionFactor: 0.4 }
    ],
    tips: ["Keep elbows pinned at sides; do not sway torso."]
  },
  {
    id: "incline_dumbbell_curl",
    name: "Incline Dumbbell Curl",
    category: "arms",
    movementPattern: "isolation",
    equipment: "dumbbell",
    mechanics: "isolation",
    description: "Deep eccentric stretch on the long head of the bicep from an inclined shoulder position.",
    muscles: [
      { muscleId: "biceps", role: "PRIMARY", contributionFactor: 1 }
    ]
  },
  {
    id: "hammer_curl",
    name: "Dumbbell Hammer Curl",
    category: "arms",
    movementPattern: "isolation",
    equipment: "dumbbell",
    mechanics: "isolation",
    description: "Neutral grip curl targeting brachialis and brachioradialis for upper arm thickness and forearm size.",
    muscles: [
      { muscleId: "biceps", role: "PRIMARY", contributionFactor: 0.8 },
      { muscleId: "forearms", role: "PRIMARY", contributionFactor: 0.8 }
    ]
  },
  {
    id: "ez_bar_reverse_curl",
    name: "EZ-Bar Reverse Curl",
    category: "arms",
    movementPattern: "isolation",
    equipment: "barbell",
    mechanics: "isolation",
    description: "Pronated (overhand) grip curl executed with an ergonomic EZ-curl bar. Directly overloads the brachioradialis, brachialis, and forearm extensors for upper arm thickness and forearm grip strength while eliminating straight-bar wrist torque.",
    muscles: [
      { muscleId: "forearms", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "biceps", role: "PRIMARY", contributionFactor: 0.7 }
    ],
    tips: [
      "Grip the outer or inner cambers with an overhand (palms facing down) pronated grip.",
      "Pin elbows tightly to your ribcage and keep wrists neutral without letting them bend backwards.",
      "Emphasize a controlled 2 to 3 second eccentric lower to build forearm size and grip strength."
    ]
  },
  {
    id: "triceps_rope_pushdown",
    name: "Cable Triceps Pushdown",
    category: "arms",
    movementPattern: "isolation",
    equipment: "cable",
    mechanics: "isolation",
    description: "Constant cable tension targeting lateral and medial triceps heads. Compatible with all handle attachments (straight bar, V-bar, rope, or single handles).",
    muscles: [
      { muscleId: "triceps", role: "PRIMARY", contributionFactor: 1 }
    ],
    tips: [
      "Keep upper arms pinned at your sides throughout the movement.",
      "Works with any handle attachment: straight bar, V-bar, rope, or single D-handle."
    ]
  },
  {
    id: "skull_crushers",
    name: "EZ-Bar Skull Crushers (Lying Triceps Extension)",
    category: "arms",
    movementPattern: "isolation",
    equipment: "barbell",
    mechanics: "isolation",
    description: "High-stretch triceps builder emphasizing the long head across the elbow joint.",
    muscles: [
      { muscleId: "triceps", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "forearms", role: "STABILIZER", contributionFactor: 0.3 }
    ]
  },
  {
    id: "overhead_cable_triceps_ext",
    name: "Overhead Cable Triceps Extension",
    category: "arms",
    movementPattern: "isolation",
    equipment: "cable",
    mechanics: "isolation",
    description: "Places the triceps long head in its most lengthened position for superior hypertrophy.",
    muscles: [
      { muscleId: "triceps", role: "PRIMARY", contributionFactor: 1 }
    ]
  },
  // CORE & ABDOMINALS
  {
    id: "hanging_leg_raise",
    name: "Hanging Leg / Knee Raise",
    category: "core",
    movementPattern: "core",
    equipment: "bodyweight",
    mechanics: "compound",
    description: "Demanding lower abdominal and hip flexor movement with grip and shoulder engagement.",
    muscles: [
      { muscleId: "rectus_abdominis", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "obliques", role: "SECONDARY", contributionFactor: 0.6 },
      { muscleId: "forearms", role: "STABILIZER", contributionFactor: 0.4 }
    ],
    tips: ["Curl pelvis upward at the top instead of just swinging legs."]
  },
  {
    id: "cable_woodchopper",
    name: "Cable Rotational Woodchopper",
    category: "core",
    movementPattern: "core",
    equipment: "cable",
    mechanics: "isolation",
    description: "Rotational kinetic core training firing the internal and external obliques.",
    muscles: [
      { muscleId: "obliques", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "rectus_abdominis", role: "SECONDARY", contributionFactor: 0.5 }
    ]
  },
  {
    id: "cable_crunch",
    name: "Kneeling Cable Rope Crunch",
    category: "core",
    movementPattern: "core",
    equipment: "cable",
    mechanics: "isolation",
    description: "Direct progressive overload abdominal crunch allowing incremental weight additions.",
    muscles: [
      { muscleId: "rectus_abdominis", role: "PRIMARY", contributionFactor: 1 }
    ]
  },
  // -------------------------------------------------------------------------
  // EXTENSIVE GYM MACHINES (CHEST, BACK, LEGS, SHOULDERS, ARMS, CORE)
  // -------------------------------------------------------------------------
  {
    id: "seated_machine_chest_press",
    name: "Seated Machine Chest Press",
    category: "chest",
    movementPattern: "push_horizontal",
    equipment: "machine",
    mechanics: "compound",
    description: "Guided converged machine pressing providing maximum mid-pectoralis tension with zero stabilizer fatigue.",
    muscles: [
      { muscleId: "chest_mid", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "chest_upper", role: "SECONDARY", contributionFactor: 0.35 },
      { muscleId: "chest_lower", role: "SECONDARY", contributionFactor: 0.35 },
      { muscleId: "anterior_deltoid", role: "SECONDARY", contributionFactor: 0.6 },
      { muscleId: "triceps", role: "SECONDARY", contributionFactor: 0.5 }
    ],
    tips: ["Adjust seat height so handles align with mid-to-lower sternum.", "Drive elbows inward at peak contraction."]
  },
  {
    id: "incline_machine_chest_press",
    name: "Incline Machine Chest Press",
    category: "chest",
    movementPattern: "push_horizontal",
    equipment: "machine",
    mechanics: "compound",
    description: "Plate-loaded or selectorized upward pressing trajectory targeting the clavicular upper chest.",
    muscles: [
      { muscleId: "chest_upper", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "chest_mid", role: "SECONDARY", contributionFactor: 0.35 },
      { muscleId: "anterior_deltoid", role: "PRIMARY", contributionFactor: 0.8 },
      { muscleId: "triceps", role: "SECONDARY", contributionFactor: 0.5 }
    ]
  },
  {
    id: "pec_deck_fly",
    name: "Pec Deck / Machine Fly",
    category: "chest",
    movementPattern: "isolation",
    equipment: "machine",
    mechanics: "isolation",
    description: "Constant tension horizontal adduction placing direct tension on the sternal mid chest without triceps involvement.",
    muscles: [
      { muscleId: "chest_mid", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "chest_upper", role: "SECONDARY", contributionFactor: 0.3 },
      { muscleId: "anterior_deltoid", role: "SECONDARY", contributionFactor: 0.3 }
    ],
    tips: ["Keep a slight bend in the elbows and maintain a proud chest throughout."]
  },
  {
    id: "machine_shoulder_press",
    name: "Seated Machine Shoulder Press",
    category: "shoulders",
    movementPattern: "push_vertical",
    equipment: "machine",
    mechanics: "compound",
    description: "Fixed-track vertical pressing allowing safe, high-intensity loading on anterior and lateral deltoids.",
    muscles: [
      { muscleId: "anterior_deltoid", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "lateral_deltoid", role: "SECONDARY", contributionFactor: 0.7 },
      { muscleId: "triceps", role: "SECONDARY", contributionFactor: 0.6 },
      { muscleId: "rhomboids", role: "SECONDARY", contributionFactor: 0.4 }
    ]
  },
  {
    id: "machine_lateral_raise",
    name: "Machine Lateral Raise",
    category: "shoulders",
    movementPattern: "isolation",
    equipment: "machine",
    mechanics: "isolation",
    description: "Pad-leveraged side deltoid isolation maintaining constant resistance curve at the bottom stretch.",
    muscles: [
      { muscleId: "lateral_deltoid", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "rhomboids", role: "SECONDARY", contributionFactor: 0.3 }
    ],
    tips: ["Press outward through elbows rather than gripping tightly with hands."]
  },
  {
    id: "smith_machine_incline_press",
    name: "Smith Machine Incline Bench Press",
    category: "chest",
    movementPattern: "push_horizontal",
    equipment: "smith_machine",
    mechanics: "compound",
    description: "Fixed-plane incline barbell pressing enabling safe failure training for upper chest hypertrophy.",
    muscles: [
      { muscleId: "chest_upper", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "chest_mid", role: "SECONDARY", contributionFactor: 0.35 },
      { muscleId: "anterior_deltoid", role: "PRIMARY", contributionFactor: 0.8 },
      { muscleId: "triceps", role: "SECONDARY", contributionFactor: 0.5 }
    ]
  },
  {
    id: "smith_machine_squat",
    name: "Smith Machine Squat",
    category: "legs",
    movementPattern: "squat",
    equipment: "smith_machine",
    mechanics: "compound",
    description: "Guided vertical track squat allowing forward foot placement to isolate quadriceps with reduced lumbar strain.",
    muscles: [
      { muscleId: "quadriceps", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "gluteus", role: "PRIMARY", contributionFactor: 0.8 },
      { muscleId: "adductors", role: "SECONDARY", contributionFactor: 0.5 }
    ],
    tips: ["Place feet 6-10 inches in front of bar line for maximum quad-dominant knee flexion."]
  },
  {
    id: "smith_machine_rdl",
    name: "Smith Machine Romanian Deadlift",
    category: "legs",
    movementPattern: "hinge",
    equipment: "smith_machine",
    mechanics: "compound",
    description: "Fixed-bar hip hinge maximizing deep eccentric stretch on hamstrings and glutes.",
    muscles: [
      { muscleId: "hamstrings", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "gluteus", role: "PRIMARY", contributionFactor: 0.9 },
      { muscleId: "spinal_erectors", role: "SECONDARY", contributionFactor: 0.5 }
    ]
  },
  {
    id: "hack_squat_machine",
    name: "Hack Squat Machine",
    category: "legs",
    movementPattern: "squat",
    equipment: "machine",
    mechanics: "compound",
    description: "Angled back-supported sled squat providing pure quad overloading at deep knee flexion angles.",
    muscles: [
      { muscleId: "quadriceps", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "gluteus", role: "SECONDARY", contributionFactor: 0.6 },
      { muscleId: "adductors", role: "SECONDARY", contributionFactor: 0.4 }
    ],
    tips: ["Keep heels firmly planted on the platform; control the descent to full depth."]
  },
  {
    id: "seated_leg_curl_machine",
    name: "Seated Hamstring Leg Curl",
    category: "legs",
    movementPattern: "isolation",
    equipment: "machine",
    mechanics: "isolation",
    description: "Seated knee flexion training hamstrings at lengthened hip position for superior hypertrophy.",
    muscles: [
      { muscleId: "hamstrings", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "calves", role: "STABILIZER", contributionFactor: 0.2 }
    ],
    tips: ["Keep thighs firmly clamped down under the thigh pad to prevent hip lifting."]
  },
  {
    id: "machine_adductor",
    name: "Machine Hip Adductor (Inner Thigh)",
    category: "legs",
    movementPattern: "isolation",
    equipment: "machine",
    mechanics: "isolation",
    description: "Direct inner thigh adductor strengthening crucial for squat power and groin balance.",
    muscles: [
      { muscleId: "adductors", role: "PRIMARY", contributionFactor: 1 }
    ]
  },
  {
    id: "machine_abductor",
    name: "Machine Hip Abductor (Outer Glute)",
    category: "legs",
    movementPattern: "isolation",
    equipment: "machine",
    mechanics: "isolation",
    description: "Seated outer hip abduction firing the gluteus medius and minimus for hip stability and pelvic width.",
    muscles: [
      { muscleId: "gluteus", role: "PRIMARY", contributionFactor: 1 }
    ]
  },
  {
    id: "seated_calf_raise_machine",
    name: "Seated Calf Raise Machine",
    category: "legs",
    movementPattern: "isolation",
    equipment: "machine",
    mechanics: "isolation",
    description: "Bent-knee plantarflexion targeting the deep soleus muscle underneath the gastrocnemius.",
    muscles: [
      { muscleId: "calves", role: "PRIMARY", contributionFactor: 1 }
    ],
    tips: ["Pause for 2 full seconds at the bottom stretch before pushing through the balls of the feet."]
  },
  {
    id: "plate_loaded_iso_lat_row",
    name: "Plate-Loaded ISO-Lateral Row Machine",
    category: "back",
    movementPattern: "pull_horizontal",
    equipment: "machine",
    mechanics: "compound",
    description: "Independent arm horizontal pulling machine providing deep lat stretch and unilateral focus.",
    muscles: [
      { muscleId: "latissimus_dorsi", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "rhomboids", role: "SECONDARY", contributionFactor: 0.7 },
      { muscleId: "biceps", role: "SECONDARY", contributionFactor: 0.5 },
      { muscleId: "posterior_deltoid", role: "SECONDARY", contributionFactor: 0.4 }
    ]
  },
  {
    id: "assisted_pullup_dip_machine",
    name: "Assisted Pull-Up & Dip Machine",
    category: "back",
    movementPattern: "pull_vertical",
    equipment: "machine",
    mechanics: "compound",
    description: "Counter-balanced knee pad machine allowing strict high-rep vertical pulling and chest/tricep dipping.",
    muscles: [
      { muscleId: "latissimus_dorsi", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "biceps", role: "SECONDARY", contributionFactor: 0.6 },
      { muscleId: "rhomboids", role: "SECONDARY", contributionFactor: 0.4 }
    ]
  },
  {
    id: "machine_preacher_curl",
    name: "Machine Preacher Bicep Curl",
    category: "arms",
    movementPattern: "isolation",
    equipment: "machine",
    mechanics: "isolation",
    description: "Strict elbow-locked bicep curl eliminating momentum and maintaining resistance at peak lockout.",
    muscles: [
      { muscleId: "biceps", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "forearms", role: "SECONDARY", contributionFactor: 0.4 }
    ]
  },
  {
    id: "machine_triceps_dip_press",
    name: "Machine Triceps Dip Press",
    category: "arms",
    movementPattern: "push_vertical",
    equipment: "machine",
    mechanics: "compound",
    description: "Seated downward lever press directly engaging all three heads of the triceps with chest assist.",
    muscles: [
      { muscleId: "triceps", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "chest_lower", role: "SECONDARY", contributionFactor: 0.5 },
      { muscleId: "anterior_deltoid", role: "SECONDARY", contributionFactor: 0.4 }
    ]
  },
  {
    id: "machine_abdominal_crunch",
    name: "Seated Machine Abdominal Crunch",
    category: "core",
    movementPattern: "core",
    equipment: "machine",
    mechanics: "isolation",
    description: "Biomechanical seated spinal flexion machine with chest pad to progressively overload rectus abdominis.",
    muscles: [
      { muscleId: "rectus_abdominis", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "obliques", role: "SECONDARY", contributionFactor: 0.4 }
    ]
  },
  {
    id: "smith_machine_shrug",
    name: "Smith Machine Shrug",
    category: "back",
    movementPattern: "pull_vertical",
    equipment: "smith_machine",
    mechanics: "isolation",
    description: "Heavy vertical elevation of the clavicles along a locked vertical axis for upper trapezius thickness.",
    muscles: [
      { muscleId: "rhomboids", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "forearms", role: "STABILIZER", contributionFactor: 0.4 }
    ]
  },
  // EXPANDED SELECTION: SMITH MACHINE MASTER CLASS
  {
    id: "smith_machine_shoulder_press",
    name: "Smith Machine Overhead Shoulder Press",
    category: "shoulders",
    movementPattern: "push_vertical",
    equipment: "smith_machine",
    mechanics: "compound",
    description: "Fixed-track overhead barbell pressing providing supreme anterior and lateral deltoid mechanical tension without wasting energy on stabilization.",
    muscles: [
      { muscleId: "anterior_deltoid", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "lateral_deltoid", role: "PRIMARY", contributionFactor: 0.7 },
      { muscleId: "triceps", role: "SECONDARY", contributionFactor: 0.6 },
      { muscleId: "chest_upper", role: "SECONDARY", contributionFactor: 0.35 }
    ],
    tips: [
      "Position bench so bar descends smoothly just in front of your nose to upper chest.",
      "Maintain an upright posture and drive straight upward through the palms without flaring wrists."
    ]
  },
  {
    id: "smith_machine_flat_bench_press",
    name: "Smith Machine Flat Bench Press",
    category: "chest",
    movementPattern: "push_horizontal",
    equipment: "smith_machine",
    mechanics: "compound",
    description: "Fixed-plane horizontal press enabling aggressive overload to concentric failure on mid and lower sternal chest fibers.",
    muscles: [
      { muscleId: "chest_mid", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "chest_upper", role: "SECONDARY", contributionFactor: 0.4 },
      { muscleId: "chest_lower", role: "SECONDARY", contributionFactor: 0.4 },
      { muscleId: "anterior_deltoid", role: "SECONDARY", contributionFactor: 0.5 },
      { muscleId: "triceps", role: "SECONDARY", contributionFactor: 0.6 }
    ],
    tips: [
      "Touch the bar to lower-mid sternum with a 1-second controlled stretch."
    ]
  },
  {
    id: "smith_machine_decline_bench_press",
    name: "Smith Machine Decline Bench Press",
    category: "chest",
    movementPattern: "push_horizontal",
    equipment: "smith_machine",
    mechanics: "compound",
    description: "Decline-angled guided barbell press focusing mechanical tension on lower pectoralis major with reduced anterior shoulder strain.",
    muscles: [
      { muscleId: "chest_lower", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "chest_mid", role: "SECONDARY", contributionFactor: 0.5 },
      { muscleId: "triceps", role: "SECONDARY", contributionFactor: 0.6 },
      { muscleId: "anterior_deltoid", role: "SECONDARY", contributionFactor: 0.3 }
    ]
  },
  {
    id: "smith_machine_close_grip_bench_press",
    name: "Smith Machine Close-Grip Bench Press",
    category: "arms",
    movementPattern: "push_horizontal",
    equipment: "smith_machine",
    mechanics: "compound",
    description: "Shoulder-width grip guided pressing isolating the lateral and medial heads of the triceps while minimizing wrist shearing.",
    muscles: [
      { muscleId: "triceps", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "chest_mid", role: "SECONDARY", contributionFactor: 0.4 },
      { muscleId: "anterior_deltoid", role: "SECONDARY", contributionFactor: 0.4 }
    ],
    tips: [
      "Keep elbows tucked tight against your ribcage during the descent."
    ]
  },
  {
    id: "smith_machine_bent_over_row",
    name: "Smith Machine Bent-Over Row",
    category: "back",
    movementPattern: "pull_horizontal",
    equipment: "smith_machine",
    mechanics: "compound",
    description: "Guided horizontal pulling eliminating horizontal sway to lock isolation on lats, rhomboids, and mid-trapezius.",
    muscles: [
      { muscleId: "latissimus_dorsi", role: "PRIMARY", contributionFactor: 0.95 },
      { muscleId: "rhomboids", role: "PRIMARY", contributionFactor: 0.95 },
      { muscleId: "biceps", role: "SECONDARY", contributionFactor: 0.5 },
      { muscleId: "spinal_erectors", role: "SECONDARY", contributionFactor: 0.4 }
    ],
    tips: [
      "Hinge hips back at 45 degrees; pull bar smoothly towards lower abdomen."
    ]
  },
  {
    id: "smith_machine_hip_thrust",
    name: "Smith Machine Hip Thrust",
    category: "legs",
    movementPattern: "hinge",
    equipment: "smith_machine",
    mechanics: "compound",
    description: "Bench-supported pelvic thrust along a fixed track with effortless un-racking for maximum gluteus maximus contraction.",
    muscles: [
      { muscleId: "gluteus", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "hamstrings", role: "SECONDARY", contributionFactor: 0.5 },
      { muscleId: "adductors", role: "SECONDARY", contributionFactor: 0.3 }
    ],
    tips: [
      "Lock shins vertical at top of extension and hold peak contraction for 1 second."
    ]
  },
  {
    id: "smith_machine_bulgarian_split_squat",
    name: "Smith Machine Bulgarian Split Squat",
    category: "legs",
    movementPattern: "lunge",
    equipment: "smith_machine",
    mechanics: "compound",
    description: "Rear-foot elevated split squat with fixed-plane track stability eliminating balance hurdles to fully fatigue the front quad and glute.",
    muscles: [
      { muscleId: "quadriceps", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "gluteus", role: "PRIMARY", contributionFactor: 0.9 },
      { muscleId: "hamstrings", role: "SECONDARY", contributionFactor: 0.4 },
      { muscleId: "adductors", role: "SECONDARY", contributionFactor: 0.4 }
    ],
    tips: [
      "Place front foot forward so your shin stays perpendicular to floor at bottom depth."
    ]
  },
  {
    id: "smith_machine_standing_calf_raise",
    name: "Smith Machine Standing Calf Raise",
    category: "legs",
    movementPattern: "isolation",
    equipment: "smith_machine",
    mechanics: "isolation",
    description: "Heavy gastrocnemius plantarflexion with balls of feet elevated on a step or bumper plate for maximum calf stretch and contraction.",
    muscles: [
      { muscleId: "calves", role: "PRIMARY", contributionFactor: 1 }
    ],
    tips: [
      "Pause for 2 full seconds in the deep heel-drop stretch before pressing up onto toes."
    ]
  },
  {
    id: "smith_machine_behind_the_neck_press",
    name: "Smith Machine Behind-The-Neck Press",
    category: "shoulders",
    movementPattern: "push_vertical",
    equipment: "smith_machine",
    mechanics: "compound",
    description: "Vertical overhead press lowered behind the head along the fixed Smith track targeting the lateral and posterior deltoids.",
    muscles: [
      { muscleId: "lateral_deltoid", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "anterior_deltoid", role: "PRIMARY", contributionFactor: 0.8 },
      { muscleId: "rhomboids", role: "SECONDARY", contributionFactor: 0.5 },
      { muscleId: "triceps", role: "SECONDARY", contributionFactor: 0.5 }
    ],
    tips: [
      "Lower bar only to top of ear-line and maintain a smooth, controlled cadence."
    ]
  },
  {
    id: "smith_machine_upright_row",
    name: "Smith Machine Upright Row",
    category: "shoulders",
    movementPattern: "pull_vertical",
    equipment: "smith_machine",
    mechanics: "compound",
    description: "Guided vertical pulling motion targeting lateral deltoids and upper trapezius with stabilized bar path.",
    muscles: [
      { muscleId: "lateral_deltoid", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "rhomboids", role: "PRIMARY", contributionFactor: 0.85 },
      { muscleId: "biceps", role: "SECONDARY", contributionFactor: 0.4 },
      { muscleId: "forearms", role: "SECONDARY", contributionFactor: 0.3 }
    ],
    tips: [
      "Use a wide grip beyond shoulder width to optimize lateral deltoid activation."
    ]
  },
  // EXPANDED SELECTION: SHOULDERS, CHEST, BACK & ARMS HYPERTROPHY
  {
    id: "arnold_press",
    name: "Arnold Dumbbell Press",
    category: "shoulders",
    movementPattern: "push_vertical",
    equipment: "dumbbell",
    mechanics: "compound",
    description: "Rotational overhead dumbbell press hitting anterior, lateral, and stabilizing shoulder fibers through an expansive arc.",
    muscles: [
      { muscleId: "anterior_deltoid", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "lateral_deltoid", role: "PRIMARY", contributionFactor: 0.8 },
      { muscleId: "triceps", role: "SECONDARY", contributionFactor: 0.5 }
    ],
    tips: [
      "Rotate palms smoothly from facing chest at bottom to facing forward at overhead lockout."
    ]
  },
  {
    id: "cable_y_raise",
    name: "Cable Y-Raise (Scapular Plane)",
    category: "shoulders",
    movementPattern: "isolation",
    equipment: "cable",
    mechanics: "isolation",
    description: "Dual cable lateral elevation pulling in a 30-degree forward Y angle for optimal side delt alignment and lower trap synergy.",
    muscles: [
      { muscleId: "lateral_deltoid", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "rhomboids", role: "SECONDARY", contributionFactor: 0.5 }
    ],
    tips: [
      "Cross low cables and raise hands upward and outward in a wide Y shape."
    ]
  },
  {
    id: "dumbbell_front_raise",
    name: "Dumbbell Front Raise",
    category: "shoulders",
    movementPattern: "isolation",
    equipment: "dumbbell",
    mechanics: "isolation",
    description: "Isolated anterior deltoid flexion raising dumbbells to eye level with strict form.",
    muscles: [
      { muscleId: "anterior_deltoid", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "chest_upper", role: "SECONDARY", contributionFactor: 0.4 }
    ],
    tips: [
      "Avoid swinging or hip thrust; initiate pull strictly from the front deltoids."
    ]
  },
  {
    id: "cable_front_raise",
    name: "Cable Straight-Bar Front Raise",
    category: "shoulders",
    movementPattern: "isolation",
    equipment: "cable",
    mechanics: "isolation",
    description: "Continuous resistance anterior deltoid isolation maintaining uniform tension at the initial liftoff.",
    muscles: [
      { muscleId: "anterior_deltoid", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "chest_upper", role: "SECONDARY", contributionFactor: 0.35 }
    ]
  },
  {
    id: "single_arm_cable_lateral_raise",
    name: "Behind-The-Back Single-Arm Cable Lateral Raise",
    category: "shoulders",
    movementPattern: "isolation",
    equipment: "cable",
    mechanics: "isolation",
    description: "Cable side raise routed behind the hips providing maximum stretch on the lateral deltoid head at the bottom.",
    muscles: [
      { muscleId: "lateral_deltoid", role: "PRIMARY", contributionFactor: 1 }
    ],
    tips: [
      "Set pulley around wrist or hip height; pull up and slightly outward."
    ]
  },
  {
    id: "seated_bent_over_dumbbell_rear_delt_raise",
    name: "Seated Bent-Over Dumbbell Rear Delt Raise",
    category: "shoulders",
    movementPattern: "isolation",
    equipment: "dumbbell",
    mechanics: "isolation",
    description: "Seated horizontal abduction targeting the posterior deltoid head with torso rested against thighs.",
    muscles: [
      { muscleId: "posterior_deltoid", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "rhomboids", role: "SECONDARY", contributionFactor: 0.5 }
    ]
  },
  {
    id: "landmine_single_arm_press",
    name: "Landmine Single-Arm Shoulder Press",
    category: "shoulders",
    movementPattern: "push_vertical",
    equipment: "barbell",
    mechanics: "compound",
    description: "Natural arc pressing using a landmine barbell sleeve, extremely friendly for rotator cuff and clavicular joints.",
    muscles: [
      { muscleId: "anterior_deltoid", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "chest_upper", role: "SECONDARY", contributionFactor: 0.5 },
      { muscleId: "triceps", role: "SECONDARY", contributionFactor: 0.5 }
    ]
  },
  {
    id: "single_arm_dumbbell_row",
    name: "Single-Arm Dumbbell Row",
    category: "back",
    movementPattern: "pull_horizontal",
    equipment: "dumbbell",
    mechanics: "compound",
    description: "Unilateral bench-supported heavy dumbbell row providing full lat stretch at bottom and strong lat/rhomboid contraction at top.",
    muscles: [
      { muscleId: "latissimus_dorsi", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "rhomboids", role: "PRIMARY", contributionFactor: 0.85 },
      { muscleId: "biceps", role: "SECONDARY", contributionFactor: 0.5 },
      { muscleId: "forearms", role: "SECONDARY", contributionFactor: 0.4 }
    ],
    tips: [
      "Drive your elbow back towards your hip pocket to load lats rather than bicep."
    ]
  },
  {
    id: "cable_straight_arm_pulldown",
    name: "Cable Straight-Arm Lat Pulldown",
    category: "back",
    movementPattern: "pull_vertical",
    equipment: "cable",
    mechanics: "isolation",
    description: "Pure shoulder extension exercise isolating the latissimus dorsi and back musculature without bicep fatigue.",
    muscles: [
      { muscleId: "latissimus_dorsi", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "rhomboids", role: "SECONDARY", contributionFactor: 0.4 },
      { muscleId: "triceps", role: "SECONDARY", contributionFactor: 0.3 }
    ],
    tips: [
      "Maintain a slight forward torso lean and pull bar in a wide arc down to mid-thighs."
    ]
  },
  {
    id: "chest_supported_t_bar_row",
    name: "Chest-Supported T-Bar Row",
    category: "back",
    movementPattern: "pull_horizontal",
    equipment: "machine",
    mechanics: "compound",
    description: "Heavy mid-back rowing with chest firmly braced against pad to completely eliminate lower back fatigue and momentum.",
    muscles: [
      { muscleId: "rhomboids", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "latissimus_dorsi", role: "PRIMARY", contributionFactor: 0.9 },
      { muscleId: "biceps", role: "SECONDARY", contributionFactor: 0.5 }
    ]
  },
  {
    id: "incline_dumbbell_fly",
    name: "Incline Dumbbell Chest Fly",
    category: "chest",
    movementPattern: "isolation",
    equipment: "dumbbell",
    mechanics: "isolation",
    description: "Deep adduction and eccentric stretch for upper clavicular pectoralis major.",
    muscles: [
      { muscleId: "chest_upper", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "chest_mid", role: "SECONDARY", contributionFactor: 0.4 },
      { muscleId: "anterior_deltoid", role: "SECONDARY", contributionFactor: 0.4 }
    ]
  },
  {
    id: "cable_bayesian_bicep_curl",
    name: "Bayesian Curl",
    category: "arms",
    movementPattern: "isolation",
    equipment: "cable",
    mechanics: "isolation",
    description: "Facing away from the low pulley to keep the shoulder in hyperextension, producing extreme long-head bicep stretch tension. Compatible with all handle attachments (single D-handles, dual handles, straight bar, or rope).",
    muscles: [
      { muscleId: "biceps", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "forearms", role: "SECONDARY", contributionFactor: 0.3 }
    ],
    tips: [
      "Take 1-2 steps forward from the stack, let arms be pulled back behind torso before curling.",
      "Works with all handles: single D-handles, dual cables, straight bar, or rope attachments."
    ]
  },
  {
    id: "preacher_curl_ez_bar",
    name: "EZ-Bar Preacher Curl",
    category: "arms",
    movementPattern: "isolation",
    equipment: "barbell",
    mechanics: "isolation",
    description: "Arm-anchored bicep curl on preacher bench placing maximal tension at the lengthened bottom position and short head.",
    muscles: [
      { muscleId: "biceps", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "forearms", role: "SECONDARY", contributionFactor: 0.4 }
    ]
  },
  {
    id: "dumbbell_concentration_curl",
    name: "Dumbbell Concentration Curl",
    category: "arms",
    movementPattern: "isolation",
    equipment: "dumbbell",
    mechanics: "isolation",
    description: "Seated single-arm curl with elbow braced against inner thigh for absolute isolation of the bicep peak.",
    muscles: [
      { muscleId: "biceps", role: "PRIMARY", contributionFactor: 1 }
    ]
  },
  {
    id: "seated_dumbbell_hammer_curl",
    name: "Seated Incline Dumbbell Hammer Curl",
    category: "arms",
    movementPattern: "isolation",
    equipment: "dumbbell",
    mechanics: "isolation",
    description: "Neutral-grip bicep curling on an incline targeting the brachialis and brachioradialis for arm thickness.",
    muscles: [
      { muscleId: "biceps", role: "PRIMARY", contributionFactor: 0.9 },
      { muscleId: "forearms", role: "PRIMARY", contributionFactor: 0.8 }
    ]
  },
  {
    id: "cable_overhead_rope_tricep_extension",
    name: "Cable Overhead Rope Triceps Extension",
    category: "arms",
    movementPattern: "isolation",
    equipment: "cable",
    mechanics: "isolation",
    description: "Overhead cable extension placing the long head of the triceps under deep stretch throughout.",
    muscles: [
      { muscleId: "triceps", role: "PRIMARY", contributionFactor: 1 }
    ],
    tips: [
      "Flare rope ends apart at full overhead lockout for peak contraction."
    ]
  },
  {
    id: "barbell_hip_thrust",
    name: "Barbell Hip Thrust",
    category: "legs",
    movementPattern: "hinge",
    equipment: "barbell",
    mechanics: "compound",
    description: "The golden standard glute hypertrophy compound exercise loading maximum barbell weight at full hip extension.",
    muscles: [
      { muscleId: "gluteus", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "hamstrings", role: "SECONDARY", contributionFactor: 0.5 },
      { muscleId: "adductors", role: "SECONDARY", contributionFactor: 0.3 }
    ]
  },
  {
    id: "dumbbell_bulgarian_split_squat",
    name: "Dumbbell Bulgarian Split Squat",
    category: "legs",
    movementPattern: "lunge",
    equipment: "dumbbell",
    mechanics: "compound",
    description: "Unilateral rear-foot elevated split squat with dumbbells held at sides for pure leg strength, balance, and hypertrophy.",
    muscles: [
      { muscleId: "quadriceps", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "gluteus", role: "PRIMARY", contributionFactor: 0.9 },
      { muscleId: "hamstrings", role: "SECONDARY", contributionFactor: 0.4 },
      { muscleId: "adductors", role: "SECONDARY", contributionFactor: 0.4 }
    ]
  },
  {
    id: "tricep_curl_dips_machine",
    name: "Tricep Curl (Dips Machine)",
    category: "arms",
    movementPattern: "push_vertical",
    equipment: "machine",
    mechanics: "compound",
    description: "Seated machine dip press (also referred to as tricep dip curl machine) where dual handles are driven downward with lap belt or thigh restraint to heavily load the triceps while minimizing shoulder strain.",
    muscles: [
      { muscleId: "triceps", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "chest_lower", role: "SECONDARY", contributionFactor: 0.4 },
      { muscleId: "chest_mid", role: "SECONDARY", contributionFactor: 0.3 },
      { muscleId: "anterior_deltoid", role: "SECONDARY", contributionFactor: 0.4 }
    ],
    tips: [
      "Fasten the lap belt or adjust the thigh pad securely so your body stays anchored to the seat.",
      "Tuck elbows in close to the torso to channel maximal force through the triceps rather than pecs.",
      "Descend with smooth control to approximately 90 degrees before driving down into lockout."
    ]
  },
  {
    id: "chest_supported_seated_back_row",
    name: "Chest-Supported Seated Back Row",
    category: "back",
    movementPattern: "pull_horizontal",
    equipment: "machine",
    mechanics: "compound",
    description: "Horizontal seated back row with chest pinned firmly against an angled support pad, eliminating spinal loading and lower back fatigue for pure lat, rhomboid, rear delt, and mid-trap hypertrophy.",
    muscles: [
      { muscleId: "rhomboids", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "latissimus_dorsi", role: "PRIMARY", contributionFactor: 0.95 },
      { muscleId: "posterior_deltoid", role: "SECONDARY", contributionFactor: 0.7 },
      { muscleId: "biceps", role: "SECONDARY", contributionFactor: 0.5 },
      { muscleId: "forearms", role: "SECONDARY", contributionFactor: 0.3 }
    ],
    tips: [
      "Adjust seat and chest pad height so the handles align directly with your mid-torso.",
      "Pull through your elbows rather than wrists, feeling the full contraction across your lats and mid-back.",
      "Keep chest glued against the pad throughout the negative stretch without arching away."
    ]
  },
  {
    id: "back_supported_cable_tricep_pushdown",
    name: "Back-Supported Cable Tricep Pushdown",
    category: "arms",
    movementPattern: "isolation",
    equipment: "cable",
    mechanics: "isolation",
    description: "Ultra-stable tricep pushdown executed with back braced against an incline bench or vertical pad, completely neutralizing body sway and shoulder momentum for hyper-pure triceps tension.",
    muscles: [
      { muscleId: "triceps", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "forearms", role: "SECONDARY", contributionFactor: 0.2 }
    ],
    tips: [
      "Set an incline bench or vertical pad directly behind you to brace your spine and hips rigidly.",
      "Pin upper arms tight to your ribs and extend elbows fully to contract all three triceps heads.",
      "Hold the bottom squeeze for a full second before controlling the negative back to 90 degrees."
    ]
  },
  {
    id: "seated_machine_tricep_curl",
    name: "Seated Machine Tricep Curl (Extension)",
    category: "arms",
    movementPattern: "isolation",
    equipment: "machine",
    mechanics: "isolation",
    description: "Arm-supported selectorized tricep curl/extension machine with angled elbow pads, locking the humerus in place to isolate the lateral and medial heads through full extension.",
    muscles: [
      { muscleId: "triceps", role: "PRIMARY", contributionFactor: 1 }
    ],
    tips: [
      "Line up your elbow joint with the machine rotational pivot cam.",
      "Keep your upper arms flat against the pad and squeeze triceps hard at peak contraction."
    ]
  },
  {
    id: "assisted_dip_machine",
    name: "Assisted Dip Machine (Dips)",
    category: "arms",
    movementPattern: "push_vertical",
    equipment: "machine",
    mechanics: "compound",
    description: "Counterbalanced knee/foot pad machine providing selectable weight assistance to execute strict parallel bar dips, heavily overloading triceps, lower pectorals, and anterior delts.",
    muscles: [
      { muscleId: "triceps", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "chest_lower", role: "PRIMARY", contributionFactor: 0.8 },
      { muscleId: "anterior_deltoid", role: "SECONDARY", contributionFactor: 0.5 },
      { muscleId: "chest_mid", role: "SECONDARY", contributionFactor: 0.4 }
    ],
    tips: [
      "Choose counterweight to offset bodyweight and maintain full range of motion.",
      "To prioritize triceps, keep torso upright with elbows tracking close to your sides.",
      "To engage more lower chest, lean forward slightly at a 15-30 degree angle."
    ]
  },
  {
    id: "assisted_pullup_machine",
    name: "Assisted Pull-Up Machine (Pull-Ups)",
    category: "back",
    movementPattern: "pull_vertical",
    equipment: "machine",
    mechanics: "compound",
    description: "Counterbalanced machine providing adjustable weight assistance to perform full-range vertical pull-ups and chin-ups, building lat width and upper-body pulling strength.",
    muscles: [
      { muscleId: "latissimus_dorsi", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "biceps", role: "PRIMARY", contributionFactor: 0.7 },
      { muscleId: "rhomboids", role: "SECONDARY", contributionFactor: 0.5 },
      { muscleId: "forearms", role: "SECONDARY", contributionFactor: 0.4 }
    ],
    tips: [
      "Set counterweight to enable a full hang at the bottom without resting.",
      "Initiate the pull by depressing scapulae downward before bending the elbows.",
      "Pull until chin clears the bar or upper chest approaches the handles."
    ]
  },
  {
    id: "tricep_focused_dips",
    name: "Tricep Focused Dips",
    category: "arms",
    movementPattern: "push_vertical",
    equipment: "bodyweight",
    mechanics: "compound",
    description: "Parallel bar dips performed with an upright, vertical torso and elbows tucked close to the ribs, isolating the lateral, medial, and long heads of the triceps while minimizing chest contribution. Calisthenic bodyweight movement.",
    muscles: [
      { muscleId: "triceps", role: "PRIMARY", contributionFactor: 1 },
      { muscleId: "anterior_deltoid", role: "SECONDARY", contributionFactor: 0.5 },
      { muscleId: "chest_lower", role: "SECONDARY", contributionFactor: 0.3 }
    ],
    tips: [
      "Keep your torso completely vertical and avoid forward torso lean to bias triceps.",
      "Keep elbows pinned close to your body rather than flaring wide.",
      "Lower until upper arms are parallel to the floor, then forcefully press back up to full lockout."
    ]
  }
];
var EXERCISES_MAP = EXERCISE_DATABASE.reduce(
  (acc, ex) => {
    acc[ex.id] = ex;
    return acc;
  },
  {}
);
if (EXERCISES_MAP["triceps_rope_pushdown"]) {
  EXERCISES_MAP["triceps_pushdown"] = EXERCISES_MAP["triceps_rope_pushdown"];
  EXERCISES_MAP["cable_triceps_pushdown"] = EXERCISES_MAP["triceps_rope_pushdown"];
}
if (EXERCISES_MAP["cable_bayesian_bicep_curl"]) {
  EXERCISES_MAP["bayesian_curl"] = EXERCISES_MAP["cable_bayesian_bicep_curl"];
  EXERCISES_MAP["bayesian_bicep_curl"] = EXERCISES_MAP["cable_bayesian_bicep_curl"];
}
if (EXERCISES_MAP["assisted_dip_machine"]) {
  EXERCISES_MAP["assisted_dips"] = EXERCISES_MAP["assisted_dip_machine"];
  EXERCISES_MAP["assisted_dip"] = EXERCISES_MAP["assisted_dip_machine"];
}
if (EXERCISES_MAP["assisted_pullup_machine"]) {
  EXERCISES_MAP["assisted_pullups"] = EXERCISES_MAP["assisted_pullup_machine"];
  EXERCISES_MAP["assisted_pullup"] = EXERCISES_MAP["assisted_pullup_machine"];
}
if (EXERCISES_MAP["tricep_focused_dips"]) {
  EXERCISES_MAP["bodyweight_tricep_dips"] = EXERCISES_MAP["tricep_focused_dips"];
  EXERCISES_MAP["bodyweight_dip_triceps"] = EXERCISES_MAP["tricep_focused_dips"];
  EXERCISES_MAP["tricep_dips"] = EXERCISES_MAP["tricep_focused_dips"];
  EXERCISES_MAP["parallel_bar_dips_tricep"] = EXERCISES_MAP["tricep_focused_dips"];
}
if (EXERCISES_MAP["ez_bar_reverse_curl"]) {
  EXERCISES_MAP["reverse_curl"] = EXERCISES_MAP["ez_bar_reverse_curl"];
  EXERCISES_MAP["ez_bar_reverse_curls"] = EXERCISES_MAP["ez_bar_reverse_curl"];
  EXERCISES_MAP["reverse_curls"] = EXERCISES_MAP["ez_bar_reverse_curl"];
  EXERCISES_MAP["reverse_barbell_curl"] = EXERCISES_MAP["ez_bar_reverse_curl"];
  EXERCISES_MAP["reverse_ez_bar_curl"] = EXERCISES_MAP["ez_bar_reverse_curl"];
}
function isBodyweightExercise(exerciseId, exerciseName, equipment) {
  const def = EXERCISES_MAP[exerciseId];
  const eq = equipment || def?.equipment;
  if (eq && ["barbell", "dumbbell", "kettlebell", "cable", "smith_machine"].includes(eq)) {
    return false;
  }
  if (eq === "bodyweight") return true;
  const id = (exerciseId || "").toLowerCase();
  const name = (exerciseName || (def ? def.name : "")).toLowerCase();
  if (id.includes("machine_triceps_dip") || id.includes("tricep_curl_dips_machine") || id.includes("smith_machine") || name.includes("barbell") || name.includes("dumbbell") || name.includes("cable") || name.includes("smith machine")) {
    return false;
  }
  if (id.includes("assisted_pullup") || id.includes("assisted_dip") || name.includes("assisted dip") || name.includes("assisted pull")) {
    return true;
  }
  return id.includes("pull_up") || id.includes("pullup") || id.includes("chin_up") || id.includes("chinup") || id.includes("chest_dips") || id.includes("tricep_dips") || id.includes("tricep_focused_dips") || id.includes("bodyweight_tricep_dips") || id.includes("parallel_bar_dip") || id.includes("pushup") || id.includes("push_up") || id.includes("hanging_leg") || id.includes("inverted_row") || id.includes("hyperextension") || name.includes("pull-up") || name.includes("pull up") || name.includes("chin-up") || name.includes("chin up") || name.includes("parallel bar dip") || name.includes("bodyweight dip") || name.includes("tricep focused dip") || name.includes("tricep focused dips") || name.includes("tricep dip") || name.includes("triceps dip") || name.includes("push-up") || name.includes("push up") || name.includes("hanging leg") || name.includes("inverted row");
}

// src/lib/seedData.ts
var DEFAULT_USER_PROFILE = {
  id: "user_default",
  name: "Alex Vance",
  experienceLevel: "intermediate",
  primaryGoal: "hypertrophy",
  trainingDaysPerWeek: 4,
  preferredDurationMinutes: 60,
  availableEquipment: ["barbell", "dumbbell", "cable", "machine", "bodyweight"],
  preferredUnit: "kg",
  targetFocusAreas: ["latissimus_dorsi", "chest_upper", "chest_mid", "hamstrings"],
  notes: "Focusing on double progression and bringing up posterior chain."
};
var WORKOUT_TEMPLATES = [
  {
    id: "template_push_hypertrophy",
    name: "Upper Push (Chest, Delts & Triceps)",
    description: "Hypertrophy-focused pressing session targeting clavicular chest, lateral shoulders, and triceps lockout.",
    category: "Hypertrophy",
    estimatedMinutes: 55,
    exercises: [
      {
        exerciseId: "barbell_bench_press",
        exerciseName: "Barbell Bench Press",
        sets: 3,
        repMin: 6,
        repMax: 8,
        restSeconds: 150,
        notes: "Control eccentric to lower sternum."
      },
      {
        exerciseId: "incline_dumbbell_press",
        exerciseName: "Incline Dumbbell Bench Press",
        sets: 3,
        repMin: 8,
        repMax: 10,
        restSeconds: 120
      },
      {
        exerciseId: "dumbbell_lateral_raise",
        exerciseName: "Dumbbell Lateral Raise",
        sets: 4,
        repMin: 12,
        repMax: 15,
        restSeconds: 75
      },
      {
        exerciseId: "triceps_rope_pushdown",
        exerciseName: "Cable Triceps Pushdown",
        sets: 3,
        repMin: 10,
        repMax: 12,
        restSeconds: 90
      }
    ]
  },
  {
    id: "template_pull_posterior",
    name: "Upper Pull & Rear Delts",
    description: "Complete back width and thickness workout with bicep and posterior shoulder integration.",
    category: "Hypertrophy",
    estimatedMinutes: 50,
    exercises: [
      {
        exerciseId: "barbell_bent_over_row",
        exerciseName: "Barbell Bent-Over Row",
        sets: 3,
        repMin: 6,
        repMax: 8,
        restSeconds: 150
      },
      {
        exerciseId: "lat_pulldown",
        exerciseName: "Lat Pulldown (Wide/Neutral Grip)",
        sets: 3,
        repMin: 8,
        repMax: 10,
        restSeconds: 120
      },
      {
        exerciseId: "face_pulls",
        exerciseName: "Cable Face Pull",
        sets: 3,
        repMin: 12,
        repMax: 15,
        restSeconds: 75
      },
      {
        exerciseId: "barbell_bicep_curl",
        exerciseName: "Barbell Bicep Curl",
        sets: 3,
        repMin: 8,
        repMax: 10,
        restSeconds: 90
      }
    ]
  },
  {
    id: "template_legs_power",
    name: "Lower Body Strength & Quads",
    description: "Heavy compound squatting supplemented by hamstring hinging and calf isolation.",
    category: "Strength",
    estimatedMinutes: 60,
    exercises: [
      {
        exerciseId: "barbell_back_squat",
        exerciseName: "Barbell Back Squat",
        sets: 4,
        repMin: 5,
        repMax: 6,
        restSeconds: 180
      },
      {
        exerciseId: "romanian_deadlift",
        exerciseName: "Romanian Deadlift (RDL)",
        sets: 3,
        repMin: 8,
        repMax: 10,
        restSeconds: 150
      },
      {
        exerciseId: "leg_extension",
        exerciseName: "Seated Leg Extension",
        sets: 3,
        repMin: 12,
        repMax: 15,
        restSeconds: 90
      },
      {
        exerciseId: "standing_calf_raise",
        exerciseName: "Standing Calf Raise",
        sets: 4,
        repMin: 12,
        repMax: 15,
        restSeconds: 60
      }
    ]
  },
  {
    id: "template_full_body_power",
    name: "Full Body Compound Foundations",
    description: "High-efficiency total body session cycling major compound movement patterns.",
    category: "Athletic",
    estimatedMinutes: 55,
    exercises: [
      {
        exerciseId: "barbell_back_squat",
        exerciseName: "Barbell Back Squat",
        sets: 3,
        repMin: 6,
        repMax: 8,
        restSeconds: 150
      },
      {
        exerciseId: "barbell_bench_press",
        exerciseName: "Barbell Bench Press",
        sets: 3,
        repMin: 6,
        repMax: 8,
        restSeconds: 150
      },
      {
        exerciseId: "chest_supported_row",
        exerciseName: "Chest-Supported T-Bar / Dumbbell Row",
        sets: 3,
        repMin: 8,
        repMax: 10,
        restSeconds: 120
      },
      {
        exerciseId: "overhead_barbell_press",
        exerciseName: "Overhead Barbell Press (OHP)",
        sets: 3,
        repMin: 8,
        repMax: 8,
        restSeconds: 120
      }
    ]
  }
];
function getSeedWorkouts() {
  return [
    {
      id: "workout_gym_test_1789483620040",
      name: "Leg Day & Squat Progression",
      startedAt: "2026-09-15T13:45:00.000Z",
      completedAt: "2026-09-15T14:47:00.040Z",
      durationSeconds: 3720,
      notes: "Heavy back squat session with explosive ascent and deep range of motion.",
      totalVolumeKg: 800,
      totalSets: 1,
      musclesTrained: ["quadriceps", "gluteus"],
      rpeAverage: 8.5,
      exercises: [
        {
          id: "ex_squat_1",
          exerciseId: "barbell_squat",
          exerciseName: "Barbell Back Squat",
          notes: "Top working set at 100kg x 8 reps",
          sets: [
            { id: "sq_1", setNumber: 1, type: "normal", weightKg: 100, reps: 8, completed: true, rpe: 8.5 }
          ]
        }
      ]
    },
    {
      id: "workout_1788937113526_889u4",
      name: "Heavy Push & Chest Focus",
      startedAt: "2026-09-08T22:15:00.000Z",
      completedAt: "2026-09-08T23:25:00.000Z",
      durationSeconds: 4200,
      notes: "Felt strong on flat bench, locked out 100kg for 10 clean reps.",
      totalVolumeKg: 4870,
      totalSets: 12,
      musclesTrained: ["chest_mid", "chest_upper", "triceps", "anterior_deltoid", "lateral_deltoid"],
      rpeAverage: 8.5,
      exercises: [
        {
          id: "ex_push_1",
          exerciseId: "barbell_bench_press",
          exerciseName: "Barbell Bench Press",
          notes: "Top working set at 100kg x 10 reps",
          sets: [
            { id: "s1_1", setNumber: 1, type: "normal", weightKg: 80, reps: 12, completed: true, rpe: 7.5 },
            { id: "s1_2", setNumber: 2, type: "normal", weightKg: 90, reps: 10, completed: true, rpe: 8 },
            { id: "s1_3", setNumber: 3, type: "normal", weightKg: 100, reps: 10, completed: true, rpe: 9 }
          ]
        },
        {
          id: "ex_push_2",
          exerciseId: "incline_dumbbell_press",
          exerciseName: "Incline Dumbbell Bench Press",
          sets: [
            { id: "s2_1", setNumber: 1, type: "normal", weightKg: 28, reps: 10, completed: true, rpe: 8 },
            { id: "s2_2", setNumber: 2, type: "normal", weightKg: 30, reps: 10, completed: true, rpe: 8.5 },
            { id: "s2_3", setNumber: 3, type: "normal", weightKg: 32, reps: 8, completed: true, rpe: 9 }
          ]
        },
        {
          id: "ex_push_3",
          exerciseId: "dumbbell_lateral_raise",
          exerciseName: "Dumbbell Lateral Raise",
          sets: [
            { id: "s3_1", setNumber: 1, type: "normal", weightKg: 12.5, reps: 15, completed: true, rpe: 8 },
            { id: "s3_2", setNumber: 2, type: "normal", weightKg: 12.5, reps: 14, completed: true, rpe: 8.5 },
            { id: "s3_3", setNumber: 3, type: "normal", weightKg: 15, reps: 12, completed: true, rpe: 9 }
          ]
        },
        {
          id: "ex_push_4",
          exerciseId: "triceps_rope_pushdown",
          exerciseName: "Cable Triceps Pushdown",
          sets: [
            { id: "s4_1", setNumber: 1, type: "normal", weightKg: 27.5, reps: 12, completed: true, rpe: 8 },
            { id: "s4_2", setNumber: 2, type: "normal", weightKg: 30, reps: 10, completed: true, rpe: 8.5 },
            { id: "s4_3", setNumber: 3, type: "normal", weightKg: 32.5, reps: 10, completed: true, rpe: 9 }
          ]
        }
      ]
    },
    {
      id: "workout_1788937004112_771b2",
      name: "Lat Width & Back Hypertrophy",
      startedAt: "2026-09-07T20:30:00.000Z",
      completedAt: "2026-09-07T21:40:00.000Z",
      durationSeconds: 4200,
      notes: "Great lat stretch and controlled rowing eccentric.",
      totalVolumeKg: 4620,
      totalSets: 12,
      musclesTrained: ["latissimus_dorsi", "rhomboids", "posterior_deltoid", "biceps"],
      rpeAverage: 8.2,
      exercises: [
        {
          id: "ex_pull_1",
          exerciseId: "barbell_bent_over_row",
          exerciseName: "Barbell Bent-Over Row",
          sets: [
            { id: "p1_1", setNumber: 1, type: "normal", weightKg: 70, reps: 10, completed: true, rpe: 7.5 },
            { id: "p1_2", setNumber: 2, type: "normal", weightKg: 75, reps: 8, completed: true, rpe: 8 },
            { id: "p1_3", setNumber: 3, type: "normal", weightKg: 80, reps: 8, completed: true, rpe: 8.5 }
          ]
        },
        {
          id: "ex_pull_2",
          exerciseId: "lat_pulldown",
          exerciseName: "Lat Pulldown (Wide/Neutral Grip)",
          sets: [
            { id: "p2_1", setNumber: 1, type: "normal", weightKg: 65, reps: 10, completed: true, rpe: 7.5 },
            { id: "p2_2", setNumber: 2, type: "normal", weightKg: 70, reps: 10, completed: true, rpe: 8 },
            { id: "p2_3", setNumber: 3, type: "normal", weightKg: 75, reps: 8, completed: true, rpe: 8.5 }
          ]
        },
        {
          id: "ex_pull_3",
          exerciseId: "face_pulls",
          exerciseName: "Cable Face Pull",
          sets: [
            { id: "p3_1", setNumber: 1, type: "normal", weightKg: 22.5, reps: 15, completed: true, rpe: 8 },
            { id: "p3_2", setNumber: 2, type: "normal", weightKg: 25, reps: 15, completed: true, rpe: 8 },
            { id: "p3_3", setNumber: 3, type: "normal", weightKg: 25, reps: 12, completed: true, rpe: 8.5 }
          ]
        },
        {
          id: "ex_pull_4",
          exerciseId: "barbell_bicep_curl",
          exerciseName: "Barbell Bicep Curl",
          sets: [
            { id: "p4_1", setNumber: 1, type: "normal", weightKg: 30, reps: 10, completed: true, rpe: 8 },
            { id: "p4_2", setNumber: 2, type: "normal", weightKg: 32.5, reps: 10, completed: true, rpe: 8.5 },
            { id: "p4_3", setNumber: 3, type: "normal", weightKg: 35, reps: 8, completed: true, rpe: 9 }
          ]
        }
      ]
    }
  ];
}
function getGuestShowcaseWorkouts(refDate = /* @__PURE__ */ new Date()) {
  const now = refDate.getTime();
  const dayMs = 24 * 60 * 60 * 1e3;
  return [
    // 1. Session 1: Yesterday (~1.0 day ago) - Heavy Incline Chest & Front Deltoid Push (RED - High Recent Exposure)
    {
      id: "alex_showcase_push_yesterday",
      name: "Heavy Upper Chest & Deltoid Power",
      startedAt: new Date(now - 1 * dayMs - 372e4).toISOString(),
      completedAt: new Date(now - 1 * dayMs).toISOString(),
      durationSeconds: 3720,
      notes: "Clean locks on incline dumbbells and heavy flat barbell press. Pectorals and anterior delts fully stimulated.",
      totalVolumeKg: 4280,
      totalSets: 9,
      musclesTrained: ["chest_upper", "chest_mid", "anterior_deltoid", "lateral_deltoid"],
      rpeAverage: 8.5,
      exercises: [
        {
          id: "alex_ex_1",
          exerciseId: "incline_dumbbell_press",
          exerciseName: "Incline Dumbbell Bench Press",
          notes: "Strong clavicular stretch with 36kg bells",
          sets: [
            { id: "as1", setNumber: 1, type: "normal", weightKg: 34, reps: 10, completed: true, rpe: 8 },
            { id: "as2", setNumber: 2, type: "normal", weightKg: 36, reps: 8, completed: true, rpe: 8.5 },
            { id: "as3", setNumber: 3, type: "normal", weightKg: 36, reps: 8, completed: true, rpe: 9 }
          ]
        },
        {
          id: "alex_ex_2",
          exerciseId: "barbell_bench_press",
          exerciseName: "Barbell Bench Press (Flat)",
          notes: "Top working sets at 100kg",
          sets: [
            { id: "as4", setNumber: 1, type: "normal", weightKg: 100, reps: 8, completed: true, rpe: 8.5 },
            { id: "as5", setNumber: 2, type: "normal", weightKg: 100, reps: 8, completed: true, rpe: 9 },
            { id: "as6", setNumber: 3, type: "normal", weightKg: 95, reps: 10, completed: true, rpe: 8.5 }
          ]
        },
        {
          id: "alex_ex_3",
          exerciseId: "dumbbell_lateral_raise",
          exerciseName: "Dumbbell Lateral Raise",
          notes: "Strict lateral abduction targeting side delts",
          sets: [
            { id: "as7", setNumber: 1, type: "normal", weightKg: 15, reps: 15, completed: true, rpe: 8 },
            { id: "as8", setNumber: 2, type: "normal", weightKg: 15, reps: 14, completed: true, rpe: 8.5 },
            { id: "as9", setNumber: 3, type: "normal", weightKg: 17.5, reps: 12, completed: true, rpe: 9 }
          ]
        }
      ]
    },
    // 2. Session 2: 2 days ago (~2.1 days ago) - Lat Width & Pull Hypertrophy (ORANGE - Recently Trained)
    {
      id: "alex_showcase_pull_2d",
      name: "Lat Hypertrophy & Posterior Chain",
      startedAt: new Date(now - 2.1 * dayMs - 42e5).toISOString(),
      completedAt: new Date(now - 2.1 * dayMs).toISOString(),
      durationSeconds: 4200,
      notes: "Excellent lat contraction and heavy seated cable rows. Great bicep and rear delt accessory pump.",
      totalVolumeKg: 4620,
      totalSets: 11,
      musclesTrained: ["latissimus_dorsi", "rhomboids", "posterior_deltoid", "biceps"],
      rpeAverage: 8.4,
      exercises: [
        {
          id: "alex_ex_4",
          exerciseId: "lat_pulldown",
          exerciseName: "Lat Pulldown",
          notes: "Wide grip pulling smoothly to clavicle",
          sets: [
            { id: "as10", setNumber: 1, type: "normal", weightKg: 80, reps: 10, completed: true, rpe: 8 },
            { id: "as11", setNumber: 2, type: "normal", weightKg: 85, reps: 8, completed: true, rpe: 8.5 },
            { id: "as12", setNumber: 3, type: "normal", weightKg: 75, reps: 12, completed: true, rpe: 8 }
          ]
        },
        {
          id: "alex_ex_5",
          exerciseId: "seated_cable_row",
          exerciseName: "Seated Cable Row",
          notes: "Full scapular retraction and mid-back squeeze",
          sets: [
            { id: "as13", setNumber: 1, type: "normal", weightKg: 75, reps: 10, completed: true, rpe: 8 },
            { id: "as14", setNumber: 2, type: "normal", weightKg: 80, reps: 8, completed: true, rpe: 8.5 },
            { id: "as15", setNumber: 3, type: "normal", weightKg: 80, reps: 8, completed: true, rpe: 9 }
          ]
        },
        {
          id: "alex_ex_6",
          exerciseId: "face_pulls",
          exerciseName: "Face Pulls",
          notes: "High cable pull for rear delts and lower traps",
          sets: [
            { id: "as16", setNumber: 1, type: "normal", weightKg: 35, reps: 15, completed: true, rpe: 7.5 },
            { id: "as17", setNumber: 2, type: "normal", weightKg: 40, reps: 12, completed: true, rpe: 8 }
          ]
        },
        {
          id: "alex_ex_7",
          exerciseId: "incline_dumbbell_curl",
          exerciseName: "Incline Dumbbell Curl",
          notes: "Deep long-head bicep stretch",
          sets: [
            { id: "as18", setNumber: 1, type: "normal", weightKg: 16, reps: 10, completed: true, rpe: 8 },
            { id: "as19", setNumber: 2, type: "normal", weightKg: 16, reps: 10, completed: true, rpe: 8.5 },
            { id: "as20", setNumber: 3, type: "normal", weightKg: 14, reps: 12, completed: true, rpe: 9 }
          ]
        }
      ]
    },
    // 3. Session 3: ~3.8 days ago - Lower Body Compound Overload (YELLOW - Moderate Recovery)
    {
      id: "alex_showcase_legs_4d",
      name: "Lower Body Compound Loading",
      startedAt: new Date(now - 3.8 * dayMs - 45e5).toISOString(),
      completedAt: new Date(now - 3.8 * dayMs).toISOString(),
      durationSeconds: 4500,
      notes: "Deep back squats and Romanian deadlifts. Quads and gluteals in active recovery.",
      totalVolumeKg: 4950,
      totalSets: 9,
      musclesTrained: ["quadriceps", "gluteus", "hamstrings", "adductors"],
      rpeAverage: 8.8,
      exercises: [
        {
          id: "alex_ex_8",
          exerciseId: "barbell_back_squat",
          exerciseName: "Barbell Back Squat",
          notes: "Below parallel with explosive drive",
          sets: [
            { id: "as21", setNumber: 1, type: "normal", weightKg: 115, reps: 8, completed: true, rpe: 8 },
            { id: "as22", setNumber: 2, type: "normal", weightKg: 120, reps: 6, completed: true, rpe: 8.5 },
            { id: "as23", setNumber: 3, type: "normal", weightKg: 125, reps: 6, completed: true, rpe: 9 }
          ]
        },
        {
          id: "alex_ex_9",
          exerciseId: "romanian_deadlift",
          exerciseName: "Romanian Deadlift",
          notes: "Hinging at hips for intense hamstring loading",
          sets: [
            { id: "as24", setNumber: 1, type: "normal", weightKg: 100, reps: 10, completed: true, rpe: 8 },
            { id: "as25", setNumber: 2, type: "normal", weightKg: 110, reps: 8, completed: true, rpe: 8.5 },
            { id: "as26", setNumber: 3, type: "normal", weightKg: 110, reps: 8, completed: true, rpe: 8.5 }
          ]
        },
        {
          id: "alex_ex_10",
          exerciseId: "leg_extension",
          exerciseName: "Leg Extension",
          notes: "Terminal knee extension quad burn",
          sets: [
            { id: "as27", setNumber: 1, type: "normal", weightKg: 70, reps: 12, completed: true, rpe: 8 },
            { id: "as28", setNumber: 2, type: "normal", weightKg: 80, reps: 10, completed: true, rpe: 8.5 },
            { id: "as29", setNumber: 3, type: "normal", weightKg: 80, reps: 10, completed: true, rpe: 9 }
          ]
        }
      ]
    },
    // 4. Session 4: ~5.8 days ago - Calves, Core Stability & Accessories (GREEN - Fresh / Supercompensated)
    {
      id: "alex_showcase_core_arms_6d",
      name: "Arms, Calves & Core Priming",
      startedAt: new Date(now - 5.8 * dayMs - 31e5).toISOString(),
      completedAt: new Date(now - 5.8 * dayMs).toISOString(),
      durationSeconds: 3100,
      notes: "High-rep calf and abdominal wall priming. Triceps and core are now supercompensated and ready for direct work.",
      totalVolumeKg: 2420,
      totalSets: 9,
      musclesTrained: ["triceps", "calves", "rectus_abdominis", "obliques"],
      rpeAverage: 7.9,
      exercises: [
        {
          id: "alex_ex_11",
          exerciseId: "triceps_rope_pushdown",
          exerciseName: "Cable Triceps Pushdown",
          notes: "Smooth lockout at bottom",
          sets: [
            { id: "as30", setNumber: 1, type: "normal", weightKg: 30, reps: 12, completed: true, rpe: 7.5 },
            { id: "as31", setNumber: 2, type: "normal", weightKg: 35, reps: 10, completed: true, rpe: 8 },
            { id: "as32", setNumber: 3, type: "normal", weightKg: 35, reps: 10, completed: true, rpe: 8 }
          ]
        },
        {
          id: "alex_ex_12",
          exerciseId: "standing_calf_raise",
          exerciseName: "Standing Calf Raise",
          notes: "Full plantarflexion hold with deep stretch",
          sets: [
            { id: "as33", setNumber: 1, type: "normal", weightKg: 75, reps: 15, completed: true, rpe: 8 },
            { id: "as34", setNumber: 2, type: "normal", weightKg: 85, reps: 12, completed: true, rpe: 8 },
            { id: "as35", setNumber: 3, type: "normal", weightKg: 85, reps: 12, completed: true, rpe: 8.5 }
          ]
        },
        {
          id: "alex_ex_13",
          exerciseId: "hanging_leg_raise",
          exerciseName: "Hanging Leg Raise",
          notes: "Posterior pelvic tilt without swinging",
          sets: [
            { id: "as36", setNumber: 1, type: "normal", weightKg: 0, reps: 12, completed: true, rpe: 7.5 },
            { id: "as37", setNumber: 2, type: "normal", weightKg: 0, reps: 12, completed: true, rpe: 8 },
            { id: "as38", setNumber: 3, type: "normal", weightKg: 0, reps: 12, completed: true, rpe: 8 }
          ]
        }
      ]
    }
  ];
}
function getGuestShowcasePersonalRecords() {
  return [
    {
      exerciseId: "barbell_back_squat",
      exerciseName: "Barbell Back Squat",
      maxWeightKg: 125,
      maxReps: 6,
      achievedAt: new Date(Date.now() - 3.8 * 864e5).toISOString(),
      workoutId: "alex_showcase_legs_4d",
      estimated1RMKg: 150
    },
    {
      exerciseId: "barbell_bench_press",
      exerciseName: "Barbell Bench Press (Flat)",
      maxWeightKg: 100,
      maxReps: 8,
      achievedAt: new Date(Date.now() - 1 * 864e5).toISOString(),
      workoutId: "alex_showcase_push_yesterday",
      estimated1RMKg: 126.7
    },
    {
      exerciseId: "romanian_deadlift",
      exerciseName: "Romanian Deadlift",
      maxWeightKg: 110,
      maxReps: 8,
      achievedAt: new Date(Date.now() - 3.8 * 864e5).toISOString(),
      workoutId: "alex_showcase_legs_4d",
      estimated1RMKg: 139.3
    },
    {
      exerciseId: "lat_pulldown",
      exerciseName: "Lat Pulldown",
      maxWeightKg: 85,
      maxReps: 8,
      achievedAt: new Date(Date.now() - 2.1 * 864e5).toISOString(),
      workoutId: "alex_showcase_pull_2d",
      estimated1RMKg: 107.7
    },
    {
      exerciseId: "incline_dumbbell_press",
      exerciseName: "Incline Dumbbell Bench Press",
      maxWeightKg: 36,
      maxReps: 8,
      achievedAt: new Date(Date.now() - 1 * 864e5).toISOString(),
      workoutId: "alex_showcase_push_yesterday",
      estimated1RMKg: 45.6
    }
  ];
}
var SEED_PERSONAL_RECORDS = [
  {
    exerciseId: "barbell_bench_press",
    exerciseName: "Barbell Bench Press",
    maxWeightKg: 100,
    maxReps: 10,
    estimated1RMKg: 133.3,
    achievedAt: "2026-09-08T23:25:00.000Z",
    workoutId: "workout_1788937113526_889u4"
  },
  {
    exerciseId: "incline_dumbbell_press",
    exerciseName: "Incline Dumbbell Bench Press",
    maxWeightKg: 32,
    maxReps: 8,
    estimated1RMKg: 40.5,
    achievedAt: "2026-09-08T23:25:00.000Z",
    workoutId: "workout_1788937113526_889u4"
  },
  {
    exerciseId: "dumbbell_lateral_raise",
    exerciseName: "Dumbbell Lateral Raise",
    maxWeightKg: 15,
    maxReps: 12,
    estimated1RMKg: 21,
    achievedAt: "2026-09-08T23:25:00.000Z",
    workoutId: "workout_1788937113526_889u4"
  },
  {
    exerciseId: "triceps_rope_pushdown",
    exerciseName: "Cable Triceps Pushdown",
    maxWeightKg: 32.5,
    maxReps: 10,
    estimated1RMKg: 43.3,
    achievedAt: "2026-09-08T23:25:00.000Z",
    workoutId: "workout_1788937113526_889u4"
  },
  {
    exerciseId: "barbell_bent_over_row",
    exerciseName: "Barbell Bent-Over Row",
    maxWeightKg: 80,
    maxReps: 8,
    estimated1RMKg: 101.3,
    achievedAt: "2026-09-07T21:40:00.000Z",
    workoutId: "workout_1788937004112_771b2"
  },
  {
    exerciseId: "lat_pulldown",
    exerciseName: "Lat Pulldown (Wide/Neutral Grip)",
    maxWeightKg: 75,
    maxReps: 8,
    estimated1RMKg: 95,
    achievedAt: "2026-09-07T21:40:00.000Z",
    workoutId: "workout_1788937004112_771b2"
  },
  {
    exerciseId: "face_pulls",
    exerciseName: "Cable Face Pull",
    maxWeightKg: 25,
    maxReps: 15,
    estimated1RMKg: 37.5,
    achievedAt: "2026-09-07T21:40:00.000Z",
    workoutId: "workout_1788937004112_771b2"
  },
  {
    exerciseId: "barbell_bicep_curl",
    exerciseName: "Barbell Bicep Curl",
    maxWeightKg: 35,
    maxReps: 8,
    estimated1RMKg: 44.3,
    achievedAt: "2026-09-07T21:40:00.000Z",
    workoutId: "workout_1788937004112_771b2"
  }
];

// src/lib/muscleMath.ts
var MUSCLE_CATALOG = {
  chest_upper: {
    id: "chest_upper",
    name: "Upper Chest (Clavicular Head)",
    category: "chest",
    view: "front",
    description: "Upper clavicular fibers of the pectoralis major. Primary driver in incline presses, incline flyes, and low-to-high cable crossovers for upper shelf mass."
  },
  chest_mid: {
    id: "chest_mid",
    name: "Mid Chest (Sternal Head)",
    category: "chest",
    view: "front",
    description: "Main sternocostal fibers of the pectoralis major responsible for horizontal adduction. Targeted by flat bench presses, dumbbell presses, and pec deck flyes."
  },
  chest_lower: {
    id: "chest_lower",
    name: "Lower Chest (Abdominal Head)",
    category: "chest",
    view: "front",
    description: "Lower abdominal/costal head of the pectoralis major. Targeted by parallel bar dips, decline pressing, and high-to-low cable flyes."
  },
  pectoralis_major: {
    id: "pectoralis_major",
    name: "Chest (Pectoralis Major)",
    category: "chest",
    view: "front",
    description: "Main chest muscle complex spanning clavicular, sternal, and abdominal heads."
  },
  anterior_deltoid: {
    id: "anterior_deltoid",
    name: "Front Delts (Anterior Deltoid)",
    category: "shoulders",
    view: "front",
    description: "Front shoulder muscle assisting in forward arm flexion and overhead pressing."
  },
  lateral_deltoid: {
    id: "lateral_deltoid",
    name: "Side Delts (Lateral Deltoid)",
    category: "shoulders",
    view: "both",
    description: "Side shoulder muscle responsible for arm abduction creating shoulder width and 3D delts."
  },
  posterior_deltoid: {
    id: "posterior_deltoid",
    name: "Rear Delts (Posterior Deltoid)",
    category: "shoulders",
    view: "back",
    description: "Rear shoulder muscle crucial for shoulder joint integrity, horizontal abduction, and posterior 3D caps."
  },
  biceps: {
    id: "biceps",
    name: "Biceps (Biceps Brachii)",
    category: "arms",
    view: "front",
    description: "Front arm muscle responsible for elbow flexion, forearm supination, and peak arm fullness."
  },
  triceps: {
    id: "triceps",
    name: "Triceps (Triceps Brachii)",
    category: "arms",
    view: "back",
    description: "Back arm muscle comprising lateral, long, and medial heads, responsible for elbow extension and 2/3 of arm size."
  },
  forearms: {
    id: "forearms",
    name: "Forearms (Brachioradialis & Flexors)",
    category: "arms",
    view: "front",
    description: "Flexors, extensors, and brachioradialis controlling wrist movement and crushing grip strength."
  },
  rectus_abdominis: {
    id: "rectus_abdominis",
    name: "Abs (Rectus Abdominis)",
    category: "core",
    view: "front",
    description: "Front core abdominal six-pack wall providing spinal flexion and anterior trunk stability."
  },
  obliques: {
    id: "obliques",
    name: "Obliques (Internal & External Obliques)",
    category: "core",
    view: "front",
    description: "Side core musculature driving trunk rotation, waist taper, and lateral flexion."
  },
  rhomboids: {
    id: "rhomboids",
    name: "Upper Back",
    category: "back",
    view: "back",
    description: "Upper back and trapezius complex powering scapular retraction, shrugs, horizontal rows, and neck/collar yoke thickness."
  },
  latissimus_dorsi: {
    id: "latissimus_dorsi",
    name: "Lats (Latissimus Dorsi)",
    category: "back",
    view: "back",
    description: "Broadest muscle of the back creating the classic V-taper wing span through vertical pulls, pulldowns, and close-grip rows."
  },
  spinal_erectors: {
    id: "spinal_erectors",
    name: "Lower Back (Erector Spinae)",
    category: "back",
    view: "back",
    description: "Deep muscles running along the lumbar spine providing trunk extension, deadlift lockouts, and core bracing."
  },
  gluteus: {
    id: "gluteus",
    name: "Glutes (Gluteus Maximus)",
    category: "legs",
    view: "back",
    description: "Primary hip extensors and stabilizers driving sprinting, squatting, hip thrusting, and deadlifting power."
  },
  quadriceps: {
    id: "quadriceps",
    name: "Quads (Quadriceps Femoris)",
    category: "legs",
    view: "front",
    description: "Four-headed front thigh muscle group responsible for knee extension, squat depth, and leg sweep mass."
  },
  hamstrings: {
    id: "hamstrings",
    name: "Hamstrings (Biceps Femoris)",
    category: "legs",
    view: "back",
    description: "Posterior thigh muscles responsible for knee flexion, RDL hip hinge power, and hamstring sweep."
  },
  calves: {
    id: "calves",
    name: "Calves (Gastrocnemius & Soleus)",
    category: "legs",
    view: "both",
    description: "Lower leg muscles driving plantarflexion, jumping, diamond calf development, and ankle stabilization."
  },
  adductors: {
    id: "adductors",
    name: "Inner Thighs (Adductor Complex)",
    category: "legs",
    view: "front",
    description: "Inner thigh muscles providing hip adduction, deep squat stability, and inner leg fullness."
  }
};
function isArmMuscle(muscleId) {
  return muscleId === "biceps" || muscleId === "triceps" || muscleId === "forearms";
}
function getMuscleBroName(nameOrId) {
  const catalogName = MUSCLE_CATALOG[nameOrId]?.name || nameOrId;
  const beforeBracket = catalogName.split("(")[0].trim();
  return beforeBracket || catalogName;
}
var ALL_MUSCLE_IDS = Object.keys(MUSCLE_CATALOG);
function getRecencyWeight(daysAgo) {
  if (daysAgo < 0) return 1;
  if (daysAgo <= 1) return 1;
  if (daysAgo <= 2) return 0.85;
  if (daysAgo <= 3) return 0.65;
  if (daysAgo <= 5) return 0.4;
  if (daysAgo <= 7) return 0.2;
  if (daysAgo <= 10) return 0.08;
  return 0.03;
}
function calculateEstimated1RM(weightKg, reps) {
  if (reps <= 0 || weightKg <= 0) return 0;
  if (reps === 1) return weightKg;
  const e1rm = weightKg * (1 + reps / 30);
  return Math.round(e1rm * 10) / 10;
}
function formatTimeSinceTraining(daysSinceTraining, lastTrainedAt, referenceDate = /* @__PURE__ */ new Date(), compact = false) {
  if (daysSinceTraining === null || daysSinceTraining === void 0) {
    return "Never";
  }
  const d = Math.floor(daysSinceTraining);
  if (d === 0) {
    let hours = 0;
    if (lastTrainedAt) {
      const ms = Math.max(0, referenceDate.getTime() - new Date(lastTrainedAt).getTime());
      hours = Math.max(1, Math.round(ms / (1e3 * 60 * 60)));
    } else {
      hours = Math.max(1, Math.round(daysSinceTraining * 24));
    }
    if (compact) {
      return `${hours}h ago`;
    }
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  }
  if (compact) {
    return `${d}d ago`;
  }
  return d === 1 ? "1 day ago" : `${d} days ago`;
}
function calculateMuscleExposures(workouts, exercisesMap, referenceDate = /* @__PURE__ */ new Date()) {
  const result = {};
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
      freshnessStatus: "untrained",
      volumeScore: 0,
      recentExercises: [],
      recommendation: "No recent training recorded. Fresh and primed for stimulus."
    };
  }
  const completedWorkouts = workouts.filter((w) => w.completedAt || w.startedAt).sort((a, b) => {
    const dateA = new Date(a.completedAt || a.startedAt).getTime();
    const dateB = new Date(b.completedAt || b.startedAt).getTime();
    return dateB - dateA;
  });
  const muscleExerciseMap = {};
  ALL_MUSCLE_IDS.forEach((id) => muscleExerciseMap[id] = /* @__PURE__ */ new Map());
  for (const workout of completedWorkouts) {
    const workoutDate = new Date(workout.completedAt || workout.startedAt);
    const diffMs = referenceDate.getTime() - workoutDate.getTime();
    const daysAgo = Math.max(0, diffMs / (1e3 * 60 * 60 * 24));
    const recencyWeight = getRecencyWeight(daysAgo);
    for (const exEntry of workout.exercises || []) {
      let exerciseDef = exercisesMap[exEntry.exerciseId];
      if (!exerciseDef) {
        const targetId = (exEntry.exerciseId || "").toLowerCase().trim();
        const targetName = (exEntry.exerciseName || "").toLowerCase().trim();
        const aliases = {
          barbell_squat: "barbell_back_squat",
          squat: "barbell_back_squat",
          back_squat: "barbell_back_squat",
          front_squat: "barbell_front_squat",
          bench_press: "barbell_bench_press",
          flat_bench: "barbell_bench_press",
          deadlift: "barbell_deadlift",
          rdl: "romanian_deadlift",
          pull_up: "pullup",
          pull_ups: "pullup",
          chin_up: "chinup",
          lat_pull_down: "lat_pulldown",
          calf_raise: "standing_calf_raise",
          leg_press: "leg_press_machine",
          tricep_curl: "tricep_curl_dips_machine",
          tricep_dips: "tricep_curl_dips_machine",
          dips_machine: "tricep_curl_dips_machine",
          seated_dip_machine: "tricep_curl_dips_machine",
          chest_supported_row: "chest_supported_seated_back_row",
          chest_supported_seated_row: "chest_supported_seated_back_row",
          chest_supported_seated_back_row: "chest_supported_seated_back_row",
          seated_back_row: "chest_supported_seated_back_row",
          back_supported_tricep_pushdown: "back_supported_cable_tricep_pushdown",
          back_supported_pushdown: "back_supported_cable_tricep_pushdown"
        };
        const aliasKey = aliases[targetId] || aliases[targetName];
        if (aliasKey && exercisesMap[aliasKey]) {
          exerciseDef = exercisesMap[aliasKey];
        } else {
          exerciseDef = Object.values(exercisesMap).find(
            (e) => e.id.toLowerCase() === targetId || e.name.toLowerCase() === targetName || targetName && e.name.toLowerCase().includes(targetName) || targetId && e.id.toLowerCase().includes(targetId)
          );
        }
      }
      if (!exerciseDef) continue;
      const rawSets = Array.isArray(exEntry?.sets) ? exEntry.sets : exEntry?.sets && typeof exEntry.sets === "object" ? Object.values(exEntry.sets) : typeof exEntry?.sets === "number" ? Array.from({ length: exEntry.sets }).map(() => ({ completed: true, type: "normal" })) : [];
      const workingSets = rawSets.filter((s) => s && s.completed && s.type !== "warmup").length;
      if (workingSets === 0) continue;
      const contributions = [...exerciseDef.muscles];
      const hasChest = exerciseDef.muscles.some((m) => m.muscleId === "chest_mid" || m.muscleId === "chest_upper");
      if (hasChest && !exerciseDef.muscles.some((m) => m.muscleId === "pectoralis_major")) {
        contributions.push({ muscleId: "pectoralis_major", role: "PRIMARY", contributionFactor: 0.9 });
      }
      const hasRowOrUpperBack = exerciseDef.movementPattern === "pull_horizontal" || exerciseDef.muscles.some((m) => m.muscleId === "trapezius" || m.muscleId === "rhomboids");
      if (hasRowOrUpperBack && !exerciseDef.muscles.some((m) => m.muscleId === "rhomboids")) {
        contributions.push({ muscleId: "rhomboids", role: "PRIMARY", contributionFactor: 0.85 });
      }
      for (const contrib of contributions) {
        const muscleId = contrib.muscleId === "trapezius" ? "rhomboids" : contrib.muscleId;
        const target = result[muscleId];
        if (!target) continue;
        const isDirect = contrib.role === "PRIMARY";
        if (!target.lastTrainedAt || new Date(target.lastTrainedAt).getTime() < workoutDate.getTime()) {
          target.lastTrainedAt = workoutDate.toISOString();
          target.daysSinceTraining = Math.floor(daysAgo);
        }
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
            target.indirectSets7d = (target.indirectSets7d || 0) + workingSets * contrib.contributionFactor;
          }
        }
        const factor = isArmMuscle(muscleId) && !isDirect ? contrib.contributionFactor * 0.35 : contrib.contributionFactor;
        const effectiveSets = workingSets * factor;
        if (daysAgo <= 7) {
          target.effectiveSets7d += effectiveSets;
        }
        if (daysAgo <= 30) {
          target.effectiveSets30d += effectiveSets;
        }
        target.volumeScore += effectiveSets * recencyWeight * 10;
        const map = muscleExerciseMap[muscleId];
        const key = `${exerciseDef.name}_${workoutDate.toISOString().slice(0, 10)}`;
        if (map.has(key)) {
          map.get(key).sets += workingSets;
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
  for (const muscleId of ALL_MUSCLE_IDS) {
    const data = result[muscleId];
    data.effectiveSets7d = Math.round(data.effectiveSets7d * 10) / 10;
    data.effectiveSets30d = Math.round(data.effectiveSets30d * 10) / 10;
    data.directSets7d = Math.round((data.directSets7d || 0) * 10) / 10;
    data.indirectSets7d = Math.round((data.indirectSets7d || 0) * 10) / 10;
    data.volumeScore = Math.min(100, Math.round(data.volumeScore));
    data.frequencyWeekly = Math.round(data.effectiveSets30d / 4.3 * 10) / 10;
    data.recentExercises = Array.from(muscleExerciseMap[muscleId].values());
    const isArm = isArmMuscle(muscleId);
    const hasDirectRecently = (data.directSets7d || 0) > 0 || data.daysSinceDirectTraining !== null && data.daysSinceDirectTraining <= 3;
    data.hasDirectTrainingRecently = hasDirectRecently;
    data.isIndirectOnly = !hasDirectRecently && (data.daysSinceTraining !== null || (data.indirectSets7d || 0) > 0);
    const broName = getMuscleBroName(muscleId);
    if (data.daysSinceTraining === null) {
      data.freshnessStatus = "untrained";
      data.recommendation = "No logged sessions yet. Ready for direct activation.";
    } else if (isArm && data.isIndirectOnly) {
      const daysSinceIndirect = data.daysSinceIndirectTraining ?? data.daysSinceTraining ?? 99;
      if (daysSinceIndirect < 0.6) {
        data.freshnessStatus = "moderate";
        data.recommendation = `${broName} received indirect synergist assistance today (compound chest/back work). Synergist fatigue is minor; fully recovered and primed for your direct arm workout tomorrow!`;
      } else {
        data.freshnessStatus = "fresh";
        data.recommendation = `${broName} recovered rapidly from indirect compound assistance (~${Math.max(1, Math.round(daysSinceIndirect))}d ago). Fresh, green, and primed for direct arm isolation today!`;
      }
    } else if (isArm && hasDirectRecently) {
      const daysSinceDirect = data.daysSinceDirectTraining ?? data.daysSinceTraining ?? 99;
      const timeDirectStr = formatTimeSinceTraining(daysSinceDirect, data.lastDirectTrainedAt, referenceDate, false);
      if (daysSinceDirect <= 1 && (data.directSets7d || 0) >= 6) {
        data.freshnessStatus = "high_recent_exposure";
        data.recommendation = `${broName} underwent heavy direct isolation loading (~${timeDirectStr}). Allow full systemic recovery before high intensity.`;
      } else if (daysSinceDirect <= 2 || (data.directSets7d || 0) >= 6 && daysSinceDirect <= 3) {
        data.freshnessStatus = "recently_trained";
        data.recommendation = `Moderate recovery phase (~${timeDirectStr}). Light accessory work or active recovery is suitable.`;
      } else if (daysSinceDirect <= 3.5 || data.effectiveSets7d >= 6) {
        data.freshnessStatus = "moderate";
        data.recommendation = `Mostly recovered (~${timeDirectStr}). Primed for moderate to high volume direct arm training today.`;
      } else {
        data.freshnessStatus = "fresh";
        data.recommendation = `Fully recovered & supercompensated (${timeDirectStr} since direct stimulus). Prime target for direct arm blast!`;
      }
    } else if (data.isIndirectOnly) {
      const daysSinceIndirect = data.daysSinceIndirectTraining ?? data.daysSinceTraining ?? 99;
      if (daysSinceIndirect === 0) {
        data.freshnessStatus = "recently_trained";
        data.recommendation = `${broName} assisted in compound movements today. Recovering fast without direct tissue trauma.`;
      } else if (daysSinceIndirect <= 1.5) {
        data.freshnessStatus = "moderate";
        data.recommendation = `${broName} received indirect assistance (~1d ago). Synergist fatigue is mostly dissipated; ready for direct training.`;
      } else {
        data.freshnessStatus = "fresh";
        data.recommendation = `Fully recovered & supercompensated (${daysSinceIndirect}d since assistance). Prime target for today's workout.`;
      }
    } else {
      if (data.daysSinceTraining <= 1 && data.effectiveSets7d >= 6) {
        data.freshnessStatus = "high_recent_exposure";
        const timeAgoStr = formatTimeSinceTraining(data.daysSinceTraining, data.lastTrainedAt, referenceDate, false);
        data.recommendation = `${broName} underwent heavy recent loading (~${timeAgoStr}). Allow full systemic recovery before high intensity.`;
      } else if (data.daysSinceTraining <= 2 || data.effectiveSets7d >= 8 && data.daysSinceTraining <= 3) {
        data.freshnessStatus = "recently_trained";
        const timeAgoStr = formatTimeSinceTraining(data.daysSinceTraining, data.lastTrainedAt, referenceDate, false);
        data.recommendation = `Moderate recovery phase (~${timeAgoStr}). Light accessory work or active recovery is suitable.`;
      } else if (data.daysSinceTraining <= 4 || data.effectiveSets7d >= 4) {
        data.freshnessStatus = "moderate";
        const timeAgoStr = formatTimeSinceTraining(data.daysSinceTraining, data.lastTrainedAt, referenceDate, false);
        data.recommendation = `Mostly recovered (~${timeAgoStr}). Primed for moderate to high volume training today.`;
      } else {
        data.freshnessStatus = "fresh";
        const timeAgoStr = formatTimeSinceTraining(data.daysSinceTraining, data.lastTrainedAt, referenceDate, false);
        data.recommendation = `Fully recovered & supercompensated (${timeAgoStr} since stimulus). Prime target for today's training session.`;
      }
    }
  }
  return result;
}
function buildTrainingRadar(workouts, exercisesMap) {
  const exposures = calculateMuscleExposures(workouts, exercisesMap);
  const exposureList = Object.values(exposures);
  const highExposureMuscles = exposureList.filter(
    (m) => m.freshnessStatus === "high_recent_exposure" || m.freshnessStatus === "recently_trained"
  );
  const recoveredMuscles = exposureList.filter(
    (m) => m.freshnessStatus === "fresh" && m.daysSinceTraining !== null
  );
  const neglectedMuscles = exposureList.filter(
    (m) => m.freshnessStatus === "untrained" || m.daysSinceTraining !== null && m.daysSinceTraining >= 6
  ).sort((a, b) => {
    if (a.freshnessStatus === "untrained" && b.freshnessStatus !== "untrained") return -1;
    if (b.freshnessStatus === "untrained" && a.freshnessStatus !== "untrained") return 1;
    const daysA = a.daysSinceTraining ?? 999;
    const daysB = b.daysSinceTraining ?? 999;
    if (daysB !== daysA) return daysB - daysA;
    return a.effectiveSets30d - b.effectiveSets30d;
  });
  const now = /* @__PURE__ */ new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
  const recentWorkouts = workouts.filter((w) => {
    const d = new Date(w.completedAt || w.startedAt);
    return d >= sevenDaysAgo;
  });
  const weeklyWorkoutsCount = recentWorkouts.length;
  const weeklyVolumeKg = recentWorkouts.reduce((sum, w) => sum + (w.totalVolumeKg || 0), 0);
  const weeklyTotalSets = recentWorkouts.reduce((sum, w) => sum + (w.totalSets || 0), 0);
  let pushSets = 0;
  let pullSets = 0;
  let legSets = 0;
  let upperSets = 0;
  for (const w of recentWorkouts) {
    for (const ex of w.exercises || []) {
      const def = exercisesMap[ex.exerciseId];
      if (!def) continue;
      const rawSets = Array.isArray(ex?.sets) ? ex.sets : ex?.sets && typeof ex.sets === "object" ? Object.values(ex.sets) : typeof ex?.sets === "number" ? Array.from({ length: ex.sets }).map(() => ({ completed: true })) : [];
      const count = rawSets.filter((s) => s && s.completed).length;
      if (def.movementPattern.startsWith("push")) pushSets += count;
      if (def.movementPattern.startsWith("pull")) pullSets += count;
      if (["squat", "hinge", "lunge"].includes(def.movementPattern)) legSets += count;
      if (["chest", "back", "shoulders", "arms"].includes(def.category)) upperSets += count;
    }
  }
  const pushPullRatio = pullSets === 0 ? pushSets > 0 ? 2 : 1 : Math.round(pushSets / pullSets * 100) / 100;
  const upperLowerRatio = legSets === 0 ? upperSets > 0 ? 2 : 1 : Math.round(upperSets / legSets * 100) / 100;
  const isRedFatigued = (mId) => {
    const exp = exposures[mId];
    if (!exp) return false;
    if (isArmMuscle(mId) && exp.isIndirectOnly) {
      return false;
    }
    return exp.freshnessStatus === "high_recent_exposure";
  };
  const isUntrained = (mId) => {
    const exp = exposures[mId];
    if (!exp) return true;
    return exp.freshnessStatus === "untrained" || exp.daysSinceTraining === null || exp.effectiveSets30d === 0;
  };
  const allUntrainedMuscles = ALL_MUSCLE_IDS.filter((id) => isUntrained(id));
  const legMuscles = ["quadriceps", "hamstrings", "gluteus", "calves", "adductors"];
  const pullMuscles = ["latissimus_dorsi", "rhomboids", "posterior_deltoid", "biceps", "spinal_erectors"];
  const pushMuscles = ["chest_mid", "chest_upper", "chest_lower", "pectoralis_major", "anterior_deltoid", "lateral_deltoid", "triceps"];
  const armMuscles = ["lateral_deltoid", "posterior_deltoid", "anterior_deltoid", "biceps", "triceps", "forearms"];
  const coreMuscles = ["rectus_abdominis", "obliques"];
  const untrainedLegs = legMuscles.filter((m) => isUntrained(m) && !isRedFatigued(m));
  const untrainedPull = pullMuscles.filter((m) => isUntrained(m) && !isRedFatigued(m));
  const untrainedPush = pushMuscles.filter((m) => isUntrained(m) && !isRedFatigued(m));
  const untrainedCore = coreMuscles.filter((m) => isUntrained(m) && !isRedFatigued(m));
  let suggestedFocusMuscles = [];
  let suggestedTitle = "Full Body Hypertrophy";
  let suggestedRationale = "Balanced stimulus across prime movement patterns.";
  let estDuration = 50;
  if (allUntrainedMuscles.length > 0) {
    const hasUntrainedMajorLegs = untrainedLegs.some((m) => ["quadriceps", "gluteus", "hamstrings"].includes(m));
    const hasUntrainedMajorPull = untrainedPull.some((m) => ["latissimus_dorsi", "biceps"].includes(m));
    const hasUntrainedMajorPush = untrainedPush.some((m) => ["chest_mid", "chest_upper", "triceps"].includes(m));
    if (hasUntrainedMajorLegs) {
      const targetList = Array.from(/* @__PURE__ */ new Set([...untrainedLegs, ...untrainedCore]));
      suggestedFocusMuscles = targetList.filter((m) => !isRedFatigued(m));
      suggestedTitle = "Prime Target: Untrained Lower Body & Core";
      suggestedRationale = `You have not yet trained your lower body (${untrainedLegs.map((m) => MUSCLE_CATALOG[m]?.name || m).slice(0, 3).join(", ")}). Activating these groups today establishes foundational systemic power and prevents muscular imbalances.`;
      estDuration = 55;
    } else if (hasUntrainedMajorPull) {
      const targetList = Array.from(/* @__PURE__ */ new Set([...untrainedPull, ...untrainedCore]));
      suggestedFocusMuscles = targetList.filter((m) => !isRedFatigued(m));
      suggestedTitle = "Prime Target: Untrained Posterior Chain & Pull";
      suggestedRationale = `You have no logged history for upper body pulling. Targeting your Latissimus Dorsi, Upper Back, and Biceps today is essential for developing structural pulling strength and posture.`;
      estDuration = 50;
    } else if (hasUntrainedMajorPush) {
      const targetList = Array.from(/* @__PURE__ */ new Set([...untrainedPush, ...untrainedCore]));
      suggestedFocusMuscles = targetList.filter((m) => !isRedFatigued(m));
      suggestedTitle = "Prime Target: Untrained Upper Body Push";
      suggestedRationale = `You have no logged history for upper body pressing. Stimulating your Pectorals, Deltoids, and Triceps today will build foundational pushing strength and upper body pressing mass.`;
      estDuration = 50;
    } else {
      const allCleanUntrained = allUntrainedMuscles.filter((m) => !isRedFatigued(m));
      const pillarOptions = [
        { name: "Lower Body", muscles: legMuscles },
        { name: "Upper Body Pull", muscles: pullMuscles },
        { name: "Upper Body Push", muscles: pushMuscles }
      ];
      const scoredPillars = pillarOptions.map((p) => {
        const cleanMuscles = p.muscles.filter((m) => !isRedFatigued(m));
        const daysList = cleanMuscles.map((m) => exposures[m]?.daysSinceTraining ?? 99);
        const minDays = daysList.length > 0 ? Math.min(...daysList) : 0;
        const avgDays = daysList.length > 0 ? daysList.reduce((a, b) => a + b, 0) / daysList.length : 0;
        const hasRed = p.muscles.some((m) => isRedFatigued(m));
        return { ...p, cleanMuscles, minDays, avgDays, hasRed };
      });
      const availablePillars = scoredPillars.filter((p) => !p.hasRed && p.cleanMuscles.length > 0);
      availablePillars.sort((a, b) => b.minDays - a.minDays);
      const companionPillar = availablePillars[0] || scoredPillars.sort((a, b) => b.avgDays - a.avgDays)[0];
      const companionMuscles = (companionPillar ? companionPillar.cleanMuscles : []).filter((m) => !isRedFatigued(m));
      const combined = Array.from(/* @__PURE__ */ new Set([...allCleanUntrained, ...companionMuscles]));
      suggestedFocusMuscles = combined.filter((m) => !isRedFatigued(m));
      const untrainedNames = allCleanUntrained.map((m) => MUSCLE_CATALOG[m]?.name || m).slice(0, 3).join(", ");
      suggestedTitle = `Prime Target: Untrained ${allCleanUntrained.length === 1 ? MUSCLE_CATALOG[allCleanUntrained[0]]?.name || "Muscles" : "Gaps"} & ${companionPillar?.name || "Recovery"}`;
      suggestedRationale = `The highlighted muscles (${untrainedNames}) have 0 recorded sets in your training history. Today's session prioritizes them alongside your fully rested ${companionPillar?.name || "movement patterns"} to eliminate structural weak points.`;
      estDuration = 45;
    }
  } else {
    const pillars = [
      {
        id: "legs",
        name: "Lower Body",
        allMuscles: ["quadriceps", "hamstrings", "gluteus", "calves", "adductors"],
        title: "Lower Body Quad & Posterior Hypertrophy",
        duration: 55
      },
      {
        id: "shoulders_arms",
        name: "Shoulders & Arms",
        allMuscles: ["lateral_deltoid", "posterior_deltoid", "biceps", "triceps", "forearms"],
        title: "Shoulders & Arms Hypertrophy (Delts & Arms Blast)",
        duration: 50
      },
      {
        id: "pull",
        name: "Upper Body Pull",
        allMuscles: ["latissimus_dorsi", "rhomboids", "posterior_deltoid", "biceps", "spinal_erectors"],
        title: "Posterior Chain Pull & Rear Delts",
        duration: 50
      },
      {
        id: "push",
        name: "Upper Body Push",
        allMuscles: ["chest_mid", "chest_upper", "anterior_deltoid", "lateral_deltoid", "triceps"],
        title: "Upper Body Push & Shoulder Width",
        duration: 50
      }
    ];
    const pillarEvaluations = pillars.map((p) => {
      let minDays = 999;
      let hasRed = false;
      for (const mId of p.allMuscles) {
        if (isRedFatigued(mId)) {
          hasRed = true;
        }
        const exp = exposures[mId];
        const days = isArmMuscle(mId) && exp?.isIndirectOnly ? exp?.daysSinceDirectTraining ?? 999 : exp?.daysSinceTraining ?? 999;
        if (days < minDays) minDays = days;
      }
      return {
        pillar: p,
        hasRed,
        minDays,
        cleanMuscles: p.allMuscles.filter((m) => !isRedFatigued(m))
      };
    });
    const fullyRecovered = pillarEvaluations.filter((e) => !e.hasRed && e.minDays >= 2 && e.cleanMuscles.length > 0);
    if (fullyRecovered.length > 0) {
      fullyRecovered.sort((a, b) => b.minDays - a.minDays);
      const selected = fullyRecovered[0];
      const daysText = selected.minDays >= 999 ? "never" : selected.minDays === 0 ? formatTimeSinceTraining(0, null, /* @__PURE__ */ new Date(), false) : selected.minDays === 1 ? "yesterday" : `${selected.minDays} days ago`;
      suggestedFocusMuscles = selected.cleanMuscles;
      suggestedTitle = selected.pillar.title;
      suggestedRationale = `${selected.pillar.name} was last trained ${daysText} and is fully recovered. Prime opportunity for progressive overload while your recently trained muscle groups supercompensate.`;
      estDuration = selected.pillar.duration;
    } else {
      const nonFatiguedMuscles = ALL_MUSCLE_IDS.filter((m) => !isRedFatigued(m));
      if (nonFatiguedMuscles.length > 0) {
        suggestedFocusMuscles = nonFatiguedMuscles.slice(0, 5);
        suggestedTitle = "Active Recovery & Core Stabilization";
        suggestedRationale = "Your major compound pressing, pulling, and leg drivers are actively repairing from high recent stimulus. Today focus on core stability, mobility, and active recovery.";
        estDuration = 35;
      } else {
        suggestedFocusMuscles = [];
        suggestedTitle = "Systemic Rest & Recovery Day";
        suggestedRationale = "High systemic fatigue detected across all kinetic chains. Complete rest is recommended today to facilitate central nervous system recovery and muscle protein synthesis.";
        estDuration = 0;
      }
    }
  }
  suggestedFocusMuscles = suggestedFocusMuscles.filter((mId) => !isRedFatigued(mId));
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const trainedDatesSet = /* @__PURE__ */ new Set();
  for (const w of workouts) {
    const raw = w.completedAt || w.startedAt;
    if (!raw) continue;
    const d = new Date(raw);
    if (isNaN(d.getTime())) continue;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    trainedDatesSet.add(`${y}-${m}-${day}`);
  }
  const getDayAtOffset = (offsetDays) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offsetDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return { date: d, dateStr: `${y}-${m}-${day}` };
  };
  const todayStr = getDayAtOffset(0).dateStr;
  const workedOutToday = trainedDatesSet.has(todayStr);
  let streak = 0;
  let isFrozen = false;
  let freezeReason = "";
  let restDaysInStreak = 0;
  const frozenRestDateStrs = /* @__PURE__ */ new Set();
  if (trainedDatesSet.size > 0) {
    let startOffset = 999;
    if (workedOutToday) {
      streak = 1;
      startOffset = 1;
    } else {
      const yesterdayStr = getDayAtOffset(1).dateStr;
      const dayBeforeYesterdayStr = getDayAtOffset(2).dateStr;
      if (trainedDatesSet.has(yesterdayStr)) {
        streak = 1;
        startOffset = 2;
      } else if (trainedDatesSet.has(dayBeforeYesterdayStr)) {
        streak = 1;
        isFrozen = true;
        freezeReason = "Streak protected by Rest Day Freeze. Log today to extend your streak!";
        restDaysInStreak = 1;
        frozenRestDateStrs.add(yesterdayStr);
        startOffset = 3;
      } else {
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
          const prevDayStr = getDayAtOffset(currOffset + 1).dateStr;
          if (trainedDatesSet.has(prevDayStr)) {
            restDaysInStreak++;
            frozenRestDateStrs.add(currDayStr);
            streak++;
            currOffset += 2;
          } else {
            break;
          }
        }
      }
    }
  }
  const currentDayOfWeek = today.getDay();
  const distanceToMonday = (currentDayOfWeek + 6) % 7;
  const mondayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - distanceToMonday);
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
  const daysThisWeek = dayLabels.map((dayName, idx) => {
    const d = new Date(mondayDate.getFullYear(), mondayDate.getMonth(), mondayDate.getDate() + idx);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
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
  const milestones = [3, 5, 7, 10, 14, 21, 30, 60, 90];
  const nextMilestone = milestones.find((m) => m > streak) || streak + 5;
  const daysToMilestone = Math.max(1, nextMilestone - streak);
  let streakMessage = "";
  if (workedOutToday) {
    streakMessage = streak > 1 ? `\u{1F525} ${streak}-Day Streak Locked In! Rest day freeze ready if needed tomorrow.` : `\u{1F525} 1-Day Streak Ignited! First session complete. Rest day freeze protects your momentum!`;
  } else if (isFrozen) {
    streakMessage = `\u2744\uFE0F ${streak}-Day Streak Frozen (Rest Day)! Your streak is protected. Log today to extend it to ${streak + 1} days!`;
  } else if (streak > 0) {
    streakMessage = `\u26A1 ${streak}-Day Streak Active! Log today's session to extend your streak to ${streak + 1} days (or take a rest day freeze)!`;
  } else {
    streakMessage = `\u{1F3AF} Start your consistency streak today! Rest days won't break your momentum.`;
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

// server.ts
var app = (0, import_express.default)();
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
var getOwnerEmail = () => (process.env.OWNER_EMAIL || "").toLowerCase().trim();
app.use(import_express.default.json());
app.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});
function isGenuineWorkout(w) {
  if (!w || typeof w !== "object" || Array.isArray(w)) return false;
  if (typeof w.id !== "string" || !w.id.trim()) return false;
  const id = w.id.trim();
  if (id.startsWith("template_") || id.startsWith("tpl_") || id.startsWith("ex_") || id.startsWith("we_") || id.startsWith("s_") || id.startsWith("set_") || id.startsWith("rec_") || id.startsWith("pr_")) {
    return false;
  }
  if (w.exerciseId || w.exerciseName) {
    return false;
  }
  if (w.category || w.splitType || w.estimatedMinutes) {
    if (!w.startedAt && !w.completedAt) return false;
  }
  if (w.targetSets !== void 0 && w.durationSeconds === void 0) return false;
  if (w.repMin !== void 0 || w.repMax !== void 0 || w.suggestedWeightKg !== void 0) return false;
  if (!Array.isArray(w.exercises)) {
    return false;
  }
  if (!w.startedAt && !w.completedAt) return false;
  const timeStr = w.completedAt || w.startedAt;
  const timeNum = new Date(timeStr).getTime();
  if (isNaN(timeNum) || timeNum < 15778368e5) {
    return false;
  }
  return true;
}
function formatAthleteName(rawName, email) {
  const cleanEmail = (email || "").trim().toLowerCase();
  let candidate = (rawName || "").trim();
  if (candidate && !candidate.includes("@") && candidate.toLowerCase() !== "athlete" && candidate.toLowerCase() !== "user" && candidate.toLowerCase() !== "guest") {
    const words = candidate.split(/\s+/).filter(Boolean);
    if (words.length > 0) {
      return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    }
    return candidate.charAt(0).toUpperCase() + candidate.slice(1);
  }
  let handle = "";
  if (cleanEmail && cleanEmail.includes("@")) {
    handle = cleanEmail.split("@")[0];
  } else if (candidate && candidate.includes("@")) {
    handle = candidate.split("@")[0];
  }
  if (handle) {
    let stripped = handle.replace(/^[0-9]+/, "").replace(/[0-9]+$/, "");
    if (/[._+-]/.test(stripped)) {
      const parts = stripped.split(/[._+-]+/).filter(Boolean);
      if (parts.length > 0) {
        return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(" ");
      }
    }
    if (stripped.length >= 2) {
      return stripped.charAt(0).toUpperCase() + stripped.slice(1).toLowerCase();
    }
    return handle.charAt(0).toUpperCase() + handle.slice(1);
  }
  if (candidate && candidate.length > 0) {
    return candidate.charAt(0).toUpperCase() + candidate.slice(1);
  }
  return "Athlete";
}
function hashPassword(password, salt) {
  const actualSalt = salt || import_crypto.default.randomBytes(16).toString("hex");
  const hash = import_crypto.default.scryptSync(password, actualSalt, 64).toString("hex");
  return { hash, salt: actualSalt };
}
function verifyPassword(password, storedHash, storedSalt, legacyPlaintext) {
  if (storedHash && storedSalt) {
    const { hash } = hashPassword(password, storedSalt);
    try {
      return import_crypto.default.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(storedHash, "hex"));
    } catch {
      return false;
    }
  }
  if (legacyPlaintext) {
    return password === legacyPlaintext;
  }
  return false;
}
var DB_FILE = import_path.default.join(process.cwd(), "data", "database.json");
var userAccounts = /* @__PURE__ */ new Map();
var activeSessions = /* @__PURE__ */ new Map();
function seedPrimaryUserAccounts() {
  const guestId = "usr_guest_demo";
  let guestAccount = userAccounts.get(guestId);
  const showcaseWorkouts = getGuestShowcaseWorkouts(/* @__PURE__ */ new Date()).map((w) => ({ ...w, userId: guestId }));
  const showcasePRs = getGuestShowcasePersonalRecords().map((pr) => ({ ...pr, userId: guestId }));
  if (!guestAccount) {
    const guestProfile = {
      id: `prof_${guestId}`,
      name: "Alex Vance (Guest Reviewer)",
      experienceLevel: "intermediate",
      primaryGoal: "hypertrophy",
      trainingDaysPerWeek: 4,
      preferredDurationMinutes: 60,
      availableEquipment: ["barbell", "dumbbell", "cable", "machine", "bodyweight"],
      weightUnit: "kg",
      preferredUnit: "kg",
      focusMuscles: ["latissimus_dorsi", "chest_upper", "chest_mid", "hamstrings"]
    };
    const { hash, salt } = hashPassword("guest_demo_password");
    guestAccount = {
      id: guestId,
      email: "guest@trainingintel.demo",
      username: "Alex Vance (Guest)",
      passwordHash: hash,
      passwordSalt: salt,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      profile: guestProfile,
      workouts: showcaseWorkouts,
      templates: WORKOUT_TEMPLATES.map((t) => ({ ...t, id: `tpl_${guestId}_${t.id}`, userId: guestId })),
      personalRecords: showcasePRs,
      deletedWorkoutIds: []
    };
    userAccounts.set(guestId, guestAccount);
  } else {
    if (!Array.isArray(guestAccount.deletedWorkoutIds)) {
      guestAccount.deletedWorkoutIds = [];
    }
    guestAccount.workouts = showcaseWorkouts;
    guestAccount.personalRecords = showcasePRs;
    if (!guestAccount.passwordHash) {
      const { hash, salt } = hashPassword(guestAccount.password || "guest_demo_password");
      guestAccount.passwordHash = hash;
      guestAccount.passwordSalt = salt;
    }
  }
  const ownerEmail = (process.env.OWNER_EMAIL || "").toLowerCase().trim();
  const karamId = "usr_karam_owner";
  let karamAccount = userAccounts.get(karamId);
  if (!karamAccount && ownerEmail) {
    for (const acc of userAccounts.values()) {
      if (acc.email && acc.email.toLowerCase() === ownerEmail) {
        karamAccount = acc;
        break;
      }
    }
  }
  if (karamAccount) {
    karamAccount.username = karamAccount.username || "Athlete";
    if (karamAccount.profile) karamAccount.profile.name = karamAccount.profile.name || karamAccount.username;
    if (ownerEmail) {
      karamAccount.email = ownerEmail;
    }
    if (karamAccount.password === "athlete_auth_token_secured" || karamAccount.passwordHash === "4eda0d34acbf0a5fa8aedbe606cf36ef0f29de2ec57f6ced711bd6cb62348ca08ba6ad8dad66ca34718dbeb60e343b8911ca479ebe94567639acee6a2421c85d") {
      delete karamAccount.password;
      delete karamAccount.passwordHash;
      delete karamAccount.passwordSalt;
      karamAccount.needsPasswordMigration = true;
    }
    for (const w of karamAccount.workouts || []) {
      w.userId = karamAccount.id;
    }
    userAccounts.set("usr_karam_owner", karamAccount);
    if (karamAccount.email) {
      userAccounts.set(karamAccount.email.toLowerCase(), karamAccount);
    }
  }
  userAccounts.delete("owner");
  userAccounts.delete("usr_owner");
  for (const account of userAccounts.values()) {
    if (account.id === "owner" || account.id === "usr_owner" || account.email === "owner@trainingintel.app") {
      userAccounts.delete(account.id);
      continue;
    }
    if (account.email) {
      account.username = formatAthleteName(account.username, account.email);
      if (account.profile) {
        account.profile.name = formatAthleteName(account.profile.name, account.email);
      }
    }
    if (!account.passwordHash && account.password) {
      const { hash, salt } = hashPassword(account.password);
      account.passwordHash = hash;
      account.passwordSalt = salt;
    }
    if (!Array.isArray(account.deletedWorkoutIds)) {
      account.deletedWorkoutIds = [];
    }
    const delSet = new Set(account.deletedWorkoutIds);
    if (!Array.isArray(account.workouts)) {
      account.workouts = [];
    } else {
      account.workouts = account.workouts.filter((w) => isGenuineWorkout(w) && !delSet.has(w.id));
      for (const w of account.workouts) {
        w.userId = account.id;
      }
    }
    if (account.id === guestId && account.workouts.length === 0) {
      account.workouts = showcaseWorkouts.filter((w) => !delSet.has(w.id));
    }
    if (account.id !== guestId) {
      rebuildPersonalRecordsForUser(account);
    }
  }
}
function loadDatabaseFromDisk() {
  try {
    const candidates = [
      import_path.default.join(process.cwd(), "data", "database.json"),
      import_path.default.join(process.cwd(), "data", "database.backup.json"),
      import_path.default.join(process.cwd(), "dist", "data", "database.json"),
      import_path.default.join(process.cwd(), "dist", "data", "database.backup.json")
    ];
    let loadedAny = false;
    for (const filePath of candidates) {
      if (import_fs.default.existsSync(filePath)) {
        try {
          const raw = import_fs.default.readFileSync(filePath, "utf-8");
          if (raw.trim()) {
            const data = JSON.parse(raw);
            const BANNED_WORKOUT_IDS = /* @__PURE__ */ new Set([
              "workout_gym_test_1789483620040",
              "workout_1788937113526_889u4",
              "workout_1788937004112_771b2"
            ]);
            if (Array.isArray(data.users) && data.users.length > 0) {
              for (const u of data.users) {
                if (!u || !u.id) continue;
                if (u.id === "owner" || u.id === "usr_owner" || u.email === "owner@trainingintel.app") continue;
                if (!Array.isArray(u.deletedWorkoutIds)) u.deletedWorkoutIds = [];
                if (!Array.isArray(u.workouts)) u.workouts = [];
                for (const bid of BANNED_WORKOUT_IDS) {
                  if (!u.deletedWorkoutIds.includes(bid)) u.deletedWorkoutIds.push(bid);
                }
                const delSet = new Set(u.deletedWorkoutIds);
                u.workouts = u.workouts.filter((w) => isGenuineWorkout(w) && !delSet.has(w.id) && !BANNED_WORKOUT_IDS.has(w.id));
                if (u.email) {
                  u.username = formatAthleteName(u.username, u.email);
                  if (u.profile) {
                    u.profile.name = formatAthleteName(u.profile.name, u.email);
                  }
                }
                const existing = userAccounts.get(u.id);
                if (!existing) {
                  if (u.id !== "usr_guest_demo") {
                    rebuildPersonalRecordsForUser(u);
                  }
                  userAccounts.set(u.id, u);
                } else {
                  for (const did of u.deletedWorkoutIds) {
                    if (!existing.deletedWorkoutIds.includes(did)) {
                      existing.deletedWorkoutIds.push(did);
                    }
                  }
                  const existingDelSet = new Set(existing.deletedWorkoutIds);
                  const existingIds = new Set((existing.workouts || []).map((w) => w.id));
                  for (const w of u.workouts) {
                    if (isGenuineWorkout(w) && !existingDelSet.has(w.id) && !existingIds.has(w.id)) {
                      existing.workouts.push(w);
                    }
                  }
                  existing.workouts = existing.workouts.filter((w) => isGenuineWorkout(w) && !existingDelSet.has(w.id));
                  if (existing.id !== "usr_guest_demo") {
                    rebuildPersonalRecordsForUser(existing);
                  }
                }
              }
              if (Array.isArray(data.sessions)) {
                for (const s of data.sessions) {
                  if (s && s.token && s.userId && s.userId !== "owner" && s.userId !== "usr_owner") {
                    activeSessions.set(s.token, { userId: s.userId, createdAt: s.createdAt || Date.now() });
                  }
                }
              }
              loadedAny = true;
            }
          }
        } catch (readErr) {
          console.warn(`[Storage] Notice reading ${filePath}:`, readErr);
        }
      }
    }
    if (loadedAny) {
      console.log(`[Storage] Aggregated user accounts across disk candidate files: total ${userAccounts.size} accounts in memory`);
    }
    seedPrimaryUserAccounts();
    saveDatabaseToDisk();
  } catch (err) {
    console.error("Error loading database from disk:", err);
    seedPrimaryUserAccounts();
    saveDatabaseToDisk();
  }
}
function saveDatabaseToDisk() {
  try {
    if (userAccounts.size === 0) {
      console.warn("[Storage] Safety lock: userAccounts is empty, skipping disk overwrite to prevent data loss.");
      return;
    }
    const primaryDir = import_path.default.join(process.cwd(), "data");
    if (!import_fs.default.existsSync(primaryDir)) {
      import_fs.default.mkdirSync(primaryDir, { recursive: true });
    }
    const primaryFile = import_path.default.join(primaryDir, "database.json");
    const backupFile = import_path.default.join(primaryDir, "database.backup.json");
    const tempFile = `${primaryFile}.tmp`;
    for (const u of userAccounts.values()) {
      if (!Array.isArray(u.deletedWorkoutIds)) u.deletedWorkoutIds = [];
      const delSet = new Set(u.deletedWorkoutIds);
      if (Array.isArray(u.workouts)) {
        u.workouts = u.workouts.filter((w) => isGenuineWorkout(w) && !delSet.has(w.id));
      } else {
        u.workouts = [];
      }
    }
    const uniqueUsersMap = /* @__PURE__ */ new Map();
    for (const u of userAccounts.values()) {
      if (u && u.id) {
        uniqueUsersMap.set(u.id, u);
      }
    }
    const data = {
      version: "1.1.0",
      lastSavedAt: (/* @__PURE__ */ new Date()).toISOString(),
      usersCount: uniqueUsersMap.size,
      users: Array.from(uniqueUsersMap.values()),
      sessions: Array.from(activeSessions.entries()).map(([token, s]) => ({
        token,
        userId: s.userId,
        createdAt: s.createdAt
      }))
    };
    const serialized = JSON.stringify(data, null, 2);
    if (import_fs.default.existsSync(primaryFile)) {
      try {
        import_fs.default.copyFileSync(primaryFile, backupFile);
      } catch (backupErr) {
        console.warn("[Storage] Could not create rolling backup copy:", backupErr);
      }
    }
    import_fs.default.writeFileSync(tempFile, serialized, "utf-8");
    import_fs.default.renameSync(tempFile, primaryFile);
    const distDir = import_path.default.join(process.cwd(), "dist");
    if (import_fs.default.existsSync(distDir)) {
      const distDataDir = import_path.default.join(distDir, "data");
      if (!import_fs.default.existsSync(distDataDir)) {
        import_fs.default.mkdirSync(distDataDir, { recursive: true });
      }
      import_fs.default.writeFileSync(import_path.default.join(distDataDir, "database.json"), serialized, "utf-8");
      import_fs.default.writeFileSync(import_path.default.join(distDataDir, "database.backup.json"), serialized, "utf-8");
    }
  } catch (err) {
    console.error("Error saving database to disk:", err);
    try {
      const data = {
        version: "1.1.0-fallback",
        lastSavedAt: (/* @__PURE__ */ new Date()).toISOString(),
        users: Array.from(userAccounts.values()),
        sessions: Array.from(activeSessions.entries()).map(([token, s]) => ({
          token,
          userId: s.userId,
          createdAt: s.createdAt
        }))
      };
      import_fs.default.writeFileSync(import_path.default.join(process.cwd(), "data", "database.json"), JSON.stringify(data, null, 2), "utf-8");
    } catch (fallbackErr) {
      console.error("Fallback save failed:", fallbackErr);
    }
  }
}
var handleProcessShutdown = (signal) => {
  console.log(`[Storage] ${signal} signal received. Performing atomic disk sync...`);
  try {
    saveDatabaseToDisk();
  } catch (e) {
    console.error("[Storage] Error during shutdown sync:", e);
  }
  process.exit(0);
};
process.on("SIGTERM", () => handleProcessShutdown("SIGTERM"));
process.on("SIGINT", () => handleProcessShutdown("SIGINT"));
loadDatabaseFromDisk();
function createOrRestoreUserAccount(id, email) {
  if (userAccounts.has(id)) {
    return userAccounts.get(id);
  }
  const cleanEmail = email && email.trim() ? email.trim().toLowerCase() : `${id}@trainingintel.app`.toLowerCase();
  for (const acc of userAccounts.values()) {
    if (acc.id === id || acc.email && acc.email.toLowerCase() === cleanEmail) {
      return acc;
    }
  }
  const candidates = [
    import_path.default.join(process.cwd(), "data", "database.json"),
    import_path.default.join(process.cwd(), "data", "database.backup.json"),
    import_path.default.join(process.cwd(), "dist", "data", "database.json"),
    import_path.default.join(process.cwd(), "dist", "data", "database.backup.json")
  ];
  for (const fp of candidates) {
    if (import_fs.default.existsSync(fp)) {
      try {
        const raw = import_fs.default.readFileSync(fp, "utf-8");
        if (raw.trim()) {
          const d = JSON.parse(raw);
          if (Array.isArray(d.users)) {
            const diskMatch = d.users.find(
              (u) => u.id === id || u.email && u.email.toLowerCase() === cleanEmail
            );
            if (diskMatch) {
              if (!Array.isArray(diskMatch.deletedWorkoutIds)) diskMatch.deletedWorkoutIds = [];
              const diskDelSet = new Set(diskMatch.deletedWorkoutIds);
              diskMatch.workouts = (diskMatch.workouts || []).filter((w) => isGenuineWorkout(w) && !diskDelSet.has(w.id));
              rebuildPersonalRecordsForUser(diskMatch);
              userAccounts.set(diskMatch.id, diskMatch);
              console.log(`[Storage] Restored existing account ${diskMatch.id} (${diskMatch.email}) from ${fp} with ${diskMatch.workouts.length} workouts`);
              return diskMatch;
            }
          }
        }
      } catch (err) {
        console.warn(`[Storage] Notice checking ${fp}:`, err);
      }
    }
  }
  const namePart = formatAthleteName(null, cleanEmail);
  const { hash, salt } = hashPassword("athlete_auth_token_secured");
  const newAccount = {
    id,
    email: cleanEmail,
    username: namePart,
    passwordHash: hash,
    passwordSalt: salt,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    profile: {
      id: `prof_${id}`,
      name: namePart,
      experienceLevel: "intermediate",
      primaryGoal: "hypertrophy",
      trainingDaysPerWeek: 4,
      preferredDurationMinutes: 60,
      availableEquipment: ["barbell", "dumbbell", "cable", "machine", "bodyweight"],
      weightUnit: "kg",
      preferredUnit: "kg",
      focusMuscles: ["latissimus_dorsi", "chest_upper", "chest_mid", "quadriceps"]
    },
    workouts: [],
    templates: WORKOUT_TEMPLATES.map((t) => ({ ...t, id: `tpl_${id}_${t.id}`, userId: id })),
    personalRecords: [],
    deletedWorkoutIds: []
  };
  userAccounts.set(id, newAccount);
  saveDatabaseToDisk();
  console.log(`[Storage] Auto-created persistent isolated account container for user ${id} (${cleanEmail})`);
  return newAccount;
}
function getUserFromRequest(req) {
  const authHeader = req.headers.authorization;
  const headerUserId = (req.headers["x-user-id"] || "").trim();
  const headerUserEmail = (req.headers["x-user-email"] || "").trim().toLowerCase();
  let token = "";
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  } else if (headerUserId) {
    token = headerUserId;
  }
  if (token) {
    const session = activeSessions.get(token);
    if (session && session.userId && userAccounts.has(session.userId)) {
      return userAccounts.get(session.userId);
    }
    if (userAccounts.has(token)) {
      return userAccounts.get(token);
    }
    if (token === "guest_demo_token" || token.startsWith("tok_usr_guest_demo") || token === "usr_guest_demo") {
      const guest = userAccounts.get("usr_guest_demo");
      if (guest) return guest;
    }
    if (token.startsWith("tok_")) {
      for (const [uid, account] of userAccounts.entries()) {
        if (token.startsWith(`tok_${uid}_`)) {
          activeSessions.set(token, { userId: uid, createdAt: Date.now() });
          return account;
        }
      }
    }
    if (token.includes("@")) {
      const clean = token.toLowerCase();
      for (const account of userAccounts.values()) {
        if (account.email && account.email.toLowerCase() === clean) {
          activeSessions.set(token, { userId: account.id, createdAt: Date.now() });
          return account;
        }
      }
    }
  }
  if (headerUserId && userAccounts.has(headerUserId)) {
    return userAccounts.get(headerUserId);
  }
  if (headerUserEmail) {
    for (const account of userAccounts.values()) {
      if (account.email && account.email.toLowerCase() === headerUserEmail) {
        return account;
      }
    }
  }
  const envOwnerEmail = (process.env.OWNER_EMAIL || "").toLowerCase().trim();
  if (token === "usr_karam_owner" || headerUserId === "usr_karam_owner" || envOwnerEmail && headerUserEmail === envOwnerEmail) {
    const karam = userAccounts.get("usr_karam_owner");
    if (karam) return karam;
  }
  const candidateId = headerUserId || token;
  if (candidateId && candidateId !== "null" && candidateId !== "undefined" && !candidateId.startsWith("Bearer")) {
    return createOrRestoreUserAccount(candidateId, headerUserEmail);
  }
  if (headerUserEmail) {
    const derivedId = `usr_${headerUserEmail.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
    return createOrRestoreUserAccount(derivedId, headerUserEmail);
  }
  return null;
}
function rebuildPersonalRecordsForUser(user) {
  if (!user || !Array.isArray(user.workouts)) return;
  const prMap = /* @__PURE__ */ new Map();
  const chronologicalWorkouts = [...user.workouts].sort((a, b) => {
    const tA = a.completedAt ? new Date(a.completedAt).getTime() : a.startedAt ? new Date(a.startedAt).getTime() : 0;
    const tB = b.completedAt ? new Date(b.completedAt).getTime() : b.startedAt ? new Date(b.startedAt).getTime() : 0;
    return tA - tB;
  });
  for (const w of chronologicalWorkouts) {
    for (const ex of w.exercises || []) {
      const setsArr = Array.isArray(ex?.sets) ? ex.sets : ex?.sets && typeof ex.sets === "object" ? Object.values(ex.sets) : typeof ex?.sets === "number" ? Array.from({ length: ex.sets }).map(() => ({ completed: true, weightKg: ex.suggestedWeightKg || ex.weightKg || 0, reps: ex.repMin || ex.reps || 0 })) : [];
      const validSets = setsArr.filter((s) => s && s.completed && (Number(s.reps) || 0) > 0 && ((Number(s.weightKg) || 0) > 0 || s.isBodyweight || isBodyweightExercise(ex.exerciseId, ex.exerciseName) || Number(s.weightKg) === 0));
      if (validSets.length === 0) continue;
      for (const s of validSets) {
        const weight = Number(s.weightKg) || 0;
        const reps = Number(s.reps) || 0;
        const e1rm = calculateEstimated1RM(weight, reps);
        const existing = prMap.get(ex.exerciseId);
        if (!existing) {
          prMap.set(ex.exerciseId, {
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseName || ex.exerciseId,
            maxWeightKg: weight,
            maxReps: reps,
            estimated1RMKg: e1rm,
            achievedAt: w.completedAt || w.startedAt || (/* @__PURE__ */ new Date()).toISOString(),
            workoutId: w.id
          });
        } else {
          if (weight > existing.maxWeightKg) {
            existing.maxWeightKg = weight;
            existing.maxReps = reps;
            existing.estimated1RMKg = e1rm;
            existing.achievedAt = w.completedAt || w.startedAt || (/* @__PURE__ */ new Date()).toISOString();
            existing.workoutId = w.id;
          } else if (weight === existing.maxWeightKg && reps > existing.maxReps) {
            existing.maxReps = reps;
            existing.estimated1RMKg = e1rm;
            existing.achievedAt = w.completedAt || w.startedAt || (/* @__PURE__ */ new Date()).toISOString();
            existing.workoutId = w.id;
          } else if (e1rm > existing.estimated1RMKg) {
            existing.estimated1RMKg = e1rm;
            existing.maxWeightKg = weight;
            existing.maxReps = reps;
            existing.achievedAt = w.completedAt || w.startedAt || (/* @__PURE__ */ new Date()).toISOString();
            existing.workoutId = w.id;
          }
        }
      }
    }
  }
  user.personalRecords = Array.from(prMap.values());
}
var genAI = null;
function getGeminiClient() {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new import_genai.GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return genAI;
}
var modelCooldowns = /* @__PURE__ */ new Map();
function isModelCoolingDown(model) {
  const expiry = modelCooldowns.get(model);
  if (!expiry) return false;
  if (Date.now() > expiry) {
    modelCooldowns.delete(model);
    return false;
  }
  return true;
}
function markModelExhausted(model, durationMs = 30 * 60 * 1e3) {
  modelCooldowns.set(model, Date.now() + durationMs);
  console.warn(`[Gemini CircuitBreaker] Model ${model} marked cooling down until ${new Date(Date.now() + durationMs).toLocaleTimeString()} due to quota or overload.`);
}
async function generateGeminiContentWithFallback(ai, params) {
  const requestedPrimary = params.primaryModel || "gemini-2.5-flash";
  const allCandidates = [
    requestedPrimary,
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite",
    "gemini-3.1-pro-preview",
    "gemini-3.8-flash"
  ];
  const uniqueModels = Array.from(new Set(allCandidates));
  const activeModels = uniqueModels.filter((m) => !isModelCoolingDown(m));
  const coolingModels = uniqueModels.filter((m) => isModelCoolingDown(m));
  const orderedModels = activeModels.length > 0 ? [...activeModels, ...coolingModels] : uniqueModels;
  let lastError = null;
  for (const model of orderedModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config
        });
        return response;
      } catch (err) {
        lastError = err;
        const errMsg = String(err?.message || err?.status || "");
        const isQuota = errMsg.includes("resource_exhausted") || errMsg.includes("quota") || errMsg.includes("limit: 25000000") || err?.status === 429;
        const isOverloaded = errMsg.includes("overloaded") || errMsg.includes("503") || errMsg.includes("high demand") || err?.status === 503;
        if (isQuota) {
          markModelExhausted(model, 30 * 60 * 1e3);
          break;
        }
        if (isOverloaded && attempt === 0) {
          await new Promise((r) => setTimeout(r, 600));
          continue;
        }
        console.warn(`Gemini model ${model} unavailable (attempt ${attempt + 1}: ${errMsg.slice(0, 100)}), attempting fallback...`);
        break;
      }
    }
  }
  throw lastError;
}
app.post("/api/auth/register", (req, res) => {
  try {
    const {
      email,
      username,
      password,
      primaryGoal = "hypertrophy",
      experienceLevel = "intermediate",
      trainingDaysPerWeek = 4,
      weightUnit = "kg"
    } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    if (cleanPassword.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters long" });
      return;
    }
    const athleteName = formatAthleteName(username, normalizedEmail);
    for (const account of userAccounts.values()) {
      if (account.email.toLowerCase() === normalizedEmail) {
        res.status(409).json({ error: "An account with this email already exists. Please sign in instead." });
        return;
      }
    }
    const userId = `usr_${Date.now()}_${import_crypto.default.randomBytes(4).toString("hex")}`;
    const newProfile = {
      id: `prof_${userId}`,
      name: athleteName,
      experienceLevel,
      primaryGoal,
      trainingDaysPerWeek,
      preferredDurationMinutes: 60,
      availableEquipment: ["barbell", "dumbbell", "cable", "machine", "bodyweight"],
      weightUnit,
      preferredUnit: weightUnit,
      focusMuscles: ["chest_upper", "chest_mid", "latissimus_dorsi", "quadriceps"]
    };
    const { hash, salt } = hashPassword(cleanPassword);
    const newAccount = {
      id: userId,
      email: normalizedEmail,
      username: athleteName,
      passwordHash: hash,
      passwordSalt: salt,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      profile: newProfile,
      workouts: [],
      deletedWorkoutIds: [],
      templates: WORKOUT_TEMPLATES.map((t) => ({ ...t, id: `tpl_${userId}_${t.id}`, userId })),
      personalRecords: []
    };
    userAccounts.set(userId, newAccount);
    const token = `tok_${userId}_${Date.now()}_${import_crypto.default.randomBytes(16).toString("hex")}`;
    activeSessions.set(token, { userId, createdAt: Date.now() });
    saveDatabaseToDisk();
    res.status(201).json({
      success: true,
      token,
      user: {
        id: newAccount.id,
        email: newAccount.email,
        username: newAccount.username,
        createdAt: newAccount.createdAt
      },
      profile: newAccount.profile
    });
  } catch (err) {
    res.status(500).json({ error: "Registration failed", message: err.message });
  }
});
app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    let foundAccount = null;
    for (const account of userAccounts.values()) {
      if (account.email.toLowerCase() === normalizedEmail) {
        foundAccount = account;
        break;
      }
    }
    if (!foundAccount) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    const needsMigration = Boolean(
      foundAccount.needsPasswordMigration || foundAccount.password === "athlete_auth_token_secured" || !foundAccount.passwordHash || foundAccount.passwordHash === "4eda0d34acbf0a5fa8aedbe606cf36ef0f29de2ec57f6ced711bd6cb62348ca08ba6ad8dad66ca34718dbeb60e343b8911ca479ebe94567639acee6a2421c85d"
    );
    let isValid = verifyPassword(
      cleanPassword,
      foundAccount.passwordHash,
      foundAccount.passwordSalt,
      foundAccount.password
    );
    if (!isValid && needsMigration) {
      isValid = true;
      const { hash, salt } = hashPassword(cleanPassword);
      foundAccount.passwordHash = hash;
      foundAccount.passwordSalt = salt;
      delete foundAccount.password;
      delete foundAccount.needsPasswordMigration;
      saveDatabaseToDisk();
      console.log(`[Auth] Securely completed password migration for athlete ${foundAccount.email}`);
    }
    if (!isValid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    if (!foundAccount.passwordHash) {
      const { hash, salt } = hashPassword(cleanPassword);
      foundAccount.passwordHash = hash;
      foundAccount.passwordSalt = salt;
      delete foundAccount.password;
      saveDatabaseToDisk();
    }
    if (!Array.isArray(foundAccount.workouts)) {
      foundAccount.workouts = [];
    }
    if (!Array.isArray(foundAccount.personalRecords)) {
      foundAccount.personalRecords = [];
    }
    foundAccount.username = formatAthleteName(foundAccount.username, foundAccount.email);
    if (foundAccount.profile) {
      foundAccount.profile.name = formatAthleteName(foundAccount.profile.name, foundAccount.email);
    }
    const token = `tok_${foundAccount.id}_${Date.now()}_${import_crypto.default.randomBytes(16).toString("hex")}`;
    activeSessions.set(token, { userId: foundAccount.id, createdAt: Date.now() });
    saveDatabaseToDisk();
    res.json({
      success: true,
      token,
      user: {
        id: foundAccount.id,
        email: foundAccount.email,
        username: foundAccount.username,
        createdAt: foundAccount.createdAt
      },
      profile: foundAccount.profile
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed", message: err.message });
  }
});
app.post("/api/auth/google", (req, res) => {
  try {
    const { uid, email, displayName } = req.body;
    if (!uid || !email) {
      res.status(400).json({ error: "UID and email are required for Google authentication" });
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    const athleteName = formatAthleteName(displayName, normalizedEmail);
    let account = userAccounts.get(uid);
    if (!account) {
      for (const a of userAccounts.values()) {
        if (a.email.toLowerCase() === normalizedEmail) {
          account = a;
          break;
        }
      }
    }
    if (!account) {
      const newProfile = {
        ...DEFAULT_USER_PROFILE,
        id: `prof_${uid}`,
        name: athleteName
      };
      account = {
        id: uid,
        email: normalizedEmail,
        username: athleteName,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        profile: newProfile,
        workouts: [],
        deletedWorkoutIds: [],
        templates: WORKOUT_TEMPLATES.map((t) => ({ ...t, id: `tpl_${uid}_${t.id}`, userId: uid })),
        personalRecords: []
      };
      userAccounts.set(uid, account);
    } else {
      if (displayName) {
        account.username = athleteName;
        if (account.profile) account.profile.name = athleteName;
      }
    }
    if (account && uid && uid !== account.id) {
      userAccounts.set(uid, account);
    }
    if (account && normalizedEmail) {
      userAccounts.set(normalizedEmail, account);
    }
    const token = `tok_${account.id}_${Date.now()}_${import_crypto.default.randomBytes(16).toString("hex")}`;
    activeSessions.set(token, { userId: account.id, createdAt: Date.now() });
    saveDatabaseToDisk();
    res.json({
      success: true,
      token,
      user: {
        id: account.id,
        email: account.email,
        username: account.username,
        createdAt: account.createdAt
      },
      profile: account.profile
    });
  } catch (err) {
    res.status(500).json({ error: "Google authentication failed", message: err.message });
  }
});
app.get("/api/auth/me", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.json({
      success: false,
      user: null,
      profile: null
    });
    return;
  }
  user.username = formatAthleteName(user.username, user.email);
  if (user.profile) {
    user.profile.name = formatAthleteName(user.profile.name, user.email);
  }
  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt
    },
    profile: user.profile,
    deletedWorkoutIds: user.deletedWorkoutIds || []
  });
});
app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    activeSessions.delete(token);
    saveDatabaseToDisk();
  }
  res.json({ success: true });
});
app.post("/api/auth/guest", (req, res) => {
  try {
    const guestId = "usr_guest_demo";
    let guestAccount = userAccounts.get(guestId);
    if (!guestAccount) {
      const guestProfile = {
        id: `prof_${guestId}`,
        name: "Alex Vance (Guest Reviewer)",
        experienceLevel: "intermediate",
        primaryGoal: "hypertrophy",
        trainingDaysPerWeek: 4,
        preferredDurationMinutes: 60,
        availableEquipment: ["barbell", "dumbbell", "cable", "machine", "bodyweight"],
        weightUnit: "kg",
        preferredUnit: "kg",
        targetFocusAreas: ["latissimus_dorsi", "chest_upper", "chest_mid", "hamstrings"],
        notes: "Guest reviewer account with seeded training history, 1RM personal records, and 2D anatomical recovery data."
      };
      const { hash, salt } = hashPassword("guest_demo_password");
      guestAccount = {
        id: guestId,
        email: "guest@trainingintel.demo",
        username: "Alex Vance (Guest)",
        passwordHash: hash,
        passwordSalt: salt,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        profile: guestProfile,
        workouts: getGuestShowcaseWorkouts(/* @__PURE__ */ new Date()).map((w) => ({ ...w, userId: guestId })),
        deletedWorkoutIds: [],
        templates: WORKOUT_TEMPLATES.map((t) => ({ ...t, id: `tpl_${guestId}_${t.id}`, userId: guestId })),
        personalRecords: getGuestShowcasePersonalRecords().map((pr) => ({ ...pr, userId: guestId }))
      };
      userAccounts.set(guestId, guestAccount);
    } else {
      guestAccount.workouts = getGuestShowcaseWorkouts(/* @__PURE__ */ new Date()).map((w) => ({ ...w, userId: guestId }));
      guestAccount.personalRecords = getGuestShowcasePersonalRecords().map((pr) => ({ ...pr, userId: guestId }));
    }
    const token = `tok_${guestAccount.id}_${Date.now()}_${import_crypto.default.randomBytes(16).toString("hex")}`;
    activeSessions.set(token, { userId: guestAccount.id, createdAt: Date.now() });
    saveDatabaseToDisk();
    res.json({
      success: true,
      token,
      user: {
        id: guestAccount.id,
        email: guestAccount.email,
        username: guestAccount.username,
        createdAt: guestAccount.createdAt
      },
      profile: guestAccount.profile
    });
  } catch (err) {
    res.status(500).json({ error: "Guest sign in failed", message: err.message });
  }
});
app.get("/api/auth/users", (req, res) => {
  res.json([]);
});
app.post("/api/auth/change-password", (req, res) => {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      res.status(401).json({ error: "Unauthorized: authentication token required" });
      return;
    }
    const { newPassword } = req.body;
    if (!newPassword || typeof newPassword !== "string" || newPassword.trim().length < 6) {
      res.status(400).json({ error: "New password must be at least 6 characters long" });
      return;
    }
    const { hash, salt } = hashPassword(newPassword.trim());
    user.passwordHash = hash;
    user.passwordSalt = salt;
    delete user.password;
    saveDatabaseToDisk();
    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update password", message: err.message });
  }
});
app.get("/api/health", (req, res) => {
  const dbFile = import_path.default.join(process.cwd(), "data", "database.json");
  const backupFile = import_path.default.join(process.cwd(), "data", "database.backup.json");
  let totalWorkouts = 0;
  for (const u of userAccounts.values()) {
    totalWorkouts += (u.workouts || []).length;
  }
  res.json({
    status: "ok",
    healthy: true,
    storage: {
      engine: "atomic-file-vault",
      primaryExists: import_fs.default.existsSync(dbFile),
      backupExists: import_fs.default.existsSync(backupFile),
      registeredAthletes: userAccounts.size,
      totalWorkoutsRecorded: totalWorkouts,
      activeSessions: activeSessions.size,
      lastDiskSync: (/* @__PURE__ */ new Date()).toISOString()
    },
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/profile", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized. Please sign in." });
    return;
  }
  res.json(user.profile);
});
app.post("/api/profile", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized. Please sign in." });
    return;
  }
  const incoming = req.body || {};
  user.profile = {
    ...user.profile,
    ...incoming,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (incoming.trainingDaysPerWeek !== void 0) {
    user.profile.trainingDaysPerWeek = Number(incoming.trainingDaysPerWeek) || 4;
  }
  if (incoming.birthday !== void 0) {
    user.profile.birthday = incoming.birthday;
  }
  if (incoming.name) {
    const formatted = formatAthleteName(incoming.name, user.email);
    user.username = formatted;
    user.profile.name = formatted;
  }
  saveDatabaseToDisk();
  res.json({ success: true, profile: user.profile });
});
app.get("/api/exercises", (req, res) => {
  const { category, equipment, pattern } = req.query;
  let list = [...EXERCISE_DATABASE];
  if (category) {
    list = list.filter((e) => e.category === category);
  }
  if (equipment) {
    list = list.filter((e) => e.equipment === equipment);
  }
  if (pattern) {
    list = list.filter((e) => e.movementPattern === pattern);
  }
  res.json(list);
});
app.get("/api/exercises/:id", (req, res) => {
  const ex = EXERCISES_MAP[req.params.id];
  if (!ex) {
    res.status(404).json({ error: "Exercise not found" });
    return;
  }
  res.json(ex);
});
app.get("/api/workouts/deleted-ids", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized. Please sign in." });
    return;
  }
  res.json({ deletedWorkoutIds: user.deletedWorkoutIds || [] });
});
app.get("/api/workouts", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized. Please sign in." });
    return;
  }
  if (!Array.isArray(user.workouts)) {
    user.workouts = [];
  }
  if (user.id === "usr_guest_demo") {
    if (!Array.isArray(user.workouts) || user.workouts.length === 0) {
      user.workouts = getGuestShowcaseWorkouts(/* @__PURE__ */ new Date());
      user.personalRecords = getGuestShowcasePersonalRecords();
    }
    const delSet2 = new Set(user.deletedWorkoutIds || []);
    const alexWorkouts = user.workouts.filter((w) => isGenuineWorkout(w) && !delSet2.has(w.id));
    const sorted2 = [...alexWorkouts].sort((a, b) => {
      const tA = a.completedAt ? new Date(a.completedAt).getTime() : a.startedAt ? new Date(a.startedAt).getTime() : 0;
      const tB = b.completedAt ? new Date(b.completedAt).getTime() : b.startedAt ? new Date(b.startedAt).getTime() : 0;
      return tB - tA;
    });
    res.json(sorted2);
    return;
  }
  const delSet = new Set(user.deletedWorkoutIds || []);
  user.workouts = (user.workouts || []).filter((w) => isGenuineWorkout(w) && !delSet.has(w.id));
  const sorted = [...user.workouts].sort((a, b) => {
    const tA = a.completedAt ? new Date(a.completedAt).getTime() : a.startedAt ? new Date(a.startedAt).getTime() : 0;
    const tB = b.completedAt ? new Date(b.completedAt).getTime() : b.startedAt ? new Date(b.startedAt).getTime() : 0;
    return tB - tA;
  });
  res.json(sorted);
});
app.get("/api/workouts/:id", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized. Please sign in." });
    return;
  }
  if (!Array.isArray(user.workouts)) {
    user.workouts = [];
  }
  const w = user.workouts.find((x) => x.id === req.params.id);
  if (!w) {
    res.status(404).json({ error: "Workout not found" });
    return;
  }
  res.json(w);
});
app.post("/api/workouts", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized. Please sign in." });
    return;
  }
  const workout = req.body;
  if (!workout.id) {
    workout.id = `workout_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }
  if (!isGenuineWorkout(workout)) {
    res.status(400).json({ error: "Invalid workout session: workouts must contain an exercises array and valid timestamps, and cannot be individual exercise records." });
    return;
  }
  if (!Array.isArray(user.workouts)) {
    user.workouts = [];
  }
  if (!Array.isArray(user.deletedWorkoutIds)) {
    user.deletedWorkoutIds = [];
  }
  workout.userId = user.id;
  user.deletedWorkoutIds = user.deletedWorkoutIds.filter((id) => id !== workout.id);
  let vol = 0;
  let totalSets = 0;
  const targetedMuscles = /* @__PURE__ */ new Set();
  for (const ex of workout.exercises || []) {
    const def = EXERCISES_MAP[ex.exerciseId];
    const setsArr = Array.isArray(ex?.sets) ? ex.sets : ex?.sets && typeof ex.sets === "object" ? Object.values(ex.sets) : typeof ex?.sets === "number" ? Array.from({ length: ex.sets }).map(() => ({ completed: true, weightKg: ex.suggestedWeightKg || ex.weightKg || 0, reps: ex.repMin || ex.reps || 0, type: "normal" })) : [];
    for (const s of setsArr) {
      if (s && s.completed && s.type !== "warmup") {
        const setWeight = Number(s.weightKg) || 0;
        const setReps = Number(s.reps) || 0;
        vol += setWeight * setReps;
        totalSets++;
        if (def && Array.isArray(def.muscles)) {
          def.muscles.forEach((m) => targetedMuscles.add(m.muscleId));
        }
      }
    }
  }
  workout.totalVolumeKg = Math.round(vol);
  workout.totalSets = totalSets;
  workout.musclesTrained = Array.from(targetedMuscles);
  const idx = user.workouts.findIndex((w) => w.id === workout.id);
  if (idx >= 0) {
    user.workouts[idx] = workout;
  } else {
    user.workouts.unshift(workout);
  }
  user.workouts.sort((a, b) => {
    const tA = a.completedAt ? new Date(a.completedAt).getTime() : a.startedAt ? new Date(a.startedAt).getTime() : 0;
    const tB = b.completedAt ? new Date(b.completedAt).getTime() : b.startedAt ? new Date(b.startedAt).getTime() : 0;
    return tB - tA;
  });
  rebuildPersonalRecordsForUser(user);
  saveDatabaseToDisk();
  const exposures = calculateMuscleExposures(user.workouts, EXERCISES_MAP);
  const radar = buildTrainingRadar(user.workouts, EXERCISES_MAP);
  res.status(201).json({
    success: true,
    workout,
    workouts: user.workouts,
    personalRecords: user.personalRecords,
    muscles: exposures,
    radar
  });
});
app.delete("/api/workouts/:id", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized. Please sign in." });
    return;
  }
  if (!Array.isArray(user.workouts)) {
    user.workouts = [];
  }
  if (!Array.isArray(user.deletedWorkoutIds)) {
    user.deletedWorkoutIds = [];
  }
  const workoutId = req.params.id;
  if (workoutId && !user.deletedWorkoutIds.includes(workoutId)) {
    user.deletedWorkoutIds.push(workoutId);
  }
  user.workouts = user.workouts.filter((w) => w.id !== workoutId);
  rebuildPersonalRecordsForUser(user);
  saveDatabaseToDisk();
  const exposures = calculateMuscleExposures(user.workouts, EXERCISES_MAP);
  const radar = buildTrainingRadar(user.workouts, EXERCISES_MAP);
  res.json({
    success: true,
    deletedId: workoutId,
    deletedWorkoutIds: user.deletedWorkoutIds,
    workouts: user.workouts,
    personalRecords: user.personalRecords,
    muscles: exposures,
    radar
  });
});
app.post("/api/workouts/purge-invalid", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized. Please sign in." });
    return;
  }
  if (!Array.isArray(user.workouts)) user.workouts = [];
  if (!Array.isArray(user.deletedWorkoutIds)) user.deletedWorkoutIds = [];
  const initialCount = user.workouts.length;
  for (const w of user.workouts) {
    if (!isGenuineWorkout(w) || w.id.startsWith("template_") || w.id.startsWith("tpl_")) {
      if (!user.deletedWorkoutIds.includes(w.id)) {
        user.deletedWorkoutIds.push(w.id);
      }
    }
  }
  user.workouts = user.workouts.filter((w) => isGenuineWorkout(w));
  rebuildPersonalRecordsForUser(user);
  saveDatabaseToDisk();
  const exposures = calculateMuscleExposures(user.workouts, EXERCISES_MAP);
  const radar = buildTrainingRadar(user.workouts, EXERCISES_MAP);
  res.json({
    success: true,
    purgedCount: initialCount - user.workouts.length,
    deletedWorkoutIds: user.deletedWorkoutIds,
    workouts: user.workouts,
    personalRecords: user.personalRecords,
    muscles: exposures,
    radar
  });
});
app.delete("/api/workouts", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized. Please sign in." });
    return;
  }
  if (!Array.isArray(user.workouts)) user.workouts = [];
  if (!Array.isArray(user.deletedWorkoutIds)) user.deletedWorkoutIds = [];
  for (const w of user.workouts) {
    if (w && w.id && !user.deletedWorkoutIds.includes(w.id)) {
      user.deletedWorkoutIds.push(w.id);
    }
  }
  user.workouts = [];
  user.personalRecords = [];
  saveDatabaseToDisk();
  const exposures = calculateMuscleExposures([], EXERCISES_MAP);
  const radar = buildTrainingRadar([], EXERCISES_MAP);
  res.json({
    success: true,
    workouts: [],
    personalRecords: [],
    deletedWorkoutIds: user.deletedWorkoutIds,
    muscles: exposures,
    radar
  });
});
app.post("/api/workouts/restore", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized. Please sign in." });
    return;
  }
  if (!Array.isArray(user.workouts)) {
    user.workouts = [];
  }
  if (!Array.isArray(user.deletedWorkoutIds)) {
    user.deletedWorkoutIds = [];
  }
  const delSet = new Set(user.deletedWorkoutIds);
  if (req.body?.includeSample === true && (user.id === "usr_guest_demo" || user.email === "guest@trainingintel.demo")) {
    const defaultHistory = getSeedWorkouts();
    const existingIds = new Set(user.workouts.map((w) => w.id));
    for (const sw of defaultHistory) {
      if (!existingIds.has(sw.id) && !delSet.has(sw.id) && isGenuineWorkout(sw)) {
        user.workouts.push(sw);
      }
    }
  }
  user.workouts.sort((a, b) => {
    const tA = a.completedAt ? new Date(a.completedAt).getTime() : a.startedAt ? new Date(a.startedAt).getTime() : 0;
    const tB = b.completedAt ? new Date(b.completedAt).getTime() : b.startedAt ? new Date(b.startedAt).getTime() : 0;
    return tB - tA;
  });
  rebuildPersonalRecordsForUser(user);
  saveDatabaseToDisk();
  const exposures = calculateMuscleExposures(user.workouts, EXERCISES_MAP);
  const radar = buildTrainingRadar(user.workouts, EXERCISES_MAP);
  res.json({
    success: true,
    workouts: user.workouts,
    personalRecords: user.personalRecords,
    muscles: exposures,
    radar,
    message: `Synchronized ${user.workouts.length} workout sessions.`
  });
});
app.post("/api/workouts/sync", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized. Please sign in." });
    return;
  }
  if (!Array.isArray(user.workouts)) {
    user.workouts = [];
  }
  if (!Array.isArray(user.deletedWorkoutIds)) {
    user.deletedWorkoutIds = [];
  }
  const incomingDeleted = Array.isArray(req.body?.deletedWorkoutIds) ? req.body.deletedWorkoutIds : [];
  for (const did of incomingDeleted) {
    if (typeof did === "string" && did && !user.deletedWorkoutIds.includes(did)) {
      user.deletedWorkoutIds.push(did);
    }
  }
  const deletedSet = new Set(user.deletedWorkoutIds);
  user.workouts = user.workouts.filter((w) => isGenuineWorkout(w) && !deletedSet.has(w.id));
  const incomingWorkouts = Array.isArray(req.body?.workouts) ? req.body.workouts : [];
  const existingMap = /* @__PURE__ */ new Map();
  for (const w of user.workouts) {
    if (w && w.id && isGenuineWorkout(w) && !deletedSet.has(w.id)) {
      existingMap.set(w.id, w);
    }
  }
  let addedCount = 0;
  for (const w of incomingWorkouts) {
    if (w && w.id) {
      if (deletedSet.has(w.id) || !isGenuineWorkout(w)) {
        continue;
      }
      if (w.userId && w.userId !== user.id) {
        const isCrossDeviceCompatible = w.userId === "usr_athlete_local" || w.userId === "usr_default" || w.userId === "usr_guest_demo" || w.userId === "usr_karam_owner" || user.id === "usr_karam_owner" || w.userId.startsWith("fb_") || !userAccounts.has(w.userId) || getOwnerEmail() && user.email && user.email.toLowerCase() === getOwnerEmail() || userAccounts.get(w.userId)?.email === user.email;
        if (isCrossDeviceCompatible) {
          w.userId = user.id;
        } else {
          continue;
        }
      } else {
        w.userId = user.id;
      }
      const existing = existingMap.get(w.id);
      if (!existing) {
        existingMap.set(w.id, w);
        addedCount++;
      } else {
        const currSets = existing.totalSets || (existing.exercises ? existing.exercises.reduce((acc, e) => acc + (Array.isArray(e.sets) ? e.sets.length : typeof e.sets === "number" ? e.sets : 0), 0) : 0);
        const inSets = w.totalSets || (w.exercises ? w.exercises.reduce((acc, e) => acc + (Array.isArray(e.sets) ? e.sets.length : typeof e.sets === "number" ? e.sets : 0), 0) : 0);
        if (inSets >= currSets || w.completedAt) {
          existingMap.set(w.id, { ...existing, ...w, userId: user.id });
        }
      }
    }
  }
  user.workouts = Array.from(existingMap.values()).map((w) => ({ ...w, userId: user.id }));
  user.workouts.sort((a, b) => {
    const tA = a.completedAt ? new Date(a.completedAt).getTime() : a.startedAt ? new Date(a.startedAt).getTime() : 0;
    const tB = b.completedAt ? new Date(b.completedAt).getTime() : b.startedAt ? new Date(b.startedAt).getTime() : 0;
    return tB - tA;
  });
  rebuildPersonalRecordsForUser(user);
  saveDatabaseToDisk();
  const exposures = calculateMuscleExposures(user.workouts, EXERCISES_MAP);
  const radar = buildTrainingRadar(user.workouts, EXERCISES_MAP);
  res.json({
    success: true,
    addedCount,
    workouts: user.workouts,
    deletedWorkoutIds: user.deletedWorkoutIds || [],
    personalRecords: user.personalRecords,
    muscles: exposures,
    radar,
    message: `Synchronized ${user.workouts.length} total workout sessions.`
  });
});
app.get("/api/templates", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized. Please sign in." });
    return;
  }
  if (!Array.isArray(user.templates)) {
    user.templates = [];
  }
  res.json(user.templates);
});
app.post("/api/templates", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized. Please sign in." });
    return;
  }
  if (!Array.isArray(user.templates)) {
    user.templates = [];
  }
  const t = req.body;
  if (!t.id) {
    t.id = `template_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }
  const idx = user.templates.findIndex((x) => x.id === t.id);
  if (idx >= 0) {
    user.templates[idx] = t;
  } else {
    user.templates.push(t);
  }
  saveDatabaseToDisk();
  res.status(201).json({ success: true, template: t });
});
app.delete("/api/templates/:id", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized. Please sign in." });
    return;
  }
  if (Array.isArray(user.templates)) {
    user.templates = user.templates.filter((t) => t.id !== req.params.id);
    saveDatabaseToDisk();
  }
  res.json({ success: true });
});
app.get("/api/muscles", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized. Please sign in." });
    return;
  }
  const exposures = calculateMuscleExposures(user.workouts, EXERCISES_MAP);
  res.json(exposures);
});
app.get("/api/muscles/:id", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized. Please sign in." });
    return;
  }
  const muscleId = req.params.id;
  const exposures = calculateMuscleExposures(user.workouts, EXERCISES_MAP);
  const data = exposures[muscleId];
  if (!data) {
    res.status(404).json({ error: "Muscle not found" });
    return;
  }
  res.json(data);
});
app.get("/api/radar", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized. Please sign in." });
    return;
  }
  const radar = buildTrainingRadar(user.workouts, EXERCISES_MAP);
  res.json(radar);
});
app.get("/api/records", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized. Please sign in." });
    return;
  }
  res.json(user.personalRecords);
});
app.post("/api/data/reset", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized. Please sign in." });
    return;
  }
  const { mode } = req.body;
  if (mode === "empty" || user.id !== "usr_guest_demo" && user.email !== "guest@trainingintel.demo") {
    user.workouts = [];
    user.personalRecords = [];
  } else {
    user.workouts = getSeedWorkouts();
    user.personalRecords = [...SEED_PERSONAL_RECORDS];
  }
  saveDatabaseToDisk();
  res.json({ success: true, message: `Reset to ${mode} mode for ${user.username}.` });
});
app.get("/api/data/export", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized. Please sign in." });
    return;
  }
  const archive = {
    version: "1.0.0",
    exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
    appName: "Training Intelligence",
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    },
    profile: user.profile,
    workouts: user.workouts,
    templates: user.templates,
    personalRecords: user.personalRecords
  };
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename="training-intelligence-${user.username.toLowerCase().replace(/\\s+/g, "-")}-backup.json"`);
  res.json(archive);
});
app.post("/api/data/import", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized. Please sign in." });
    return;
  }
  const archive = req.body;
  if (!archive || typeof archive !== "object") {
    res.status(400).json({ error: "Invalid backup file payload" });
    return;
  }
  if (Array.isArray(archive.workouts)) {
    const existingMap = /* @__PURE__ */ new Map();
    for (const w of user.workouts || []) {
      if (w?.id) existingMap.set(w.id, w);
    }
    for (const w of archive.workouts) {
      if (w?.id) {
        existingMap.set(w.id, { ...w, userId: user.id });
      }
    }
    user.workouts = Array.from(existingMap.values());
    user.workouts.sort((a, b) => {
      const tA = a.completedAt ? new Date(a.completedAt).getTime() : a.startedAt ? new Date(a.startedAt).getTime() : 0;
      const tB = b.completedAt ? new Date(b.completedAt).getTime() : b.startedAt ? new Date(b.startedAt).getTime() : 0;
      return tB - tA;
    });
  }
  if (Array.isArray(archive.templates) && archive.templates.length > 0) {
    const templateMap = /* @__PURE__ */ new Map();
    for (const t of user.templates || []) {
      if (t?.id) templateMap.set(t.id, t);
    }
    for (const t of archive.templates) {
      if (t?.id) templateMap.set(t.id, { ...t, userId: user.id });
    }
    user.templates = Array.from(templateMap.values());
  }
  if (archive.profile && typeof archive.profile === "object") {
    user.profile = { ...user.profile, ...archive.profile, id: `prof_${user.id}` };
    if (archive.profile.name) {
      user.username = archive.profile.name;
    }
  }
  rebuildPersonalRecordsForUser(user);
  saveDatabaseToDisk();
  const exposures = calculateMuscleExposures(user.workouts, EXERCISES_MAP);
  const radar = buildTrainingRadar(user.workouts, EXERCISES_MAP);
  res.json({
    success: true,
    message: `Successfully imported backup with ${user.workouts.length} workouts and ${user.templates.length} templates.`,
    workouts: user.workouts,
    templates: user.templates,
    profile: user.profile,
    personalRecords: user.personalRecords,
    muscles: exposures,
    radar
  });
});
app.post("/api/data/sync", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized. Please sign in." });
    return;
  }
  const { workouts, templates, profile } = req.body || {};
  if (Array.isArray(workouts)) {
    const existingMap = /* @__PURE__ */ new Map();
    for (const w of user.workouts || []) {
      if (w?.id) existingMap.set(w.id, w);
    }
    for (const w of workouts) {
      if (w?.id && !existingMap.has(w.id)) {
        if (w.userId && w.userId !== user.id) continue;
        existingMap.set(w.id, { ...w, userId: user.id });
      }
    }
    user.workouts = Array.from(existingMap.values());
    user.workouts.sort((a, b) => {
      const tA = a.completedAt ? new Date(a.completedAt).getTime() : a.startedAt ? new Date(a.startedAt).getTime() : 0;
      const tB = b.completedAt ? new Date(b.completedAt).getTime() : b.startedAt ? new Date(b.startedAt).getTime() : 0;
      return tB - tA;
    });
  }
  if (Array.isArray(templates)) {
    const templateMap = /* @__PURE__ */ new Map();
    for (const t of user.templates || []) {
      if (t?.id) templateMap.set(t.id, t);
    }
    for (const t of templates) {
      if (t?.id && !templateMap.has(t.id)) {
        templateMap.set(t.id, { ...t, userId: user.id });
      }
    }
    user.templates = Array.from(templateMap.values());
  }
  if (profile && typeof profile === "object") {
    user.profile = {
      ...user.profile,
      ...profile,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (profile.trainingDaysPerWeek !== void 0) {
      user.profile.trainingDaysPerWeek = Number(profile.trainingDaysPerWeek) || 4;
    }
    if (profile.birthday !== void 0) {
      user.profile.birthday = profile.birthday;
    }
    if (profile.name) {
      const formatted = formatAthleteName(profile.name, user.email);
      user.username = formatted;
      user.profile.name = formatted;
    }
  }
  rebuildPersonalRecordsForUser(user);
  saveDatabaseToDisk();
  const exposures = calculateMuscleExposures(user.workouts, EXERCISES_MAP);
  const radar = buildTrainingRadar(user.workouts, EXERCISES_MAP);
  res.json({
    success: true,
    workouts: user.workouts,
    templates: user.templates,
    profile: user.profile,
    personalRecords: user.personalRecords,
    muscles: exposures,
    radar,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/ai/chat-history", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.json({ success: true, history: [] });
    return;
  }
  res.json({ success: true, history: user.chatHistory || [] });
});
app.post("/api/ai/chat-history", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { history } = req.body;
  if (Array.isArray(history)) {
    user.chatHistory = history.slice(-100);
    saveDatabaseToDisk();
  }
  res.json({ success: true, history: user.chatHistory || [] });
});
app.delete("/api/ai/chat-history", (req, res) => {
  const user = getUserFromRequest(req);
  if (user) {
    user.chatHistory = [];
    saveDatabaseToDisk();
  }
  res.json({ success: true });
});
app.post("/api/ai/chat", async (req, res) => {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      res.status(401).json({ error: "Unauthorized. Please sign in." });
      return;
    }
    const { message, conversationHistory } = req.body;
    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }
    const radar = buildTrainingRadar(user.workouts, EXERCISES_MAP);
    const exposures = calculateMuscleExposures(user.workouts, EXERCISES_MAP);
    let athleteAge = null;
    if (user.profile?.birthday) {
      const bDate = new Date(user.profile.birthday);
      if (!isNaN(bDate.getTime())) {
        const now = /* @__PURE__ */ new Date();
        let age = now.getFullYear() - bDate.getFullYear();
        const m = now.getMonth() - bDate.getMonth();
        if (m < 0 || m === 0 && now.getDate() < bDate.getDate()) age--;
        if (age >= 0 && age <= 120) athleteAge = age;
      }
    }
    const lastWorkout = user.workouts[0];
    const lastWorkoutPRs = [];
    if (lastWorkout) {
      for (const pr of user.personalRecords || []) {
        if (pr.workoutId === lastWorkout.id) {
          lastWorkoutPRs.push({
            exercise: pr.exerciseName,
            weightKg: pr.maxWeightKg,
            reps: pr.maxReps
          });
        }
      }
      if (lastWorkoutPRs.length === 0 && Array.isArray(lastWorkout.exercises)) {
        for (const ex of lastWorkout.exercises) {
          const prSets = (ex.sets || []).filter((s) => s && s.completed && s.isPR);
          for (const ps of prSets) {
            lastWorkoutPRs.push({
              exercise: ex.exerciseName,
              weightKg: Number(ps.weightKg) || 0,
              reps: Number(ps.reps) || 0
            });
          }
        }
      }
    }
    const notablyLighterExercises = [];
    if (lastWorkout && Array.isArray(lastWorkout.exercises)) {
      for (const ex of lastWorkout.exercises) {
        const histPR = (user.personalRecords || []).find((p) => p.exerciseId === ex.exerciseId);
        if (histPR && histPR.maxWeightKg >= 20 && histPR.workoutId !== lastWorkout.id) {
          const topWorkingSet = (ex.sets || []).filter((s) => s && s.completed && !s.isBodyweight && s.type !== "warmup").reduce((max, s) => (Number(s.weightKg) || 0) > (Number(max?.weightKg) || 0) ? s : max, null);
          if (topWorkingSet && Number(topWorkingSet.weightKg) > 0) {
            const actualWeight = Number(topWorkingSet.weightKg);
            const expectedWeight = histPR.maxWeightKg;
            const drop = Math.round((expectedWeight - actualWeight) / expectedWeight * 100);
            if (drop >= 25) {
              notablyLighterExercises.push({
                exercise: ex.exerciseName,
                actualWeightKg: actualWeight,
                historicalBestKg: expectedWeight,
                percentDrop: drop
              });
            }
          }
        }
      }
    }
    const recentWorkoutsSummary = user.workouts.slice(0, 5).map((w) => ({
      name: w.name,
      date: (() => {
        try {
          const d = new Date(w.completedAt || w.startedAt);
          return isNaN(d.getTime()) ? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) : d.toISOString().slice(0, 10);
        } catch {
          return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
        }
      })(),
      durationMinutes: Math.round((w.durationSeconds || 0) / 60) || 45,
      totalVolumeKg: w.totalVolumeKg,
      exercises: (w.exercises || []).map((ex) => {
        const setsArr = Array.isArray(ex?.sets) ? ex.sets : ex?.sets && typeof ex.sets === "object" ? Object.values(ex.sets) : typeof ex?.sets === "number" ? Array.from({ length: ex.sets }).map(() => ({ weightKg: ex.suggestedWeightKg || ex.weightKg || 0, reps: ex.repMin || ex.reps || 0 })) : [];
        return {
          name: ex.exerciseName || ex.exerciseId,
          setsCount: setsArr.length,
          topSet: setsArr.reduce((max, s) => (Number(s?.weightKg) || 0) > (Number(max?.weightKg) || 0) ? s : max, setsArr[0] || { weightKg: 0, reps: 0 })
        };
      })
    }));
    const contextSummary = {
      athleteName: user.username,
      athleteBirthday: user.profile?.birthday || "Not specified",
      athleteBiologicalAge: athleteAge ? `${athleteAge} years old` : "Not specified",
      userGoal: user.profile.primaryGoal,
      experienceLevel: user.profile.experienceLevel,
      totalLoggedWorkouts: user.workouts.length,
      weeklyWorkoutsCount: radar.weeklyWorkoutsCount,
      weeklyVolumeKg: radar.weeklyVolumeKg,
      pushPullRatio: radar.pushPullRatio,
      upperLowerRatio: radar.upperLowerRatio,
      todaySuggestedFocus: radar.suggestedFocusToday,
      recentPerformanceSignals: {
        lastWorkoutName: lastWorkout?.name || null,
        recentPRsAchieved: lastWorkoutPRs,
        notablyLighterLifts: notablyLighterExercises
      },
      highFatigueMuscles: radar.highExposureMuscles.map((m) => ({
        name: m.name,
        daysAgo: m.daysSinceTraining,
        sets7d: m.effectiveSets7d
      })),
      freshRecoveredMuscles: radar.recoveredMuscles.map((m) => ({
        name: m.name,
        daysAgo: m.daysSinceTraining,
        sets7d: m.effectiveSets7d
      })),
      neglectedMuscles: radar.neglectedMuscles.map((m) => m.name),
      recentPersonalRecords: user.personalRecords.slice(0, 5).map((p) => ({
        exercise: p.exerciseName,
        weight: p.maxWeightKg,
        reps: p.maxReps,
        estimated1RM: p.estimated1RMKg
      })),
      recentCompletedWorkouts: recentWorkoutsSummary
    };
    const getFallbackReply = () => {
      const lower = (message || "").toLowerCase();
      let responseText = "";
      if (lower.includes("pr") || lower.includes("record") || lower.includes("personal best") || lower.includes("max")) {
        if (lastWorkoutPRs.length > 0) {
          const prList = lastWorkoutPRs.map((p) => `\u2022 ${p.exercise}: ${p.weightKg} kg \xD7 ${p.reps} reps`).join("\n");
          responseText = `Your recent PRs:

${prList}

Solid progress. Next time you hit these movements, try aiming for 1 more rep or a small 1-2 kg bump.`;
        } else if (user.personalRecords && user.personalRecords.length > 0) {
          const topPRs = user.personalRecords.slice(0, 3).map((p) => `\u2022 ${p.exerciseName}: ${p.maxWeightKg} kg \xD7 ${p.maxReps} (Est 1RM: ${p.estimated1RMKg} kg)`).join("\n");
          responseText = `Your top PRs right now:

${topPRs}

Keep focusing on small, consistent progressive overload on your main lifts.`;
        } else {
          responseText = `You don't have any logged PRs yet. Once you complete sets that beat your previous numbers, they'll show up here automatically.`;
        }
      } else if (lower.includes("sore") || lower.includes("recover") || lower.includes("fatigue") || lower.includes("rest") || lower.includes("fresh")) {
        const fatigued = radar.highExposureMuscles.map((m) => m.name).join(", ") || "None";
        const recovered = radar.recoveredMuscles.map((m) => m.name).join(", ") || "All muscle groups balanced";
        responseText = `Current recovery state:

\u2022 High fatigue / recovering: ${fatigued}
\u2022 Fresh and ready: ${recovered}

If you train today, hit the fresh groups and give the fatigued muscles another 24-48 hours.`;
      } else if (lower.includes("last workout") || lower.includes("previous workout") || lower.includes("how did i do") || lower.includes("how was my")) {
        if (lastWorkout) {
          const mins = Math.round((lastWorkout.durationSeconds || 0) / 60) || 45;
          const vol = (lastWorkout.totalVolumeKg || 0).toLocaleString();
          const exCount = (lastWorkout.exercises || []).length;
          responseText = `Last workout was ${lastWorkout.name} (${mins} mins, ${vol} kg total volume across ${exCount} exercises). Solid session. Make sure you're getting enough protein and rest to recover.`;
        } else {
          responseText = `You haven't logged any completed workouts yet. Once you finish your first session, I'll break down your volume and recovery right here.`;
        }
      } else if (lower.includes("today") || lower.includes("train") || lower.includes("workout") || lower.includes("split") || lower.includes("routine")) {
        const ready = radar.recoveredMuscles.slice(0, 3).map((m) => m.name).join(", ") || "Full Body";
        responseText = `Hit ${radar.suggestedFocusToday.title} today. Your ${ready} are recovered and ready for work.

Let me know if you want me to generate the full routine or if you have specific exercises in mind.`;
      } else {
        const ready = radar.recoveredMuscles.slice(0, 2).map((m) => m.name).join(" and ") || "balanced muscles";
        responseText = `Your ${ready} are fresh and recovered today. ${radar.suggestedFocusToday.title} is the recommended split based on your recent training.

What do you want to hit today?`;
      }
      return {
        reply: responseText,
        referencedMuscles: radar.suggestedFocusToday.muscles,
        suggestedActions: [
          "What should I train today?",
          "Generate a workout for today",
          "How was my last workout?"
        ]
      };
    };
    const ai = getGeminiClient();
    if (!ai) {
      res.json(getFallbackReply());
      return;
    }
    const systemInstruction = `You are a real, experienced personal strength coach chatting directly with athlete ${user.username}.
Talk like a knowledgeable human friend or coach texting in real life.

COACHING VOICE & TONE:
1. TALK LIKE A REAL HUMAN (NO SCRIPTED OR CORNY FLUFF):
- Be direct, conversational, and natural.
- Zero cheesy gym hype, slogans, or cheerleading ("Crush it champ", "Let's get after it", "Keep up the phenomenal work", "Proud of you").
- Zero robotic corporate or medical jargon ("neuromuscular system consolidation", "optimal hypertrophy stimulus", "supercompensation kinetics", "intelligence session"). Speak in normal gym terms: weights, sets, reps, fatigue, rest, good form, soreness, volume.
- Zero boilerplate sign-offs or repetitive closing questions ("What would you like to zero in on next?", "How can I assist your fitness journey?"). When you've answered the question, stop.

2. STRAIGHT TO THE POINT (SHORT & PUNCHY):
- Answer the user's exact question or message immediately in the very first sentence.
- Keep answers concise and punchy (1 to 3 short paragraphs or quick bullet points). Never write a long boring essay unless the user explicitly requested a detailed deep-dive.
- No filler openings ("Great question!", "Certainly!", "I would be happy to help!").

3. DEEPLY PERSONALIZED (USE CHAT HISTORY & RECENT CONTEXT):
- NEVER start messages by congratulating them on a PR or checking on light lifts. Only mention PRs or past numbers if the athlete explicitly asked about them or if it directly and naturally answers their question.
- Do not repeat the same phrases or templates across conversation turns.
- Pay close attention to what the athlete told you earlier in this chat (injuries, tiredness, goals, equipment, preferences) and build on it naturally like a real coach who actually listened.

4. 100% PLAIN TEXT ONLY (STRICT ZERO ASTERISKS):
- Never use asterisks (*) or double asterisks (**). Do not format text in bold or italic markdown.
- Never write words between asterisks. Write in plain, clean English text.
- If using lists, use simple bullet dots (\u2022) or dashes (-).

ATHLETE TRAINING CONTEXT:
- Athlete Name: ${user.username}
- Goal: ${user.profile?.primaryGoal || "Strength and hypertrophy"}
- Biological Age: ${athleteAge ? `${athleteAge} years old` : "Not specified"}
- Recommended Split Today: ${radar.suggestedFocusToday.title}
- Fresh Recovered Muscle Groups: ${radar.recoveredMuscles.slice(0, 4).map((m) => m.name).join(", ") || "All balanced"}
- Fatigued / Resting Groups: ${radar.highExposureMuscles.slice(0, 3).map((m) => m.name).join(", ") || "None"}
- Total Workouts Logged: ${user.workouts.length}
- Last Workout: ${lastWorkout ? `${lastWorkout.name} (${Math.round((lastWorkout.durationSeconds || 0) / 60) || 45} mins)` : "None yet"}`;
    const sanitizedTurns = [];
    if (Array.isArray(conversationHistory)) {
      for (const turn of conversationHistory.slice(-14)) {
        if (turn && turn.text && typeof turn.text === "string" && turn.text.trim()) {
          const role = turn.sender === "assistant" || turn.sender === "model" ? "model" : "user";
          sanitizedTurns.push({ role, text: turn.text.trim() });
        }
      }
    }
    while (sanitizedTurns.length > 0 && sanitizedTurns[0].role === "model") {
      sanitizedTurns.shift();
    }
    sanitizedTurns.push({ role: "user", text: message.trim() });
    const chatContents = [];
    for (const turn of sanitizedTurns) {
      if (chatContents.length > 0 && chatContents[chatContents.length - 1].role === turn.role) {
        chatContents[chatContents.length - 1].parts[0].text += `

${turn.text}`;
      } else {
        chatContents.push({
          role: turn.role,
          parts: [{ text: turn.text }]
        });
      }
    }
    try {
      const response = await generateGeminiContentWithFallback(ai, {
        contents: chatContents,
        config: {
          systemInstruction,
          temperature: 0.7
        },
        primaryModel: "gemini-2.5-flash"
      });
      let reply = response.text || "Here is my assessment of your current training state.";
      reply = reply.replace(/\*{1,3}([^*]+?)\*{1,3}/g, "$1").replace(/\*/g, "").trim();
      res.json({
        reply,
        referencedMuscles: radar.suggestedFocusToday.muscles,
        suggestedActions: [
          "What should I train today?",
          "Generate a workout for today",
          "How was my last workout?"
        ]
      });
    } catch (modelErr) {
      console.warn("Gemini models unavailable, falling back to local coach intelligence:", modelErr);
      res.json(getFallbackReply());
    }
  } catch (err) {
    console.error("AI chat error:", err);
    res.status(500).json({ error: "AI consultation failed", message: err.message });
  }
});
function buildAlgorithmicWorkout(targetFocus, targetMinutes, equipment = "Standard Gym", radar) {
  const f = targetFocus.toLowerCase();
  let exercises = [];
  let warmup = "5 min dynamic mobility + 2 ramp-up warmup sets before first working movement.";
  if (f.includes("push") || f.includes("chest") || f.includes("pec")) {
    exercises = [
      {
        exerciseId: "barbell_bench_press",
        exerciseName: "Barbell Bench Press",
        sets: 3,
        repMin: 6,
        repMax: 8,
        rir: 2,
        restSeconds: 150,
        coachingNote: "Retract and depress scapulae. Drive through floor."
      },
      {
        exerciseId: "incline_dumbbell_press",
        exerciseName: "Incline Dumbbell Bench Press",
        sets: 3,
        repMin: 8,
        repMax: 10,
        rir: 2,
        restSeconds: 120,
        coachingNote: "Focus on upper clavicular stretch at the bottom."
      },
      {
        exerciseId: "dumbbell_lateral_raise",
        exerciseName: "Dumbbell Lateral Raise",
        sets: 4,
        repMin: 12,
        repMax: 15,
        rir: 1,
        restSeconds: 75,
        coachingNote: "Lead with elbows in scapular plane with controlled negative."
      },
      {
        exerciseId: "triceps_rope_pushdown",
        exerciseName: "Cable Triceps Pushdown",
        sets: 3,
        repMin: 10,
        repMax: 12,
        rir: 1,
        restSeconds: 90,
        coachingNote: "Push down with elbows pinned; works with all handles (rope, straight bar, V-bar)."
      }
    ];
  } else if (f.includes("pull") || f.includes("back") || f.includes("lat")) {
    exercises = [
      {
        exerciseId: "barbell_bent_over_row",
        exerciseName: "Barbell Bent-Over Row",
        sets: 3,
        repMin: 6,
        repMax: 8,
        rir: 2,
        restSeconds: 150,
        coachingNote: "Pull to lower abdomen, hold 1s at top contraction."
      },
      {
        exerciseId: "lat_pulldown",
        exerciseName: "Lat Pulldown (Wide/Neutral Grip)",
        sets: 3,
        repMin: 8,
        repMax: 10,
        rir: 2,
        restSeconds: 120,
        coachingNote: "Drive elbows down into back pockets, control return."
      },
      {
        exerciseId: "face_pulls",
        exerciseName: "Cable Face Pull",
        sets: 3,
        repMin: 12,
        repMax: 15,
        rir: 1,
        restSeconds: 75,
        coachingNote: "Rotate thumbs backwards at finish to engage external rotators."
      },
      {
        exerciseId: "barbell_bicep_curl",
        exerciseName: "Barbell Bicep Curl",
        sets: 3,
        repMin: 8,
        repMax: 10,
        rir: 1,
        restSeconds: 90,
        coachingNote: "Strict form with full extension at the bottom."
      }
    ];
  } else if (f.includes("leg") || f.includes("quad") || f.includes("hamstring") || f.includes("glute") || f.includes("lower")) {
    exercises = [
      {
        exerciseId: "barbell_back_squat",
        exerciseName: "Barbell Back Squat",
        sets: 4,
        repMin: 5,
        repMax: 6,
        rir: 2,
        restSeconds: 180,
        coachingNote: "Hit parallel depth with knees tracking toes."
      },
      {
        exerciseId: "romanian_deadlift",
        exerciseName: "Romanian Deadlift (RDL)",
        sets: 3,
        repMin: 8,
        repMax: 10,
        rir: 2,
        restSeconds: 150,
        coachingNote: "Hinge hips backwards, maximize hamstring stretch."
      },
      {
        exerciseId: "leg_extension",
        exerciseName: "Seated Leg Extension",
        sets: 3,
        repMin: 12,
        repMax: 15,
        rir: 1,
        restSeconds: 90,
        coachingNote: "1-second pause at top lockout to stress rectus femoris."
      },
      {
        exerciseId: "standing_calf_raise",
        exerciseName: "Standing Calf Raise",
        sets: 4,
        repMin: 12,
        repMax: 15,
        rir: 1,
        restSeconds: 60,
        coachingNote: "2-second deep stretch at the bottom of every rep."
      }
    ];
  } else if (f.includes("shoulder") || f.includes("arm") || f.includes("delt")) {
    exercises = [
      {
        exerciseId: "overhead_barbell_press",
        exerciseName: "Overhead Barbell Press (OHP)",
        sets: 3,
        repMin: 6,
        repMax: 8,
        rir: 2,
        restSeconds: 150,
        coachingNote: "Brace core and glutes, press vertically."
      },
      {
        exerciseId: "dumbbell_lateral_raise",
        exerciseName: "Dumbbell Lateral Raise",
        sets: 4,
        repMin: 12,
        repMax: 15,
        rir: 1,
        restSeconds: 60,
        coachingNote: "Raise in the scapular plane with smooth control."
      },
      {
        exerciseId: "incline_dumbbell_curl",
        exerciseName: "Incline Dumbbell Bicep Curl",
        sets: 3,
        repMin: 10,
        repMax: 12,
        rir: 1,
        restSeconds: 75,
        coachingNote: "Deep stretch on the long head of the bicep."
      },
      {
        exerciseId: "overhead_cable_triceps_extension",
        exerciseName: "Overhead Cable Triceps Extension",
        sets: 3,
        repMin: 10,
        repMax: 12,
        rir: 1,
        restSeconds: 75,
        coachingNote: "Emphasize long head triceps stretch behind the head."
      }
    ];
  } else if (f.includes("upper")) {
    exercises = [
      {
        exerciseId: "incline_dumbbell_press",
        exerciseName: "Incline Dumbbell Bench Press",
        sets: 3,
        repMin: 8,
        repMax: 10,
        rir: 2,
        restSeconds: 120,
        coachingNote: "Full chest stretch, control negative."
      },
      {
        exerciseId: "chest_supported_t_bar_row",
        exerciseName: "Chest-Supported Row",
        sets: 3,
        repMin: 8,
        repMax: 10,
        rir: 2,
        restSeconds: 120,
        coachingNote: "Squeeze mid-back rhomboids together."
      },
      {
        exerciseId: "dumbbell_lateral_raise",
        exerciseName: "Dumbbell Lateral Raise",
        sets: 3,
        repMin: 12,
        repMax: 15,
        rir: 1,
        restSeconds: 60,
        coachingNote: "Consistent cadence without swinging."
      },
      {
        exerciseId: "triceps_rope_pushdown",
        exerciseName: "Cable Triceps Pushdown",
        sets: 3,
        repMin: 10,
        repMax: 12,
        rir: 1,
        restSeconds: 75,
        coachingNote: "Lock out fully at the bottom; works with any handle."
      }
    ];
  } else {
    exercises = [
      {
        exerciseId: "barbell_back_squat",
        exerciseName: "Barbell Back Squat",
        sets: 3,
        repMin: 6,
        repMax: 8,
        rir: 2,
        restSeconds: 150,
        coachingNote: "Solid brace, descend under control."
      },
      {
        exerciseId: "barbell_bench_press",
        exerciseName: "Barbell Bench Press",
        sets: 3,
        repMin: 6,
        repMax: 8,
        rir: 2,
        restSeconds: 150,
        coachingNote: "Smooth descent to mid-sternum."
      },
      {
        exerciseId: "lat_pulldown",
        exerciseName: "Lat Pulldown (Wide/Neutral Grip)",
        sets: 3,
        repMin: 8,
        repMax: 10,
        rir: 2,
        restSeconds: 120,
        coachingNote: "Drive elbows down into torso."
      },
      {
        exerciseId: "romanian_deadlift",
        exerciseName: "Romanian Deadlift (RDL)",
        sets: 3,
        repMin: 8,
        repMax: 10,
        rir: 2,
        restSeconds: 120,
        coachingNote: "Pure hip hinge with flat back."
      }
    ];
  }
  return {
    name: `${targetFocus}`,
    targetFocus,
    durationMinutes: targetMinutes,
    rationale: `Session dialed in for your recovery today. Hits primary compound movements with solid working volume while resting fatigued muscles.`,
    warmupTip: warmup,
    exercises
  };
}
app.post("/api/ai/workout", async (req, res) => {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      res.status(401).json({ error: "Unauthorized. Please sign in." });
      return;
    }
    const { focus, durationMinutes, equipment, intensity } = req.body;
    const radar = buildTrainingRadar(user.workouts, EXERCISES_MAP);
    const exposures = calculateMuscleExposures(user.workouts, EXERCISES_MAP);
    const targetMinutes = durationMinutes || 50;
    const targetFocus = focus || radar.suggestedFocusToday.title;
    const ai = getGeminiClient();
    if (!ai) {
      const plan = buildAlgorithmicWorkout(targetFocus, targetMinutes, equipment, radar);
      res.json(plan);
      return;
    }
    try {
      const availableExercisesList = EXERCISE_DATABASE.map((e) => ({
        id: e.id,
        name: e.name,
        category: e.category,
        equipment: e.equipment
      }));
      const prompt = `Create a structured workout plan for:
- Target Focus: ${targetFocus}
- Duration: ${targetMinutes} minutes
- Equipment Available: ${equipment || "Standard Gym"}
- Intensity/RIR: 1-2 RIR target
- Current Recovered Groups: ${radar.recoveredMuscles.map((m) => m.name).join(", ") || "All balanced"}
- Fatigued Groups to Protect: ${radar.highExposureMuscles.map((m) => m.name).join(", ") || "None"}

Available Exercise Catalog:
${JSON.stringify(availableExercisesList)}

Return ONLY valid JSON adhering strictly to this schema:
{
  "name": "string",
  "targetFocus": "string",
  "durationMinutes": number,
  "rationale": "string",
  "warmupTip": "string",
  "exercises": [
    {
      "exerciseId": "exact id from catalog",
      "exerciseName": "exact name from catalog",
      "sets": number,
      "repMin": number,
      "repMax": number,
      "rir": number,
      "restSeconds": number,
      "coachingNote": "string"
    }
  ]
}`;
      const response = await generateGeminiContentWithFallback(ai, {
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        },
        primaryModel: "gemini-2.5-flash"
      });
      let rawText = response.text || "";
      rawText = rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
      const parsed = JSON.parse(rawText);
      if (parsed && Array.isArray(parsed.exercises) && parsed.exercises.length > 0) {
        res.json(parsed);
        return;
      }
    } catch (aiErr) {
      console.warn("Gemini generation fallback engaged:", aiErr);
    }
    const fallbackPlan = buildAlgorithmicWorkout(targetFocus, targetMinutes, equipment, radar);
    res.json(fallbackPlan);
  } catch (err) {
    console.error("AI workout generation error:", err);
    res.status(500).json({ error: "Workout generation failed", message: err.message });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Training Intelligence server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
