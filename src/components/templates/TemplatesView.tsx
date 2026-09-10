import React, { useState } from 'react';
import { WorkoutTemplate, Exercise, MuscleId } from '../../types';
import { MUSCLE_CATALOG } from '../../lib/muscleMath';
import { EXERCISES_MAP } from '../../lib/exerciseDatabase';
import { ExerciseSelectorModal } from '../workout/ExerciseSelectorModal';
import {
  BookmarkPlus,
  Play,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Sparkles,
  Layers,
  Search,
  Dumbbell,
  Check,
  X,
  ChevronRight,
  Flame
} from 'lucide-react';

interface TemplatesViewProps {
  templates: WorkoutTemplate[];
  onStartTemplate: (template: WorkoutTemplate) => void;
  onSaveTemplate: (template: WorkoutTemplate) => void;
  onDeleteTemplate: (id: string) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({
  templates,
  onStartTemplate,
  onSaveTemplate,
  onDeleteTemplate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal State for creating or editing template
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateCategory, setTemplateCategory] = useState<string>('custom');
  const [templateExercises, setTemplateExercises] = useState<Array<{
    exerciseId: string;
    exerciseName: string;
    targetSets: number;
    repMin: number;
    repMax: number;
    restSeconds: number;
  }>>([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);

  // Helper to safely extract muscles trained from a template
  const getTemplateMuscles = (tpl: WorkoutTemplate): MuscleId[] => {
    if (tpl.targetMuscles && tpl.targetMuscles.length > 0) {
      return tpl.targetMuscles;
    }
    const derived = new Set<MuscleId>();
    for (const ex of tpl.exercises || []) {
      const def = EXERCISES_MAP[ex.exerciseId];
      if (def?.muscles) {
        for (const m of def.muscles) {
          derived.add(m.muscleId);
        }
      }
    }
    return Array.from(derived).slice(0, 4);
  };

  const categories = [
    { id: 'all', label: 'All Routines' },
    { id: 'push', label: 'Push' },
    { id: 'pull', label: 'Pull' },
    { id: 'legs', label: 'Legs' },
    { id: 'upper', label: 'Upper' },
    { id: 'lower', label: 'Lower' },
    { id: 'full_body', label: 'Full Body' },
    { id: 'custom', label: 'Custom' }
  ];

  const filteredTemplates = (templates || []).filter(tpl => {
    const matchesSearch =
      tpl.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpl.exercises?.some(e => e.exerciseName?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'all' ||
      tpl.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handleOpenCreateModal = () => {
    setEditingTemplateId(null);
    setTemplateName('');
    setTemplateDescription('');
    setTemplateCategory('custom');
    setTemplateExercises([]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tpl: WorkoutTemplate) => {
    setEditingTemplateId(tpl.id);
    setTemplateName(tpl.name || '');
    setTemplateDescription(tpl.description || '');
    setTemplateCategory(tpl.category || 'custom');
    setTemplateExercises(
      (tpl.exercises || []).map(e => ({
        exerciseId: e.exerciseId,
        exerciseName: e.exerciseName,
        targetSets: e.targetSets || e.sets || 3,
        repMin: e.repMin || 8,
        repMax: e.repMax || 12,
        restSeconds: e.restSeconds || 90
      }))
    );
    setIsModalOpen(true);
  };

  const handleAddExercise = (ex: Exercise) => {
    setTemplateExercises(prev => [
      ...prev,
      {
        exerciseId: ex.id,
        exerciseName: ex.name,
        targetSets: 3,
        repMin: 8,
        repMax: 12,
        restSeconds: 90
      }
    ]);
  };

  const handleUpdateExerciseParam = (
    index: number,
    field: 'targetSets' | 'repMin' | 'repMax' | 'restSeconds',
    val: number
  ) => {
    setTemplateExercises(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleRemoveExercise = (index: number) => {
    setTemplateExercises(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim() || templateExercises.length === 0) return;

    const estimatedMins = Math.max(30, Math.round(templateExercises.length * 8.5));
    const targetMuscles: MuscleId[] = Array.from(
      new Set(
        templateExercises.flatMap(e => {
          const def = EXERCISES_MAP[e.exerciseId];
          return def ? def.muscles.map(m => m.muscleId) : [];
        })
      )
    );

    const updatedTemplate: WorkoutTemplate = {
      id: editingTemplateId || `template_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: templateName.trim(),
      description: templateDescription.trim(),
      category: templateCategory,
      estimatedMinutes: estimatedMins,
      estimatedDurationMinutes: estimatedMins,
      targetMuscles,
      exercises: templateExercises.map(e => ({
        exerciseId: e.exerciseId,
        exerciseName: e.exerciseName,
        sets: e.targetSets,
        targetSets: e.targetSets,
        repMin: e.repMin,
        repMax: e.repMax,
        restSeconds: e.restSeconds
      }))
    };

    onSaveTemplate(updatedTemplate);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Workout Routines & Splits
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Browse structured training splits or design custom reusable workout templates.
          </p>
        </div>

        <button
          id="create-routine-btn"
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Custom Routine
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search routines by title or exercise..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Quick Categories Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {filteredTemplates.map(tpl => {
          const muscles = getTemplateMuscles(tpl);
          const duration =
            tpl.estimatedDurationMinutes ||
            tpl.estimatedMinutes ||
            Math.round((tpl.exercises?.length || 4) * 8.5);

          return (
            <div
              key={tpl.id}
              className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 dark:hover:border-blue-800 transition-all group"
            >
              <div className="space-y-3">
                {/* Category Badge & Duration */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {tpl.category || 'Routine'}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5" /> ~{duration}m
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {tpl.name}
                  </h3>
                  {tpl.description ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {tpl.description}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {tpl.exercises?.length || 0} programmed exercises
                    </p>
                  )}
                </div>

                {/* Target Muscle Badges */}
                {muscles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {muscles.map(mId => (
                      <span
                        key={mId}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30"
                      >
                        {MUSCLE_CATALOG[mId]?.name.split(' ')[0] || mId}
                      </span>
                    ))}
                  </div>
                )}

                {/* Exercise Preview List */}
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {(tpl.exercises || []).slice(0, 4).map((e, idx) => (
                    <div key={idx} className="flex justify-between items-center py-0.5">
                      <span className="truncate max-w-[170px] font-medium text-slate-800 dark:text-slate-200">
                        {e.exerciseName}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500 shrink-0">
                        {e.targetSets || e.sets || 3} sets × {e.repMin || 8}-{e.repMax || 12}
                      </span>
                    </div>
                  ))}
                  {(tpl.exercises?.length || 0) > 4 && (
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium block pt-0.5">
                      +{(tpl.exercises?.length || 0) - 4} more exercises
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => onStartTemplate(tpl)}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.98]"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Start Session
                </button>

                <button
                  onClick={() => handleOpenEditModal(tpl)}
                  className="p-2.5 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-slate-200 dark:border-slate-800 transition-colors"
                  title="Edit Routine"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onDeleteTemplate(tpl.id)}
                  className="p-2.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-slate-800 transition-colors"
                  title="Delete Routine"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredTemplates.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
            <BookmarkPlus className="w-10 h-10 text-slate-400 mx-auto opacity-50" />
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              No matching routines found
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create a custom training template to streamline your frequent workout sessions.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs"
            >
              Create New Routine
            </button>
          </div>
        )}
      </div>

      {/* Create / Edit Template Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[88vh]">
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingTemplateId ? 'Edit Workout Routine' : 'Create Custom Workout Routine'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Design an organized, repeatable training blueprint.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {/* Routine Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Routine Name *
                </label>
                <input
                  type="text"
                  placeholder="E.g., Chest & Back Hypertrophy Split"
                  value={templateName}
                  onChange={e => setTemplateName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Category & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category Split
                  </label>
                  <select
                    value={templateCategory}
                    onChange={e => setTemplateCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="push">Push (Chest/Shoulders/Triceps)</option>
                    <option value="pull">Pull (Back/Biceps/Rear Delts)</option>
                    <option value="legs">Legs (Quads/Hamstrings/Glutes)</option>
                    <option value="upper">Upper Body</option>
                    <option value="lower">Lower Body</option>
                    <option value="full_body">Full Body</option>
                    <option value="custom">Custom Split</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Focus on mechanical tension..."
                    value={templateDescription}
                    onChange={e => setTemplateDescription(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Added Exercises List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Programmed Exercises ({templateExercises.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowExerciseSelector(true)}
                    className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Movement
                  </button>
                </div>

                <div className="space-y-2.5">
                  {templateExercises.map((e, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                          {idx + 1}. {e.exerciseName}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(idx)}
                          className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                          title="Remove movement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Sets / Reps / Rest Controls */}
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-500 font-medium block mb-0.5">
                            Sets
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={e.targetSets}
                            onChange={ev =>
                              handleUpdateExerciseParam(
                                idx,
                                'targetSets',
                                Math.max(1, parseInt(ev.target.value) || 1)
                              )
                            }
                            className="w-full p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-center"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-medium block mb-0.5">
                            Target Reps
                          </label>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="1"
                              max="50"
                              value={e.repMin}
                              onChange={ev =>
                                handleUpdateExerciseParam(
                                idx,
                                'repMin',
                                Math.max(1, parseInt(ev.target.value) || 1)
                              )
                            }
                              className="w-full p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-center"
                            />
                            <span className="text-slate-400">-</span>
                            <input
                              type="number"
                              min="1"
                              max="50"
                              value={e.repMax}
                              onChange={ev =>
                                handleUpdateExerciseParam(
                                idx,
                                'repMax',
                                Math.max(1, parseInt(ev.target.value) || 1)
                              )
                            }
                              className="w-full p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-center"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-medium block mb-0.5">
                            Rest (sec)
                          </label>
                          <input
                            type="number"
                            step="15"
                            min="30"
                            max="300"
                            value={e.restSeconds}
                            onChange={ev =>
                              handleUpdateExerciseParam(
                                idx,
                                'restSeconds',
                                Math.max(30, parseInt(ev.target.value) || 90)
                              )
                            }
                            className="w-full p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-center"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {templateExercises.length === 0 && (
                    <div
                      onClick={() => setShowExerciseSelector(true)}
                      className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 cursor-pointer hover:border-blue-400 transition-colors"
                    >
                      <Dumbbell className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        No exercises added yet
                      </p>
                      <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-bold">
                        + Click to choose your first exercise
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTemplate}
                disabled={!templateName.trim() || templateExercises.length === 0}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all active:scale-[0.98]"
              >
                {editingTemplateId ? 'Save Changes' : 'Create Routine'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Movement Selector Modal */}
      {showExerciseSelector && (
        <ExerciseSelectorModal
          onSelect={handleAddExercise}
          onClose={() => setShowExerciseSelector(false)}
        />
      )}
    </div>
  );
};
