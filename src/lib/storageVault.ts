import {
  Workout,
  WorkoutTemplate,
  UserProfile,
  PersonalRecord,
  AuthUser,
  TrainingDataArchive,
  AIMessage
} from '../types';

const DB_NAME = 'training_intel_vault_v1';
const STORE_NAME = 'athlete_store';
const DB_VERSION = 1;

// LocalStorage Keys for instant sync failover
const LS_KEYS = {
  MASTER_WORKOUTS: 'training_intel_master_workouts',
  WORKOUTS: 'training_intel_workouts_cache',
  PROFILE: 'training_intel_profile_cache',
  TEMPLATES: 'training_intel_templates_cache',
  RECORDS: 'training_intel_records_cache',
  USER: 'training_intel_user_cache',
  LAST_SYNC: 'training_intel_last_sync_timestamp',
  DELETED_WORKOUTS: 'training_intel_deleted_workout_ids',
  CHAT_HISTORY: 'training_intel_chat_history_cache'
};

// Strict validation to prevent templates, exercises, or corrupted items from polluting workout history
export function isGenuineWorkout(w: any): boolean {
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

  // 2. Reject objects that are individual exercises masquerading as workouts
  if (w.exerciseId || w.exerciseName) {
    return false;
  }

  // 3. Reject template data structures
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

function getDeletedWorkoutStorageKey(): string {
  try {
    const saved = localStorage.getItem('training_intel_user_id');
    if (saved && saved.trim()) {
      return `deleted_${saved.trim().replace(/[^a-zA-Z0-9_-]/g, '_')}`;
    }
  } catch {}
  return LS_KEYS.DELETED_WORKOUTS;
}

export function getDeletedWorkoutIds(): Set<string> {
  const set = new Set<string>();
  const storageKey = getDeletedWorkoutStorageKey();
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const id of parsed) {
          if (typeof id === 'string' && id) set.add(id);
        }
      }
    }
  } catch {}
  return set;
}

export function addDeletedWorkoutId(id: string): void {
  if (!id) return;
  const set = getDeletedWorkoutIds();
  set.add(id);
  const arr = Array.from(set);
  const storageKey = getDeletedWorkoutStorageKey();
  try {
    localStorage.setItem(storageKey, JSON.stringify(arr));
  } catch {}
  idbSet(storageKey, arr).catch(() => {});
}

export function addDeletedWorkoutIds(ids: string[]): void {
  if (!Array.isArray(ids) || ids.length === 0) return;
  const set = getDeletedWorkoutIds();
  for (const id of ids) {
    if (typeof id === 'string' && id) set.add(id);
  }
  const arr = Array.from(set);
  const storageKey = getDeletedWorkoutStorageKey();
  try {
    localStorage.setItem(storageKey, JSON.stringify(arr));
  } catch {}
  idbSet(storageKey, arr).catch(() => {});
}

export function removeDeletedWorkoutId(id: string): void {
  if (!id) return;
  const set = getDeletedWorkoutIds();
  if (set.has(id)) {
    set.delete(id);
    const arr = Array.from(set);
    const storageKey = getDeletedWorkoutStorageKey();
    try {
      localStorage.setItem(storageKey, JSON.stringify(arr));
    } catch {}
    idbSet(storageKey, arr).catch(() => {});
  }
}

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
    if (saved && saved.trim()) {
      const clean = saved.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      return `${baseKey}_${clean}`;
    }
    const token = localStorage.getItem('training_intel_token');
    if (token && token.trim()) {
      const cleanToken = token.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32);
      return `${baseKey}_tok_${cleanToken}`;
    }
  } catch {}
  return `${baseKey}_anon_session`;
}

