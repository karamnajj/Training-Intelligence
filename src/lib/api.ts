import {
  Workout,
  WorkoutTemplate,
  UserProfile,
  PersonalRecord,
  MuscleExposureData,
  TrainingRadar,
  Exercise,
  AIWorkoutPlan,
  MuscleId,
  AuthResponse,
  AuthUser,
  TrainingDataArchive,
  AIMessage
} from '../types';
import { EXERCISE_DATABASE, EXERCISES_MAP } from './exerciseDatabase';
import { DEFAULT_USER_PROFILE, WORKOUT_TEMPLATES } from './seedData';
import { calculateMuscleExposures, buildTrainingRadar } from './muscleMath';
import { storageVault, isGenuineWorkout, getDeletedWorkoutIds, addDeletedWorkoutIds, removeDeletedWorkoutId } from './storageVault';
import {
  auth,
  saveWorkoutToFirestore,
  deleteWorkoutFromFirestore,
  getWorkoutsFromFirestore,
  clearAllWorkoutsFromFirestore,
  purgeInvalidWorkoutsFromFirestore,
  saveTemplateToFirestore,
  getTemplatesFromFirestore,
  savePersonalRecordToFirestore,
  getPersonalRecordsFromFirestore,
  saveUserProfileToFirestore,
  getUserProfileFromFirestore,
  signOutFromFirebase,
  waitForFirebaseAuth
} from './firebase';

const BASE_URL = '/api';
const TOKEN_STORAGE_KEY = 'training_intel_token';

