import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Workout,
  WorkoutExercise,
  WorkoutTemplate,
  UserProfile,
  PersonalRecord,
  MuscleExposureData,
  TrainingRadar,
  AIWorkoutPlan,
  MuscleId
} from './types';
import { api } from './lib/api';
import { storageVault, isGenuineWorkout, getDeletedWorkoutIds } from './lib/storageVault';
import { calculateMuscleExposures, buildTrainingRadar, generateRecommendedWorkoutSession } from './lib/muscleMath';
import { EXERCISES_MAP } from './lib/exerciseDatabase';
import { WORKOUT_TEMPLATES } from './lib/seedData';
import {
  auth,
  subscribeToFirebaseAuth,
  waitForFirebaseAuth,
  signOutFromFirebase,
  getWorkoutsFromFirestore,
  subscribeToWorkoutsFromFirestore,
  saveWorkoutToFirestore,
  getTemplatesFromFirestore,
  getUserProfileFromFirestore
} from './lib/firebase';
import {
  getActiveWorkoutSession,
  clearActiveWorkoutSession,
  createAndSaveActiveSession,
  sessionToPartialWorkout,
  ActiveWorkoutSession
} from './lib/activeWorkoutStorage';

// Components
import { Dashboard } from './components/dashboard/Dashboard';
import { ActiveWorkout } from './components/workout/ActiveWorkout';
import { AITrainer } from './components/ai/AITrainer';
import { HistoryView } from './components/history/HistoryView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { TemplatesView } from './components/templates/TemplatesView';
import { ProfileModal } from './components/profile/ProfileModal';
import { AuthModal } from './components/auth/AuthModal';
import { WelcomeAuthView } from './components/auth/WelcomeAuthView';
import { AuthUser } from './types';
import { formatAthleteName } from './lib/nameUtils';
import { initGA, trackPageView, trackWorkoutStarted, trackWorkoutCompleted } from './lib/analytics';

// Icons
import {
  Activity,
  Bot,
  Calendar,
  BarChart3,
  BookmarkPlus,
  Play,
  Settings,
  Dumbbell,
  Sun,
  Moon,
  Sparkles,
  User,
  Users,
  LogOut,
  X
} from 'lucide-react';

