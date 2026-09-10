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
  TrainingDataArchive
} from '../types';
import { EXERCISE_DATABASE, EXERCISES_MAP } from './exerciseDatabase';
import { DEFAULT_USER_PROFILE, WORKOUT_TEMPLATES, getSeedWorkouts, SEED_PERSONAL_RECORDS } from './seedData';
import { calculateMuscleExposures, buildTrainingRadar } from './muscleMath';
import { storageVault } from './storageVault';

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
    if (data.token) {
      this.setSession(data.token, data.user?.id, data.user?.email);
    }
    return data;
  },

  async getMe(): Promise<{ success: boolean; user: AuthUser; profile: UserProfile } | null> {
    try {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: this.getHeaders()
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (data && data.user) {
        try {
          if (data.token) this.setToken(data.token);
          if (data.user.id) localStorage.setItem('training_intel_user_id', data.user.id);
          if (data.user.email) localStorage.setItem('training_intel_user_email', data.user.email);
        } catch {}
      }
      return data;
    } catch {
      return null;
    }
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
    if (data.token) {
      this.setSession(data.token, data.user?.id, data.user?.email);
    }
    return data;
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders()
      });
    } finally {
      this.setToken(null);
      try {
        localStorage.removeItem('training_intel_user_id');
        localStorage.removeItem('training_intel_user_email');
      } catch {}
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
      const res = await fetch(`${BASE_URL}/workouts/sync`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ workouts })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.workouts) {
          await storageVault.saveWorkouts(data.workouts);
        }
        return data;
      }
    } catch (err) {
      console.warn('[Storage] Workout sync warning:', err);
    }
    return { success: false };
  },

  async getWorkouts(): Promise<Workout[]> {
    let localWorkouts = await storageVault.getWorkouts();

    try {
      const res = await fetch(`${BASE_URL}/workouts`, {
        headers: this.getHeaders()
      });
      if (res.ok) {
        const serverWorkouts: Workout[] = await res.json();
        if (Array.isArray(serverWorkouts)) {
          // If local storage vault has workouts missing from the server (e.g. server reboot or cold start),
          // immediately auto-heal the server by syncing them!
          const serverIds = new Set(serverWorkouts.map(w => w.id));
          const missingOnServer = localWorkouts.filter(w => !serverIds.has(w.id));

          if (missingOnServer.length > 0) {
            console.log(`[Storage] Auto-healing: syncing ${missingOnServer.length} vaulted workouts to server...`);
            const syncResult = await this.syncWorkouts(localWorkouts);
            if (syncResult.success && syncResult.workouts) {
              await storageVault.saveWorkouts(syncResult.workouts);
              return syncResult.workouts;
            }
          }

          await storageVault.saveWorkouts(serverWorkouts);
          return serverWorkouts;
        }
      }
    } catch (err) {
      console.warn('[Storage] Backend workouts fetch issue, using storage vault:', err);
    }

    // Return vaulted workouts (IndexedDB + LocalStorage)
    if (localWorkouts.length > 0) {
      return localWorkouts;
    }

    return [];
  },

  async saveWorkout(workout: Workout): Promise<{
    workout: Workout;
    workouts?: Workout[];
    personalRecords?: PersonalRecord[];
    muscles?: Record<MuscleId, MuscleExposureData>;
    radar?: TrainingRadar;
  }> {
    // 1. Instant local vault persistence (zero latency, zero risk)
    const updatedLocal = await storageVault.saveWorkout(workout);

    // 2. Persist to server backend
    try {
      const res = await fetch(`${BASE_URL}/workouts`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(workout)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.workouts) {
          await storageVault.saveWorkouts(data.workouts);
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
    // 1. Instant delete in storage vault
    const remaining = await storageVault.deleteWorkout(id);

    // 2. Delete on server
    try {
      const res = await fetch(`${BASE_URL}/workouts/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.workouts) {
          await storageVault.saveWorkouts(data.workouts);
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
    try {
      const res = await fetch(`${BASE_URL}/templates`, {
        headers: this.getHeaders()
      });
      if (res.ok) {
        const templates = await res.json();
        if (Array.isArray(templates) && templates.length > 0) {
          await storageVault.saveTemplates(templates);
          return templates;
        }
      }
    } catch {}

    const vaulted = await storageVault.getTemplates();
    if (vaulted && vaulted.length > 0) return vaulted;
    return WORKOUT_TEMPLATES;
  },

  async saveTemplate(template: WorkoutTemplate): Promise<WorkoutTemplate> {
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
      return calculateMuscleExposures(w.length > 0 ? w : getSeedWorkouts(), EXERCISES_MAP);
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
      return buildTrainingRadar(w.length > 0 ? w : getSeedWorkouts(), EXERCISES_MAP);
    }
  },

  async getPersonalRecords(): Promise<PersonalRecord[]> {
    try {
      const res = await fetch(`${BASE_URL}/records`, {
        headers: this.getHeaders()
      });
      if (res.ok) {
        const prs = await res.json();
        if (Array.isArray(prs)) {
          await storageVault.saveRecords(prs);
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
  }
};