export const api = {
  // Token & session management
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  },

  setToken(token: string | null) {
    try {
      if (token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to set token:', e);
    }
  },

  setSession(token: string | null, userId?: string, email?: string) {
    this.setToken(token);
    try {
      if (userId) localStorage.setItem('training_intel_user_id', userId);
      if (email) localStorage.setItem('training_intel_user_email', email);
    } catch {}
  },

  getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store',
      'Pragma': 'no-cache',
      ...customHeaders
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    try {
      const savedUserId = localStorage.getItem('training_intel_user_id');
      if (savedUserId) headers['x-user-id'] = savedUserId;
      const savedEmail = localStorage.getItem('training_intel_user_email');
      if (savedEmail) headers['x-user-email'] = savedEmail;
    } catch {}
    return headers;
  },

  // Auth & Account API
  async register(params: {
    email: string;
    username: string;
    password: string;
    primaryGoal?: string;
    experienceLevel?: string;
    trainingDaysPerWeek?: number;
    weightUnit?: 'kg' | 'lbs';
  }): Promise<AuthResponse> {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Registration failed' }));
      throw new Error(err.error || 'Registration failed');
    }
    const data: AuthResponse = await res.json();
    if (data.token) {
      this.setSession(data.token, data.user?.id, data.user?.email);
    }
    if (data.user) {
      storageVault.saveUser(data.user).catch(() => {});
    }
    if (data.profile) {
      storageVault.saveProfile(data.profile).catch(() => {});
    }
    return data;
  },

  async login(params: { email: string; password: string }): Promise<AuthResponse> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(err.error || 'Invalid credentials');
    }
    const data: AuthResponse = await res.json();
    if (data.token) {
      this.setSession(data.token, data.user?.id, data.user?.email);
    }
    if (data.user) {
      storageVault.saveUser(data.user).catch(() => {});
    }
    if (data.profile) {
      storageVault.saveProfile(data.profile).catch(() => {});
    }
    return data;
  },

  async loginAsGuest(): Promise<AuthResponse> {
    const res = await fetch(`${BASE_URL}/auth/guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Guest login failed' }));
      throw new Error(err.error || 'Guest login failed');
    }
    const data: AuthResponse = await res.json();
    try {
      await signOutFromFirebase();
    } catch {}
    if (data.token) {
      this.setSession(data.token, data.user?.id, data.user?.email);
    }
    if (data.user) {
      localStorage.setItem('training_intel_user_name', data.user.username);
      await storageVault.saveUser(data.user);
    }
    if (data.profile) {
      await storageVault.saveProfile(data.profile);
    }
    return data;
  },

  async getMe(): Promise<{ success: boolean; user: AuthUser; profile: UserProfile } | null> {
    try {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: this.getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.user) {
          try {
            if (data.token) this.setToken(data.token);
            if (data.user.id) localStorage.setItem('training_intel_user_id', data.user.id);
            if (data.user.email) localStorage.setItem('training_intel_user_email', data.user.email);
            if (Array.isArray(data.deletedWorkoutIds) && data.deletedWorkoutIds.length > 0) {
              addDeletedWorkoutIds(data.deletedWorkoutIds);
            }
            storageVault.saveUser(data.user).catch(() => {});
            if (data.profile) storageVault.saveProfile(data.profile).catch(() => {});
          } catch {}
          return data;
        }
      }
    } catch {
      // Offline / server restart failover
    }

    // Resilient local vault recovery: Never log the athlete out if local session is cached!
    const localUser = await storageVault.getUser();
    if (localUser && localUser.id) {
      const localProfile = await storageVault.getProfile() || {
        id: `prof_${localUser.id}`,
        name: localUser.username || 'Athlete',
        experienceLevel: 'intermediate',
        primaryGoal: 'hypertrophy',
        trainingDaysPerWeek: 4,
        preferredDurationMinutes: 60,
        availableEquipment: ['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight'],
        weightUnit: 'kg',
        preferredUnit: 'kg',
        focusMuscles: ['latissimus_dorsi', 'chest_upper', 'chest_mid', 'quadriceps']
      };
      return {
        success: true,
        user: localUser,
        profile: localProfile
      };
    }

    return null;
  },

  async getUsersList(): Promise<Array<{
    id: string;
    email: string;
    username: string;
    primaryGoal: string;
    experienceLevel: string;
    workoutCount: number;
    templateCount: number;
    createdAt: string;
  }>> {
    try {
      const res = await fetch(`${BASE_URL}/auth/users`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async switchAccount(userId: string): Promise<AuthResponse> {
    const res = await fetch(`${BASE_URL}/auth/switch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    if (!res.ok) throw new Error('Failed to switch user account');
    const data: AuthResponse = await res.json();
    if (userId === 'usr_guest_demo') {
      try {
        await signOutFromFirebase();
      } catch {}
    }
    if (data.token) {
      this.setSession(data.token, data.user?.id, data.user?.email);
    }
    if (data.user) {
      localStorage.setItem('training_intel_user_name', data.user.username);
      await storageVault.saveUser(data.user);
    }
    if (data.profile) {
      await storageVault.saveProfile(data.profile);
    }
    return data;
  },

  async logout(): Promise<void> {
    const currentUid = (() => {
      try {
        return localStorage.getItem('training_intel_user_id') || undefined;
      } catch {
        return undefined;
      }
    })();
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders()
      });
    } catch {}

    try {
      await signOutFromFirebase();
    } catch {}

    this.setToken(null);
    try {
      localStorage.removeItem('training_intel_user_id');
      localStorage.removeItem('training_intel_user_email');
    } catch {}
    if (currentUid) {
      await storageVault.clearUserCache(currentUid);
    }
  },

  // Profile
  async getProfile(): Promise<UserProfile> {
    try {
      const res = await fetch(`${BASE_URL}/profile`, {
        headers: this.getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch profile');
      const p: UserProfile = await res.json();
      if (p && p.id) {
        await storageVault.saveProfile(p);
      }
      return p;
    } catch {
      const vaulted = await storageVault.getProfile();
      if (vaulted && vaulted.id) return vaulted;
      return DEFAULT_USER_PROFILE;
    }
  },

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const res = await fetch(`${BASE_URL}/profile`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      if (data.profile) {
        await storageVault.saveProfile(data.profile);
      }
      return data.profile;
    } catch {
      const existing = (await storageVault.getProfile()) || DEFAULT_USER_PROFILE;
      const updated = { ...existing, ...profile };
      await storageVault.saveProfile(updated);
      return updated;
    }
  },

  async getExercises(): Promise<Exercise[]> {
    try {
      const res = await fetch(`${BASE_URL}/exercises`);
      if (!res.ok) throw new Error('Failed to fetch exercises');
      return await res.json();
    } catch {
      return EXERCISE_DATABASE;
    }
  },

  async syncWorkouts(workouts: Workout[]): Promise<{
    success: boolean;
    workouts?: Workout[];
    personalRecords?: PersonalRecord[];
    muscles?: Record<MuscleId, MuscleExposureData>;
    radar?: TrainingRadar;
  }> {
    try {
      const delSet = getDeletedWorkoutIds();
      const cleanWorkouts = (workouts || []).filter(w => isGenuineWorkout(w) && !delSet.has(w.id));

      const res = await fetch(`${BASE_URL}/workouts/sync`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          workouts: cleanWorkouts,
          deletedWorkoutIds: Array.from(delSet)
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.deletedWorkoutIds && Array.isArray(data.deletedWorkoutIds)) {
          addDeletedWorkoutIds(data.deletedWorkoutIds);
        }
        if (data.workouts && Array.isArray(data.workouts)) {
          await storageVault.saveWorkouts(data.workouts, true);
        }
        return data;
      }
    } catch (err) {
      console.warn('[Storage] Workout sync warning:', err);
    }
    return { success: false };
  },

  async getWorkouts(): Promise<Workout[]> {
    const workoutMap = new Map<string, Workout>();
    const activeUserId = (() => {
      try {
        return localStorage.getItem('training_intel_user_id') || '';
      } catch {
        return '';
      }
    })();
    const isGuest = activeUserId === 'usr_guest_demo';

    let currentFirebaseUser = isGuest ? null : auth.currentUser;
    if (!currentFirebaseUser && !isGuest) {
      currentFirebaseUser = await waitForFirebaseAuth(350);
    }

    // 0. Synchronize latest tombstones from server across all devices
    try {
      const delRes = await fetch(`${BASE_URL}/workouts/deleted-ids`, {
        headers: this.getHeaders()
      });
      if (delRes.ok) {
        const delData = await delRes.json();
        if (delData.deletedWorkoutIds && Array.isArray(delData.deletedWorkoutIds) && delData.deletedWorkoutIds.length > 0) {
          addDeletedWorkoutIds(delData.deletedWorkoutIds);
        }
      }
    } catch {}

    const delSet = getDeletedWorkoutIds();

    // 1. First retrieve all safe local workouts from storage vault (Filtered by tombstones & genuine check)
    try {
      const localWorkouts = await storageVault.getWorkouts();
      if (Array.isArray(localWorkouts)) {
        for (const w of localWorkouts) {
          if (w && w.id && isGenuineWorkout(w) && !delSet.has(w.id)) {
            workoutMap.set(w.id, w);
          }
        }
      }
    } catch (lErr) {
      console.warn('[StorageVault] Local workouts retrieval notice:', lErr);
    }

    // 2. Cloud Firestore: If Firebase user is authenticated (and not guest), retrieve directly from cloud and auto-purge tombstones
    if (!isGuest && currentFirebaseUser?.uid) {
      try {
        const firestoreWorkouts = await getWorkoutsFromFirestore(currentFirebaseUser.uid, delSet);
        if (Array.isArray(firestoreWorkouts) && firestoreWorkouts.length > 0) {
          for (const fw of firestoreWorkouts) {
            if (fw && fw.id && isGenuineWorkout(fw) && !delSet.has(fw.id)) {
              const existing = workoutMap.get(fw.id);
              if (!existing) {
                workoutMap.set(fw.id, fw);
              } else {
                const exSets = existing.totalSets || (existing.exercises ? existing.exercises.reduce((acc, e) => acc + (Array.isArray(e.sets) ? e.sets.length : (typeof e.sets === 'number' ? e.sets : 0)), 0) : 0);
                const fwSets = fw.totalSets || (fw.exercises ? fw.exercises.reduce((acc, e) => acc + (Array.isArray(e.sets) ? e.sets.length : (typeof e.sets === 'number' ? e.sets : 0)), 0) : 0);
                if (fwSets >= exSets) {
                  workoutMap.set(fw.id, fw);
                }
              }
            }
          }
        }
      } catch (fErr) {
        console.warn('[Firestore] Cloud workouts fetch notice:', fErr);
      }
    }

    // 3. Query backend server and merge (Desktop/Server is source of truth)
    try {
      const res = await fetch(`${BASE_URL}/workouts?_t=${Date.now()}`, {
        headers: this.getHeaders(),
        cache: 'no-store'
      });
      if (res.ok) {
        const serverWorkouts: Workout[] = await res.json();
        if (Array.isArray(serverWorkouts) && serverWorkouts.length > 0) {
          for (const sw of serverWorkouts) {
            if (sw && sw.id && isGenuineWorkout(sw)) {
              // Server actively returned this workout: it is alive! Un-tombstone if needed
              if (delSet.has(sw.id)) {
                removeDeletedWorkoutId(sw.id);
                delSet.delete(sw.id);
              }
              const existing = workoutMap.get(sw.id);
              if (!existing) {
                workoutMap.set(sw.id, sw);
              } else {
                const exSets = existing.totalSets || (existing.exercises ? existing.exercises.reduce((acc, e) => acc + (Array.isArray(e.sets) ? e.sets.length : (typeof e.sets === 'number' ? e.sets : 0)), 0) : 0);
                const swSets = sw.totalSets || (sw.exercises ? sw.exercises.reduce((acc, e) => acc + (Array.isArray(e.sets) ? e.sets.length : (typeof e.sets === 'number' ? e.sets : 0)), 0) : 0);
                if (swSets >= exSets || sw.completedAt) {
                  workoutMap.set(sw.id, { ...existing, ...sw });
                }
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('[Storage] Backend workouts fetch issue, proceeding with merged vault:', err);
    }

    const mergedList = Array.from(workoutMap.values()).filter(w => isGenuineWorkout(w) && !delSet.has(w.id));
    mergedList.sort((a, b) => {
      const tA = a.completedAt ? new Date(a.completedAt).getTime() : (a.startedAt ? new Date(a.startedAt).getTime() : 0);
      const tB = b.completedAt ? new Date(b.completedAt).getTime() : (b.startedAt ? new Date(b.startedAt).getTime() : 0);
      return tB - tA;
    });

    // 4. Save consolidated workouts back to storage vault safely
    await storageVault.saveWorkouts(mergedList, false);

    // Auto-Heal: Sync with Firestore and server
    if (!isGuest && currentFirebaseUser?.uid && mergedList.length > 0) {
      for (const w of mergedList) {
        saveWorkoutToFirestore(currentFirebaseUser.uid, w).catch(() => {});
      }
    }

    if (mergedList.length > 0) {
      this.syncWorkouts(mergedList).catch(() => {});
    }

    return mergedList;
  },

  async saveWorkout(workout: Workout): Promise<{
    workout: Workout;
    workouts?: Workout[];
    personalRecords?: PersonalRecord[];
    muscles?: Record<MuscleId, MuscleExposureData>;
    radar?: TrainingRadar;
  }> {
    if (!isGenuineWorkout(workout)) {
      throw new Error('Invalid workout session: must have an exercises array and timing, and cannot be an individual exercise record.');
    }

    // 1. Instant local vault persistence (zero latency, zero risk)
    const updatedLocal = await storageVault.saveWorkout(workout);

    // 2. Direct Cloud Firestore write (permanent, never wiped on redeploy)
    const currentFirebaseUser = auth.currentUser;
    if (currentFirebaseUser?.uid) {
      saveWorkoutToFirestore(currentFirebaseUser.uid, workout).catch(err => {
        console.warn('[Firestore] Real-time workout write warning:', err);
      });
    }

    // 3. Persist to server backend
    try {
      const res = await fetch(`${BASE_URL}/workouts`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(workout)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.workouts) {
          await storageVault.saveWorkouts(data.workouts, false);
        }
        if (data.personalRecords) {
          await storageVault.saveRecords(data.personalRecords);
        }
        return data;
      }
    } catch (err) {
      console.warn('[Storage] Server save delayed, saved safely in storage vault:', err);
    }

    return {
      workout,
      workouts: updatedLocal
    };
  },

  async deleteWorkout(id: string): Promise<{
    success: boolean;
    deletedId?: string;
    workouts?: Workout[];
    personalRecords?: PersonalRecord[];
    muscles?: Record<MuscleId, MuscleExposureData>;
    radar?: TrainingRadar;
  }> {
    // 1. Persistent Tombstone + Instant eradication from Storage Vault
    const remaining = await storageVault.deleteWorkout(id);

    // 2. Delete from Cloud Firestore
    const currentFirebaseUser = auth.currentUser;
    if (currentFirebaseUser?.uid) {
      deleteWorkoutFromFirestore(currentFirebaseUser.uid, id).catch(err => {
        console.warn('[Firestore] Delete workout warning:', err);
      });
    }

    // 3. Delete on server (records tombstone on server side too)
    try {
      const res = await fetch(`${BASE_URL}/workouts/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.deletedWorkoutIds && Array.isArray(data.deletedWorkoutIds)) {
          addDeletedWorkoutIds(data.deletedWorkoutIds);
        }
        if (data.workouts) {
          // Authoritative replacement save, NOT an additive union!
          await storageVault.saveWorkouts(data.workouts, true);
        }
        if (data.personalRecords) {
          await storageVault.saveRecords(data.personalRecords);
        }
        return data;
      }
    } catch (err) {
      console.warn('[Storage] Server delete issue:', err);
    }

    return { success: true, deletedId: id, workouts: remaining };
  },

  async purgeInvalidWorkouts(): Promise<{
    success: boolean;
    purgedCount?: number;
    workouts?: Workout[];
    personalRecords?: PersonalRecord[];
    muscles?: Record<MuscleId, MuscleExposureData>;
    radar?: TrainingRadar;
  }> {
    // 1. Clean local storage vault
    await storageVault.purgeInvalidWorkouts();

    // 2. Clean Firestore if signed in
    if (auth.currentUser?.uid) {
      try {
        await purgeInvalidWorkoutsFromFirestore(auth.currentUser.uid, getDeletedWorkoutIds());
      } catch (fErr) {
        console.warn('[Firestore] Purge invalid notice:', fErr);
      }
    }

    // 3. Trigger server purge
    try {
      const res = await fetch(`${BASE_URL}/workouts/purge-invalid`, {
        method: 'POST',
        headers: this.getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.deletedWorkoutIds && Array.isArray(data.deletedWorkoutIds)) {
          addDeletedWorkoutIds(data.deletedWorkoutIds);
        }
        if (data.workouts) {
          await storageVault.saveWorkouts(data.workouts, true);
        }
        if (data.personalRecords) {
          await storageVault.saveRecords(data.personalRecords);
        }
        return data;
      }
    } catch (err) {
      console.warn('[Storage] Server purge notice:', err);
    }

    const clean = await storageVault.getWorkouts();
    return { success: true, workouts: clean };
  },

  async clearAllWorkouts(): Promise<{
    success: boolean;
    workouts: Workout[];
    personalRecords: PersonalRecord[];
    muscles?: Record<MuscleId, MuscleExposureData>;
    radar?: TrainingRadar;
  }> {
    // 1. Wipe and tombstone local stores
    await storageVault.clearAllWorkouts();

    // 2. Wipe Firestore if signed in
    if (auth.currentUser?.uid) {
      try {
        await clearAllWorkoutsFromFirestore(auth.currentUser.uid);
      } catch (fErr) {
        console.warn('[Firestore] Clear all workouts notice:', fErr);
      }
    }

    // 3. Wipe on server
    try {
      const res = await fetch(`${BASE_URL}/workouts`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.deletedWorkoutIds && Array.isArray(data.deletedWorkoutIds)) {
          addDeletedWorkoutIds(data.deletedWorkoutIds);
        }
        return data;
      }
    } catch (err) {
      console.warn('[Storage] Clear all workouts server notice:', err);
    }

    return {
      success: true,
      workouts: [],
      personalRecords: [],
      muscles: calculateMuscleExposures([], EXERCISES_MAP),
      radar: buildTrainingRadar([], EXERCISES_MAP)
    };
  },

  async restoreWorkouts(): Promise<{
    workouts: Workout[];
    personalRecords: PersonalRecord[];
    muscles: Record<MuscleId, MuscleExposureData>;
    radar: TrainingRadar;
  }> {
    const res = await fetch(`${BASE_URL}/workouts/restore`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to restore workouts');
    const data = await res.json();
    if (data.workouts) {
      await storageVault.saveWorkouts(data.workouts);
    }
    if (data.personalRecords) {
      await storageVault.saveRecords(data.personalRecords);
    }
    return data;
  },

  async getTemplates(): Promise<WorkoutTemplate[]> {
    const currentFirebaseUser = auth.currentUser;
    if (currentFirebaseUser?.uid) {
      try {
        const firestoreTemplates = await getTemplatesFromFirestore(currentFirebaseUser.uid);
        if (Array.isArray(firestoreTemplates) && firestoreTemplates.length > 0) {
          await storageVault.saveTemplates(firestoreTemplates);
          return firestoreTemplates;
        }
      } catch {}
    }

    try {
      const res = await fetch(`${BASE_URL}/templates`, {
        headers: this.getHeaders()
      });
      if (res.ok) {
        const templates = await res.json();
        if (Array.isArray(templates) && templates.length > 0) {
          await storageVault.saveTemplates(templates);
          if (currentFirebaseUser?.uid) {
            for (const t of templates) {
              saveTemplateToFirestore(currentFirebaseUser.uid, t).catch(() => {});
            }
          }
          return templates;
        }
      }
    } catch {}

    const vaulted = await storageVault.getTemplates();
    if (vaulted && vaulted.length > 0) return vaulted;
    return WORKOUT_TEMPLATES;
  },

  async saveTemplate(template: WorkoutTemplate): Promise<WorkoutTemplate> {
    const currentFirebaseUser = auth.currentUser;
    if (currentFirebaseUser?.uid) {
      saveTemplateToFirestore(currentFirebaseUser.uid, template).catch(() => {});
    }

    const res = await fetch(`${BASE_URL}/templates`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(template)
    });
    const data = await res.json();
    const existing = await storageVault.getTemplates();
    const filtered = existing.filter(t => t.id !== template.id);
    await storageVault.saveTemplates([data.template, ...filtered]);
    return data.template;
  },

  async deleteTemplate(id: string): Promise<void> {
    await fetch(`${BASE_URL}/templates/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    const existing = await storageVault.getTemplates();
    await storageVault.saveTemplates(existing.filter(t => t.id !== id));
  },

  async getMuscles(): Promise<Record<MuscleId, MuscleExposureData>> {
    try {
      const res = await fetch(`${BASE_URL}/muscles`, {
        headers: this.getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch muscles');
      return await res.json();
    } catch {
      const w = await storageVault.getWorkouts();
      return calculateMuscleExposures(w, EXERCISES_MAP);
    }
  },

  async getRadar(): Promise<TrainingRadar> {
    try {
      const res = await fetch(`${BASE_URL}/radar`, {
        headers: this.getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch radar');
      return await res.json();
    } catch {
      const w = await storageVault.getWorkouts();
      return buildTrainingRadar(w, EXERCISES_MAP);
    }
  },

  async getPersonalRecords(): Promise<PersonalRecord[]> {
    const currentFirebaseUser = auth.currentUser;
    if (currentFirebaseUser?.uid) {
      try {
        const firestorePrs = await getPersonalRecordsFromFirestore(currentFirebaseUser.uid);
        if (Array.isArray(firestorePrs) && firestorePrs.length > 0) {
          await storageVault.saveRecords(firestorePrs);
          return firestorePrs;
        }
      } catch {}
    }

    try {
      const res = await fetch(`${BASE_URL}/records`, {
        headers: this.getHeaders()
      });
      if (res.ok) {
        const prs = await res.json();
        if (Array.isArray(prs) && prs.length > 0) {
          await storageVault.saveRecords(prs);
          if (currentFirebaseUser?.uid) {
            for (const r of prs) {
              savePersonalRecordToFirestore(currentFirebaseUser.uid, r).catch(() => {});
            }
          }
          return prs;
        }
      }
    } catch {}

    return await storageVault.getRecords();
  },

  // Full Universal Data Synchronization
  async syncAllData(localData?: {
    workouts?: Workout[];
    templates?: WorkoutTemplate[];
    profile?: UserProfile;
  }): Promise<{
    success: boolean;
    workouts?: Workout[];
    templates?: WorkoutTemplate[];
    profile?: UserProfile;
    personalRecords?: PersonalRecord[];
    muscles?: Record<MuscleId, MuscleExposureData>;
    radar?: TrainingRadar;
  }> {
    try {
      const payload = {
        workouts: localData?.workouts || (await storageVault.getWorkouts()),
        templates: localData?.templates || (await storageVault.getTemplates()),
        profile: localData?.profile || (await storageVault.getProfile())
      };

      const res = await fetch(`${BASE_URL}/data/sync`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.workouts) await storageVault.saveWorkouts(data.workouts);
        if (data.templates) await storageVault.saveTemplates(data.templates);
        if (data.profile) await storageVault.saveProfile(data.profile);
        if (data.personalRecords) await storageVault.saveRecords(data.personalRecords);
        return data;
      }
    } catch (err) {
      console.warn('[Storage] Full sync warning:', err);
    }
    return { success: false };
  },

  // Export Full Backup File
  async exportBackup(currentUser?: AuthUser | null, profile?: UserProfile | null): Promise<void> {
    try {
      const res = await fetch(`${BASE_URL}/data/export`, {
        headers: this.getHeaders()
      });
      if (res.ok) {
        const archive: TrainingDataArchive = await res.json();
        storageVault.downloadArchive(archive);
        return;
      }
    } catch {
      console.warn('[Storage] Server export fallback to local vault...');
    }

    // Fallback: build archive from storage vault
    const [w, t, pr, p] = await Promise.all([
      storageVault.getWorkouts(),
      storageVault.getTemplates(),
      storageVault.getRecords(),
      storageVault.getProfile()
    ]);
    const archive = storageVault.createArchive(currentUser || null, profile || p, w, t, pr);
    storageVault.downloadArchive(archive);
  },

  // Import Full Backup File
  async importBackup(rawJson: string): Promise<{
    success: boolean;
    message?: string;
    workouts?: Workout[];
    templates?: WorkoutTemplate[];
    profile?: UserProfile;
    personalRecords?: PersonalRecord[];
  }> {
    const archive = storageVault.parseArchive(rawJson);
    if (!archive) {
      throw new Error('Invalid training intelligence backup file. Please check the JSON format.');
    }

    // 1. Vault locally first
    if (archive.workouts) await storageVault.saveWorkouts(archive.workouts);
    if (archive.templates) await storageVault.saveTemplates(archive.templates);
    if (archive.profile) await storageVault.saveProfile(archive.profile);
    if (archive.personalRecords) await storageVault.saveRecords(archive.personalRecords);

    // 2. Post to server
    try {
      const res = await fetch(`${BASE_URL}/data/import`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(archive)
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (err) {
      console.warn('[Storage] Server import error, retained in storage vault:', err);
    }

    return {
      success: true,
      message: `Restored ${archive.workouts.length} workouts and ${archive.templates.length} templates from backup.`,
      workouts: archive.workouts,
      templates: archive.templates,
      profile: archive.profile,
      personalRecords: archive.personalRecords
    };
  },

  // Health and Storage Diagnostics
  async getHealth(): Promise<{
    status: string;
    healthy: boolean;
    storage?: {
      engine: string;
      primaryExists: boolean;
      backupExists: boolean;
      registeredAthletes: number;
      totalWorkoutsRecorded: number;
      lastDiskSync: string;
    };
  }> {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      return await res.json();
    } catch {
      return { status: 'offline', healthy: false };
    }
  },

  async resetData(mode: 'seed' | 'empty'): Promise<void> {
    await fetch(`${BASE_URL}/data/reset`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ mode })
    });
    if (mode === 'empty') {
      await storageVault.saveWorkouts([]);
      await storageVault.saveRecords([]);
    }
  },

  async askAICoach(
    message: string,
    conversationHistory: any[] = []
  ): Promise<{
    reply: string;
    referencedMuscles?: MuscleId[];
    suggestedActions?: string[];
  }> {
    const res = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ message, conversationHistory })
    });
    if (!res.ok) {
      throw new Error('AI consultation failed');
    }
    return await res.json();
  },

  async generateAIWorkout(params: {
    focus?: string;
    durationMinutes?: number;
    equipment?: string;
  }): Promise<AIWorkoutPlan> {
    const res = await fetch(`${BASE_URL}/ai/workout`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      throw new Error('AI workout generation failed');
    }
    return await res.json();
  },

  // AI Trainer Chat History Persistence
  async getChatHistory(): Promise<AIMessage[]> {
    try {
      const local = await storageVault.getChatHistory();
      if (Array.isArray(local) && local.length > 0) {
        return local;
      }
    } catch {}

    try {
      const res = await fetch(`${BASE_URL}/ai/chat-history`, {
        headers: this.getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.history) && data.history.length > 0) {
          storageVault.saveChatHistory(data.history).catch(() => {});
          return data.history;
        }
      }
    } catch {}

    return [];
  },

  async saveChatHistory(history: AIMessage[]): Promise<void> {
    await storageVault.saveChatHistory(history);
    try {
      fetch(`${BASE_URL}/ai/chat-history`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ history })
      }).catch(() => {});
    } catch {}
  },

  async clearChatHistory(): Promise<void> {
    await storageVault.clearChatHistory();
    try {
      fetch(`${BASE_URL}/ai/chat-history`, {
        method: 'DELETE',
        headers: this.getHeaders()
      }).catch(() => {});
    } catch {}
  }
};