export const storageVault = {
  // 1. Workouts with Indestructible Conflict-Free Merge & Deletion Tombstones
  async persistDirectWorkouts(workouts: Workout[]): Promise<void> {
    const k = getActiveUserStorageKey('workouts');
    const delSet = getDeletedWorkoutIds();
    // Guarantee no non-genuine or deleted workouts enter the vault
    const cleanList = (workouts || []).filter(w => isGenuineWorkout(w) && !delSet.has(w.id));

    cleanList.sort((a, b) => {
      const tA = a.completedAt ? new Date(a.completedAt).getTime() : (a.startedAt ? new Date(a.startedAt).getTime() : 0);
      const tB = b.completedAt ? new Date(b.completedAt).getTime() : (b.startedAt ? new Date(b.startedAt).getTime() : 0);
      return tB - tA;
    });

    try {
      localStorage.setItem(k, JSON.stringify(cleanList));
    } catch (e) {
      console.warn('[StorageVault] LocalStorage write notice:', e);
    }
    await idbSet(k, cleanList);
    this.markSyncTimestamp();
  },

  async saveWorkouts(incomingWorkouts: Workout[], replace = false): Promise<void> {
    const delSet = getDeletedWorkoutIds();

    const validIncoming = (incomingWorkouts || []).filter(w => isGenuineWorkout(w) && !delSet.has(w.id));
    const map = new Map<string, Workout>();

    // If not full replacement, preserve existing genuine non-deleted workouts
    if (!replace) {
      const existing = await this.getWorkouts();
      for (const w of existing) {
        if (w && w.id && isGenuineWorkout(w) && !delSet.has(w.id)) {
          map.set(w.id, w);
        }
      }
    }

    // Merge incoming workouts: keep the richer/newer version
    for (const inW of validIncoming) {
      const curr = map.get(inW.id);
      if (!curr) {
        map.set(inW.id, inW);
      } else {
        const currSets = curr.totalSets || (curr.exercises ? curr.exercises.reduce((acc, e) => acc + (Array.isArray(e.sets) ? e.sets.length : (typeof e.sets === 'number' ? e.sets : 0)), 0) : 0);
        const inSets = inW.totalSets || (inW.exercises ? inW.exercises.reduce((acc, e) => acc + (Array.isArray(e.sets) ? e.sets.length : (typeof e.sets === 'number' ? e.sets : 0)), 0) : 0);
        if (inSets >= currSets || inW.completedAt) {
          map.set(inW.id, { ...curr, ...inW });
        }
      }
    }

    const merged = Array.from(map.values());
    merged.sort((a, b) => {
      const tA = a.completedAt ? new Date(a.completedAt).getTime() : (a.startedAt ? new Date(a.startedAt).getTime() : 0);
      const tB = b.completedAt ? new Date(b.completedAt).getTime() : (b.startedAt ? new Date(b.startedAt).getTime() : 0);
      return tB - tA;
    });

    await this.persistDirectWorkouts(merged);
  },

  async getWorkouts(): Promise<Workout[]> {
    const delSet = getDeletedWorkoutIds();

    const map = new Map<string, Workout>();
    const k = getActiveUserStorageKey('workouts');

    // Helper to safely ingest workouts strictly from the current authenticated user's store
    const ingest = (list: any) => {
      if (Array.isArray(list)) {
        const currentUid = (() => {
          try {
            return localStorage.getItem('training_intel_user_id') || '';
          } catch {
            return '';
          }
        })();

        for (const w of list) {
          if (w && w.id && isGenuineWorkout(w) && !delSet.has(w.id)) {
            // Adopt local, cross-device, or alias workouts into current active user account
            if (w.userId && currentUid && w.userId !== currentUid) {
              const isCrossDeviceCompatible =
                w.userId === 'usr_athlete_local' ||
                w.userId === 'usr_default' ||
                w.userId === 'usr_guest_demo' ||
                w.userId === 'usr_karam_owner' ||
                w.userId.startsWith('fb_') ||
                !w.userId.startsWith('usr_') ||
                currentUid === 'usr_karam_owner' ||
                (currentUid !== 'usr_guest_demo' && w.userId !== 'usr_guest_demo');

              if (isCrossDeviceCompatible) {
                w.userId = currentUid;
              } else {
                continue;
              }
            } else if (!w.userId && currentUid) {
              w.userId = currentUid;
            }
            const curr = map.get(w.id);
            if (!curr) {
              map.set(w.id, w);
            } else {
              const currSets = curr.totalSets || (curr.exercises ? curr.exercises.reduce((acc, e) => acc + (Array.isArray(e.sets) ? e.sets.length : (typeof e.sets === 'number' ? e.sets : 0)), 0) : 0);
              const wSets = w.totalSets || (w.exercises ? w.exercises.reduce((acc, e) => acc + (Array.isArray(e.sets) ? e.sets.length : (typeof e.sets === 'number' ? e.sets : 0)), 0) : 0);
              if (wSets >= currSets || w.completedAt) {
                map.set(w.id, { ...curr, ...w });
              }
            }
          }
        }
      }
    };

    // Load exclusively from current active user vault in IndexedDB and localStorage
    ingest(await idbGet<Workout[]>(k));
    try {
      const raw = localStorage.getItem(k);
      if (raw) ingest(JSON.parse(raw));
    } catch {}

    const results = Array.from(map.values());
    results.sort((a, b) => {
      const tA = a.completedAt ? new Date(a.completedAt).getTime() : (a.startedAt ? new Date(a.startedAt).getTime() : 0);
      const tB = b.completedAt ? new Date(b.completedAt).getTime() : (b.startedAt ? new Date(b.startedAt).getTime() : 0);
      return tB - tA;
    });

    return results;
  },

  async saveWorkout(workout: Workout): Promise<Workout[]> {
    if (!isGenuineWorkout(workout)) {
      console.warn('[StorageVault] Refusing to save non-genuine workout object to workout history.');
      return await this.getWorkouts();
    }

    const currentUid = (() => {
      try {
        return localStorage.getItem('training_intel_user_id') || '';
      } catch {
        return '';
      }
    })();
    if (currentUid && !workout.userId) {
      workout.userId = currentUid;
    }

    const all = await this.getWorkouts();
    const idx = all.findIndex(w => w.id === workout.id);
    let updated: Workout[];

    if (idx >= 0) {
      updated = [...all];
      updated[idx] = { ...all[idx], ...workout };
    } else {
      updated = [workout, ...all];
    }

    // Sort newest first
    updated.sort((a, b) => {
      const tA = a.completedAt ? new Date(a.completedAt).getTime() : (a.startedAt ? new Date(a.startedAt).getTime() : 0);
      const tB = b.completedAt ? new Date(b.completedAt).getTime() : (b.startedAt ? new Date(b.startedAt).getTime() : 0);
      return tB - tA;
    });

    await this.persistDirectWorkouts(updated);
    return updated;
  },

  async deleteWorkout(id: string): Promise<Workout[]> {
    if (!id) return await this.getWorkouts();

    // 1. Record persistent tombstone for this user so it can never be resurrected
    addDeletedWorkoutId(id);

    // 2. Eradicate from active user's storage key
    const k = getActiveUserStorageKey('workouts');
    const existing = await this.getWorkouts();
    const remaining = existing.filter(w => w.id !== id);

    try {
      localStorage.setItem(k, JSON.stringify(remaining));
    } catch {}

    // 3. Update IndexedDB store for active user
    await idbSet(k, remaining);

    return remaining;
  },

  // 1b. Deep Sanitation Utility: clears out any fake template entries or orphaned records
  async purgeInvalidWorkouts(): Promise<number> {
    const delSet = getDeletedWorkoutIds();
    const purgedIds: string[] = [];
    const k = getActiveUserStorageKey('workouts');

    try {
      const raw = localStorage.getItem(k);
      if (raw && raw.startsWith('[')) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          let dirty = false;
          const cleaned = parsed.filter((item: any) => {
            if (!item || !item.id) return false;
            if (!isGenuineWorkout(item) || item.id.startsWith('template_') || item.id.startsWith('tpl_')) {
              dirty = true;
              if (typeof item.id === 'string' && (item.id.startsWith('template_') || item.id.startsWith('tpl_'))) {
                purgedIds.push(item.id);
              }
              return false;
            }
            return true;
          });
          if (dirty) {
            localStorage.setItem(k, JSON.stringify(cleaned));
          }
        }
      }
    } catch {}

    if (purgedIds.length > 0) {
      addDeletedWorkoutIds(purgedIds);
    }

    const cleanWorkouts = await this.getWorkouts();
    await this.persistDirectWorkouts(cleanWorkouts);
    return purgedIds.length;
  },

  async clearAllWorkouts(): Promise<void> {
    const existing = await this.getWorkouts();
    const ids = existing.map(w => w.id).filter(Boolean);
    if (ids.length > 0) {
      addDeletedWorkoutIds(ids);
    }
    const k = getActiveUserStorageKey('workouts');
    try {
      localStorage.setItem(k, JSON.stringify([]));
    } catch {}
    await idbSet(k, []);
  },

  getDeletedWorkoutIds(): Set<string> {
    return getDeletedWorkoutIds();
  },

  addDeletedWorkoutId(id: string): void {
    addDeletedWorkoutId(id);
  },

  addDeletedWorkoutIds(ids: string[]): void {
    addDeletedWorkoutIds(ids);
  },

  removeDeletedWorkoutId(id: string): void {
    removeDeletedWorkoutId(id);
  },

  // 2. User Authentication Cache
  async saveUser(user: AuthUser): Promise<void> {
    const k = getActiveUserStorageKey('user');
    try {
      localStorage.setItem(k, JSON.stringify(user));
      localStorage.setItem(LS_KEYS.USER, JSON.stringify(user));
      localStorage.setItem('training_intel_user_id', user.id);
      if (user.email) localStorage.setItem('training_intel_user_email', user.email);
    } catch {}
    await idbSet(k, user);
  },

  async getUser(): Promise<AuthUser | null> {
    const k = getActiveUserStorageKey('user');
    const idbData = await idbGet<AuthUser>(k);
    if (idbData && idbData.id) return idbData;

    try {
      const raw = localStorage.getItem(k);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.id) return parsed;
      }
      const generic = localStorage.getItem(LS_KEYS.USER);
      if (generic) {
        const parsed = JSON.parse(generic);
        const currentUid = localStorage.getItem('training_intel_user_id');
        if (parsed && parsed.id && (!currentUid || parsed.id === currentUid)) return parsed;
      }
    } catch {}

    return null;
  },

  // 3. Profile
  async saveProfile(profile: UserProfile): Promise<void> {
    const k = getActiveUserStorageKey('profile');
    try {
      localStorage.setItem(k, JSON.stringify(profile));
    } catch {}
    await idbSet(k, profile);
  },

  async getProfile(): Promise<UserProfile | null> {
    const k = getActiveUserStorageKey('profile');
    const idbData = await idbGet<UserProfile>(k);
    if (idbData && idbData.id) return idbData;

    try {
      const raw = localStorage.getItem(k);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.id) return parsed;
      }
    } catch {}

    return null;
  },

  // 3. Templates
  async saveTemplates(templates: WorkoutTemplate[]): Promise<void> {
    const k = getActiveUserStorageKey('templates');
    try {
      localStorage.setItem(k, JSON.stringify(templates));
    } catch {}
    await idbSet(k, templates);
  },

  async getTemplates(): Promise<WorkoutTemplate[]> {
    const k = getActiveUserStorageKey('templates');
    const idbData = await idbGet<WorkoutTemplate[]>(k);
    if (Array.isArray(idbData) && idbData.length > 0) return idbData;

    try {
      const raw = localStorage.getItem(k);
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
  },

  // 7. AI Trainer Chat Conversation History
  async getChatHistory(): Promise<AIMessage[]> {
    const k = getActiveUserStorageKey('chat_history');
    try {
      const idbData = await idbGet<AIMessage[]>(k);
      if (Array.isArray(idbData) && idbData.length > 0) return idbData;

      const raw = localStorage.getItem(k) || localStorage.getItem(LS_KEYS.CHAT_HISTORY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  },

  async saveChatHistory(messages: AIMessage[]): Promise<void> {
    if (!Array.isArray(messages)) return;
    const k = getActiveUserStorageKey('chat_history');
    const capped = messages.slice(-100);
    try {
      localStorage.setItem(k, JSON.stringify(capped));
      localStorage.setItem(LS_KEYS.CHAT_HISTORY, JSON.stringify(capped));
    } catch {}
    await Promise.all([
      idbSet(k, capped),
      idbSet(LS_KEYS.CHAT_HISTORY, capped)
    ]);
  },

  async clearChatHistory(): Promise<void> {
    const k = getActiveUserStorageKey('chat_history');
    try {
      localStorage.removeItem(k);
      localStorage.removeItem(LS_KEYS.CHAT_HISTORY);
    } catch {}
    await Promise.all([
      idbSet(k, []),
      idbSet(LS_KEYS.CHAT_HISTORY, [])
    ]);
  }
};
