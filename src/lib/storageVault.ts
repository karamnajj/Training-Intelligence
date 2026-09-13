import {
  Workout,
  WorkoutTemplate,
  UserProfile,
  PersonalRecord,
  AuthUser,
  TrainingDataArchive
} from '../types';

const DB_NAME = 'training_intel_vault_v1';
const STORE_NAME = 'athlete_store';
const DB_VERSION = 1;

// LocalStorage Keys for instant sync failover
const LS_KEYS = {
  WORKOUTS: 'training_intel_workouts_cache',
  PROFILE: 'training_intel_profile_cache',
  TEMPLATES: 'training_intel_templates_cache',
  RECORDS: 'training_intel_records_cache',
  USER: 'training_intel_user_cache',
  LAST_SYNC: 'training_intel_last_sync_timestamp'
};

function openIndexedDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }

    try {
      const req = window.indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      req.onsuccess = () => {
        resolve(req.result);
      };

      req.onerror = () => {
        console.warn('[StorageVault] IndexedDB open error, falling back to LocalStorage');
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

async function idbGet<T>(key: string): Promise<T | null> {
  const db = await openIndexedDB();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);

      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbSet(key: string, val: any): Promise<boolean> {
  const db = await openIndexedDB();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(val, key);

      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

function getActiveUserStorageKey(baseKey: string): string {
  try {
    const saved = localStorage.getItem('training_intel_user_id');
    if (saved && saved.trim()) return `${baseKey}_${saved.trim()}`;
    const token = localStorage.getItem('training_intel_token');
    if (token) {
      if (token.includes('usr_guest_demo')) return `${baseKey}_usr_guest_demo`;
      if (token.includes('usr_karam_owner')) return `${baseKey}_usr_karam_owner`;
    }
  } catch {}
  return `${baseKey}_default`;
}

export const storageVault = {
  // 1. Workouts
  async saveWorkouts(workouts: Workout[], allowEmpty = false): Promise<void> {
    const k = getActiveUserStorageKey('workouts');
    // Guard against accidental wipes: If incoming array is empty, but we already have stored workouts, do not overwrite unless explicitly forced
    if (!allowEmpty && (!workouts || workouts.length === 0)) {
      const existing = await this.getWorkouts();
      if (existing && existing.length > 0) {
        console.warn('[StorageVault] Safeguard engaged: Prevented overwriting existing workouts with empty array.');
        return;
      }
    }

    try {
      localStorage.setItem(k, JSON.stringify(workouts));
    } catch (e) {
      console.warn('[StorageVault] LocalStorage write warning:', e);
    }
    await idbSet(k, workouts);
    this.markSyncTimestamp();
  },

  async getWorkouts(): Promise<Workout[]> {
    const k = getActiveUserStorageKey('workouts');
    // Try IndexedDB first (user scoped)
    const idbData = await idbGet<Workout[]>(k);
    if (Array.isArray(idbData)) {
      return idbData;
    }

    // Secondary fallback: LocalStorage
    try {
      const raw = localStorage.getItem(k);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          await idbSet(k, parsed);
          return parsed;
        }
      }
    } catch {}

    return [];
  },

  async saveWorkout(workout: Workout): Promise<Workout[]> {
    const all = await this.getWorkouts();
    const idx = all.findIndex(w => w.id === workout.id);
    let updated: Workout[];

    if (idx >= 0) {
      updated = [...all];
      updated[idx] = workout;
    } else {
      updated = [workout, ...all];
    }

    // Sort newest first
    updated.sort((a, b) => {
      const tA = a.completedAt ? new Date(a.completedAt).getTime() : (a.startedAt ? new Date(a.startedAt).getTime() : 0);
      const tB = b.completedAt ? new Date(b.completedAt).getTime() : (b.startedAt ? new Date(b.startedAt).getTime() : 0);
      return tB - tA;
    });

    await this.saveWorkouts(updated);
    return updated;
  },

  async deleteWorkout(id: string): Promise<Workout[]> {
    const all = await this.getWorkouts();
    const filtered = all.filter(w => w.id !== id);
    await this.saveWorkouts(filtered);
    return filtered;
  },

  // 2. Profile
  async saveProfile(profile: UserProfile): Promise<void> {
    try {
      localStorage.setItem(LS_KEYS.PROFILE, JSON.stringify(profile));
    } catch {}
    await idbSet('profile', profile);
  },

  async getProfile(): Promise<UserProfile | null> {
    const idbData = await idbGet<UserProfile>('profile');
    if (idbData && idbData.id) return idbData;

    try {
      const raw = localStorage.getItem(LS_KEYS.PROFILE);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.id) return parsed;
      }
    } catch {}

    return null;
  },

  // 3. Templates
  async saveTemplates(templates: WorkoutTemplate[]): Promise<void> {
    try {
      localStorage.setItem(LS_KEYS.TEMPLATES, JSON.stringify(templates));
    } catch {}
    await idbSet('templates', templates);
  },

  async getTemplates(): Promise<WorkoutTemplate[]> {
    const idbData = await idbGet<WorkoutTemplate[]>('templates');
    if (Array.isArray(idbData) && idbData.length > 0) return idbData;

    try {
      const raw = localStorage.getItem(LS_KEYS.TEMPLATES);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}

    return [];
  },

  // 4. Personal Records
  async saveRecords(records: PersonalRecord[]): Promise<void> {
    const k = getActiveUserStorageKey('records');
    try {
      localStorage.setItem(k, JSON.stringify(records));
    } catch {}
    await idbSet(k, records);
  },

  async getRecords(): Promise<PersonalRecord[]> {
    const k = getActiveUserStorageKey('records');
    const idbData = await idbGet<PersonalRecord[]>(k);
    if (Array.isArray(idbData)) return idbData;

    try {
      const raw = localStorage.getItem(k);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}

    return [];
  },

  async clearUserCache(userId?: string): Promise<void> {
    // CRITICAL: Never delete logged workouts or personal records on logout!
    // Workouts and records are the athlete's valuable history and must persist.
    // We only remove ephemeral draft keys if needed.
    try {
      localStorage.removeItem('training_intel_active_draft');
    } catch {}
  },

  // 5. Sync metadata
  markSyncTimestamp(): void {
    try {
      localStorage.setItem(LS_KEYS.LAST_SYNC, new Date().toISOString());
    } catch {}
  },

  getLastSyncTimestamp(): string | null {
    try {
      return localStorage.getItem(LS_KEYS.LAST_SYNC);
    } catch {
      return null;
    }
  },

  // 6. Export / Import Backup
  createArchive(
    user: AuthUser | null,
    profile: UserProfile | null,
    workouts: Workout[],
    templates: WorkoutTemplate[],
    personalRecords: PersonalRecord[]
  ): TrainingDataArchive {
    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      appName: 'Training Intelligence',
      user: {
        id: user?.id || profile?.id || 'usr_athlete',
        username: user?.username || profile?.name || 'Athlete',
        email: user?.email || 'athlete@trainingintel.app'
      },
      profile: profile || {
        id: 'prof_default',
        name: 'Athlete',
        experienceLevel: 'intermediate',
        primaryGoal: 'hypertrophy',
        trainingDaysPerWeek: 4,
        preferredDurationMinutes: 60,
        availableEquipment: ['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight'],
        weightUnit: 'kg',
        preferredUnit: 'kg',
        focusMuscles: ['latissimus_dorsi', 'chest_upper', 'chest_mid']
      },
      workouts,
      templates,
      personalRecords
    };
  },

  downloadArchive(archive: TrainingDataArchive): void {
    const jsonStr = JSON.stringify(archive, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateTag = new Date().toISOString().split('T')[0];
    const fileName = `training-intelligence-backup-${dateTag}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  parseArchive(rawJson: string): TrainingDataArchive | null {
    try {
      const data = JSON.parse(rawJson);
      if (!data || typeof data !== 'object') return null;

      // Basic structure validation
      if (!Array.isArray(data.workouts)) return null;

      return {
        version: data.version || '1.0.0',
        exportedAt: data.exportedAt || new Date().toISOString(),
        appName: data.appName || 'Training Intelligence',
        user: data.user || {
          id: 'usr_imported',
          username: 'Imported Athlete',
          email: 'imported@trainingintel.app'
        },
        profile: data.profile || {
          id: 'prof_imported',
          name: 'Athlete',
          experienceLevel: 'intermediate',
          primaryGoal: 'hypertrophy',
          trainingDaysPerWeek: 4,
          preferredDurationMinutes: 60,
          availableEquipment: ['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight'],
          weightUnit: 'kg',
          preferredUnit: 'kg',
          focusMuscles: []
        },
        workouts: data.workouts,
        templates: Array.isArray(data.templates) ? data.templates : [],
        personalRecords: Array.isArray(data.personalRecords) ? data.personalRecords : []
      };
    } catch {
      return null;
    }
  }
};
