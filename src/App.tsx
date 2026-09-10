import React, { useState, useEffect } from 'react';
import {
  Workout,
  WorkoutTemplate,
  UserProfile,
  PersonalRecord,
  MuscleExposureData,
  TrainingRadar,
  AIWorkoutPlan,
  MuscleId
} from './types';
import { api } from './lib/api';
import { calculateMuscleExposures, buildTrainingRadar, generateRecommendedWorkoutSession } from './lib/muscleMath';
import { EXERCISES_MAP } from './lib/exerciseDatabase';
import { getSeedWorkouts, WORKOUT_TEMPLATES, SEED_PERSONAL_RECORDS } from './lib/seedData';

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
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'workout' | 'ai' | 'history' | 'analytics' | 'templates'
  >('dashboard');

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

  // Active workout staging state
  const [activeWorkoutData, setActiveWorkoutData] = useState<Partial<Workout> | null>(null);

  // Modals & Preferences
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMobileWorkoutMenu, setShowMobileWorkoutMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial backend state
  const loadData = async () => {
    try {
      let authData = await api.getMe();
      // If no valid session was recovered, attempt auto-login as Karam
      if (!authData || !authData.user) {
        try {
          authData = await api.login({ email: 'karamnajj79@gmail.com', password: 'password123' });
        } catch {
          // ignore error
        }
      }

      if (authData && authData.user) {
        setCurrentUser(authData.user);
        const [p, w, t, pr, m, r] = await Promise.all([
          api.getProfile(),
          api.getWorkouts(),
          api.getTemplates(),
          api.getPersonalRecords(),
          api.getMuscles(),
          api.getRadar()
        ]);
        setProfile(p);
        setWorkouts(Array.isArray(w) ? w : []);
        setTemplates(t && t.length > 0 ? t : WORKOUT_TEMPLATES);
        setPersonalRecords(Array.isArray(pr) ? pr : []);
        setMusclesData(m);
        setRadar(r);
      } else {
        // Even if auth fails or is offline, load cached user workouts
        const fallbackWorkouts = await api.getWorkouts();
        setWorkouts(Array.isArray(fallbackWorkouts) ? fallbackWorkouts : []);
        const prs = await api.getPersonalRecords();
        setPersonalRecords(Array.isArray(prs) ? prs : []);
        setTemplates(WORKOUT_TEMPLATES);
      }
    } catch (err) {
      console.warn('Data initialization notice:', err);
      try {
        const cached = await api.getWorkouts();
        setWorkouts(Array.isArray(cached) ? cached : []);
      } catch {
        setWorkouts([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Dark mode HTML class toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Workout launching helpers
  const handleStartBlankWorkout = () => {
    setActiveWorkoutData({
      name: `Workout #${workouts.length + 1}`,
      startedAt: new Date().toISOString(),
      exercises: []
    });
    setActiveTab('workout');
  };

  const handleStartRecommendedWorkout = () => {
    if (!radar) return;
    const rec = radar.suggestedFocusToday;

    // Instantly generate customized, anatomically aligned workout session
    const plan = generateRecommendedWorkoutSession(radar);
    handleStartGeneratedPlan(plan);
  };

  const handleStartTemplate = (template: WorkoutTemplate) => {
    setActiveWorkoutData({
      name: template.name,
      startedAt: new Date().toISOString(),
      exercises: template.exercises.map((e, idx) => ({
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
      }))
    });
    setActiveTab('workout');
  };

  const handleStartGeneratedPlan = (plan: AIWorkoutPlan) => {
    setActiveWorkoutData({
      name: plan.name,
      startedAt: new Date().toISOString(),
      notes: plan.rationale,
      exercises: plan.exercises.map((e, idx) => ({
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
      }))
    });
    setActiveTab('workout');
  };

  const handleRepeatWorkout = (workout: Workout) => {
    setActiveWorkoutData({
      name: `${workout.name} (Repeat)`,
      startedAt: new Date().toISOString(),
      exercises: workout.exercises.map(e => ({
        ...e,
        id: `we_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        sets: e.sets.map(s => ({
          ...s,
          id: `s_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          completed: false
        }))
      }))
    });
    setActiveTab('workout');
  };

  // Workout completion handler
  const handleFinishActiveWorkout = async (finishedWorkout: Workout) => {
    // 1. Immediately update React state so the workout is NEVER lost
    const immediateList = [finishedWorkout, ...workouts.filter(w => w.id !== finishedWorkout.id)];
    setWorkouts(immediateList);
    setMusclesData(calculateMuscleExposures(immediateList, EXERCISES_MAP));
    setRadar(buildTrainingRadar(immediateList, EXERCISES_MAP));

    try {
      const res = await api.saveWorkout(finishedWorkout);
      const saved = res.workout || finishedWorkout;
      const updatedList = res.workouts || [saved, ...workouts.filter(w => w.id !== saved.id)];
      
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
    } catch (err) {
      console.error('Error saving finished workout to server:', err);
    } finally {
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

  const handleDeleteWorkout = async (id: string) => {
    try {
      const res = await api.deleteWorkout(id);
      const remaining = res.workouts || workouts.filter(w => w.id !== id);
      setWorkouts(remaining);

      if (res.muscles) {
        setMusclesData(res.muscles);
      } else {
        setMusclesData(calculateMuscleExposures(remaining, EXERCISES_MAP));
      }

      if (res.radar) {
        setRadar(res.radar);
      } else {
        setRadar(buildTrainingRadar(remaining, EXERCISES_MAP));
      }

      if (res.personalRecords) {
        setPersonalRecords(res.personalRecords);
      } else {
        const prs = await api.getPersonalRecords();
        setPersonalRecords(prs);
      }
    } catch (err) {
      console.error('Error deleting workout:', err);
      // Fallback local recompute
      const remaining = workouts.filter(w => w.id !== id);
      setWorkouts(remaining);
      setMusclesData(calculateMuscleExposures(remaining, EXERCISES_MAP));
      setRadar(buildTrainingRadar(remaining, EXERCISES_MAP));
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
    setCurrentUser(user);
    setProfile(userProf);
    setIsLoading(true);
    await loadData();
  };

  const handleLogout = async () => {
    await api.logout();
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
          setActiveWorkoutData(null);
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
                setAuthModalMode('switch');
                setShowAuthModal(true);
              }}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all shrink-0"
              title="Athlete Account & Profile Switching"
            >
              <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                {currentUser?.username?.charAt(0) || profile?.name?.charAt(0) || 'A'}
              </div>
              <span className="hidden sm:inline max-w-[80px] sm:max-w-[120px] truncate">
                {currentUser?.username || profile?.name || 'Athlete'}
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
                onRestoreHistory={handleRestoreHistory}
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
        />
      )}

      {/* Athlete Authentication & Switching Modal */}
      {showAuthModal && (
        <AuthModal
          currentUser={currentUser}
          currentProfile={profile}
          initialMode={authModalMode}
          onAuthSuccess={handleAuthSuccess}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
}

export default App;
