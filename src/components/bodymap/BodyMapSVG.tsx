import React from 'react';
import { MuscleId, MuscleExposureData } from '../../types';
import { MUSCLE_CATALOG, FRESHNESS_COLORS } from '../../lib/muscleMath';

interface BodyMapSVGProps {
  view: 'front' | 'back';
  musclesData: Record<MuscleId, MuscleExposureData>;
  selectedMuscle: MuscleId | null;
  hoveredMuscle: MuscleId | null;
  onHoverMuscle: (id: MuscleId | null) => void;
  onSelectMuscle: (id: MuscleId) => void;
}

export const BodyMapSVG: React.FC<BodyMapSVGProps> = ({
  view,
  musclesData,
  selectedMuscle,
  hoveredMuscle,
  onHoverMuscle,
  onSelectMuscle
}) => {
  // Fitbod-style dynamic gradient or solid fill based on recovery state
  const getMuscleFill = (id: MuscleId) => {
    const data = musclesData[id];
    const status = data?.freshnessStatus || 'untrained';
    if (status === 'fresh') return 'url(#fitbod-grad-fresh)';
    if (status === 'moderate') return 'url(#fitbod-grad-moderate)';
    if (status === 'recently_trained' || status === 'high_recent_exposure') return 'url(#fitbod-grad-fatigued)';
    return 'url(#fitbod-grad-untrained)';
  };

  const getMuscleStroke = (id: MuscleId) => {
    if (selectedMuscle === id) return '#ffffff';
    if (hoveredMuscle === id) return '#38bdf8';
    const data = musclesData[id];
    const status = data?.freshnessStatus || 'untrained';
    if (status === 'fresh') return '#34d399';
    if (status === 'moderate') return '#fbbf24';
    if (status === 'recently_trained' || status === 'high_recent_exposure') return '#f87171';
    return 'rgba(148, 163, 184, 0.25)';
  };

  const getStrokeWidth = (id: MuscleId) => {
    if (selectedMuscle === id) return '2';
    if (hoveredMuscle === id) return '1.8';
    return '1';
  };

  const getOpacity = (id: MuscleId) => {
    if (hoveredMuscle && hoveredMuscle !== id) return '0.7';
    return '0.98';
  };

  const getFilter = (id: MuscleId) => {
    if (selectedMuscle === id || hoveredMuscle === id) return 'url(#fitbod-glow-active)';
    const data = musclesData[id];
    const status = data?.freshnessStatus || 'untrained';
    if (status === 'fresh') return 'url(#fitbod-glow-subtle)';
    return undefined;
  };

  const renderMuscleGroup = (
    id: MuscleId,
    name: string,
    children: React.ReactNode
  ) => {
    const displayName = MUSCLE_CATALOG[id]?.name || name;
    const isSelected = selectedMuscle === id;
    const isHovered = hoveredMuscle === id;

    return (
      <g
        id={`fitbod-muscle-${id}`}
        className="cursor-pointer transition-transform duration-200 focus:outline-none"
        style={{
          transformOrigin: '100px 175px',
          transform: isHovered || isSelected ? 'scale(1.015)' : 'scale(1)'
        }}
        onMouseEnter={() => onHoverMuscle(id)}
        onMouseLeave={() => onHoverMuscle(null)}
        onClick={() => onSelectMuscle(id)}
        role="button"
        tabIndex={0}
        aria-label={displayName}
      >
        {children}
      </g>
    );
  };

  return (
    <svg
      viewBox="0 0 200 350"
      className="w-full h-auto max-h-[460px] select-none mx-auto drop-shadow-md"
      aria-label={`${view === 'front' ? 'Front' : 'Back'} Fitbod Body Map`}
    >
      <defs>
        {/* Fitbod Fresh Radiant Gradient (Emerald to Mint) */}
        <linearGradient id="fitbod-grad-fresh" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Fitbod Moderate Recovery Gradient (Gold Amber to Honey) */}
        <linearGradient id="fitbod-grad-moderate" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        {/* Fitbod High-Exposure / Fatigued Gradient (Crimson to Coral) */}
        <linearGradient id="fitbod-grad-fatigued" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>

        {/* Fitbod Untrained / Stealth Matte Gradient */}
        <linearGradient id="fitbod-grad-untrained" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#334155" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#1e293b" stopOpacity="0.9" />
        </linearGradient>

        {/* Subtle Athletic Silhouette Gradient */}
        <linearGradient id="fitbod-silhouette-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#090d16" stopOpacity="0.98" />
        </linearGradient>

        {/* Glow Filters */}
        <filter id="fitbod-glow-subtle" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#10b981" floodOpacity="0.35" />
        </filter>
        <filter id="fitbod-glow-active" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#38bdf8" floodOpacity="0.75" />
        </filter>
      </defs>

      {/* ============================================================ */}
      {/* BASE HUMAN ATHLETIC SILHOUETTE (FITBOD CONTOUR)               */}
      {/* ============================================================ */}
      <g id="fitbod-base-silhouette" className="stroke-slate-800/80 dark:stroke-slate-700/50" strokeWidth="1">
        {/* Head & Cranium */}
        <path
          d="M 100,8 C 111,8 116,16 116,26 C 116,36 109,44 100,45 C 91,44 84,36 84,26 C 84,16 89,8 100,8 Z"
          fill="url(#fitbod-silhouette-grad)"
        />
        {/* Neck Column */}
        <path
          d="M 93,43 C 92,51 86,55 80,58 L 120,58 C 114,55 108,51 107,43 Z"
          fill="url(#fitbod-silhouette-grad)"
        />

        {/* Clavicular Collarbone Landmark (Front only) */}
        {view === 'front' && (
          <path
            d="M 80,58 Q 100,62 120,58"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="0.8"
          />
        )}

        {/* Wrist & Hands / Stylized Athletic Fists */}
        <path
          d="M 43,184 C 40,191 40,197 43,203 C 46,207 49,206 51,201 L 52,184 Z"
          fill="url(#fitbod-silhouette-grad)"
        />
        <path
          d="M 157,184 C 160,191 160,197 157,203 C 154,207 151,206 149,201 L 148,184 Z"
          fill="url(#fitbod-silhouette-grad)"
        />

        {/* Patella / Knee Joint Caps */}
        <circle cx="82" cy="242" r="5" fill="#1e293b" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
        <circle cx="118" cy="242" r="5" fill="#1e293b" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />

        {/* Ankles & Athletic Feet */}
        <path
          d="M 75,324 C 74,332 67,338 65,342 C 73,342 85,342 88,342 C 88,338 87,332 86,324 Z"
          fill="url(#fitbod-silhouette-grad)"
        />
        <path
          d="M 125,324 C 126,332 133,338 135,342 C 127,342 115,342 112,342 C 112,338 113,332 114,324 Z"
          fill="url(#fitbod-silhouette-grad)"
        />
      </g>

      {/* ============================================================ */}
      {/* ANTERIOR (FRONT) MUSCLES                                      */}
      {/* ============================================================ */}
      {view === 'front' && (
        <g id="fitbod-anterior-muscles">
          {/* CHEST - Upper (Clavicular Head) */}
          {renderMuscleGroup(
            'chest_upper',
            'Upper Chest',
            <>
              <path
                d="M 98,59 C 90,58 79,58 72,61 C 70,64 69,67 70,70 C 77,70 88,69 98,71 Z"
                fill={getMuscleFill('chest_upper')}
                stroke={getMuscleStroke('chest_upper')}
                strokeWidth={getStrokeWidth('chest_upper')}
                opacity={getOpacity('chest_upper')}
                filter={getFilter('chest_upper')}
              />
              <path
                d="M 102,59 C 110,58 121,58 128,61 C 130,64 131,67 130,70 C 123,70 112,69 102,71 Z"
                fill={getMuscleFill('chest_upper')}
                stroke={getMuscleStroke('chest_upper')}
                strokeWidth={getStrokeWidth('chest_upper')}
                opacity={getOpacity('chest_upper')}
                filter={getFilter('chest_upper')}
              />
            </>
          )}

          {/* CHEST - Mid (Sternal Head) */}
          {renderMuscleGroup(
            'chest_mid',
            'Mid Chest',
            <>
              <path
                d="M 98,73 C 86,71 76,73 69,73 C 68,79 69,85 73,88 C 81,89 90,88 98,88 Z"
                fill={getMuscleFill('chest_mid')}
                stroke={getMuscleStroke('chest_mid')}
                strokeWidth={getStrokeWidth('chest_mid')}
                opacity={getOpacity('chest_mid')}
                filter={getFilter('chest_mid')}
              />
              <path
                d="M 102,73 C 114,71 124,73 131,73 C 132,79 131,85 127,88 C 119,89 110,88 102,88 Z"
                fill={getMuscleFill('chest_mid')}
                stroke={getMuscleStroke('chest_mid')}
                strokeWidth={getStrokeWidth('chest_mid')}
                opacity={getOpacity('chest_mid')}
                filter={getFilter('chest_mid')}
              />
            </>
          )}

          {/* CHEST - Lower (Abdominal/Costal Head) */}
          {renderMuscleGroup(
            'chest_lower',
            'Lower Chest',
            <>
              <path
                d="M 98,90 C 88,90 79,90 73,89 C 73,95 78,101 86,103 C 93,103 96,99 98,96 Z"
                fill={getMuscleFill('chest_lower')}
                stroke={getMuscleStroke('chest_lower')}
                strokeWidth={getStrokeWidth('chest_lower')}
                opacity={getOpacity('chest_lower')}
                filter={getFilter('chest_lower')}
              />
              <path
                d="M 102,90 C 112,90 121,90 127,89 C 127,95 122,101 114,103 C 107,103 104,99 102,96 Z"
                fill={getMuscleFill('chest_lower')}
                stroke={getMuscleStroke('chest_lower')}
                strokeWidth={getStrokeWidth('chest_lower')}
                opacity={getOpacity('chest_lower')}
                filter={getFilter('chest_lower')}
              />
            </>
          )}

          {/* DELTOIDS - Anterior (Front Delts) */}
          {renderMuscleGroup(
            'anterior_deltoid',
            'Front Shoulders',
            <>
              <path
                d="M 71,59 C 66,59 61,62 59,67 C 57,73 58,80 64,85 C 67,81 68,74 69,67 Z"
                fill={getMuscleFill('anterior_deltoid')}
                stroke={getMuscleStroke('anterior_deltoid')}
                strokeWidth={getStrokeWidth('anterior_deltoid')}
                opacity={getOpacity('anterior_deltoid')}
                filter={getFilter('anterior_deltoid')}
              />
              <path
                d="M 129,59 C 134,59 139,62 141,67 C 143,73 142,80 136,85 C 133,81 132,74 131,67 Z"
                fill={getMuscleFill('anterior_deltoid')}
                stroke={getMuscleStroke('anterior_deltoid')}
                strokeWidth={getStrokeWidth('anterior_deltoid')}
                opacity={getOpacity('anterior_deltoid')}
                filter={getFilter('anterior_deltoid')}
              />
            </>
          )}

          {/* DELTOIDS - Lateral (Side Delts) */}
          {renderMuscleGroup(
            'lateral_deltoid',
            'Side Shoulders',
            <>
              <path
                d="M 58,65 C 53,68 49,74 50,82 C 51,89 55,93 59,93 C 58,85 57,77 58,65 Z"
                fill={getMuscleFill('lateral_deltoid')}
                stroke={getMuscleStroke('lateral_deltoid')}
                strokeWidth={getStrokeWidth('lateral_deltoid')}
                opacity={getOpacity('lateral_deltoid')}
                filter={getFilter('lateral_deltoid')}
              />
              <path
                d="M 142,65 C 147,68 151,74 150,82 C 149,89 145,93 141,93 C 142,85 143,77 142,65 Z"
                fill={getMuscleFill('lateral_deltoid')}
                stroke={getMuscleStroke('lateral_deltoid')}
                strokeWidth={getStrokeWidth('lateral_deltoid')}
                opacity={getOpacity('lateral_deltoid')}
                filter={getFilter('lateral_deltoid')}
              />
            </>
          )}

          {/* ARMS - Biceps (Biceps Brachii) */}
          {renderMuscleGroup(
            'biceps',
            'Biceps',
            <>
              <path
                d="M 58,95 C 53,99 52,111 53,123 C 54,129 58,131 62,129 C 66,124 67,113 66,101 C 65,96 61,94 58,95 Z"
                fill={getMuscleFill('biceps')}
                stroke={getMuscleStroke('biceps')}
                strokeWidth={getStrokeWidth('biceps')}
                opacity={getOpacity('biceps')}
                filter={getFilter('biceps')}
              />
              <path
                d="M 142,95 C 147,99 148,111 147,123 C 146,129 142,131 138,129 C 134,124 133,113 134,101 C 135,96 139,94 142,95 Z"
                fill={getMuscleFill('biceps')}
                stroke={getMuscleStroke('biceps')}
                strokeWidth={getStrokeWidth('biceps')}
                opacity={getOpacity('biceps')}
                filter={getFilter('biceps')}
              />
            </>
          )}

          {/* ARMS - Forearms (Brachioradialis & Wrist Flexors) */}
          {renderMuscleGroup(
            'forearms',
            'Forearms',
            <>
              <path
                d="M 53,131 C 48,136 46,146 47,161 C 48,173 50,181 53,182 C 56,182 59,174 61,164 C 63,151 63,137 60,131 Z"
                fill={getMuscleFill('forearms')}
                stroke={getMuscleStroke('forearms')}
                strokeWidth={getStrokeWidth('forearms')}
                opacity={getOpacity('forearms')}
                filter={getFilter('forearms')}
              />
              <path
                d="M 147,131 C 152,136 154,146 153,161 C 152,173 150,181 147,182 C 144,182 141,174 139,164 C 137,151 137,137 140,131 Z"
                fill={getMuscleFill('forearms')}
                stroke={getMuscleStroke('forearms')}
                strokeWidth={getStrokeWidth('forearms')}
                opacity={getOpacity('forearms')}
                filter={getFilter('forearms')}
              />
            </>
          )}

          {/* CORE - Rectus Abdominis (Fitbod 6-Pack Symmetry) */}
          {renderMuscleGroup(
            'rectus_abdominis',
            'Abdominals',
            <>
              {/* Upper Abs */}
              <path
                d="M 91,105 C 94,104 97,104 98,104 L 98,116 C 95,116 92,116 91,115 C 89,112 89,108 91,105 Z"
                fill={getMuscleFill('rectus_abdominis')}
                stroke={getMuscleStroke('rectus_abdominis')}
                strokeWidth={getStrokeWidth('rectus_abdominis')}
                opacity={getOpacity('rectus_abdominis')}
                filter={getFilter('rectus_abdominis')}
              />
              <path
                d="M 109,105 C 106,104 103,104 102,104 L 102,116 C 105,116 108,116 109,115 C 111,112 111,108 109,105 Z"
                fill={getMuscleFill('rectus_abdominis')}
                stroke={getMuscleStroke('rectus_abdominis')}
                strokeWidth={getStrokeWidth('rectus_abdominis')}
                opacity={getOpacity('rectus_abdominis')}
                filter={getFilter('rectus_abdominis')}
              />
              {/* Middle Abs */}
              <path
                d="M 90,119 C 94,118 97,118 98,118 L 98,131 C 94,131 92,131 90,130 C 88,126 88,122 90,119 Z"
                fill={getMuscleFill('rectus_abdominis')}
                stroke={getMuscleStroke('rectus_abdominis')}
                strokeWidth={getStrokeWidth('rectus_abdominis')}
                opacity={getOpacity('rectus_abdominis')}
                filter={getFilter('rectus_abdominis')}
              />
              <path
                d="M 110,119 C 106,118 103,118 102,118 L 102,131 C 106,131 108,131 110,130 C 112,126 112,122 110,119 Z"
                fill={getMuscleFill('rectus_abdominis')}
                stroke={getMuscleStroke('rectus_abdominis')}
                strokeWidth={getStrokeWidth('rectus_abdominis')}
                opacity={getOpacity('rectus_abdominis')}
                filter={getFilter('rectus_abdominis')}
              />
              {/* Lower Abs */}
              <path
                d="M 91,134 C 94,133 97,133 98,133 L 98,148 C 95,148 93,147 92,145 C 89,140 89,136 91,134 Z"
                fill={getMuscleFill('rectus_abdominis')}
                stroke={getMuscleStroke('rectus_abdominis')}
                strokeWidth={getStrokeWidth('rectus_abdominis')}
                opacity={getOpacity('rectus_abdominis')}
                filter={getFilter('rectus_abdominis')}
              />
              <path
                d="M 109,134 C 106,133 103,133 102,133 L 102,148 C 105,148 107,147 108,145 C 111,140 111,136 109,134 Z"
                fill={getMuscleFill('rectus_abdominis')}
                stroke={getMuscleStroke('rectus_abdominis')}
                strokeWidth={getStrokeWidth('rectus_abdominis')}
                opacity={getOpacity('rectus_abdominis')}
                filter={getFilter('rectus_abdominis')}
              />
            </>
          )}

          {/* CORE - Obliques (Flanks) */}
          {renderMuscleGroup(
            'obliques',
            'Obliques',
            <>
              <path
                d="M 86,106 C 80,107 73,115 72,127 C 71,139 73,147 77,150 C 82,149 86,146 88,143 C 87,133 87,119 86,106 Z"
                fill={getMuscleFill('obliques')}
                stroke={getMuscleStroke('obliques')}
                strokeWidth={getStrokeWidth('obliques')}
                opacity={getOpacity('obliques')}
                filter={getFilter('obliques')}
              />
              <path
                d="M 114,106 C 120,107 127,115 128,127 C 129,139 127,147 123,150 C 118,149 114,146 112,143 C 113,133 113,119 114,106 Z"
                fill={getMuscleFill('obliques')}
                stroke={getMuscleStroke('obliques')}
                strokeWidth={getStrokeWidth('obliques')}
                opacity={getOpacity('obliques')}
                filter={getFilter('obliques')}
              />
            </>
          )}

          {/* LEGS - Quadriceps (Sweeping Athletic Quads) */}
          {renderMuscleGroup(
            'quadriceps',
            'Quadriceps',
            <>
              <path
                d="M 75,155 C 69,166 66,189 67,213 C 68,227 72,236 78,237 C 85,238 89,232 92,225 C 95,205 95,179 94,157 C 87,155 80,154 75,155 Z"
                fill={getMuscleFill('quadriceps')}
                stroke={getMuscleStroke('quadriceps')}
                strokeWidth={getStrokeWidth('quadriceps')}
                opacity={getOpacity('quadriceps')}
                filter={getFilter('quadriceps')}
              />
              <path
                d="M 125,155 C 131,166 134,189 133,213 C 132,227 128,236 122,237 C 115,238 111,232 108,225 C 105,205 105,179 106,157 C 113,155 120,154 125,155 Z"
                fill={getMuscleFill('quadriceps')}
                stroke={getMuscleStroke('quadriceps')}
                strokeWidth={getStrokeWidth('quadriceps')}
                opacity={getOpacity('quadriceps')}
                filter={getFilter('quadriceps')}
              />
            </>
          )}

          {/* LEGS - Adductors (Inner Thighs) */}
          {renderMuscleGroup(
            'adductors',
            'Inner Thighs',
            <>
              <path
                d="M 94,163 C 95,176 95,196 93,216 C 91,216 90,206 91,186 C 92,173 93,166 94,163 Z"
                fill={getMuscleFill('adductors')}
                stroke={getMuscleStroke('adductors')}
                strokeWidth={getStrokeWidth('adductors')}
                opacity={getOpacity('adductors')}
                filter={getFilter('adductors')}
              />
              <path
                d="M 106,163 C 105,176 105,196 107,216 C 109,216 110,206 109,186 C 108,173 107,166 106,163 Z"
                fill={getMuscleFill('adductors')}
                stroke={getMuscleStroke('adductors')}
                strokeWidth={getStrokeWidth('adductors')}
                opacity={getOpacity('adductors')}
                filter={getFilter('adductors')}
              />
            </>
          )}

          {/* LEGS - Calves (Gastrocnemius Front & Shins) */}
          {renderMuscleGroup(
            'calves',
            'Calves & Shins',
            <>
              <path
                d="M 76,251 C 70,259 69,273 71,291 C 73,307 75,319 78,323 C 82,323 85,317 87,306 C 90,289 89,267 86,251 Z"
                fill={getMuscleFill('calves')}
                stroke={getMuscleStroke('calves')}
                strokeWidth={getStrokeWidth('calves')}
                opacity={getOpacity('calves')}
                filter={getFilter('calves')}
              />
              <path
                d="M 124,251 C 130,259 131,273 129,291 C 127,307 125,319 122,323 C 118,323 115,317 113,306 C 110,289 111,267 114,251 Z"
                fill={getMuscleFill('calves')}
                stroke={getMuscleStroke('calves')}
                strokeWidth={getStrokeWidth('calves')}
                opacity={getOpacity('calves')}
                filter={getFilter('calves')}
              />
            </>
          )}
        </g>
      )}

      {/* ============================================================ */}
      {/* POSTERIOR (BACK) MUSCLES                                     */}
      {/* ============================================================ */}
      {view === 'back' && (
        <g id="fitbod-posterior-muscles">
          {/* BACK - Upper Back (Trapezius Diamond & Rhomboids) */}
          {renderMuscleGroup(
            'rhomboids',
            'Trapezius & Upper Back',
            <>
              {/* Upper Trapezius Yoke */}
              <path
                d="M 100,44 C 91,46 81,51 72,58 C 74,64 77,68 82,70 C 89,67 95,66 100,66 C 105,66 111,67 118,70 C 123,68 126,64 128,58 C 119,51 109,46 100,44 Z"
                fill={getMuscleFill('rhomboids')}
                stroke={getMuscleStroke('rhomboids')}
                strokeWidth={getStrokeWidth('rhomboids')}
                opacity={getOpacity('rhomboids')}
                filter={getFilter('rhomboids')}
              />
              {/* Mid-Trap & Rhomboid Core Diamond */}
              <path
                d="M 99,67 C 93,67 85,71 80,75 C 79,84 86,98 99,114 Z"
                fill={getMuscleFill('rhomboids')}
                stroke={getMuscleStroke('rhomboids')}
                strokeWidth={getStrokeWidth('rhomboids')}
                opacity={getOpacity('rhomboids')}
                filter={getFilter('rhomboids')}
              />
              <path
                d="M 101,67 C 107,67 115,71 120,75 C 121,84 114,98 101,114 Z"
                fill={getMuscleFill('rhomboids')}
                stroke={getMuscleStroke('rhomboids')}
                strokeWidth={getStrokeWidth('rhomboids')}
                opacity={getOpacity('rhomboids')}
                filter={getFilter('rhomboids')}
              />
            </>
          )}

          {/* DELTOIDS - Posterior (Rear Delts) */}
          {renderMuscleGroup(
            'posterior_deltoid',
            'Rear Shoulders',
            <>
              <path
                d="M 70,60 C 64,61 59,65 57,71 C 55,77 56,84 62,88 C 65,83 67,76 68,68 Z"
                fill={getMuscleFill('posterior_deltoid')}
                stroke={getMuscleStroke('posterior_deltoid')}
                strokeWidth={getStrokeWidth('posterior_deltoid')}
                opacity={getOpacity('posterior_deltoid')}
                filter={getFilter('posterior_deltoid')}
              />
              <path
                d="M 130,60 C 136,61 141,65 143,71 C 145,77 144,84 138,88 C 135,83 133,76 132,68 Z"
                fill={getMuscleFill('posterior_deltoid')}
                stroke={getMuscleStroke('posterior_deltoid')}
                strokeWidth={getStrokeWidth('posterior_deltoid')}
                opacity={getOpacity('posterior_deltoid')}
                filter={getFilter('posterior_deltoid')}
              />
            </>
          )}

          {/* ARMS - Triceps (Long, Lateral & Medial Heads) */}
          {renderMuscleGroup(
            'triceps',
            'Triceps',
            <>
              <path
                d="M 56,92 C 51,96 49,108 50,121 C 51,127 55,129 59,127 C 63,122 65,111 64,99 C 63,94 59,92 56,92 Z"
                fill={getMuscleFill('triceps')}
                stroke={getMuscleStroke('triceps')}
                strokeWidth={getStrokeWidth('triceps')}
                opacity={getOpacity('triceps')}
                filter={getFilter('triceps')}
              />
              <path
                d="M 144,92 C 149,96 151,108 150,121 C 149,127 145,129 141,127 C 137,122 135,111 136,99 C 137,94 141,92 144,92 Z"
                fill={getMuscleFill('triceps')}
                stroke={getMuscleStroke('triceps')}
                strokeWidth={getStrokeWidth('triceps')}
                opacity={getOpacity('triceps')}
                filter={getFilter('triceps')}
              />
            </>
          )}

          {/* ARMS - Forearms Posterior (Extensors) */}
          {renderMuscleGroup(
            'forearms',
            'Forearm Extensors',
            <>
              <path
                d="M 52,130 C 47,135 45,145 46,160 C 47,172 49,180 52,181 C 55,181 58,173 60,163 C 62,150 62,136 59,130 Z"
                fill={getMuscleFill('forearms')}
                stroke={getMuscleStroke('forearms')}
                strokeWidth={getStrokeWidth('forearms')}
                opacity={getOpacity('forearms')}
                filter={getFilter('forearms')}
              />
              <path
                d="M 148,130 C 153,135 155,145 154,160 C 153,172 151,180 148,181 C 145,181 142,173 140,163 C 138,150 138,136 141,130 Z"
                fill={getMuscleFill('forearms')}
                stroke={getMuscleStroke('forearms')}
                strokeWidth={getStrokeWidth('forearms')}
                opacity={getOpacity('forearms')}
                filter={getFilter('forearms')}
              />
            </>
          )}

          {/* BACK - Latissimus Dorsi (V-Taper Wings) */}
          {renderMuscleGroup(
            'latissimus_dorsi',
            'Lats',
            <>
              <path
                d="M 78,82 C 72,92 68,108 71,126 C 73,138 78,144 83,143 C 86,136 88,124 88,110 C 88,96 84,86 78,82 Z"
                fill={getMuscleFill('latissimus_dorsi')}
                stroke={getMuscleStroke('latissimus_dorsi')}
                strokeWidth={getStrokeWidth('latissimus_dorsi')}
                opacity={getOpacity('latissimus_dorsi')}
                filter={getFilter('latissimus_dorsi')}
              />
              <path
                d="M 122,82 C 128,92 132,108 129,126 C 127,138 122,144 117,143 C 114,136 112,124 112,110 C 112,96 116,86 122,82 Z"
                fill={getMuscleFill('latissimus_dorsi')}
                stroke={getMuscleStroke('latissimus_dorsi')}
                strokeWidth={getStrokeWidth('latissimus_dorsi')}
                opacity={getOpacity('latissimus_dorsi')}
                filter={getFilter('latissimus_dorsi')}
              />
            </>
          )}

          {/* BACK - Spinal Erectors (Lower Back) */}
          {renderMuscleGroup(
            'spinal_erectors',
            'Lower Back',
            <>
              <path
                d="M 92,118 C 95,116 98,116 98,116 L 98,148 C 96,148 94,147 92,144 C 90,138 90,128 92,118 Z"
                fill={getMuscleFill('spinal_erectors')}
                stroke={getMuscleStroke('spinal_erectors')}
                strokeWidth={getStrokeWidth('spinal_erectors')}
                opacity={getOpacity('spinal_erectors')}
                filter={getFilter('spinal_erectors')}
              />
              <path
                d="M 108,118 C 105,116 102,116 102,116 L 102,148 C 104,148 106,147 108,144 C 110,138 110,128 108,118 Z"
                fill={getMuscleFill('spinal_erectors')}
                stroke={getMuscleStroke('spinal_erectors')}
                strokeWidth={getStrokeWidth('spinal_erectors')}
                opacity={getOpacity('spinal_erectors')}
                filter={getFilter('spinal_erectors')}
              />
            </>
          )}

          {/* GLUTEUS (Fitbod Glute Contours) */}
          {renderMuscleGroup(
            'gluteus',
            'Glutes',
            <>
              <path
                d="M 98,149 C 91,148 76,151 73,161 C 69,174 72,192 81,197 C 89,201 96,196 98,187 Z"
                fill={getMuscleFill('gluteus')}
                stroke={getMuscleStroke('gluteus')}
                strokeWidth={getStrokeWidth('gluteus')}
                opacity={getOpacity('gluteus')}
                filter={getFilter('gluteus')}
              />
              <path
                d="M 102,149 C 109,148 124,151 127,161 C 131,174 128,192 119,197 C 111,201 104,196 102,187 Z"
                fill={getMuscleFill('gluteus')}
                stroke={getMuscleStroke('gluteus')}
                strokeWidth={getStrokeWidth('gluteus')}
                opacity={getOpacity('gluteus')}
                filter={getFilter('gluteus')}
              />
            </>
          )}

          {/* LEGS - Hamstrings (Posterior Thighs) */}
          {renderMuscleGroup(
            'hamstrings',
            'Hamstrings',
            <>
              <path
                d="M 76,200 C 71,206 69,219 72,234 C 75,237 81,237 86,236 C 92,232 94,222 93,205 C 87,203 81,201 76,200 Z"
                fill={getMuscleFill('hamstrings')}
                stroke={getMuscleStroke('hamstrings')}
                strokeWidth={getStrokeWidth('hamstrings')}
                opacity={getOpacity('hamstrings')}
                filter={getFilter('hamstrings')}
              />
              <path
                d="M 124,200 C 129,206 131,219 128,234 C 125,237 119,237 114,236 C 108,232 106,222 107,205 C 113,203 119,201 124,200 Z"
                fill={getMuscleFill('hamstrings')}
                stroke={getMuscleStroke('hamstrings')}
                strokeWidth={getStrokeWidth('hamstrings')}
                opacity={getOpacity('hamstrings')}
                filter={getFilter('hamstrings')}
              />
            </>
          )}

          {/* LEGS - Calves Posterior (Gastrocnemius Twin Diamond) */}
          {renderMuscleGroup(
            'calves',
            'Calves (Posterior)',
            <>
              <path
                d="M 76,249 C 70,257 69,271 71,289 C 73,305 75,317 78,321 C 82,321 85,315 87,304 C 90,287 89,265 86,249 Z"
                fill={getMuscleFill('calves')}
                stroke={getMuscleStroke('calves')}
                strokeWidth={getStrokeWidth('calves')}
                opacity={getOpacity('calves')}
                filter={getFilter('calves')}
              />
              <path
                d="M 124,249 C 130,257 131,271 129,289 C 127,305 125,317 122,321 C 118,321 115,315 113,304 C 110,287 111,265 114,249 Z"
                fill={getMuscleFill('calves')}
                stroke={getMuscleStroke('calves')}
                strokeWidth={getStrokeWidth('calves')}
                opacity={getOpacity('calves')}
                filter={getFilter('calves')}
              />
            </>
          )}
        </g>
      )}
    </svg>
  );
};
