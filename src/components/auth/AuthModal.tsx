import React, { useState, useEffect } from 'react';
import { AuthUser, UserProfile } from '../../types';
import { api } from '../../lib/api';
import { signInWithGoogle } from '../../lib/firebase';
import { formatAthleteName } from '../../lib/nameUtils';
import {
  X,
  User,
  LogIn,
  LogOut,
  UserPlus,
  Users,
  ShieldCheck,
  Dumbbell,
  Check,
  ArrowRight,
  Flame,
  KeyRound,
  Mail,
  Sparkles
} from 'lucide-react';

interface AuthModalProps {
  currentUser: AuthUser | null;
  currentProfile: UserProfile | null;
  onAuthSuccess: (user: AuthUser, profile: UserProfile) => void;
  onLogout?: () => void;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'switch';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  currentProfile,
  onAuthSuccess,
  onLogout,
  onClose,
  initialMode = 'signin'
}) => {
  const [tab, setTab] = useState<'signin' | 'signup' | 'switch'>(initialMode);

  useEffect(() => {
    setTab(initialMode);
  }, [initialMode]);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [primaryGoal, setPrimaryGoal] = useState<'hypertrophy' | 'strength' | 'endurance' | 'general_fitness'>('hypertrophy');
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [trainingDaysPerWeek, setTrainingDaysPerWeek] = useState(4);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');

  // Loading & Error states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await api.login({ email: email.trim(), password: password.trim() });
      const cleanAthleteName = formatAthleteName(res.user.username, res.user.email);
      setSuccessMessage(`Welcome back, ${cleanAthleteName}!`);
      setTimeout(() => {
        onAuthSuccess(res.user, res.profile);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const cleanAthleteName = formatAthleteName(username.trim(), email.trim());
      const res = await api.register({
        email: email.trim(),
        username: cleanAthleteName,
        password: password.trim(),
        primaryGoal,
        experienceLevel,
        trainingDaysPerWeek,
        weightUnit
      });
      setSuccessMessage(`Account created! Welcome, ${formatAthleteName(res.user.username, res.user.email)}.`);
      setTimeout(() => {
        onAuthSuccess(res.user, res.profile);
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.loginAsGuest();
      const cleanAthleteName = formatAthleteName(res.user.username, res.user.email);
      setSuccessMessage(`Welcome, ${cleanAthleteName}!`);
      setTimeout(() => {
        onAuthSuccess(res.user, res.profile);
        onClose();
      }, 400);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to enter guest demo mode');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const firebaseUser = await signInWithGoogle();
      const userId = firebaseUser.uid;
      const userEmail = firebaseUser.email || 'athlete@google.com';
      const userDisplayName = formatAthleteName(firebaseUser.displayName, userEmail);

      const res = await api.loginWithGoogle({
        uid: userId,
        email: userEmail,
        displayName: userDisplayName
      });

      setSuccessMessage(`Connected with Google! Cloud sync active.`);
      setTimeout(() => {
        onAuthSuccess(res.user, res.profile);
        onClose();
      }, 400);
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setErrorMessage(err.message || 'Google sign-in could not be completed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Dumbbell className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Athlete Account Management
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Isolated workout history, personal records, and tailored AI coaching.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-4 flex gap-1 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={() => {
              setTab('signin');
              setErrorMessage(null);
            }}
            className={`flex-1 pb-2.5 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-all ${
              tab === 'signin'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </button>

          <button
            type="button"
            onClick={() => {
              setTab('signup');
              setErrorMessage(null);
            }}
            className={`flex-1 pb-2.5 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-all ${
              tab === 'signup'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Create Account
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Current Signed In User Banner */}
          {currentUser && (
            <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
                  Currently Active Session
                </div>
                <div className="font-bold text-slate-900 dark:text-white text-xs mt-0.5">
                  {formatAthleteName(currentUser.username, currentUser.email)}
                </div>
                {currentUser.email && (
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">{currentUser.email}</div>
                )}
              </div>
              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                  title="Sign out of this session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          )}

          {/* Notifications */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 font-medium animate-in fade-in">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              {successMessage}
            </div>
          )}

          {/* TAB 1: SIGN IN */}
          {tab === 'signin' && (
            <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    name="modal_login_email"
                    autoComplete="off"
                    required
                    placeholder="athlete@domain.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    name="modal_login_password"
                    autoComplete="new-password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
              >
                {isLoading ? (
                  <Sparkles className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign In to Athlete Profile
                  </>
                )}
              </button>

              {/* Google Cloud Sign-In Button */}
              <button
                type="button"
                id="modal-google-signin-btn"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs flex items-center justify-center gap-2.5 border border-slate-200 dark:border-slate-700 shadow-xs transition-all active:scale-[0.99] cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.25 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.57H1.26C.46 8.16 0 9.98 0 12s.46 3.84 1.26 5.43l4.02-3.14z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.26 6.57l4.02 3.14c.95-2.83 3.6-4.96 6.72-4.96z"
                  />
                </svg>
                <span>Continue with Google (Cloud Synced)</span>
              </button>
            </form>
          )}

          {/* TAB 2: CREATE ACCOUNT (SIGN UP) */}
          {tab === 'signup' && (
            <form onSubmit={handleRegister} className="space-y-3.5" autoComplete="off">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Athlete Name
                </label>
                <input
                  type="text"
                  name="modal_signup_name"
                  autoComplete="off"
                  required
                  placeholder="e.g. Jordan Hayes"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="modal_signup_email"
                    autoComplete="off"
                    required
                    placeholder="jordan@gym.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="modal_signup_password"
                    autoComplete="new-password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Goal
                  </label>
                  <select
                    value={primaryGoal}
                    onChange={e => setPrimaryGoal(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-xs"
                  >
                    <option value="hypertrophy">Hypertrophy (Muscle)</option>
                    <option value="strength">Strength / Power</option>
                    <option value="endurance">Endurance & MetCon</option>
                    <option value="general_fitness">General Health</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Experience Level
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={e => setExperienceLevel(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-xs"
                  >
                    <option value="beginner">Beginner (&lt; 1 yr)</option>
                    <option value="intermediate">Intermediate (1-3 yrs)</option>
                    <option value="advanced">Advanced (3+ yrs)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Days / Week
                  </label>
                  <div className="flex gap-1">
                    {[3, 4, 5, 6].map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setTrainingDaysPerWeek(d)}
                        className={`flex-1 py-1.5 rounded-lg font-bold text-xs ${
                          trainingDaysPerWeek === d
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Units
                  </label>
                  <div className="flex gap-1">
                    {(['kg', 'lbs'] as const).map(u => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setWeightUnit(u)}
                        className={`flex-1 py-1.5 rounded-lg font-bold text-xs uppercase ${
                          weightUnit === u
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
              >
                {isLoading ? (
                  <Sparkles className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Create Isolated Athlete Account
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Encrypted per-user storage isolation</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