export function App() {
  // Navigation Tabs: If user reloads or page refreshes with an active workout, restore straight to workout!
  const initialActiveSession = useMemo(() => getActiveWorkoutSession(), []);

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'workout' | 'ai' | 'history' | 'analytics' | 'templates'
  >(() => {
    if (initialActiveSession && initialActiveSession.id) {
      return 'workout';
    }
    return 'dashboard';
  });

  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'switch'>('signin');

  // Application Data States
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [musclesData, setMusclesData] = useState<Record<MuscleId, MuscleExposureData> | null>(null);
  const [radar, setRadar] = useState<TrainingRadar | null>(null);

  // Active workout staging state (restores saved workout data immediately on reload)
  const [activeWorkoutData, setActiveWorkoutData] = useState<Partial<Workout> | null>(() => {
    if (initialActiveSession && initialActiveSession.id) {
      return sessionToPartialWorkout(initialActiveSession);
    }
    return null;
  });

  // Snapshot of persisted workout session for floating resume banner across tabs
  const [persistedSession, setPersistedSession] = useState<ActiveWorkoutSession | null>(() => getActiveWorkoutSession());

  // Modals & Preferences
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMobileWorkoutMenu, setShowMobileWorkoutMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial backend state with instant local vault restore
  const loadData = async () => {
    let savedUid = localStorage.getItem('training_intel_user_id');

    // If unauthenticated (no saved user id, or legacy dummy), do NOT auto-assign Karam!
    if (!savedUid || savedUid === 'usr_athlete_local' || savedUid === 'usr_default') {
      try {
        const fbUser = await waitForFirebaseAuth(1200);
        if (fbUser) {
          savedUid = fbUser.uid;
          const userEmail = fbUser.email || '';
          api.setSession(savedUid, savedUid, userEmail);
          localStorage.setItem('training_intel_user_id', savedUid);
          if (userEmail) localStorage.setItem('training_intel_user_email', userEmail);
        } else {
          // Check backend /api/auth/me to see if a valid session exists
          const authData = await api.getMe();
          if (authData && authData.user) {
            savedUid = authData.user.id;
            api.setSession(api.getToken() || authData.user.id, authData.user.id, authData.user.email);
            localStorage.setItem('training_intel_user_id', savedUid);
            if (authData.user.email) localStorage.setItem('training_intel_user_email', authData.user.email);
          } else {
            // Truly unauthenticated session: keep isolated, show sign-in gate
            setCurrentUser(null);
            setProfile(null);
            setWorkouts([]);
            setTemplates([]);
            setPersonalRecords([]);
            setMusclesData(null);
            setRadar(null);
            setIsLoading(false);
            return;
          }
        }
      } catch {
        setCurrentUser(null);
        setProfile(null);
        setWorkouts([]);
        setTemplates([]);
        setPersonalRecords([]);
        setMusclesData(null);
        setRadar(null);
        setIsLoading(false);
        return;
      }
    }

    const activeUid = savedUid;
    if (!activeUid) {
      setIsLoading(false);
      return;
    }

    // Phase 1: Instant Local Restore with Sanitization for the active user
    try {
      // Clean out any corrupted or template entries before loading
      await storageVault.purgeInvalidWorkouts();

      const [cachedUser, cachedProf, cachedW, cachedT, cachedPrs] = await Promise.all([
        storageVault.getUser(),
        storageVault.getProfile(),
        storageVault.getWorkouts(),
        storageVault.getTemplates(),
        storageVault.getRecords()
      ]);

      const isGuest = activeUid === 'usr_guest_demo';

      if (cachedUser && cachedUser.id === activeUid) {
        const cleanName = formatAthleteName(cachedUser.username, cachedUser.email);
        const resolvedUser = { ...cachedUser, username: cleanName };
        setCurrentUser(resolvedUser);
      } else {
        const savedEmail = localStorage.getItem('training_intel_user_email') || (isGuest ? 'guest@trainingintel.demo' : '');
        const savedName = localStorage.getItem('training_intel_user_name') || (isGuest ? 'Alex Vance (Guest)' : '');
        const cleanName = formatAthleteName(savedName, savedEmail);
        const autoUser: AuthUser = {
          id: activeUid,
          email: savedEmail,
          username: cleanName,
          createdAt: new Date().toISOString()
        };
        setCurrentUser(autoUser);
        storageVault.saveUser(autoUser).catch(() => {});
      }

      if (cachedProf) {
        const cleanProfName = formatAthleteName(cachedProf.name, cachedProf.id);
        setProfile({ ...cachedProf, name: cleanProfName });
      }
      if (Array.isArray(cachedW)) {
        setWorkouts(cachedW);
        setMusclesData(calculateMuscleExposures(cachedW, EXERCISES_MAP));
        setRadar(buildTrainingRadar(cachedW, EXERCISES_MAP));
      }
      if (Array.isArray(cachedT) && cachedT.length > 0) setTemplates(cachedT);
      if (Array.isArray(cachedPrs) && cachedPrs.length > 0) setPersonalRecords(cachedPrs);
    } catch (localErr) {
      console.warn('[Vault] Instant local load notice:', localErr);
    }

    // Phase 2: Cloud / Backend Network Synchronization
    try {
      const authData = await api.getMe();

      if (authData && authData.user) {
        const cleanName = formatAthleteName(authData.user.username, authData.user.email);
        const resolvedUser = { ...authData.user, username: cleanName };
        setCurrentUser(resolvedUser);
        if (authData.profile) {
          const cleanProfName = formatAthleteName(authData.profile.name, authData.user.email);
          setProfile({ ...authData.profile, name: cleanProfName });
        }
      }

      const [p, w, t, pr, m, r] = await Promise.all([
        api.getProfile(),
        api.getWorkouts(),
        api.getTemplates(),
        api.getPersonalRecords(),
        api.getMuscles(),
        api.getRadar()
      ]);

      if (p) setProfile(p);
      if (Array.isArray(w)) {
        setWorkouts(w);
        setMusclesData(calculateMuscleExposures(w, EXERCISES_MAP));
        setRadar(buildTrainingRadar(w, EXERCISES_MAP));
      }
      if (t && t.length > 0) setTemplates(t);
      if (Array.isArray(pr)) setPersonalRecords(pr);
      if (m && (!w || w.length === 0)) setMusclesData(m);
      if (r && (!w || w.length === 0)) setRadar(r);
    } catch (err) {
      console.warn('Network sync notice (local data preserved):', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Re-sync whenever user returns to tab, unlocks mobile screen, or regains network
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData();
      }
    };
    const handleFocus = () => {
      loadData();
    };
    const handleOnline = () => {
      loadData();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);

    let unsubscribeRealtimeWorkouts: (() => void) | null = null;

    // Continuous Firebase Auth sync to preserve user data across app reloads and republishes
    const unsubscribe = subscribeToFirebaseAuth(async (fbUser) => {
      // If user has switched to the Guest Demo account, do not overwrite the session with Firebase
      const currentActiveId = localStorage.getItem('training_intel_user_id');
      if (currentActiveId === 'usr_guest_demo') {
        return;
      }

      if (fbUser) {
        const uid = fbUser.uid;
        const email = fbUser.email || '';
        const username = formatAthleteName(fbUser.displayName, email);

        api.setSession(uid, uid, email);

        const authUser: AuthUser = {
          id: uid,
          email,
          username,
          createdAt: new Date().toISOString()
        };

        setCurrentUser(authUser);
        storageVault.saveUser(authUser).catch(() => {});

        // Attach live real-time subscription for instant cross-device sync
        if (unsubscribeRealtimeWorkouts) {
          unsubscribeRealtimeWorkouts();
          unsubscribeRealtimeWorkouts = null;
        }

        unsubscribeRealtimeWorkouts = subscribeToWorkoutsFromFirestore(uid, async (realtimeWorkouts) => {
          if (!Array.isArray(realtimeWorkouts)) return;
          const delSet = getDeletedWorkoutIds();
          const cleanWorkouts = realtimeWorkouts.filter(w => isGenuineWorkout(w) && !delSet.has(w.id));
          cleanWorkouts.sort((a, b) => {
            const tA = a.completedAt ? new Date(a.completedAt).getTime() : (a.startedAt ? new Date(a.startedAt).getTime() : 0);
            const tB = b.completedAt ? new Date(b.completedAt).getTime() : (b.startedAt ? new Date(b.startedAt).getTime() : 0);
            return tB - tA;
          });

          if (cleanWorkouts.length > 0) {
            setWorkouts(cleanWorkouts);
            setMusclesData(calculateMuscleExposures(cleanWorkouts, EXERCISES_MAP));
            setRadar(buildTrainingRadar(cleanWorkouts, EXERCISES_MAP));
            storageVault.saveWorkouts(cleanWorkouts).catch(() => {});
            api.syncWorkouts(cleanWorkouts).catch(() => {});
          }
        });

        // Fetch fresh Firestore data and sync
        try {
          const [cloudWorkouts, cloudTemplates, cloudProfile] = await Promise.all([
            getWorkoutsFromFirestore(uid),
            getTemplatesFromFirestore(uid),
            getUserProfileFromFirestore(uid)
          ]);

          if (cloudProfile) {
            const cleanProfName = formatAthleteName(cloudProfile.name, email);
            const resolvedProf = { ...cloudProfile, name: cleanProfName };
            setProfile(resolvedProf);
            storageVault.saveProfile(resolvedProf).catch(() => {});
          }

          // Full bidirectional union between Firestore and local/server workouts
          const currentVaultWorkouts = await storageVault.getWorkouts();
          const delSet = getDeletedWorkoutIds();
          const unifiedMap = new Map<string, Workout>();

          for (const w of currentVaultWorkouts) {
            if (w?.id && isGenuineWorkout(w) && !delSet.has(w.id)) unifiedMap.set(w.id, w);
          }
          if (Array.isArray(cloudWorkouts)) {
            for (const cw of cloudWorkouts) {
              if (cw?.id && isGenuineWorkout(cw) && !delSet.has(cw.id)) {
                const exist = unifiedMap.get(cw.id);
                if (!exist) {
                  unifiedMap.set(cw.id, cw);
                } else {
                  const existSets = exist.totalSets || (exist.exercises ? exist.exercises.reduce((acc, e) => acc + (Array.isArray(e.sets) ? e.sets.length : (typeof e.sets === 'number' ? e.sets : 0)), 0) : 0);
                  const cwSets = cw.totalSets || (cw.exercises ? cw.exercises.reduce((acc, e) => acc + (Array.isArray(e.sets) ? e.sets.length : (typeof e.sets === 'number' ? e.sets : 0)), 0) : 0);
                  if (cwSets >= existSets || cw.completedAt) {
                    unifiedMap.set(cw.id, { ...exist, ...cw });
                  }
                }
              }
            }
          }

          const unifiedWorkouts = Array.from(unifiedMap.values());
          unifiedWorkouts.sort((a, b) => {
            const tA = a.completedAt ? new Date(a.completedAt).getTime() : (a.startedAt ? new Date(a.startedAt).getTime() : 0);
            const tB = b.completedAt ? new Date(b.completedAt).getTime() : (b.startedAt ? new Date(b.startedAt).getTime() : 0);
            return tB - tA;
          });

          if (unifiedWorkouts.length > 0) {
            await storageVault.saveWorkouts(unifiedWorkouts);
            setWorkouts(unifiedWorkouts);
            setMusclesData(calculateMuscleExposures(unifiedWorkouts, EXERCISES_MAP));
            setRadar(buildTrainingRadar(unifiedWorkouts, EXERCISES_MAP));
            api.syncWorkouts(unifiedWorkouts).catch(() => {});

            // Auto-heal cloud: Upload any workouts missing in Firestore
            const cloudIds = new Set((cloudWorkouts || []).map(w => w.id));
            for (const uw of unifiedWorkouts) {
              if (!cloudIds.has(uw.id)) {
                saveWorkoutToFirestore(uid, uw).catch(() => {});
              }
            }
          }

          if (Array.isArray(cloudTemplates) && cloudTemplates.length > 0) {
            setTemplates(cloudTemplates);
            storageVault.saveTemplates(cloudTemplates).catch(() => {});
          }
        } catch (syncErr) {
          console.warn('[Firebase] Background sync notice:', syncErr);
        }
      }
    });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
      if (unsubscribeRealtimeWorkouts) unsubscribeRealtimeWorkouts();
      unsubscribe();
    };
  }, []);

  // Google Analytics 4 (GA4) - Initialize tag on mount
  useEffect(() => {
    initGA();
  }, []);

  // Google Analytics 4 (GA4) - Track view changes
  useEffect(() => {
    const tabTitles: Record<string, string> = {
      dashboard: 'Dashboard',
      workout: 'Log Workout',
      ai: 'AI Coach',
      history: 'Workout History',
      analytics: 'Analytics & Overload',
      templates: 'Workout Templates'
    };
    trackPageView(activeTab, `Training Intelligence | ${tabTitles[activeTab] || activeTab}`);
  }, [activeTab]);

  // Dark mode HTML class toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Periodic check for active workout session to keep floating banner in sync
  useEffect(() => {
    const checkActiveSession = () => {
      setPersistedSession(getActiveWorkoutSession());
    };
    checkActiveSession();
    const interval = setInterval(checkActiveSession, 2000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Warn if user attempts to refresh or close tab during an ongoing workout
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const activeSession = getActiveWorkoutSession();
      if (activeSession && activeSession.id) {
        e.preventDefault();
        e.returnValue = 'You have a workout in progress. Reloading will resume your session.';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Workout launching helpers
  const handleStartBlankWorkout = () => {
    const existing = getActiveWorkoutSession();
    if (existing && existing.id) {
      setActiveWorkoutData(sessionToPartialWorkout(existing));
      setActiveTab('workout');
      return;
    }
    const name = `Workout #${workouts.length + 1}`;
    trackWorkoutStarted(name, 'blank');
    const newSession = createAndSaveActiveSession({
      name,
      startedAt: new Date().toISOString(),
      exercises: []
    });
    setPersistedSession(newSession);
    setActiveWorkoutData(sessionToPartialWorkout(newSession));
    setActiveTab('workout');
  };

  const handleStartRecommendedWorkout = () => {
    if (!radar) return;
    const rec = radar.suggestedFocusToday;
    trackWorkoutStarted(rec?.title || 'Recommended Split', 'recommended');

    // Instantly generate customized, anatomically aligned workout session
    const plan = generateRecommendedWorkoutSession(radar);
    handleStartGeneratedPlan(plan);
  };

  const handleStartTemplate = (template: WorkoutTemplate) => {
    trackWorkoutStarted(template.name, template.id);
    const exercises: WorkoutExercise[] = template.exercises.map((e, idx) => ({
      id: `we_${Date.now()}_${idx}`,
      exerciseId: e.exerciseId,
      exerciseName: e.exerciseName,
      targetRestSeconds: e.restSeconds,
      sets: Array.from({ length: e.targetSets || e.sets || 3 }).map((_, sIdx) => ({
        id: `s_${Date.now()}_${idx}_${sIdx}`,
        setNumber: sIdx + 1,
        type: 'normal',
        weightKg: 40,
        reps: e.repMin || 10,
        completed: false
      }))
    }));
    const newSession = createAndSaveActiveSession({
      name: template.name,
      startedAt: new Date().toISOString(),
      exercises
    });
    setPersistedSession(newSession);
    setActiveWorkoutData(sessionToPartialWorkout(newSession));
    setActiveTab('workout');
  };

  const handleStartGeneratedPlan = (plan: AIWorkoutPlan) => {
    const exercises: WorkoutExercise[] = plan.exercises.map((e, idx) => ({
      id: `we_${Date.now()}_${idx}`,
      exerciseId: e.exerciseId,
      exerciseName: e.exerciseName,
      targetRestSeconds: e.restSeconds,
      sets: Array.from({ length: e.sets || 3 }).map((_, sIdx) => ({
        id: `s_${Date.now()}_${idx}_${sIdx}`,
        setNumber: sIdx + 1,
        type: 'normal',
        weightKg: e.suggestedWeightKg || 30,
        reps: e.repMin || 8,
        completed: false
      }))
    }));
    const newSession = createAndSaveActiveSession({
      name: plan.name,
      notes: plan.rationale,
      startedAt: new Date().toISOString(),
      exercises
    });
    setPersistedSession(newSession);
    setActiveWorkoutData(sessionToPartialWorkout(newSession));
    setActiveTab('workout');
  };

  const handleRepeatWorkout = (workout: Workout) => {
    const exercises = (workout.exercises || []).map((e: any) => {
      const rawSets: any[] = Array.isArray(e.sets)
        ? e.sets
        : (typeof e.sets === 'number'
          ? Array.from({ length: e.sets }).map((_, sIdx) => ({
              id: `s_${Date.now()}_${sIdx}`,
              setNumber: sIdx + 1,
              type: 'normal',
              weightKg: e.suggestedWeightKg || e.weightKg || 40,
              reps: e.repMin || e.reps || 10,
              completed: false
            }))
          : (e.sets && typeof e.sets === 'object'
            ? Object.values(e.sets)
            : []));
      return {
        ...e,
        id: `we_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        sets: rawSets.map((s: any, sIdx: number) => ({
          ...s,
          id: `s_${Date.now()}_${sIdx}_${Math.random().toString(36).substr(2, 4)}`,
          completed: false
        }))
      };
    });
    const newSession = createAndSaveActiveSession({
      name: `${workout.name} (Repeat)`,
      startedAt: new Date().toISOString(),
      exercises
    });
    setPersistedSession(newSession);
    setActiveWorkoutData(sessionToPartialWorkout(newSession));
    setActiveTab('workout');
  };

  // Workout completion handler
  const handleFinishActiveWorkout = async (finishedWorkout: Workout) => {
    const activeUserId = currentUser?.id || localStorage.getItem('training_intel_user_id') || '';
    if (activeUserId && !finishedWorkout.userId) {
      finishedWorkout.userId = activeUserId;
    }
    storageVault.removeDeletedWorkoutId(finishedWorkout.id);

    // 1. Gather all existing workouts from React state AND storage vault so nothing is ever dropped
    const vaultWorkouts = await storageVault.getWorkouts().catch(() => []);
    const delIds = new Set(storageVault.getDeletedWorkoutIds());
    const initialMap = new Map<string, Workout>();

    for (const w of [...workouts, ...vaultWorkouts]) {
      if (w && w.id && !delIds.has(w.id) && isGenuineWorkout(w)) {
        initialMap.set(w.id, w);
      }
    }
    initialMap.set(finishedWorkout.id, finishedWorkout);
    const immediateList = Array.from(initialMap.values());
    immediateList.sort((a, b) => {
      const tA = a.completedAt ? new Date(a.completedAt).getTime() : (a.startedAt ? new Date(a.startedAt).getTime() : 0);
      const tB = b.completedAt ? new Date(b.completedAt).getTime() : (b.startedAt ? new Date(b.startedAt).getTime() : 0);
      return tB - tA;
    });

    setWorkouts(immediateList);
    setMusclesData(calculateMuscleExposures(immediateList, EXERCISES_MAP));
    setRadar(buildTrainingRadar(immediateList, EXERCISES_MAP));

    // Send GA4 custom workout event
    trackWorkoutCompleted(
      finishedWorkout.name,
      finishedWorkout.totalVolumeKg || 0,
      finishedWorkout.totalSets || 0,
      (finishedWorkout.durationSeconds || 0) / 60
    );

    try {
      const res = await api.saveWorkout(finishedWorkout);
      const saved = res.workout || finishedWorkout;
      
      const map = new Map<string, Workout>();
      for (const w of immediateList) {
        if (w && w.id && !delIds.has(w.id) && isGenuineWorkout(w)) map.set(w.id, w);
      }
      if (res.workouts && Array.isArray(res.workouts)) {
        for (const w of res.workouts) {
          if (w && w.id && !delIds.has(w.id) && isGenuineWorkout(w)) map.set(w.id, w);
        }
      }
      map.set(saved.id, saved);
      const updatedList = Array.from(map.values());
      updatedList.sort((a, b) => {
        const tA = a.completedAt ? new Date(a.completedAt).getTime() : (a.startedAt ? new Date(a.startedAt).getTime() : 0);
        const tB = b.completedAt ? new Date(b.completedAt).getTime() : (b.startedAt ? new Date(b.startedAt).getTime() : 0);
        return tB - tA;
      });
      
      setWorkouts(updatedList);

      // Refresh recalculated muscles, radar, and PRs
      if (res.muscles) {
        setMusclesData(res.muscles);
      } else {
        setMusclesData(calculateMuscleExposures(updatedList, EXERCISES_MAP));
      }

      if (res.radar) {
        setRadar(res.radar);
      } else {
        setRadar(buildTrainingRadar(updatedList, EXERCISES_MAP));
      }

      if (res.personalRecords) {
        setPersonalRecords(res.personalRecords);
      } else {
        const prs = await api.getPersonalRecords();
        setPersonalRecords(prs);
      }

      // Synchronize full list with server
      api.syncWorkouts(updatedList).catch(() => {});
    } catch (err) {
      console.error('Notice saving finished workout to server:', err);
    } finally {
      clearActiveWorkoutSession();
      setPersistedSession(null);
      setActiveWorkoutData(null);
      setActiveTab('history');
    }
  };

  const handleUpdateWorkout = async (updatedWorkout: Workout) => {
    // 1. Optimistic update
    const immediateList = workouts.map(w => w.id === updatedWorkout.id ? updatedWorkout : w);
    setWorkouts(immediateList);
    setMusclesData(calculateMuscleExposures(immediateList, EXERCISES_MAP));
    setRadar(buildTrainingRadar(immediateList, EXERCISES_MAP));

    try {
      const res = await api.saveWorkout(updatedWorkout);
      const saved = res.workout || updatedWorkout;
      const updatedList = res.workouts || immediateList;
      setWorkouts(updatedList);

      if (res.muscles) {
        setMusclesData(res.muscles);
      } else {
        setMusclesData(calculateMuscleExposures(updatedList, EXERCISES_MAP));
      }

      if (res.radar) {
        setRadar(res.radar);
      } else {
        setRadar(buildTrainingRadar(updatedList, EXERCISES_MAP));
      }

      if (res.personalRecords) {
        setPersonalRecords(res.personalRecords);
      } else {
        const prs = await api.getPersonalRecords();
        setPersonalRecords(prs);
      }

      // Automatically sync updated list with server and cloud
      api.syncWorkouts(updatedList).catch(() => {});
    } catch (err) {
      console.error('Error updating workout:', err);
    }
  };

  const handleRestoreHistory = async () => {
    setIsLoading(true);
    try {
      const res = await api.restoreWorkouts();
      if (res.workouts) {
        setWorkouts(res.workouts);
        if (res.personalRecords) setPersonalRecords(res.personalRecords);
        if (res.muscles) setMusclesData(res.muscles);
        if (res.radar) setRadar(res.radar);
      }
    } catch (err) {
      console.warn('Failed to call restoreWorkouts endpoint:', err);
      try {
        const fallback = await api.getWorkouts();
        setWorkouts(fallback);
      } catch {
        // keep current
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSyncData = async () => {
    try {
      await loadData();
      const fresh = await api.getWorkouts();
      if (Array.isArray(fresh) && fresh.length > 0) {
        setWorkouts(fresh);
        setMusclesData(calculateMuscleExposures(fresh, EXERCISES_MAP));
        setRadar(buildTrainingRadar(fresh, EXERCISES_MAP));
      }
    } catch (err) {
      console.warn('Manual sync notice:', err);
    }
  };

  const handleDeleteWorkout = async (id: string) => {
    // 1. Instant persistent tombstone and optimistic state update
    storageVault.addDeletedWorkoutId(id);
    await storageVault.deleteWorkout(id);
    const remaining = workouts.filter(w => w.id !== id);
    setWorkouts(remaining);
    setMusclesData(calculateMuscleExposures(remaining, EXERCISES_MAP));
    setRadar(buildTrainingRadar(remaining, EXERCISES_MAP));

    try {
      const res = await api.deleteWorkout(id);
      const serverRemaining = res.workouts ? res.workouts.filter(w => w.id !== id) : remaining;
      setWorkouts(serverRemaining);

      if (res.muscles) {
        setMusclesData(res.muscles);
      } else {
        setMusclesData(calculateMuscleExposures(serverRemaining, EXERCISES_MAP));
      }

      if (res.radar) {
        setRadar(res.radar);
      } else {
        setRadar(buildTrainingRadar(serverRemaining, EXERCISES_MAP));
      }

      if (res.personalRecords) {
        setPersonalRecords(res.personalRecords);
      } else {
        const prs = await api.getPersonalRecords();
        setPersonalRecords(prs);
      }
    } catch (err) {
      console.error('Error deleting workout:', err);
    }
  };

  const handleClearAllWorkouts = async () => {
    setIsLoading(true);
    setWorkouts([]);
    setMusclesData(calculateMuscleExposures([], EXERCISES_MAP));
    setRadar(buildTrainingRadar([], EXERCISES_MAP));
    setPersonalRecords([]);

    try {
      await api.clearAllWorkouts();
    } catch (err) {
      console.error('Error clearing all workouts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurgeInvalidWorkouts = async () => {
    setIsLoading(true);
    try {
      const res = await api.purgeInvalidWorkouts();
      if (res.workouts) {
        setWorkouts(res.workouts);
        setMusclesData(res.muscles || calculateMuscleExposures(res.workouts, EXERCISES_MAP));
        setRadar(res.radar || buildTrainingRadar(res.workouts, EXERCISES_MAP));
      }
    } catch (err) {
      console.error('Error purging invalid workouts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTemplate = async (template: WorkoutTemplate) => {
    try {
      const saved = await api.saveTemplate(template);
      setTemplates(prev => [...prev.filter(t => t.id !== saved.id), saved]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await api.deleteTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (updated: Partial<UserProfile>) => {
    try {
      const p = await api.updateProfile(updated);
      setProfile(p);
      if (updated.name && currentUser) {
        const updatedUser = { ...currentUser, username: updated.name };
        setCurrentUser(updatedUser);
        storageVault.saveUser(updatedUser).catch(() => {});
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetData = async (mode: 'seed' | 'empty') => {
    setIsLoading(true);
    try {
      await api.resetData(mode);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = async (user: AuthUser, userProf: UserProfile) => {
    const cleanUserName = formatAthleteName(user.username, user.email);
    const cleanProfName = formatAthleteName(userProf.name, user.email);
    const resolvedUser = { ...user, username: cleanUserName };
    const resolvedProf = { ...userProf, name: cleanProfName };
    setCurrentUser(resolvedUser);
    setProfile(resolvedProf);
    try {
      localStorage.setItem('training_intel_user_id', user.id);
      localStorage.setItem('training_intel_user_email', user.email);
      localStorage.setItem('training_intel_user_name', cleanUserName);
    } catch {}
    await Promise.all([
      storageVault.saveUser(resolvedUser),
      storageVault.saveProfile(resolvedProf)
    ]);
    setIsLoading(true);
    await loadData();
  };

  const handleLogout = async () => {
    try {
      await signOutFromFirebase();
    } catch (err) {
      console.warn('Firebase signout warning:', err);
    }
    await api.logout();
    localStorage.removeItem('training_intel_user_id');
    localStorage.removeItem('training_intel_user_email');
    localStorage.removeItem('training_intel_user_name');
    setCurrentUser(null);
    setProfile(null);
    setWorkouts([]);
    setTemplates([]);
    setPersonalRecords([]);
    setMusclesData(null);
    setRadar(null);
  };

  // If in active workout mode, display full-screen ActiveWorkout screen
  if (activeTab === 'workout') {
    return (
      <ActiveWorkout
        initialWorkout={activeWorkoutData || undefined}
        previousWorkouts={workouts}
        onFinishWorkout={handleFinishActiveWorkout}
        onCancelWorkout={() => {
          clearActiveWorkoutSession();
          setPersistedSession(null);
          setActiveWorkoutData(null);
          setActiveTab('dashboard');
        }}
        onMinimize={() => {
          setPersistedSession(getActiveWorkoutSession());
          setActiveTab('dashboard');
        }}
      />
    );
  }

  // Welcome / Sign-in gate for unauthenticated users
  if (!isLoading && !currentUser) {
    return (
      <WelcomeAuthView
        onAuthSuccess={async (user, userProf) => {
          setCurrentUser(user);
          setProfile(userProf);
          setIsLoading(true);
          await loadData();
        }}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 sm:px-8 py-2.5 sm:py-3.5 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 min-w-0">
          {/* Logo & App Title */}
          <div
            className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none shrink-0"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 shrink-0">
              <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white truncate">
                  Training Intelligence
                </span>
                <span className="hidden xs:inline px-1 sm:px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-bold text-[9px] sm:text-[10px] uppercase">
                  AI Pro
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Anatomical Hypertrophy & Overload System
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold">
            <button
              id="nav-dashboard-tab"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4 text-blue-500" />
              Body Map & Radar
            </button>

            <button
              id="nav-ai-tab"
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                activeTab === 'ai'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bot className="w-4 h-4 text-purple-500" />
              AI Coach
            </button>

            <button
              id="nav-history-tab"
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                activeTab === 'history'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4 text-emerald-500" />
              History
            </button>

            <button
              id="nav-analytics-tab"
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                activeTab === 'analytics'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-amber-500" />
              Analytics & PRs
            </button>

            <button
              id="nav-templates-tab"
              onClick={() => setActiveTab('templates')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                activeTab === 'templates'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookmarkPlus className="w-4 h-4 text-indigo-500" />
              Routines
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Athlete Account / Switch Button */}
            <button
              id="athlete-account-btn"
              onClick={() => {
                setAuthModalMode('signin');
                setShowAuthModal(true);
              }}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all shrink-0"
              title="Athlete Account & Profile Switching"
            >
              <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                {formatAthleteName(currentUser?.username || profile?.name, currentUser?.email).charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline max-w-[80px] sm:max-w-[120px] truncate">
                {formatAthleteName(currentUser?.username || profile?.name, currentUser?.email)}
              </span>
              <Users className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />
            </button>

            {/* Quick Log Button (Tablet/Desktop only; Mobile has floating bottom action) */}
            <button
              id="global-start-workout-btn"
              onClick={handleStartBlankWorkout}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Workout</span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Settings & Profile Modal */}
            <button
              id="athlete-profile-btn"
              onClick={() => setShowProfileModal(true)}
              className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Athlete profile settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Logout Button */}
            <button
              id="athlete-logout-btn"
              onClick={handleLogout}
              className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Responsive Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 pb-28 md:pb-8">
        {isLoading || !profile || !musclesData || !radar ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
            <Sparkles className="w-10 h-10 text-blue-500 animate-spin" />
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              Synchronizing Anatomical Models...
            </h3>
            <p className="text-xs text-slate-500">
              Calculating recovery decay rates and progressive overload recommendations.
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                radar={radar}
                musclesData={musclesData}
                recentWorkouts={workouts}
                personalRecords={personalRecords}
                userProfile={profile}
                onStartEmptyWorkout={handleStartBlankWorkout}
                onStartRecommendedWorkout={handleStartRecommendedWorkout}
                onStartTemplate={tplId => {
                  const match = templates.find(t => t.id === tplId);
                  if (match) handleStartTemplate(match);
                }}
                onRepeatWorkout={handleRepeatWorkout}
                onNavigateToAI={() => setActiveTab('ai')}
                onNavigateToHistory={() => setActiveTab('history')}
                onNavigateToAnalytics={() => setActiveTab('analytics')}
              />
            )}

            {activeTab === 'ai' && (
              <AITrainer
                radar={radar}
                musclesData={musclesData}
                onStartGeneratedWorkout={handleStartGeneratedPlan}
                onSaveTemplate={plan => {
                  const tpl: WorkoutTemplate = {
                    id: `tpl_${Date.now()}`,
                    name: plan.name,
                    category: 'custom',
                    estimatedMinutes: plan.durationMinutes,
                    estimatedDurationMinutes: plan.durationMinutes,
                    targetMuscles: ['pectoralis_major', 'anterior_deltoid'],
                    exercises: plan.exercises.map(e => ({
                      exerciseId: e.exerciseId,
                      exerciseName: e.exerciseName,
                      sets: e.sets,
                      targetSets: e.sets,
                      repMin: e.repMin,
                      repMax: e.repMax,
                      restSeconds: e.restSeconds
                    }))
                  };
                  handleSaveTemplate(tpl);
                  setActiveTab('templates');
                }}
              />
            )}

            {activeTab === 'history' && (
              <HistoryView
                workouts={workouts}
                onRepeatWorkout={handleRepeatWorkout}
                onUpdateWorkout={handleUpdateWorkout}
                onDeleteWorkout={handleDeleteWorkout}
                onStartNewWorkout={handleStartBlankWorkout}
                onClearAllWorkouts={handleClearAllWorkouts}
                onSync={handleManualSyncData}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView
                workouts={workouts}
                personalRecords={personalRecords}
                musclesData={musclesData}
                radar={radar}
                userProfile={profile}
              />
            )}

            {activeTab === 'templates' && (
              <TemplatesView
                templates={templates}
                onStartTemplate={handleStartTemplate}
                onSaveTemplate={handleSaveTemplate}
                onDeleteTemplate={handleDeleteTemplate}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Floating Workout Action Button (Pop-up down to the right) */}
      <div className="md:hidden fixed bottom-20 right-4 z-40 flex flex-col items-end">
        {showMobileWorkoutMenu && (
          <>
            {/* Click-outside dismissal backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/35 backdrop-blur-xs z-40"
              onClick={() => setShowMobileWorkoutMenu(false)}
            />

            {/* Quick Workout Pop-up Menu */}
            <div
              id="mobile-workout-popup-menu"
              className="relative z-50 mb-3 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 space-y-2"
            >
              <div className="flex items-center justify-between px-1 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Start Workout
                  </span>
                </div>
                <button
                  id="close-mobile-workout-popup-btn"
                  onClick={() => setShowMobileWorkoutMenu(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Blank Workout */}
              <button
                id="mobile-popup-blank-btn"
                onClick={() => {
                  setShowMobileWorkoutMenu(false);
                  handleStartBlankWorkout();
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-slate-800 dark:text-slate-100 text-xs font-semibold text-left transition-colors border border-blue-200/60 dark:border-blue-800/40"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
                <div>
                  <div className="font-bold text-blue-700 dark:text-blue-400">Blank Session</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Log custom exercises live</div>
                </div>
              </button>

              {/* AI Recommended Hypertrophy Plan */}
              <button
                id="mobile-popup-ai-btn"
                onClick={() => {
                  setShowMobileWorkoutMenu(false);
                  handleStartRecommendedWorkout();
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-slate-800 dark:text-slate-100 text-xs font-semibold text-left transition-colors border border-purple-200/60 dark:border-purple-800/40"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-purple-700 dark:text-purple-400">AI Hypertrophy Plan</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Recovery-targeted workout</div>
                </div>
              </button>

              {/* Saved Routines */}
              <button
                id="mobile-popup-routines-btn"
                onClick={() => {
                  setShowMobileWorkoutMenu(false);
                  setActiveTab('templates');
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-semibold text-left transition-colors border border-slate-200/60 dark:border-slate-700/50"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <BookmarkPlus className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-indigo-700 dark:text-indigo-400">Saved Routines</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">PPL, Upper/Lower, custom</div>
                </div>
              </button>
            </div>
          </>
        )}

        {/* Floating Action Trigger Button (Bottom Right) */}
        <button
          id="mobile-floating-workout-btn"
          onClick={() => setShowMobileWorkoutMenu(!showMobileWorkoutMenu)}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white shadow-xl shadow-blue-600/35 border border-blue-400/30 transition-all font-bold text-xs"
          title="Start workout"
        >
          <Play className={`w-4 h-4 fill-current transition-transform duration-200 ${showMobileWorkoutMenu ? 'rotate-90' : ''}`} />
          <span>Workout</span>
        </button>
      </div>

      {/* Floating Active Workout Banner if session is running and user navigated away */}
      {persistedSession && (
        <aside
          aria-label="Active workout in progress"
          className="fixed bottom-16 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white p-3 sm:p-3.5 rounded-2xl shadow-2xl border border-blue-500/50 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-md shadow-blue-500/30">
              <Dumbbell className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-black tracking-wider text-blue-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                Workout in Progress
              </div>
              <div className="font-bold text-xs sm:text-sm text-white truncate">
                {persistedSession.name}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                const sess = getActiveWorkoutSession();
                if (sess) setActiveWorkoutData(sessionToPartialWorkout(sess));
                setActiveTab('workout');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Resume
            </button>
          </div>
        </aside>
      )}

      {/* Mobile Bottom Fixed Navigation Bar (5 Primary Tab Modes) */}
      <nav className="md:hidden sticky bottom-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-1.5 px-2 grid grid-cols-5 items-center text-xs">
        <button
          id="mobile-bottom-dashboard-btn"
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors ${
            activeTab === 'dashboard'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Activity className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Body</span>
        </button>

        <button
          id="mobile-bottom-ai-btn"
          onClick={() => setActiveTab('ai')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors relative ${
            activeTab === 'ai'
              ? 'text-purple-600 dark:text-purple-400 font-bold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Bot className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">AI Coach</span>
          <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-purple-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
        </button>

        <button
          id="mobile-bottom-templates-btn"
          onClick={() => setActiveTab('templates')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors ${
            activeTab === 'templates'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <BookmarkPlus className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Routines</span>
        </button>

        <button
          id="mobile-bottom-history-btn"
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors ${
            activeTab === 'history'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">History</span>
        </button>

        <button
          id="mobile-bottom-analytics-btn"
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors ${
            activeTab === 'analytics'
              ? 'text-amber-600 dark:text-amber-400 font-bold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Stats</span>
        </button>
      </nav>

      {/* Profile & Settings Modal */}
      {showProfileModal && profile && (
        <ProfileModal
          profile={profile}
          onSave={handleUpdateProfile}
          onResetData={handleResetData}
          onReloadData={loadData}
          onClose={() => setShowProfileModal(false)}
          isGuest={currentUser?.id === 'usr_guest_demo' || currentUser?.email === 'guest@trainingintel.demo'}
        />
      )}

      {/* Athlete Authentication & Switching Modal */}
      {showAuthModal && (
        <AuthModal
          currentUser={currentUser}
          currentProfile={profile}
          initialMode={authModalMode}
          onAuthSuccess={handleAuthSuccess}
          onLogout={handleLogout}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
}

export default App;
