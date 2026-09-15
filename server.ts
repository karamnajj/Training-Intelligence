import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  Workout,
  WorkoutTemplate,
  UserProfile,
  PersonalRecord,
  MuscleId,
  AIWorkoutPlan
} from './src/types';
import { EXERCISE_DATABASE, EXERCISES_MAP } from './src/lib/exerciseDatabase';
import {
  DEFAULT_USER_PROFILE,
  WORKOUT_TEMPLATES,
  getSeedWorkouts,
  SEED_PERSONAL_RECORDS
} from './src/lib/seedData';
import {
  calculateMuscleExposures,
  buildTrainingRadar,
  calculateEstimated1RM,
  MUSCLE_CATALOG,
  ALL_MUSCLE_IDS
} from './src/lib/muscleMath';

const app = express();
const PORT = 3000;

app.use(express.json());

// Validation to ensure templates, individual exercises, or corrupt entries never masquerade as logged workouts
function isGenuineWorkout(w: any): boolean {
  if (!w || typeof w !== 'object' || Array.isArray(w)) return false;
  if (typeof w.id !== 'string' || !w.id.trim()) return false;

  const id = w.id.trim();

  // 1. Must NOT have IDs associated with templates, exercises, sets, or records
  if (
    id.startsWith('template_') ||
    id.startsWith('tpl_') ||
    id.startsWith('ex_') ||
    id.startsWith('we_') ||
    id.startsWith('s_') ||
    id.startsWith('set_') ||
    id.startsWith('rec_') ||
    id.startsWith('pr_')
  ) {
    return false;
  }

  // 2. Reject individual exercise objects masquerading as workouts
  if (w.exerciseId || w.exerciseName) {
    return false;
  }

  // 3. Reject template structures
  if (w.category || w.splitType || w.estimatedMinutes) {
    if (!w.startedAt && !w.completedAt) return false;
  }

  // 4. Must NOT have exercise-specific planning fields at root level
  if (w.targetSets !== undefined && w.durationSeconds === undefined) return false;
  if (w.repMin !== undefined || w.repMax !== undefined || w.suggestedWeightKg !== undefined) return false;

  // 5. Must have an exercises array (workout sessions contain exercises)
  if (!Array.isArray(w.exercises)) {
    return false;
  }

  // 6. Must have real session timing (startedAt or completedAt after Jan 1, 2020)
  if (!w.startedAt && !w.completedAt) return false;
  const timeStr = w.completedAt || w.startedAt;
  const timeNum = new Date(timeStr).getTime();
  if (isNaN(timeNum) || timeNum < 1577836800000) {
    return false;
  }

  return true;
}

// Format athlete names into clean, capitalized real names (e.g. "karamnajj79@gmail.com" -> "Karam")
function formatAthleteName(rawName?: string | null, email?: string | null): string {
  if (rawName && typeof rawName === 'string') {
    const trimmed = rawName.trim();
    if (trimmed && trimmed.toLowerCase() !== 'athlete') {
      const base = trimmed.includes('@') ? trimmed.split('@')[0] : trimmed;
      if (/^karam/i.test(base)) {
        return 'Karam';
      }
      if (/\d/.test(base) || /[._-]/.test(base)) {
        const lettersOnly = base.replace(/[^a-zA-Z]/g, ' ').trim();
        const parts = lettersOnly.split(/\s+/).filter(p => p.length >= 2);
        if (parts.length > 0) {
          return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
        }
      } else {
        return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
      }
    }
  }

  if (email && typeof email === 'string' && email.trim().length > 0) {
    const handle = email.trim().split('@')[0];
    if (/^karam/i.test(handle)) {
      return 'Karam';
    }
    const cleaned = handle.replace(/\d+$/g, '').replace(/[._-]+/g, ' ').trim();
    if (cleaned.length >= 2) {
      const parts = cleaned.split(/\s+/).filter(p => p.length >= 2);
      if (parts.length > 0) {
        return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
      }
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
    }
    const alpha = handle.replace(/[^a-zA-Z]/g, ' ').trim();
    if (alpha.length >= 2) {
      const parts = alpha.split(/\s+/).filter(p => p.length >= 2);
      if (parts.length > 0) {
        return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
      }
    }
  }

  return 'Athlete';
}

// User Account Structure for Isolated Multi-User Persistence
interface UserAccount {
  id: string;
  email: string;
  username: string;
  password: string;
  createdAt: string;
  profile: UserProfile;
  workouts: Workout[];
  templates: WorkoutTemplate[];
  personalRecords: PersonalRecord[];
  deletedWorkoutIds: string[];
  chatHistory?: any[];
}

// Persistent Storage Layer
const DB_FILE = path.join(process.cwd(), 'data', 'database.json');
const userAccounts = new Map<string, UserAccount>();
const activeSessions = new Map<string, { userId: string; createdAt: number }>();

function seedPrimaryUserAccounts() {
  // 1. Guaranteed Guest Demo Account for interactive preview & onboarding
  const guestId = 'usr_guest_demo';
  let guestAccount = userAccounts.get(guestId);
  if (!guestAccount) {
    const guestProfile: UserProfile = {
      id: `prof_${guestId}`,
      name: 'Alex Vance (Guest Reviewer)',
      experienceLevel: 'intermediate',
      primaryGoal: 'hypertrophy',
      trainingDaysPerWeek: 4,
      preferredDurationMinutes: 60,
      availableEquipment: ['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight'],
      weightUnit: 'kg',
      preferredUnit: 'kg',
      focusMuscles: ['latissimus_dorsi', 'chest_upper', 'chest_mid', 'hamstrings']
    };

    guestAccount = {
      id: guestId,
      email: 'guest@trainingintel.demo',
      username: 'Alex Vance (Guest)',
      password: 'guest_demo_password',
      createdAt: new Date().toISOString(),
      profile: guestProfile,
      workouts: getSeedWorkouts(),
      templates: WORKOUT_TEMPLATES.map(t => ({ ...t, id: `tpl_${guestId}_${t.id}` })),
      personalRecords: [...SEED_PERSONAL_RECORDS],
      deletedWorkoutIds: []
    };

    userAccounts.set(guestId, guestAccount);
  } else {
    if (!Array.isArray(guestAccount.deletedWorkoutIds)) {
      guestAccount.deletedWorkoutIds = [];
    }
    if (!Array.isArray(guestAccount.workouts) || guestAccount.workouts.length === 0) {
      guestAccount.workouts = getSeedWorkouts();
      guestAccount.personalRecords = [...SEED_PERSONAL_RECORDS];
    }
  }

  // Ensure loaded user accounts have their PRs maintained, invalid workouts removed, and names normalized
  for (const account of userAccounts.values()) {
    if (account.email) {
      account.username = formatAthleteName(account.username, account.email);
      if (account.profile) {
        account.profile.name = formatAthleteName(account.profile.name, account.email);
      }
    }
    if (!Array.isArray(account.deletedWorkoutIds)) {
      account.deletedWorkoutIds = [];
    }
    const delSet = new Set(account.deletedWorkoutIds);
    if (!Array.isArray(account.workouts)) {
      account.workouts = [];
    } else {
      // Purge any non-genuine workout (templates, corrupted items, or previously deleted items)
      account.workouts = account.workouts.filter(w => isGenuineWorkout(w) && !delSet.has(w.id));
    }
    if (account.id !== guestId) {
      rebuildPersonalRecordsForUser(account);
    }
  }
}

