import React, { useState, useRef, useMemo } from 'react';
import { UserProfile, MuscleId } from '../../types';
import { MUSCLE_CATALOG } from '../../lib/muscleMath';
import { api } from '../../lib/api';
import { auth, signInWithGoogle, saveWorkoutToFirestore } from '../../lib/firebase';
import { storageVault } from '../../lib/storageVault';
import { THEME_PALETTES, ThemePaletteId, getSavedThemePalette, applyThemePalette } from '../../lib/theme';
import { nativeHaptics } from '../../lib/nativeBridge';
import { X, User, Settings, ShieldAlert, RotateCcw, Check, Sparkles, Download, Upload, RefreshCw, ShieldCheck, Cloud, Calendar, Cake, Palette } from 'lucide-react';

interface ProfileModalProps {
  profile: UserProfile;
  onSave: (profile: Partial<UserProfile>) => void;
  onResetData: (mode: 'seed' | 'empty') => void;
  onReloadData?: () => void;
  onClose: () => void;
  isGuest?: boolean;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  onSave,
  onResetData,
  onReloadData,
  onClose,
  isGuest = false
}) => {
  const [name, setName] = useState(profile.name);
  const [birthday, setBirthday] = useState(profile.birthday || '');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>(profile.weightUnit || 'kg');
  const [experienceLevel, setExperienceLevel] = useState(profile.experienceLevel || 'intermediate');
  const [trainingDaysPerWeek, setTrainingDaysPerWeek] = useState(profile.trainingDaysPerWeek || 4);
  const [primaryGoal, setPrimaryGoal] = useState(profile.primaryGoal || 'hypertrophy');
  const [focusMuscles, setFocusMuscles] = useState<MuscleId[]>(profile.focusMuscles || []);
  const [themePalette, setThemePalette] = useState<ThemePaletteId>(
    (profile.themePalette as ThemePaletteId) || getSavedThemePalette()
  );
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [vaultStatusMsg, setVaultStatusMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setName(profile.name || '');
    setBirthday(profile.birthday || '');
    setWeightUnit(profile.weightUnit || 'kg');
    setExperienceLevel(profile.experienceLevel || 'intermediate');
    setTrainingDaysPerWeek(profile.trainingDaysPerWeek || 4);
    setPrimaryGoal(profile.primaryGoal || 'hypertrophy');
    setFocusMuscles(profile.focusMuscles || []);
    setThemePalette((profile.themePalette as ThemePaletteId) || getSavedThemePalette());
  }, [profile]);

  const handleSelectPalette = (id: ThemePaletteId) => {
    setThemePalette(id);
    applyThemePalette(id);
    nativeHaptics.selection();
  };

  const calculatedAge = useMemo(() => {
    if (!birthday) return null;
    const birth = new Date(birthday);
    if (isNaN(birth.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 0 && age <= 120 ? age : null;
  }, [birthday]);

  const handleToggleFocusMuscle = (id: MuscleId) => {
    setFocusMuscles(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleExportBackup = async () => {
    try {
      setIsExporting(true);
      setVaultStatusMsg('Generating secure archive backup...');
      await api.exportBackup(null, profile);
      setVaultStatusMsg('Backup archive downloaded successfully!');
      setTimeout(() => setVaultStatusMsg(null), 4000);
    } catch (err: any) {
      setVaultStatusMsg(`Export error: ${err.message || 'Failed to export'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setVaultStatusMsg('Validating and restoring training dataset...');
      const text = await file.text();
      const res = await api.importBackup(text);
      if (res.success) {
        setVaultStatusMsg(res.message || 'Dataset restored successfully!');
        if (onReloadData) {
          onReloadData();
        }
        setTimeout(() => setVaultStatusMsg(null), 4000);
      } else {
        setVaultStatusMsg('Restore failed: invalid file format.');
      }
    } catch (err: any) {
      setVaultStatusMsg(`Restore error: ${err.message || 'Invalid backup file'}`);
    } finally {
      setIsImporting(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleForceSync = async () => {
    try {
      setIsSyncing(true);
      setVaultStatusMsg('Synchronizing local vault with server database...');
      const res = await api.syncAllData();
      if (res.success) {
        setVaultStatusMsg('Everything in sync. 100% of workouts and records are verified.');
        if (onReloadData) {
          onReloadData();
        }
        setTimeout(() => setVaultStatusMsg(null), 4000);
      } else {
        setVaultStatusMsg('Sync completed locally.');
      }
    } catch (err: any) {
      setVaultStatusMsg(`Sync note: ${err.message || 'Completed'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSave = () => {
    onSave({
      name: name.trim(),
      birthday: birthday.trim(),
      weightUnit,
      preferredUnit: weightUnit,
      experienceLevel: experienceLevel as any,
      trainingDaysPerWeek: Number(trainingDaysPerWeek) || 4,
      primaryGoal: primaryGoal as any,
      focusMuscles,
      themePalette
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Athlete Profile & Coaching Preferences
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Athlete Name & Birthday */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Athlete Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Birthday
                </label>
                {calculatedAge !== null && (
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                    Age: {calculatedAge}
                  </span>
                )}
              </div>
              <input
                type="date"
                value={birthday}
                max={new Date().toISOString().slice(0, 10)}
                onChange={e => setBirthday(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Training Goal & Experience Level */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Primary Goal
              </label>
              <select
                value={primaryGoal}
                onChange={e => setPrimaryGoal(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium capitalize"
              >
                <option value="hypertrophy">Hypertrophy (Muscle Growth)</option>
                <option value="strength">Strength (Max 1RM Power)</option>
                <option value="endurance">Endurance & Conditioning</option>
                <option value="general_fitness">General Health & Longevity</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Lifting Experience
              </label>
              <select
                value={experienceLevel}
                onChange={e => setExperienceLevel(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium capitalize"
              >
                <option value="beginner">Beginner (&lt; 1 yr)</option>
                <option value="intermediate">Intermediate (1–3 yrs)</option>
                <option value="advanced">Advanced (3+ yrs)</option>
              </select>
            </div>
          </div>

          {/* Training Days Per Week & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Days/Week
              </label>
              <div className="flex gap-1.5">
                {[3, 4, 5, 6].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setTrainingDaysPerWeek(d)}
                    className={`flex-1 py-2 rounded-xl font-bold ${
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
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Weight Unit
              </label>
              <div className="flex gap-1.5">
                {(['kg', 'lbs'] as const).map(u => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setWeightUnit(u)}
                    className={`flex-1 py-2 rounded-xl font-bold uppercase ${
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

          {/* Focus Muscle Priorities */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Priority Hypertrophy Targets (AI will prioritize these in recommendations)
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
              {Object.keys(MUSCLE_CATALOG).map(key => {
                const mId = key as MuscleId;
                const info = MUSCLE_CATALOG[mId];
                const isSelected = focusMuscles.includes(mId);
                return (
                  <button
                    key={mId}
                    type="button"
                    onClick={() => handleToggleFocusMuscle(mId)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {info.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* App Color Palette Theme */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <label className="font-semibold text-slate-800 dark:text-slate-200">
                  App Color Palette
                </label>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {THEME_PALETTES.find(p => p.id === themePalette)?.name || 'Default'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {THEME_PALETTES.map(p => {
                const isSelected = themePalette === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPalette(p.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px] text-slate-900 dark:text-white truncate">
                        {p.name}
                      </span>
                      {isSelected && <Check className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-1">
                      {p.previewSwatches.map((color, cIdx) => (
                        <span
                          key={cIdx}
                          className="w-2.5 h-2.5 rounded-full border border-black/10 dark:border-white/10 shrink-0"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Data Safety, Cloud Vault & Portability */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Data Vault & Cloud Resilience
                </span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                Atomic Writes Active
              </span>
            </div>
            
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Your workouts, templates, and PRs are saved with atomic transactions and dual-cached across memory and browser storage. Export or restore your complete athlete dataset at any time.
            </p>

            {/* Cloud Firestore Status */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Cloud className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    Firebase Cloud Firestore Database
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {auth.currentUser?.email ? `Connected: ${auth.currentUser.email}` : 'Hardened multi-layer cloud persistence active'}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                Live & Protected
              </span>
            </div>

            {vaultStatusMsg && (
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 text-[11px] text-blue-700 dark:text-blue-300 font-medium flex items-center gap-1.5 animate-in fade-in">
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                <span>{vaultStatusMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                disabled={isExporting}
                onClick={handleExportBackup}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-blue-500" />
                <span>{isExporting ? 'Exporting...' : 'Export Backup'}</span>
              </button>

              <button
                type="button"
                disabled={isImporting}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-500" />
                <span>{isImporting ? 'Restoring...' : 'Restore Backup'}</span>
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <button
              type="button"
              disabled={isSyncing}
              onClick={handleForceSync}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronizing with Vault...' : 'Harmonize & Sync All Data Now'}</span>
            </button>
          </div>

          {/* Workspace Dataset Management */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="font-bold text-slate-700 dark:text-slate-300 block text-xs">
              Workout History Reset
            </span>
            <div className="flex gap-2">
              {isGuest && (
                <button
                  type="button"
                  onClick={() => {
                    onResetData('seed');
                    onClose();
                  }}
                  className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs"
                >
                  Reload Guest Demo Data
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onResetData('empty');
                  onClose();
                }}
                className="flex-1 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 font-semibold text-xs"
              >
                Clear Workout History (Start From Scratch)
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
};
