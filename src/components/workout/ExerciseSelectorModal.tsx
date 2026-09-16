import React, { useState, useMemo } from 'react';
import { Exercise } from '../../types';
import { EXERCISE_DATABASE } from '../../lib/exerciseDatabase';
import { MUSCLE_CATALOG } from '../../lib/muscleMath';
import { Search, X, Dumbbell, Filter, Check } from 'lucide-react';

interface ExerciseSelectorModalProps {
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
  title?: string;
  excludeExerciseIds?: string[];
}

export const ExerciseSelectorModal: React.FC<ExerciseSelectorModalProps> = ({
  onSelect,
  onClose,
  title = 'Select Exercise',
  excludeExerciseIds = []
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');

  const categories = ['all', 'chest', 'back', 'legs', 'shoulders', 'arms', 'core'];
  const equipments = [
    { id: 'all', label: 'All Equipment' },
    { id: 'smith_machine', label: '⚡ Smith Machine' },
    { id: 'barbell', label: 'Barbell' },
    { id: 'dumbbell', label: 'Dumbbell' },
    { id: 'cable', label: 'Cable' },
    { id: 'machine', label: 'Machine' },
    { id: 'bodyweight', label: 'Bodyweight' }
  ];

  const filteredExercises = useMemo(() => {
    const searchTrimmed = search.trim().toLowerCase();
    const searchClean = searchTrimmed.replace(/[-_()]/g, ' ').replace(/\s+/g, ' ');
    const searchWords = searchClean.split(' ').filter(Boolean);

    return EXERCISE_DATABASE.filter(ex => {
      if (excludeExerciseIds.includes(ex.id)) return false;

      const nameClean = ex.name.toLowerCase().replace(/[-_()]/g, ' ');
      const descClean = ex.description.toLowerCase().replace(/[-_()]/g, ' ');
      const equipClean = ex.equipment.toLowerCase().replace(/[-_()]/g, ' ');
      const categoryClean = ex.category.toLowerCase();
      const muscleNames = ex.muscles.map(m => (MUSCLE_CATALOG[m.muscleId]?.name || '').toLowerCase()).join(' ');

      const matchesSearch =
        !searchTrimmed ||
        ex.name.toLowerCase().includes(searchTrimmed) ||
        nameClean.includes(searchClean) ||
        searchWords.every(word =>
          nameClean.includes(word) ||
          descClean.includes(word) ||
          equipClean.includes(word) ||
          categoryClean.includes(word) ||
          muscleNames.includes(word)
        );

      const matchesCategory = selectedCategory === 'all' || ex.category === selectedCategory;
      const matchesEquipment =
        selectedEquipment === 'all' ||
        ex.equipment === selectedEquipment ||
        (selectedEquipment === 'machine' && ex.equipment === 'smith_machine');

      return matchesSearch && matchesCategory && matchesEquipment;
    });
  }, [search, selectedCategory, selectedEquipment, excludeExerciseIds]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {filteredExercises.length} {filteredExercises.length === 1 ? 'exercise' : 'exercises'} available
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-2.5 bg-slate-50/50 dark:bg-slate-950/30">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search exercise by name (e.g., 'Smith machine shoulder press', 'squat', 'delts')..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-xs">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg font-semibold uppercase tracking-wider whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Equipment Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider shrink-0 pl-0.5">
              Gear:
            </span>
            {equipments.map(eq => (
              <button
                key={eq.id}
                type="button"
                onClick={() => setSelectedEquipment(eq.id)}
                className={`px-2.5 py-0.5 rounded-md font-medium whitespace-nowrap transition-all text-[11px] ${
                  selectedEquipment === eq.id
                    ? eq.id === 'smith_machine'
                      ? 'bg-amber-600 text-white font-bold shadow-xs'
                      : 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 font-bold shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {eq.label}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredExercises.length > 0 ? (
            filteredExercises.map(ex => (
              <div
                key={ex.id}
                onClick={() => {
                  onSelect(ex);
                  onClose();
                }}
                className="pt-2.5 first:pt-0 p-3 rounded-xl hover:bg-blue-50/60 dark:hover:bg-blue-950/20 border border-transparent hover:border-blue-200 dark:hover:border-blue-800/40 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {ex.name}
                    </h4>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${
                        ex.equipment === 'smith_machine'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {ex.equipment.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] uppercase font-medium px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {ex.mechanics}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {ex.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {ex.muscles.map(m => (
                      <span
                        key={m.muscleId}
                        className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                          m.role === 'PRIMARY'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-semibold'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {MUSCLE_CATALOG[m.muscleId]?.name || m.muscleId} ({m.role.toLowerCase()})
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0"
                >
                  Add +
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Dumbbell className="w-10 h-10 mx-auto opacity-30 mb-2" />
              <p className="text-sm font-medium">No matching exercises found.</p>
              <p className="text-xs text-slate-500 mt-1">Try tweaking your search term or category filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