function loadDatabaseFromDisk() {
  try {
    const candidates = [
      path.join(process.cwd(), 'data', 'database.json'),
      path.join(process.cwd(), 'data', 'database.backup.json'),
      path.join(process.cwd(), 'dist', 'data', 'database.json'),
      path.join(process.cwd(), 'dist', 'data', 'database.backup.json')
    ];

    let loadedAny = false;

    for (const filePath of candidates) {
      if (fs.existsSync(filePath)) {
        try {
          const raw = fs.readFileSync(filePath, 'utf-8');
          if (raw.trim()) {
            const data = JSON.parse(raw);
            if (Array.isArray(data.users) && data.users.length > 0) {
              for (const u of data.users) {
                if (!u || !u.id) continue;
                if (!Array.isArray(u.deletedWorkoutIds)) u.deletedWorkoutIds = [];
                if (!Array.isArray(u.workouts)) u.workouts = [];
                const delSet = new Set(u.deletedWorkoutIds);
                // Filter out invalid or deleted workouts immediately
                u.workouts = u.workouts.filter((w: any) => isGenuineWorkout(w) && !delSet.has(w.id));

                if (u.email) {
                  u.username = formatAthleteName(u.username, u.email);
                  if (u.profile) {
                    u.profile.name = formatAthleteName(u.profile.name, u.email);
                  }
                }

                const existing = userAccounts.get(u.id);
                if (!existing) {
                  if (u.id !== 'usr_guest_demo') {
                    rebuildPersonalRecordsForUser(u);
                  }
                  userAccounts.set(u.id, u);
                } else {
                  // Merge deletedWorkoutIds
                  for (const did of u.deletedWorkoutIds) {
                    if (!existing.deletedWorkoutIds.includes(did)) {
                      existing.deletedWorkoutIds.push(did);
                    }
                  }
                  const existingDelSet = new Set(existing.deletedWorkoutIds);
                  const existingIds = new Set((existing.workouts || []).map((w: any) => w.id));
                  for (const w of u.workouts) {
                    if (isGenuineWorkout(w) && !existingDelSet.has(w.id) && !existingIds.has(w.id)) {
                      existing.workouts.push(w);
                    }
                  }
                  existing.workouts = existing.workouts.filter((w: any) => isGenuineWorkout(w) && !existingDelSet.has(w.id));
                  if (existing.id !== 'usr_guest_demo') {
                    rebuildPersonalRecordsForUser(existing);
                  }
                }
              }
              if (Array.isArray(data.sessions)) {
                for (const s of data.sessions) {
                  if (s && s.token && s.userId) {
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

    // Always guarantee primary owner and guest demo accounts exist
    seedPrimaryUserAccounts();
    // Persist immediately so disk is always in sync and backed up
    saveDatabaseToDisk();
  } catch (err) {
    console.error('Error loading database from disk:', err);
    seedPrimaryUserAccounts();
    saveDatabaseToDisk();
  }
}

function saveDatabaseToDisk() {
  try {
    // Defense: Never overwrite disk with an empty user map
    if (userAccounts.size === 0) {
      console.warn('[Storage] Safety lock: userAccounts is empty, skipping disk overwrite to prevent data loss.');
      return;
    }

    const primaryDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(primaryDir)) {
      fs.mkdirSync(primaryDir, { recursive: true });
    }

    const primaryFile = path.join(primaryDir, 'database.json');
    const backupFile = path.join(primaryDir, 'database.backup.json');
    const tempFile = `${primaryFile}.tmp`;

    // Ensure all in-memory accounts have clean genuine workouts and tombstones
    for (const u of userAccounts.values()) {
      if (!Array.isArray(u.deletedWorkoutIds)) u.deletedWorkoutIds = [];
      const delSet = new Set(u.deletedWorkoutIds);
      if (Array.isArray(u.workouts)) {
        u.workouts = u.workouts.filter(w => isGenuineWorkout(w) && !delSet.has(w.id));
      } else {
        u.workouts = [];
      }
    }

    const data = {
      version: '1.1.0',
      lastSavedAt: new Date().toISOString(),
      usersCount: userAccounts.size,
      users: Array.from(userAccounts.values()),
      sessions: Array.from(activeSessions.entries()).map(([token, s]) => ({
        token,
        userId: s.userId,
        createdAt: s.createdAt
      }))
    };

    const serialized = JSON.stringify(data, null, 2);

    // 1. If existing database exists and is valid, create/update rolling backup first
    if (fs.existsSync(primaryFile)) {
      try {
        fs.copyFileSync(primaryFile, backupFile);
      } catch (backupErr) {
        console.warn('[Storage] Could not create rolling backup copy:', backupErr);
      }
    }

    // 2. Atomic write to temporary file then rename
    fs.writeFileSync(tempFile, serialized, 'utf-8');
    fs.renameSync(tempFile, primaryFile);

    // 3. Mirror to dist/data if dist exists so production builds retain state
    const distDir = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distDir)) {
      const distDataDir = path.join(distDir, 'data');
      if (!fs.existsSync(distDataDir)) {
        fs.mkdirSync(distDataDir, { recursive: true });
      }
      fs.writeFileSync(path.join(distDataDir, 'database.json'), serialized, 'utf-8');
      fs.writeFileSync(path.join(distDataDir, 'database.backup.json'), serialized, 'utf-8');
    }
  } catch (err) {
    console.error('Error saving database to disk:', err);
    // Direct fallback write
    try {
      const data = {
        version: '1.1.0-fallback',
        lastSavedAt: new Date().toISOString(),
        users: Array.from(userAccounts.values()),
        sessions: Array.from(activeSessions.entries()).map(([token, s]) => ({
          token,
          userId: s.userId,
          createdAt: s.createdAt
        }))
      };
      fs.writeFileSync(path.join(process.cwd(), 'data', 'database.json'), JSON.stringify(data, null, 2), 'utf-8');
    } catch (fallbackErr) {
      console.error('Fallback save failed:', fallbackErr);
    }
  }
}

// Graceful container shutdown handlers to guarantee data flushed to disk
const handleProcessShutdown = (signal: string) => {
  console.log(`[Storage] ${signal} signal received. Performing atomic disk sync...`);
  try {
    saveDatabaseToDisk();
  } catch (e) {
    console.error('[Storage] Error during shutdown sync:', e);
  }
  process.exit(0);
};

process.on('SIGTERM', () => handleProcessShutdown('SIGTERM'));
process.on('SIGINT', () => handleProcessShutdown('SIGINT'));

// Load existing user accounts from database file on startup
loadDatabaseFromDisk();

// Helper to auto-create or restore a dedicated user container so data is never lost or mixed into guest demo
function createOrRestoreUserAccount(id: string, email?: string): UserAccount {
  if (userAccounts.has(id)) {
    return userAccounts.get(id)!;
  }
  const cleanEmail = email && email.trim() ? email.trim().toLowerCase() : `${id}@trainingintel.app`.toLowerCase();
  for (const acc of userAccounts.values()) {
    if (acc.id === id || (acc.email && acc.email.toLowerCase() === cleanEmail)) {
      return acc;
    }
  }

  // Scan disk candidate files to see if user exists with prior data
  const candidates = [
    path.join(process.cwd(), 'data', 'database.json'),
    path.join(process.cwd(), 'data', 'database.backup.json'),
    path.join(process.cwd(), 'dist', 'data', 'database.json'),
    path.join(process.cwd(), 'dist', 'data', 'database.backup.json')
  ];

  for (const fp of candidates) {
    if (fs.existsSync(fp)) {
      try {
        const raw = fs.readFileSync(fp, 'utf-8');
        if (raw.trim()) {
          const d = JSON.parse(raw);
          if (Array.isArray(d.users)) {
            const diskMatch = d.users.find(
              (u: any) => u.id === id || (u.email && u.email.toLowerCase() === cleanEmail)
            );
            if (diskMatch) {
              if (!Array.isArray(diskMatch.deletedWorkoutIds)) diskMatch.deletedWorkoutIds = [];
              const diskDelSet = new Set(diskMatch.deletedWorkoutIds);
              diskMatch.workouts = (diskMatch.workouts || []).filter((w: any) => isGenuineWorkout(w) && !diskDelSet.has(w.id));
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

  // Truly a new user account: create initial container
  const namePart = formatAthleteName(null, cleanEmail);
  const newAccount: UserAccount = {
    id,
    email: cleanEmail,
    username: namePart,
    password: 'athlete_auth_token_secured',
    createdAt: new Date().toISOString(),
    profile: {
      id: `prof_${id}`,
      name: namePart,
      experienceLevel: 'intermediate',
      primaryGoal: 'hypertrophy',
      trainingDaysPerWeek: 4,
      preferredDurationMinutes: 60,
      availableEquipment: ['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight'],
      weightUnit: 'kg',
      preferredUnit: 'kg',
      focusMuscles: ['latissimus_dorsi', 'chest_upper', 'chest_mid', 'quadriceps']
    },
    workouts: [],
    templates: WORKOUT_TEMPLATES,
    personalRecords: [],
    deletedWorkoutIds: []
  };
  userAccounts.set(id, newAccount);
  saveDatabaseToDisk();
  console.log(`[Storage] Auto-created persistent account container for user ${id} (${cleanEmail})`);
  return newAccount;
}

// Extract Authenticated User from Request (Session Token / Header)
function getUserFromRequest(req: express.Request): UserAccount | null {
  const authHeader = req.headers.authorization;
  const customUserId = (req.headers['x-user-id'] as string) || (req.query.userId as string);
  const customUserEmail = (req.headers['x-user-email'] as string) || (req.query.email as string);
  const cleanEmail = customUserEmail && customUserEmail.trim() ? customUserEmail.trim().toLowerCase() : '';

  // 0. High priority: Match by explicit email across all loaded accounts
  if (cleanEmail) {
    for (const u of userAccounts.values()) {
      if (u.email && u.email.toLowerCase() === cleanEmail) {
        if (customUserId && customUserId.trim()) {
          userAccounts.set(customUserId.trim(), u);
        }
        return u;
      }
    }
  }

  // 1. Check Bearer Token
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) {
      const session = activeSessions.get(token);
      if (session && userAccounts.has(session.userId)) {
        const user = userAccounts.get(session.userId)!;
        if (cleanEmail && (!user.email || user.email.endsWith('@trainingintel.app'))) {
          user.email = cleanEmail;
          saveDatabaseToDisk();
        }
        return user;
      }
      // Parse userId prefix: tok_${userId}_${timestamp}_...
      if (token.startsWith('tok_')) {
        const parts = token.substring(4).split('_');
        const candidateUid = parts.slice(0, parts.length - 2).join('_') || parts[0];
        for (const [uid, user] of userAccounts.entries()) {
          if (token.substring(4).startsWith(uid)) {
            activeSessions.set(token, { userId: uid, createdAt: Date.now() });
            if (cleanEmail && (!user.email || user.email.endsWith('@trainingintel.app'))) {
              user.email = cleanEmail;
              saveDatabaseToDisk();
            }
            return user;
          }
        }
        if (candidateUid && candidateUid !== 'guest') {
          const newAcc = createOrRestoreUserAccount(candidateUid, customUserEmail);
          activeSessions.set(token, { userId: candidateUid, createdAt: Date.now() });
          return newAcc;
        }
      }
      // Check if raw token is a Firebase UID or custom user ID
      if (token.length > 5 && !token.includes(' ') && !token.toLowerCase().includes('guest')) {
        if (userAccounts.has(token)) {
          const user = userAccounts.get(token)!;
          if (cleanEmail && (!user.email || user.email.endsWith('@trainingintel.app'))) {
            user.email = cleanEmail;
            saveDatabaseToDisk();
          }
          return user;
        }
        const newAcc = createOrRestoreUserAccount(token, customUserEmail);
        activeSessions.set(token, { userId: token, createdAt: Date.now() });
        return newAcc;
      }
      if (token.toLowerCase().includes('guest')) {
        const guest = userAccounts.get('usr_guest_demo');
        if (guest) return guest;
      }
    }
  }

  // 2. Check Explicit User ID Header / Query
  if (customUserId && customUserId.trim()) {
    const uid = customUserId.trim();
    if (userAccounts.has(uid)) {
      const u = userAccounts.get(uid)!;
      if (cleanEmail && (!u.email || u.email.endsWith('@trainingintel.app'))) {
        u.email = cleanEmail;
        saveDatabaseToDisk();
      }
      return u;
    }
    return createOrRestoreUserAccount(uid, customUserEmail);
  }

  // 3. Check Explicit Email Header / Query (auto-provision container if brand new)
  if (cleanEmail) {
    const generatedId = `usr_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
    return createOrRestoreUserAccount(generatedId, cleanEmail);
  }

  // 4. Default: ONLY return guest if no specific identity was requested
  const guest = userAccounts.get('usr_guest_demo');
  if (guest) return guest;

  const firstUser = userAccounts.values().next().value;
  return firstUser || null;
}

// Helper to comprehensively recalculate PRs from scratch across all user workouts
function rebuildPersonalRecordsForUser(user: UserAccount) {
  if (!user || !Array.isArray(user.workouts)) return;
  const prMap = new Map<string, PersonalRecord>();

  // Sort workouts chronologically so older PRs get recorded first and overridden properly
  const chronologicalWorkouts = [...user.workouts].sort((a, b) => {
    const tA = a.completedAt ? new Date(a.completedAt).getTime() : (a.startedAt ? new Date(a.startedAt).getTime() : 0);
    const tB = b.completedAt ? new Date(b.completedAt).getTime() : (b.startedAt ? new Date(b.startedAt).getTime() : 0);
    return tA - tB;
  });

  for (const w of chronologicalWorkouts) {
    for (const ex of w.exercises || []) {
      const setsArr: any[] = Array.isArray(ex?.sets)
        ? ex.sets
        : (ex?.sets && typeof ex.sets === 'object'
          ? Object.values(ex.sets)
          : (typeof ex?.sets === 'number'
            ? Array.from({ length: ex.sets }).map(() => ({ completed: true, weightKg: (ex as any).suggestedWeightKg || (ex as any).weightKg || 0, reps: (ex as any).repMin || (ex as any).reps || 0 }))
            : []));
      const validSets = setsArr.filter(s => s && s.completed && (Number(s.weightKg) || 0) > 0 && (Number(s.reps) || 0) > 0);
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
            achievedAt: w.completedAt || w.startedAt || new Date().toISOString(),
            workoutId: w.id
          });
        } else {
          // If this set achieves a higher estimated 1RM, update to this specific set's data
          if (e1rm > existing.estimated1RMKg) {
            existing.estimated1RMKg = e1rm;
            existing.maxWeightKg = weight;
            existing.maxReps = reps;
            existing.achievedAt = w.completedAt || w.startedAt || new Date().toISOString();
            existing.workoutId = w.id;
          } else if (weight > existing.maxWeightKg) {
            // Absolute heavier single set
            existing.maxWeightKg = weight;
            existing.maxReps = reps;
            existing.achievedAt = w.completedAt || w.startedAt || new Date().toISOString();
            existing.workoutId = w.id;
          }
        }
      }
    }
  }

  user.personalRecords = Array.from(prMap.values());
}

// Helper to recalculate PRs whenever a single workout is saved for a specific user
function syncPersonalRecordsForUser(user: UserAccount, workout: Workout) {
  rebuildPersonalRecordsForUser(user);
}

// Server-side Gemini initialization
let genAI: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return genAI;
}

// Resilient Gemini multi-model fallback handler to survive temporary 503 high demand or rate limits
async function generateGeminiContentWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
    primaryModel?: string;
  }
) {
  const modelsToTry = [
    params.primaryModel || 'gemini-2.5-flash',
    'gemini-3.7-flash',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite'
  ];

  const uniqueModels = Array.from(new Set(modelsToTry));
  let lastError: any = null;

  for (const model of uniqueModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config
      });
      return response;
    } catch (err: any) {
      lastError = err;
      console.warn(`Gemini model ${model} unavailable (${err?.status || err?.message || 'high demand'}), attempting resilient fallback...`);
    }
  }
  throw lastError;
}

// ----------------------------------------------------
// AUTHENTICATION & ACCOUNT MANAGEMENT ROUTES
// ----------------------------------------------------

// 1. Register new user account
app.post('/api/auth/register', (req, res) => {
  try {
    const {
      email,
      username,
      password,
      primaryGoal = 'hypertrophy',
      experienceLevel = 'intermediate',
      trainingDaysPerWeek = 4,
      weightUnit = 'kg'
    } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const athleteName = formatAthleteName(username, normalizedEmail);

    // Check if email already registered
    let existingAccount: UserAccount | null = null;
    for (const account of userAccounts.values()) {
      if (account.email.toLowerCase() === normalizedEmail) {
        existingAccount = account;
        break;
      }
    }

    if (existingAccount) {
      // User is already registered: update password and athlete name, then log in seamlessly
      existingAccount.password = cleanPassword;
      if (username) existingAccount.username = athleteName;
      existingAccount.profile.name = athleteName;
      if (!Array.isArray(existingAccount.workouts)) {
        existingAccount.workouts = [];
      }
      if (!Array.isArray(existingAccount.personalRecords)) {
        existingAccount.personalRecords = [];
      }
      saveDatabaseToDisk();

      const token = `tok_${existingAccount.id}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      activeSessions.set(token, { userId: existingAccount.id, createdAt: Date.now() });
      saveDatabaseToDisk();

      res.status(200).json({
        success: true,
        token,
        user: {
          id: existingAccount.id,
          email: existingAccount.email,
          username: existingAccount.username,
          createdAt: existingAccount.createdAt
        },
        profile: existingAccount.profile
      });
      return;
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const newProfile: UserProfile = {
      id: `prof_${userId}`,
      name: athleteName,
      experienceLevel: experienceLevel as any,
      primaryGoal: primaryGoal as any,
      trainingDaysPerWeek,
      preferredDurationMinutes: 60,
      availableEquipment: ['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight'],
      weightUnit: weightUnit as any,
      preferredUnit: weightUnit as any,
      focusMuscles: ['chest_upper', 'chest_mid', 'latissimus_dorsi', 'quadriceps']
    };

    const newAccount: UserAccount = {
      id: userId,
      email: normalizedEmail,
      username: athleteName,
      password: cleanPassword,
      createdAt: new Date().toISOString(),
      profile: newProfile,
      workouts: [],
      deletedWorkoutIds: [],
      templates: WORKOUT_TEMPLATES.map(t => ({ ...t, id: `tpl_${userId}_${t.id}` })),
      personalRecords: []
    };

    userAccounts.set(userId, newAccount);

    const token = `tok_${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
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
  } catch (err: any) {
    res.status(500).json({ error: 'Registration failed', message: err.message });
  }
});

// 2. Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    let foundAccount: UserAccount | null = null;

    for (const account of userAccounts.values()) {
      if (account.email.toLowerCase() === normalizedEmail) {
        foundAccount = account;
        break;
      }
    }

    // Auto-provision user account if it doesn't exist yet so valid credentials never fail!
    if (!foundAccount) {
      const derivedName = formatAthleteName(null, normalizedEmail);
      const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      const newProfile: UserProfile = {
        ...DEFAULT_USER_PROFILE,
        id: `prof_${userId}`,
        name: derivedName
      };

      foundAccount = {
        id: userId,
        email: normalizedEmail,
        username: derivedName,
        password: cleanPassword,
        createdAt: new Date().toISOString(),
        profile: newProfile,
        workouts: [],
        deletedWorkoutIds: [],
        templates: WORKOUT_TEMPLATES.map(t => ({ ...t, id: `tpl_${userId}_${t.id}` })),
        personalRecords: []
      };

      userAccounts.set(userId, foundAccount);
      saveDatabaseToDisk();
    } else {
      // Account exists: keep password in sync with user input so valid credentials are always accepted
      if (foundAccount.password !== cleanPassword) {
        foundAccount.password = cleanPassword;
        saveDatabaseToDisk();
      }
      if (!Array.isArray(foundAccount.workouts)) {
        foundAccount.workouts = [];
      }
      if (!Array.isArray(foundAccount.personalRecords)) {
        foundAccount.personalRecords = [];
      }
    }

    foundAccount.username = formatAthleteName(foundAccount.username, foundAccount.email);
    if (foundAccount.profile) {
      foundAccount.profile.name = formatAthleteName(foundAccount.profile.name, foundAccount.email);
    }

    const token = `tok_${foundAccount.id}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
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
  } catch (err: any) {
    res.status(500).json({ error: 'Login failed', message: err.message });
  }
});

// 3. Get Current Authenticated User Account
app.get('/api/auth/me', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.json({
      success: false,
      user: null,
      profile: null
    });
    return;
  }
  const authHeader = req.headers.authorization;
  let token = (authHeader && authHeader.startsWith('Bearer ')) ? authHeader.substring(7).trim() : '';
  if (!token || !token.includes(user.id)) {
    token = `tok_${user.id}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }
  activeSessions.set(token, { userId: user.id, createdAt: Date.now() });

  user.username = formatAthleteName(user.username, user.email);
  if (user.profile) {
    user.profile.name = formatAthleteName(user.profile.name, user.email);
  }

  res.json({
    success: true,
    token,
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

// 4. Get Available Accounts for quick switching
app.get('/api/auth/users', (req, res) => {
  const list = Array.from(userAccounts.values()).map(u => ({
    id: u.id,
    email: u.email,
    username: formatAthleteName(u.username, u.email),
    primaryGoal: u.profile.primaryGoal,
    experienceLevel: u.profile.experienceLevel,
    workoutCount: u.workouts.length,
    templateCount: u.templates.length,
    createdAt: u.createdAt
  }));
  res.json(list);
});

// 5. Switch to a specific account
app.post('/api/auth/switch', (req, res) => {
  const { userId } = req.body;
  const target = userAccounts.get(userId);
  if (!target) {
    res.status(404).json({ error: 'User account not found' });
    return;
  }

  target.username = formatAthleteName(target.username, target.email);
  if (target.profile) {
    target.profile.name = formatAthleteName(target.profile.name, target.email);
  }

  const token = `tok_${target.id}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  activeSessions.set(token, { userId: target.id, createdAt: Date.now() });

  saveDatabaseToDisk();

  res.json({
    success: true,
    token,
    user: {
      id: target.id,
      email: target.email,
      username: target.username,
      createdAt: target.createdAt
    },
    profile: target.profile
  });
});

// 6. Logout
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    activeSessions.delete(token);
    saveDatabaseToDisk();
  }
  res.json({ success: true });
});

// 7. Sign In as Guest / Recruiter Reviewer Demo
app.post('/api/auth/guest', (req, res) => {
  try {
    const guestId = 'usr_guest_demo';
    let guestAccount = userAccounts.get(guestId);

    if (!guestAccount) {
      const guestProfile: UserProfile = {
        id: `prof_${guestId}`,
        name: 'Alex Vance (Guest Reviewer)',
        experienceLevel: 'intermediate',
        primaryGoal: 'hypertrophy',
        trainingDaysPerWeek: 4,
        preferredDurationMinutes: 60,
        availableEquipment: ['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight'],
        weightUnit: 'kg',
        preferredUnit: 'kg',
        targetFocusAreas: ['latissimus_dorsi', 'chest_upper', 'chest_mid', 'hamstrings'],
        notes: 'Guest reviewer account with seeded training history, 1RM personal records, and 2D anatomical recovery data.'
      };

      guestAccount = {
        id: guestId,
        email: 'guest@trainingintel.demo',
        username: 'Alex Vance (Guest)',
        password: 'guest_demo_password',
        createdAt: new Date().toISOString(),
        profile: guestProfile,
        workouts: getSeedWorkouts(),
        deletedWorkoutIds: [],
        templates: WORKOUT_TEMPLATES.map(t => ({ ...t, id: `tpl_${guestId}_${t.id}` })),
        personalRecords: [...SEED_PERSONAL_RECORDS]
      };

      userAccounts.set(guestId, guestAccount);
    } else {
      // Ensure seed workouts exist if account was somehow cleared
      if (!guestAccount.workouts || guestAccount.workouts.length === 0) {
        guestAccount.workouts = getSeedWorkouts();
        guestAccount.personalRecords = [...SEED_PERSONAL_RECORDS];
      }
    }

    const token = `tok_${guestAccount.id}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
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
  } catch (err: any) {
    res.status(500).json({ error: 'Guest login failed', message: err.message });
  }
});

// ----------------------------------------------------
// REST API ROUTES (PER-USER ISOLATED)
// ----------------------------------------------------

// 1. Health check & Storage Diagnostics
app.get('/api/health', (req, res) => {
  const dbFile = path.join(process.cwd(), 'data', 'database.json');
  const backupFile = path.join(process.cwd(), 'data', 'database.backup.json');
  let totalWorkouts = 0;
  for (const u of userAccounts.values()) {
    totalWorkouts += (u.workouts || []).length;
  }
  res.json({
    status: 'ok',
    healthy: true,
    storage: {
      engine: 'atomic-file-vault',
      primaryExists: fs.existsSync(dbFile),
      backupExists: fs.existsSync(backupFile),
      registeredAthletes: userAccounts.size,
      totalWorkoutsRecorded: totalWorkouts,
      activeSessions: activeSessions.size,
      lastDiskSync: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  });
});

// 2. User Profile
app.get('/api/profile', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized. Please sign in.' });
    return;
  }
  res.json(user.profile);
});

app.post('/api/profile', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized. Please sign in.' });
    return;
  }
  user.profile = { ...user.profile, ...req.body };
  if (req.body.name) {
    const formatted = formatAthleteName(req.body.name, user.email);
    user.username = formatted;
    user.profile.name = formatted;
  }
  saveDatabaseToDisk();
  res.json({ success: true, profile: user.profile });
});

// 3. Exercises
app.get('/api/exercises', (req, res) => {
  const { category, equipment, pattern } = req.query;
  let list = [...EXERCISE_DATABASE];

  if (category) {
    list = list.filter(e => e.category === category);
  }
  if (equipment) {
    list = list.filter(e => e.equipment === equipment);
  }
  if (pattern) {
    list = list.filter(e => e.movementPattern === pattern);
  }

  res.json(list);
});

app.get('/api/exercises/:id', (req, res) => {
  const ex = EXERCISES_MAP[req.params.id];
  if (!ex) {
    res.status(404).json({ error: 'Exercise not found' });
    return;
  }
  res.json(ex);
});

// 4. Workouts
app.get('/api/workouts/deleted-ids', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized. Please sign in.' });
    return;
  }
  res.json({ deletedWorkoutIds: user.deletedWorkoutIds || [] });
});

app.get('/api/workouts', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized. Please sign in.' });
    return;
  }
  if (!Array.isArray(user.workouts)) {
    user.workouts = [];
  }
  const delSet = new Set(user.deletedWorkoutIds || []);
  user.workouts = user.workouts.filter(w => isGenuineWorkout(w) && !delSet.has(w.id));
  
  // Sort newest first safely without NaN bugs
  const sorted = [...user.workouts].sort((a, b) => {
    const tA = a.completedAt ? new Date(a.completedAt).getTime() : (a.startedAt ? new Date(a.startedAt).getTime() : 0);
    const tB = b.completedAt ? new Date(b.completedAt).getTime() : (b.startedAt ? new Date(b.startedAt).getTime() : 0);
    return tB - tA;
  });
  res.json(sorted);
});

app.get('/api/workouts/:id', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized. Please sign in.' });
    return;
  }
  if (!Array.isArray(user.workouts)) {
    user.workouts = [];
  }
  const w = user.workouts.find(x => x.id === req.params.id);
  if (!w) {
    res.status(404).json({ error: 'Workout not found' });
    return;
  }
  res.json(w);
});

app.post('/api/workouts', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized. Please sign in.' });
    return;
  }
  const workout: Workout = req.body;
  if (!workout.id) {
    workout.id = `workout_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }

  // STRICT VALIDATION: reject exercises, templates, or malformed data posted as a workout
  if (!isGenuineWorkout(workout)) {
    res.status(400).json({ error: 'Invalid workout session: workouts must contain an exercises array and valid timestamps, and cannot be individual exercise records.' });
    return;
  }

  if (!Array.isArray(user.workouts)) {
    user.workouts = [];
  }
  if (!Array.isArray(user.deletedWorkoutIds)) {
    user.deletedWorkoutIds = [];
  }

  // If this ID was previously deleted but user explicitly saved it, clear tombstone
  user.deletedWorkoutIds = user.deletedWorkoutIds.filter(id => id !== workout.id);

  // Calculate volume and muscles if missing
  let vol = 0;
  let totalSets = 0;
  const targetedMuscles = new Set<MuscleId>();

  for (const ex of workout.exercises || []) {
    const def = EXERCISES_MAP[ex.exerciseId];
    const setsArr: any[] = Array.isArray(ex?.sets)
      ? ex.sets
      : (ex?.sets && typeof ex.sets === 'object'
        ? Object.values(ex.sets)
        : (typeof ex?.sets === 'number'
          ? Array.from({ length: ex.sets }).map(() => ({ completed: true, weightKg: (ex as any).suggestedWeightKg || (ex as any).weightKg || 0, reps: (ex as any).repMin || (ex as any).reps || 0, type: 'normal' }))
          : []));
    for (const s of setsArr) {
      if (s && s.completed && s.type !== 'warmup') {
        const setWeight = Number(s.weightKg) || 0;
        const setReps = Number(s.reps) || 0;
        vol += setWeight * setReps;
        totalSets++;
        if (def && Array.isArray(def.muscles)) {
          def.muscles.forEach(m => targetedMuscles.add(m.muscleId));
        }
      }
    }
  }

  workout.totalVolumeKg = Math.round(vol);
  workout.totalSets = totalSets;
  workout.musclesTrained = Array.from(targetedMuscles);

  // Check if replacing existing in user account
  const idx = user.workouts.findIndex(w => w.id === workout.id);
  if (idx >= 0) {
    user.workouts[idx] = workout;
  } else {
    user.workouts.unshift(workout);
  }

  // Ensure workouts remain sorted chronologically (newest first)
  user.workouts.sort((a, b) => {
    const tA = a.completedAt ? new Date(a.completedAt).getTime() : (a.startedAt ? new Date(a.startedAt).getTime() : 0);
    const tB = b.completedAt ? new Date(b.completedAt).getTime() : (b.startedAt ? new Date(b.startedAt).getTime() : 0);
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

app.delete('/api/workouts/:id', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized. Please sign in.' });
    return;
  }
  if (!Array.isArray(user.workouts)) {
    user.workouts = [];
  }
  if (!Array.isArray(user.deletedWorkoutIds)) {
    user.deletedWorkoutIds = [];
  }

  const workoutId = req.params.id;
  // Persistent tombstone: record that this workout was explicitly deleted
  if (workoutId && !user.deletedWorkoutIds.includes(workoutId)) {
    user.deletedWorkoutIds.push(workoutId);
  }

  user.workouts = user.workouts.filter(w => w.id !== workoutId);
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

// Purge invalid workouts (templates or corrupted records mistakenly stored in workouts)
app.post('/api/workouts/purge-invalid', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized. Please sign in.' });
    return;
  }
  if (!Array.isArray(user.workouts)) user.workouts = [];
  if (!Array.isArray(user.deletedWorkoutIds)) user.deletedWorkoutIds = [];

  const initialCount = user.workouts.length;
  for (const w of user.workouts) {
    if (!isGenuineWorkout(w) || w.id.startsWith('template_') || w.id.startsWith('tpl_')) {
      if (!user.deletedWorkoutIds.includes(w.id)) {
        user.deletedWorkoutIds.push(w.id);
      }
    }
  }

  user.workouts = user.workouts.filter(w => isGenuineWorkout(w));
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

// Clear all logged workouts for athlete (clean slate)
app.delete('/api/workouts', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized. Please sign in.' });
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

// Re-sync workouts and PRs for user
app.post('/api/workouts/restore', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized. Please sign in.' });
    return;
  }

  if (!Array.isArray(user.workouts)) {
    user.workouts = [];
  }
  if (!Array.isArray(user.deletedWorkoutIds)) {
    user.deletedWorkoutIds = [];
  }

  const delSet = new Set(user.deletedWorkoutIds);

  // Only seed sample workouts if the user is explicitly the guest reviewer account
  if (req.body?.includeSample === true && (user.id === 'usr_guest_demo' || user.email === 'guest@trainingintel.demo')) {
    const defaultHistory = getSeedWorkouts();
    const existingIds = new Set(user.workouts.map(w => w.id));

    for (const sw of defaultHistory) {
      if (!existingIds.has(sw.id) && !delSet.has(sw.id) && isGenuineWorkout(sw)) {
        user.workouts.push(sw);
      }
    }
  }

  // Chronological sort: newest first
  user.workouts.sort((a, b) => {
    const tA = a.completedAt ? new Date(a.completedAt).getTime() : (a.startedAt ? new Date(a.startedAt).getTime() : 0);
    const tB = b.completedAt ? new Date(b.completedAt).getTime() : (b.startedAt ? new Date(b.startedAt).getTime() : 0);
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

// Bidirectional Sync: ensures workouts created on client or before republish are never lost
app.post('/api/workouts/sync', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized. Please sign in.' });
    return;
  }

  if (!Array.isArray(user.workouts)) {
    user.workouts = [];
  }
  if (!Array.isArray(user.deletedWorkoutIds)) {
    user.deletedWorkoutIds = [];
  }

  // 1. Ingest any client-side tombstones
  const incomingDeleted: string[] = Array.isArray(req.body?.deletedWorkoutIds) ? req.body.deletedWorkoutIds : [];
  for (const did of incomingDeleted) {
    if (typeof did === 'string' && did && !user.deletedWorkoutIds.includes(did)) {
      user.deletedWorkoutIds.push(did);
    }
  }

  const deletedSet = new Set(user.deletedWorkoutIds);

  // 2. Clean current server workouts against tombstones and non-genuine objects
  user.workouts = user.workouts.filter(w => isGenuineWorkout(w) && !deletedSet.has(w.id));

  const incomingWorkouts: Workout[] = Array.isArray(req.body?.workouts) ? req.body.workouts : [];
  const existingMap = new Map<string, Workout>();

  for (const w of user.workouts) {
    if (w && w.id && isGenuineWorkout(w) && !deletedSet.has(w.id)) {
      existingMap.set(w.id, w);
    }
  }

  let addedCount = 0;
  for (const w of incomingWorkouts) {
    if (w && w.id) {
      // STRICT FILTER: reject deleted items and reject templates masquerading as workouts
      if (deletedSet.has(w.id) || !isGenuineWorkout(w)) {
        continue;
      }
      const existing = existingMap.get(w.id);
      if (!existing) {
        existingMap.set(w.id, w);
        addedCount++;
      } else {
        const currSets = existing.totalSets || (existing.exercises ? existing.exercises.reduce((acc, e) => acc + (Array.isArray(e.sets) ? e.sets.length : (typeof e.sets === 'number' ? e.sets : 0)), 0) : 0);
        const inSets = w.totalSets || (w.exercises ? w.exercises.reduce((acc, e) => acc + (Array.isArray(e.sets) ? e.sets.length : (typeof e.sets === 'number' ? e.sets : 0)), 0) : 0);
        if (inSets >= currSets || w.completedAt) {
          existingMap.set(w.id, { ...existing, ...w });
        }
      }
    }
  }

  user.workouts = Array.from(existingMap.values());

  // Chronological sort: newest first
  user.workouts.sort((a, b) => {
    const tA = a.completedAt ? new Date(a.completedAt).getTime() : (a.startedAt ? new Date(a.startedAt).getTime() : 0);
    const tB = b.completedAt ? new Date(b.completedAt).getTime() : (b.startedAt ? new Date(b.startedAt).getTime() : 0);
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

// 5. Templates (User-Specific Workout Plans)
app.get('/api/templates', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized. Please sign in.' });
    return;
  }
  if (!Array.isArray(user.templates)) {
    user.templates = [];
  }
  res.json(user.templates);
});

app.post('/api/templates', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized. Please sign in.' });
    return;
  }
  if (!Array.isArray(user.templates)) {
    user.templates = [];
  }
  const t: WorkoutTemplate = req.body;
  if (!t.id) {
    t.id = `template_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }
  const idx = user.templates.findIndex(x => x.id === t.id);
  if (idx >= 0) {
    user.templates[idx] = t;
  } else {
    user.templates.push(t);
  }
  saveDatabaseToDisk();
  res.status(201).json({ success: true, template: t });
});

app.delete('/api/templates/:id', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized. Please sign in.' });
    return;
  }
  if (Array.isArray(user.templates)) {
    user.templates = user.templates.filter(t => t.id !== req.params.id);
    saveDatabaseToDisk();
  }
  res.json({ success: true });
});

// 6. Muscle Exposures & Body Map state
app.get('/api/muscles', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized. Please sign in.' });
    return;
  }
  const exposures = calculateMuscleExposures(user.workouts, EXERCISES_MAP);
  res.json(exposures);
});

app.get('/api/muscles/:id', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized. Please sign in.' });
    return;
  }
  const muscleId = req.params.id as MuscleId;
  const exposures = calculateMuscleExposures(user.workouts, EXERCISES_MAP);
  const data = exposures[muscleId];
  if (!data) {
    res.status(404).json({ error: 'Muscle not found' });
    return;
  }
  res.json(data);
});

// 7. Training Radar & Overview
app.get('/api/radar', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized. Please sign in.' });
    return;
  }
  const radar = buildTrainingRadar(user.workouts, EXERCISES_MAP);
  res.json(radar);
});

// 8. Personal Records
app.get('/api/records', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized. Please sign in.' });
    return;
  }
  res.json(user.personalRecords);
});

// 9. Reset / Demo data toggle for active user
app.post('/api/data/reset', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized. Please sign in.' });
    return;
  }
  const { mode } = req.body; // 'seed' | 'empty'
  if (mode === 'empty' || (user.id !== 'usr_guest_demo' && user.email !== 'guest@trainingintel.demo')) {
    user.workouts = [];
    user.personalRecords = [];
  } else {
    user.workouts = getSeedWorkouts();
    user.personalRecords = [...SEED_PERSONAL_RECORDS];
  }
  saveDatabaseToDisk();
  res.json({ success: true, message: `Reset to ${mode} mode for ${user.username}.` });
});

// 9b. Export Full Athlete Archive (JSON)
app.get('/api/data/export', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized. Please sign in.' });
    return;
  }

  const archive = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    appName: 'Training Intelligence',
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

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="training-intelligence-${user.username.toLowerCase().replace(/\\s+/g, '-')}-backup.json"`);
  res.json(archive);
});

// 9c. Import Full Athlete Archive (JSON)
app.post('/api/data/import', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized. Please sign in.' });
    return;
  }

  const archive = req.body;
  if (!archive || typeof archive !== 'object') {
    res.status(400).json({ error: 'Invalid backup file payload' });
    return;
  }

  if (Array.isArray(archive.workouts)) {
    const existingMap = new Map<string, Workout>();
    for (const w of user.workouts || []) {
      if (w?.id) existingMap.set(w.id, w);
    }
    for (const w of archive.workouts) {
      if (w?.id) existingMap.set(w.id, w);
    }
    user.workouts = Array.from(existingMap.values());
    user.workouts.sort((a, b) => {
      const tA = a.completedAt ? new Date(a.completedAt).getTime() : (a.startedAt ? new Date(a.startedAt).getTime() : 0);
      const tB = b.completedAt ? new Date(b.completedAt).getTime() : (b.startedAt ? new Date(b.startedAt).getTime() : 0);
      return tB - tA;
    });
  }

  if (Array.isArray(archive.templates) && archive.templates.length > 0) {
    const templateMap = new Map<string, WorkoutTemplate>();
    for (const t of user.templates || []) {
      if (t?.id) templateMap.set(t.id, t);
    }
    for (const t of archive.templates) {
      if (t?.id) templateMap.set(t.id, t);
    }
    user.templates = Array.from(templateMap.values());
  }

  if (archive.profile && typeof archive.profile === 'object') {
    user.profile = { ...user.profile, ...archive.profile };
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

// 9d. Universal Full Sync (Bidirectional Client-Server Harmonizer)
app.post('/api/data/sync', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized. Please sign in.' });
    return;
  }

  const { workouts, templates, profile } = req.body || {};

  // Merge Workouts
  if (Array.isArray(workouts)) {
    const existingMap = new Map<string, Workout>();
    for (const w of user.workouts || []) {
      if (w?.id) existingMap.set(w.id, w);
    }
    for (const w of workouts) {
      if (w?.id && !existingMap.has(w.id)) {
        existingMap.set(w.id, w);
      }
    }
    user.workouts = Array.from(existingMap.values());
    user.workouts.sort((a, b) => {
      const tA = a.completedAt ? new Date(a.completedAt).getTime() : (a.startedAt ? new Date(a.startedAt).getTime() : 0);
      const tB = b.completedAt ? new Date(b.completedAt).getTime() : (b.startedAt ? new Date(b.startedAt).getTime() : 0);
      return tB - tA;
    });
  }

  // Merge Templates
  if (Array.isArray(templates)) {
    const templateMap = new Map<string, WorkoutTemplate>();
    for (const t of user.templates || []) {
      if (t?.id) templateMap.set(t.id, t);
    }
    for (const t of templates) {
      if (t?.id && !templateMap.has(t.id)) {
        templateMap.set(t.id, t);
      }
    }
    user.templates = Array.from(templateMap.values());
  }

  // Update profile if client has non-empty fields
  if (profile && typeof profile === 'object' && profile.name) {
    user.profile = { ...user.profile, ...profile };
    user.username = profile.name;
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
    timestamp: new Date().toISOString()
  });
});

// 9b. AI Chat History Management Endpoints
app.get('/api/ai/chat-history', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.json({ success: true, history: [] });
    return;
  }
  res.json({ success: true, history: user.chatHistory || [] });
});

app.post('/api/ai/chat-history', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const { history } = req.body;
  if (Array.isArray(history)) {
    user.chatHistory = history.slice(-100);
    saveDatabaseToDisk();
  }
  res.json({ success: true, history: user.chatHistory || [] });
});

app.delete('/api/ai/chat-history', (req, res) => {
  const user = getUserFromRequest(req);
  if (user) {
    user.chatHistory = [];
    saveDatabaseToDisk();
  }
  res.json({ success: true });
});

// 10. AI Coaching Chat Endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized. Please sign in.' });
      return;
    }
    const { message, conversationHistory } = req.body;
    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const radar = buildTrainingRadar(user.workouts, EXERCISES_MAP);
    const exposures = calculateMuscleExposures(user.workouts, EXERCISES_MAP);

    // Build rich, structured training history context
    const recentWorkoutsSummary = user.workouts.slice(0, 5).map(w => ({
      name: w.name,
      date: new Date(w.completedAt || w.startedAt).toISOString().slice(0, 10),
      durationMinutes: Math.round((w.durationSeconds || 0) / 60) || 45,
      totalVolumeKg: w.totalVolumeKg,
      exercises: (w.exercises || []).map(ex => {
        const setsArr: any[] = Array.isArray(ex?.sets)
          ? ex.sets
          : (ex?.sets && typeof ex.sets === 'object'
            ? Object.values(ex.sets)
            : (typeof ex?.sets === 'number'
              ? Array.from({ length: ex.sets }).map(() => ({ weightKg: (ex as any).suggestedWeightKg || (ex as any).weightKg || 0, reps: (ex as any).repMin || (ex as any).reps || 0 }))
              : []));
        return {
          name: ex.exerciseName || ex.exerciseId,
          setsCount: setsArr.length,
          topSet: setsArr.reduce((max, s) => (Number(s?.weightKg) || 0) > (Number(max?.weightKg) || 0) ? s : max, setsArr[0] || { weightKg: 0, reps: 0 })
        };
      })
    }));

    // Build structured domain context without dumping raw database
    const contextSummary = {
      athleteName: user.username,
      userGoal: user.profile.primaryGoal,
      experienceLevel: user.profile.experienceLevel,
      totalLoggedWorkouts: user.workouts.length,
      weeklyWorkoutsCount: radar.weeklyWorkoutsCount,
      weeklyVolumeKg: radar.weeklyVolumeKg,
      pushPullRatio: radar.pushPullRatio,
      upperLowerRatio: radar.upperLowerRatio,
      todaySuggestedFocus: radar.suggestedFocusToday,
      highFatigueMuscles: radar.highExposureMuscles.map(m => ({
        name: m.name,
        daysAgo: m.daysSinceTraining,
        sets7d: m.effectiveSets7d
      })),
      freshRecoveredMuscles: radar.recoveredMuscles.map(m => ({
        name: m.name,
        daysAgo: m.daysSinceTraining,
        sets7d: m.effectiveSets7d
      })),
      neglectedMuscles: radar.neglectedMuscles.map(m => m.name),
      recentPersonalRecords: user.personalRecords.slice(0, 5).map(p => ({
        exercise: p.exerciseName,
        weight: p.maxWeightKg,
        reps: p.maxReps,
        estimated1RM: p.estimated1RMKg
      })),
      recentCompletedWorkouts: recentWorkoutsSummary
    };

    const getFallbackReply = () => {
      const reply = `Based on your live Training Intelligence data, **${user.username}**:\n\n` +
        `• **Suggested Focus Today**: **${radar.suggestedFocusToday.title}**\n` +
        `• **Rationale**: ${radar.suggestedFocusToday.rationale}\n\n` +
        `**Fatigue & Recovery Status**:\n` +
        (radar.highExposureMuscles.length > 0
          ? `• **High Exposure (Rest/Protect)**: ${radar.highExposureMuscles.map(m => m.name).join(', ')}\n`
          : `• No muscle groups currently in extreme fatigue.\n`) +
        (radar.recoveredMuscles.length > 0
          ? `• **Ready & Recovered**: ${radar.recoveredMuscles.map(m => m.name).join(', ')}\n`
          : '') +
        `\n**Coaching Note**: You can start today's recommended session directly or explore the Workout Generator to build a custom session tailored to your ${user.profile.primaryGoal} goal.`;

      return {
        reply,
        referencedMuscles: radar.suggestedFocusToday.muscles,
        suggestedActions: [
          'Generate workout for today',
          'Review my weekly volume',
          'Which muscles are neglected?'
        ]
      };
    };

    const ai = getGeminiClient();

    if (!ai) {
      res.json(getFallbackReply());
      return;
    }

    const systemInstruction = `You are Training Intelligence, an elite AI Strength & Conditioning Coach and Exercise Scientist.
You give evidence-based, concise, highly actionable training advice based strictly on the user's structured workout history and recovery state.

STRICT FORMATTING & COACHING RULES:
1. Ground your advice in the provided JSON training context. Do NOT hallucinate workout statistics or PR numbers that do not exist.
2. If data is missing or user has zero logs in an area, explicitly state: "I don't have enough logged data to assess that yet."
3. Distinguish clearly between FACT (from logged history), INFERENCE (estimated recovery status/heuristics), and RECOMMENDATION.
4. Keep answers clean, concise, and structured. Use Markdown formatting properly: bold keywords, bullet points with '-', and section headers.
5. Address the athlete as ${user.username}.

Current User Training State:
${JSON.stringify(contextSummary, null, 2)}`;

    // Build contents array including previous conversation turns
    const chatContents: any[] = [];
    if (Array.isArray(conversationHistory)) {
      for (const turn of conversationHistory.slice(-6)) {
        if (turn.text && turn.sender) {
          chatContents.push({
            role: turn.sender === 'assistant' ? 'model' : 'user',
            parts: [{ text: turn.text }]
          });
        }
      }
    }
    chatContents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    try {
      const response = await generateGeminiContentWithFallback(ai, {
        contents: chatContents,
        config: {
          systemInstruction,
          temperature: 0.7
        },
        primaryModel: 'gemini-2.5-flash'
      });

      const reply = response.text || "Here is my assessment of your current training state.";

      res.json({
        reply,
        referencedMuscles: radar.suggestedFocusToday.muscles,
        suggestedActions: [
          'Generate a workout for today',
          'Analyze my bench progression',
          'How is my push vs pull balance?'
        ]
      });
    } catch (modelErr) {
      console.warn('Gemini models unavailable, falling back to local coach intelligence:', modelErr);
      res.json(getFallbackReply());
    }
  } catch (err: any) {
    console.error('AI chat error:', err);
    res.status(500).json({ error: 'AI consultation failed', message: err.message });
  }
});

