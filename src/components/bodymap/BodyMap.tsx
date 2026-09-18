import React, { useState } from 'react';
import { MuscleId, MuscleExposureData } from '../../types';
import { BodyMapSVG } from './BodyMapSVG';
import { MuscleDetailModal } from './MuscleDetailModal';
import { MUSCLE_CATALOG, FRESHNESS_COLORS } from '../../lib/muscleMath';
import { Table, Info, Dumbbell } from 'lucide-react';

interface BodyMapProps {
  musclesData: Record<MuscleId, MuscleExposureData>;
  onTrainMuscle?: (muscleId: MuscleId) => void;
  className?: string;
}

export const BodyMap: React.FC<BodyMapProps> = ({
  musclesData,
  onTrainMuscle,
  className = ''
}) => {
  const [activeView, setActiveView] = useState<'front' | 'back' | 'both'>('both');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleId | null>(null);
  const [hoveredMuscle, setHoveredMuscle] = useState<MuscleId | null>(null);
  const [showTableView, setShowTableView] = useState(false);
  const [modalMuscle, setModalMuscle] = useState<MuscleId | null>(null);

  const inspectorMuscleId = hoveredMuscle || selectedMuscle;
  const inspectorData = inspectorMuscleId ? musclesData[inspectorMuscleId] : null;
  const inspectorInfo = inspectorMuscleId ? MUSCLE_CATALOG[inspectorMuscleId] : null;

  return (
    <div className={`relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden ${className}`}>
      {/* 1. Header with Title & Perspective View Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Muscle Recovery Map
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Live recovery status and training readiness. Click any muscle to view details.
          </p>
        </div>

        {/* View Selector Controls */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold">
            <button
              id="bodymap-view-both-btn"
              onClick={() => {
                setActiveView('both');
                setShowTableView(false);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeView === 'both' && !showTableView
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Dual
            </button>
            <button
              id="bodymap-view-front-btn"
              onClick={() => {
                setActiveView('front');
                setShowTableView(false);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeView === 'front' && !showTableView
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Front
            </button>
            <button
              id="bodymap-view-back-btn"
              onClick={() => {
                setActiveView('back');
                setShowTableView(false);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeView === 'back' && !showTableView
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Back
            </button>
            <button
              id="bodymap-view-table-btn"
              onClick={() => setShowTableView(!showTableView)}
              className={`p-1.5 rounded-lg transition-all ${
                showTableView
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Toggle Table List"
            >
              <Table className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Visual Body Map Canvas */}
      <div className="p-4 sm:p-6">
        {showTableView ? (
          /* Table View */
          <div className="overflow-x-auto max-h-[440px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Muscle</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Last Trained</th>
                  <th className="py-2.5 px-3">7-Day Eff. Sets</th>
                  <th className="py-2.5 px-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(Object.values(musclesData) as MuscleExposureData[]).map(m => {
                  const info = MUSCLE_CATALOG[m.muscleId];
                  const color = FRESHNESS_COLORS[m.freshnessStatus];
                  return (
                    <tr
                      key={m.muscleId}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                      onClick={() => setModalMuscle(m.muscleId)}
                    >
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: color.fill }}
                        />
                        {info.name}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${color.badgeClass}`}>
                          {color.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                        {m.daysSinceTraining === null
                          ? 'Never'
                          : Math.floor(m.daysSinceTraining) === 0
                          ? 'Today'
                          : `${Math.floor(m.daysSinceTraining)}d ago`}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">
                        {m.effectiveSets7d}
                        {m.isIndirectOnly && (m.indirectSets7d || 0) > 0 && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-normal leading-tight">
                            synergist
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setModalMuscle(m.muscleId);
                          }}
                          className="text-blue-600 dark:text-blue-400 font-medium hover:underline text-xs"
                        >
                          Details &rarr;
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Front & Back SVG Diagrams */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-center">
              {(activeView === 'front' || activeView === 'both') && (
                <div className="flex flex-col items-center bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Front View
                  </span>
                  <div className="w-full max-w-[240px]">
                    <BodyMapSVG
                      view="front"
                      musclesData={musclesData}
                      selectedMuscle={selectedMuscle}
                      hoveredMuscle={hoveredMuscle}
                      onHoverMuscle={setHoveredMuscle}
                      onSelectMuscle={id => setModalMuscle(id)}
                    />
                  </div>
                </div>
              )}

              {(activeView === 'back' || activeView === 'both') && (
                <div className="flex flex-col items-center bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Back View
                  </span>
                  <div className="w-full max-w-[240px]">
                    <BodyMapSVG
                      view="back"
                      musclesData={musclesData}
                      selectedMuscle={selectedMuscle}
                      hoveredMuscle={hoveredMuscle}
                      onHoverMuscle={setHoveredMuscle}
                      onSelectMuscle={id => setModalMuscle(id)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Inspector strip if hovered or selected */}
            {inspectorMuscleId && inspectorData && inspectorInfo ? (
              <div
                onClick={() => setModalMuscle(inspectorMuscleId)}
                className="p-3.5 rounded-2xl bg-slate-900 text-white shadow-md border border-slate-800 flex items-center justify-between gap-3 cursor-pointer hover:border-blue-500/50 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: FRESHNESS_COLORS[inspectorData.freshnessStatus].fill }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{inspectorInfo.name}</span>
                      <span className="text-[11px] text-slate-400 capitalize">({inspectorInfo.category})</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Status: <strong className="text-white">{FRESHNESS_COLORS[inspectorData.freshnessStatus].label}</strong> •{' '}
                      Last: {inspectorData.daysSinceTraining === null ? 'Never' : `${Math.floor(inspectorData.daysSinceTraining)}d ago`} •{' '}
                      7-day sets: {inspectorData.effectiveSets7d}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {onTrainMuscle && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onTrainMuscle(inspectorMuscleId);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1"
                    >
                      <Dumbbell className="w-3 h-3" />
                      Train
                    </button>
                  )}
                  <span className="text-xs text-blue-400 hover:underline">View &rarr;</span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
                Click or hover any muscle group to view recovery freshness, training history, and exercises.
              </div>
            )}
          </div>
        )}

        {/* 3. Recovery Legend */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            Recovery Status:
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {(['high_recent_exposure', 'recently_trained', 'moderate', 'fresh', 'untrained'] as const).map(state => {
              const conf = FRESHNESS_COLORS[state];
              return (
                <div
                  key={state}
                  className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800"
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: conf.fill }} />
                  <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">{conf.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Muscle Detail Modal */}
      {modalMuscle && (
        <MuscleDetailModal
          muscleId={modalMuscle}
          muscleData={musclesData[modalMuscle]}
          onClose={() => setModalMuscle(null)}
          onSelectForWorkout={onTrainMuscle}
        />
      )}
    </div>
  );
};