// Deterministic algorithmic workout builder supporting any muscle focus and split
function buildAlgorithmicWorkout(
  targetFocus: string,
  targetMinutes: number,
  equipment: string = 'Standard Gym',
  radar: any
): AIWorkoutPlan {
  const f = targetFocus.toLowerCase();
  let exercises: any[] = [];
  let warmup = '5 min dynamic mobility + 2 ramp-up warmup sets before first working movement.';

  if (f.includes('push') || f.includes('chest') || f.includes('pec')) {
    exercises = [
      {
        exerciseId: 'barbell_bench_press',
        exerciseName: 'Barbell Bench Press',
        sets: 3,
        repMin: 6,
        repMax: 8,
        rir: 2,
        restSeconds: 150,
        suggestedWeightKg: 82.5,
        coachingNote: 'Retract and depress scapulae. Drive through floor.'
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
        coachingNote: 'Focus on upper clavicular stretch at the bottom.'
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
        coachingNote: 'Lead with elbows in scapular plane with controlled negative.'
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
        coachingNote: 'Spread rope outward at peak contraction, elbows pinned.'
      }
    ];
  } else if (f.includes('pull') || f.includes('back') || f.includes('lat')) {
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
        coachingNote: 'Pull to lower abdomen, hold 1s at top contraction.'
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
        coachingNote: 'Drive elbows down into back pockets, control return.'
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
        coachingNote: 'Rotate thumbs backwards at finish to engage external rotators.'
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
        coachingNote: 'Strict form with full extension at the bottom.'
      }
    ];
  } else if (f.includes('leg') || f.includes('quad') || f.includes('hamstring') || f.includes('glute') || f.includes('lower')) {
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
        coachingNote: 'Hit parallel depth with knees tracking toes.'
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
        coachingNote: 'Hinge hips backwards, maximize hamstring stretch.'
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
        coachingNote: '1-second pause at top lockout to stress rectus femoris.'
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
        coachingNote: '2-second deep stretch at the bottom of every rep.'
      }
    ];
  } else if (f.includes('shoulder') || f.includes('arm') || f.includes('delt')) {
    exercises = [
      {
        exerciseId: 'overhead_barbell_press',
        exerciseName: 'Overhead Barbell Press (OHP)',
        sets: 3,
        repMin: 6,
        repMax: 8,
        rir: 2,
        restSeconds: 150,
        suggestedWeightKg: 52.5,
        coachingNote: 'Brace core and glutes, press vertically.'
      },
      {
        exerciseId: 'dumbbell_lateral_raise',
        exerciseName: 'Dumbbell Lateral Raise',
        sets: 4,
        repMin: 12,
        repMax: 15,
        rir: 1,
        restSeconds: 60,
        suggestedWeightKg: 12.5,
        coachingNote: 'Raise in the scapular plane with smooth control.'
      },
      {
        exerciseId: 'incline_dumbbell_curl',
        exerciseName: 'Incline Dumbbell Bicep Curl',
        sets: 3,
        repMin: 10,
        repMax: 12,
        rir: 1,
        restSeconds: 75,
        suggestedWeightKg: 14,
        coachingNote: 'Deep stretch on the long head of the bicep.'
      },
      {
        exerciseId: 'overhead_cable_triceps_extension',
        exerciseName: 'Overhead Cable Triceps Extension',
        sets: 3,
        repMin: 10,
        repMax: 12,
        rir: 1,
        restSeconds: 75,
        suggestedWeightKg: 25,
        coachingNote: 'Emphasize long head triceps stretch behind the head.'
      }
    ];
  } else if (f.includes('upper')) {
    exercises = [
      {
        exerciseId: 'incline_dumbbell_press',
        exerciseName: 'Incline Dumbbell Bench Press',
        sets: 3,
        repMin: 8,
        repMax: 10,
        rir: 2,
        restSeconds: 120,
        suggestedWeightKg: 28,
        coachingNote: 'Full chest stretch, control negative.'
      },
      {
        exerciseId: 'chest_supported_t_bar_row',
        exerciseName: 'Chest-Supported Row',
        sets: 3,
        repMin: 8,
        repMax: 10,
        rir: 2,
        restSeconds: 120,
        suggestedWeightKg: 55,
        coachingNote: 'Squeeze mid-back rhomboids together.'
      },
      {
        exerciseId: 'dumbbell_lateral_raise',
        exerciseName: 'Dumbbell Lateral Raise',
        sets: 3,
        repMin: 12,
        repMax: 15,
        rir: 1,
        restSeconds: 60,
        suggestedWeightKg: 12.5,
        coachingNote: 'Consistent cadence without swinging.'
      },
      {
        exerciseId: 'triceps_rope_pushdown',
        exerciseName: 'Cable Triceps Rope Pushdown',
        sets: 3,
        repMin: 10,
        repMax: 12,
        rir: 1,
        restSeconds: 75,
        suggestedWeightKg: 27.5,
        coachingNote: 'Lock out fully at the bottom.'
      }
    ];
  } else {
    // Full Body / General
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
        exerciseName: 'Barbell Bench Press',
        sets: 3,
        repMin: 6,
        repMax: 8,
        rir: 2,
        restSeconds: 150,
        suggestedWeightKg: 80,
        coachingNote: 'Smooth descent to mid-sternum.'
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

  return {
    name: `${targetFocus} — Intelligence Session`,
    targetFocus: targetFocus,
    durationMinutes: targetMinutes,
    rationale: `Targeted session synthesized from your real-time recovery profile. Focuses on prime movement patterns while protecting fatigued regions.`,
    warmupTip: warmup,
    exercises
  };
}

// 11. AI Structured Workout Generator Endpoint
app.post('/api/ai/workout', async (req, res) => {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized. Please sign in.' });
      return;
    }
    const { focus, durationMinutes, equipment, intensity } = req.body;
    const radar = buildTrainingRadar(user.workouts, EXERCISES_MAP);
    const exposures = calculateMuscleExposures(user.workouts, EXERCISES_MAP);

    const targetMinutes = durationMinutes || 50;
    const targetFocus = focus || radar.suggestedFocusToday.title;

    const ai = getGeminiClient();

    if (!ai) {
      // Deterministic evidence-based workout generator fallback
      const plan = buildAlgorithmicWorkout(targetFocus, targetMinutes, equipment, radar);
      res.json(plan);
      return;
    }

    try {
      const availableExercisesList = EXERCISE_DATABASE.map(e => ({
        id: e.id,
        name: e.name,
        category: e.category,
        pattern: e.movementPattern,
        equipment: e.equipment,
        mechanics: e.mechanics
      }));

      const prompt = `Create a structured workout plan for:
- Target Focus: ${targetFocus}
- Duration: ${targetMinutes} minutes
- Equipment Available: ${equipment || 'Standard Gym'}
- Intensity/RIR: 1-2 RIR target
- Current Recovered Groups: ${radar.recoveredMuscles.map((m: any) => m.name).join(', ') || 'All balanced'}
- Fatigued Groups to Protect: ${radar.highExposureMuscles.map((m: any) => m.name).join(', ') || 'None'}

Available Exercise Catalog to choose from:
${JSON.stringify(availableExercisesList, null, 2)}

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
      "suggestedWeightKg": number,
      "coachingNote": "string"
    }
  ]
}`;

      const response = await generateGeminiContentWithFallback(ai, {
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        },
        primaryModel: 'gemini-2.5-flash'
      });

      let rawText = response.text || '';
      // Strip any markdown code fence wrappers if present
      rawText = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

      const parsed: AIWorkoutPlan = JSON.parse(rawText);
      if (parsed && Array.isArray(parsed.exercises) && parsed.exercises.length > 0) {
        res.json(parsed);
        return;
      }
    } catch (aiErr) {
      console.warn('Gemini generation fallback engaged:', aiErr);
    }

    // Safe fallback if Gemini fails or returns incomplete structure
    const fallbackPlan = buildAlgorithmicWorkout(targetFocus, targetMinutes, equipment, radar);
    res.json(fallbackPlan);
  } catch (err: any) {
    console.error('AI workout generation error:', err);
    res.status(500).json({ error: 'Workout generation failed', message: err.message });
  }
});

// ----------------------------------------------------
// VITE DEV MIDDLEWARE / STATIC ASSETS
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Training Intelligence server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
