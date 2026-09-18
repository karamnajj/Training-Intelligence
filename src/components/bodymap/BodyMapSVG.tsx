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
  const getMuscleFill = (id: MuscleId) => {
    const data = musclesData[id];
    const status = data?.freshnessStatus || 'untrained';
    return FRESHNESS_COLORS[status]?.fill || '#94a3b8';
  };

  const getMuscleStroke = (id: MuscleId) => {
    if (selectedMuscle === id) return '#ffffff';
    if (hoveredMuscle === id) return '#f8fafc';
    const data = musclesData[id];
    const status = data?.freshnessStatus || 'untrained';
    return FRESHNESS_COLORS[status]?.stroke || '#64748b';
  };

  const getStrokeWidth = (id: MuscleId) => {
    if (selectedMuscle === id) return '2.5';
    if (hoveredMuscle === id) return '2';
    return '1.2';
  };

  const getOpacity = (id: MuscleId) => {
    if (hoveredMuscle && hoveredMuscle !== id) return '0.65';
    return '0.95';
  };

  const renderMuscleGroup = (
    id: MuscleId,
    name: string,
    children: React.ReactNode
  ) => {
    const displayName = MUSCLE_CATALOG[id]?.name || name;
    return (
      <g
        id={`muscle-group-${id}`}
        className="cursor-pointer transition-all duration-200 group"
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
      className="w-full h-auto max-h-[440px] select-none mx-auto drop-shadow-xs"
      aria-label={`${view === 'front' ? 'Front' : 'Back'} Body Map`}
    >
      {/* Background Body Skeleton & Silhouette (Subtle anatomical base) */}
      <g id="body-base-silhouette" className="fill-slate-100 dark:fill-slate-800/80 stroke-slate-200 dark:stroke-slate-700/60" strokeWidth="0.8">
        {/* Head & Neck */}
        <path d="M 100,10 C 111,10 116,18 116,28 C 116,38 109,46 100,47 C 91,46 84,38 84,28 C 84,18 89,10 100,10 Z" />
        <path d="M 92,44 C 91,52 86,55 81,59 L 119,59 C 114,55 109,52 108,44 Z" />

        {/* Hands / Wrists */}
        <path d="M 44,185 C 41,192 41,198 44,204 C 47,208 50,207 51,202 L 52,185 Z" />
        <path d="M 156,185 C 159,192 159,198 156,204 C 153,208 150,207 149,202 L 148,185 Z" />

        {/* Knees & Feet */}
        {/* Knee joints */}
        <circle cx="82" cy="242" r="6" />
        <circle cx="118" cy="242" r="6" />

        {/* Ankles & Feet */}
        <path d="M 75,324 C 74,332 68,338 66,342 C 73,342 85,342 88,342 C 88,338 87,332 86,324 Z" />
        <path d="M 125,324 C 126,332 132,338 134,342 C 127,342 115,342 112,342 C 112,338 113,332 114,324 Z" />
      </g>

      {/* ============================================================ */}
      {/* FRONT (ANTERIOR) MUSCLES                                      */}
      {/* ============================================================ */}
      {view === 'front' && (
        <g id="front-muscles">
          {/* CHEST - Upper (Clavicular Head) */}
          {renderMuscleGroup(
            'chest_upper',
            'Upper Chest',
            <>
              {/* Left Clavicular */}
              <path
                d="M 98,58 C 90,57 78,57 71,60 C 69,63 68,67 69,70 C 76,70 88,69 98,71 Z"
                fill={getMuscleFill('chest_upper')}
                stroke={getMuscleStroke('chest_upper')}
                strokeWidth={getStrokeWidth('chest_upper')}
                opacity={getOpacity('chest_upper')}
              />
              {/* Right Clavicular */}
              <path
                d="M 102,58 C 110,57 122,57 129,60 C 131,63 132,67 131,70 C 124,70 112,69 102,71 Z"
                fill={getMuscleFill('chest_upper')}
                stroke={getMuscleStroke('chest_upper')}
                strokeWidth={getStrokeWidth('chest_upper')}
                opacity={getOpacity('chest_upper')}
              />
            </>
          )}

          {/* CHEST - Mid (Sternal Head) */}
          {renderMuscleGroup(
            'chest_mid',
            'Mid Chest',
            <>
              {/* Left Mid Chest */}
              <path
                d="M 98,72 C 86,70 75,72 68,72 C 67,78 68,84 72,87 C 80,88 90,87 98,87 Z"
                fill={getMuscleFill('chest_mid')}
                stroke={getMuscleStroke('chest_mid')}
                strokeWidth={getStrokeWidth('chest_mid')}
                opacity={getOpacity('chest_mid')}
              />
              {/* Right Mid Chest */}
              <path
                d="M 102,72 C 114,70 125,72 132,72 C 133,78 132,84 128,87 C 120,88 110,87 102,87 Z"
                fill={getMuscleFill('chest_mid')}
                stroke={getMuscleStroke('chest_mid')}
                strokeWidth={getStrokeWidth('chest_mid')}
                opacity={getOpacity('chest_mid')}
              />
            </>
          )}

          {/* CHEST - Lower (Abdominal/Costal Head) */}
          {renderMuscleGroup(
            'chest_lower',
            'Lower Chest',
            <>
              {/* Left Lower Chest */}
              <path
                d="M 98,89 C 88,89 78,89 72,88 C 72,94 77,100 85,102 C 92,102 96,98 98,95 Z"
                fill={getMuscleFill('chest_lower')}
                stroke={getMuscleStroke('chest_lower')}
                strokeWidth={getStrokeWidth('chest_lower')}
                opacity={getOpacity('chest_lower')}
              />
              {/* Right Lower Chest */}
              <path
                d="M 102,89 C 112,89 122,89 128,88 C 128,94 123,100 115,102 C 108,102 104,98 102,95 Z"
                fill={getMuscleFill('chest_lower')}
                stroke={getMuscleStroke('chest_lower')}
                strokeWidth={getStrokeWidth('chest_lower')}
                opacity={getOpacity('chest_lower')}
              />
            </>
          )}

          {/* SHOULDERS - Anterior Deltoid (Front Delts) */}
          {renderMuscleGroup(
            'anterior_deltoid',
            'Front Deltoids',
            <>
              {/* Left Anterior Delt */}
              <path
                d="M 70,58 C 65,58 60,61 58,66 C 56,72 57,79 63,84 C 66,80 67,73 68,66 Z"
                fill={getMuscleFill('anterior_deltoid')}
                stroke={getMuscleStroke('anterior_deltoid')}
                strokeWidth={getStrokeWidth('anterior_deltoid')}
                opacity={getOpacity('anterior_deltoid')}
              />
              {/* Right Anterior Delt */}
              <path
                d="M 130,58 C 135,58 140,61 142,66 C 144,72 143,79 137,84 C 134,80 133,73 132,66 Z"
                fill={getMuscleFill('anterior_deltoid')}
                stroke={getMuscleStroke('anterior_deltoid')}
                strokeWidth={getStrokeWidth('anterior_deltoid')}
                opacity={getOpacity('anterior_deltoid')}
              />
            </>
          )}

          {/* SHOULDERS - Lateral Deltoid (Side Delts) */}
          {renderMuscleGroup(
            'lateral_deltoid',
            'Side Deltoids',
            <>
              {/* Left Lateral Delt */}
              <path
                d="M 57,64 C 52,67 48,73 49,81 C 50,88 54,92 58,92 C 57,84 56,76 57,64 Z"
                fill={getMuscleFill('lateral_deltoid')}
                stroke={getMuscleStroke('lateral_deltoid')}
                strokeWidth={getStrokeWidth('lateral_deltoid')}
                opacity={getOpacity('lateral_deltoid')}
              />
              {/* Right Lateral Delt */}
              <path
                d="M 143,64 C 148,67 152,73 151,81 C 150,88 146,92 142,92 C 143,84 144,76 143,64 Z"
                fill={getMuscleFill('lateral_deltoid')}
                stroke={getMuscleStroke('lateral_deltoid')}
                strokeWidth={getStrokeWidth('lateral_deltoid')}
                opacity={getOpacity('lateral_deltoid')}
              />
            </>
          )}

          {/* ARMS - Biceps (Biceps Brachii) */}
          {renderMuscleGroup(
            'biceps',
            'Biceps',
            <>
              {/* Left Bicep */}
              <path
                d="M 57,94 C 52,98 51,110 52,122 C 53,128 57,130 61,128 C 65,123 66,112 65,100 C 64,95 60,93 57,94 Z"
                fill={getMuscleFill('biceps')}
                stroke={getMuscleStroke('biceps')}
                strokeWidth={getStrokeWidth('biceps')}
                opacity={getOpacity('biceps')}
              />
              {/* Right Bicep */}
              <path
                d="M 143,94 C 148,98 149,110 148,122 C 147,128 143,130 139,128 C 135,123 134,112 135,100 C 136,95 140,93 143,94 Z"
                fill={getMuscleFill('biceps')}
                stroke={getMuscleStroke('biceps')}
                strokeWidth={getStrokeWidth('biceps')}
                opacity={getOpacity('biceps')}
              />
            </>
          )}

          {/* ARMS - Forearms (Brachioradialis & Flexors) */}
          {renderMuscleGroup(
            'forearms',
            'Forearms',
            <>
              {/* Left Forearm */}
              <path
                d="M 52,130 C 47,135 45,145 46,160 C 47,172 49,182 52,183 C 55,183 58,175 60,165 C 62,152 62,138 59,132 Z"
                fill={getMuscleFill('forearms')}
                stroke={getMuscleStroke('forearms')}
                strokeWidth={getStrokeWidth('forearms')}
                opacity={getOpacity('forearms')}
              />
              {/* Right Forearm */}
              <path
                d="M 148,130 C 153,135 155,145 154,160 C 153,172 151,182 148,183 C 145,183 142,175 140,165 C 138,152 138,138 141,132 Z"
                fill={getMuscleFill('forearms')}
                stroke={getMuscleStroke('forearms')}
                strokeWidth={getStrokeWidth('forearms')}
                opacity={getOpacity('forearms')}
              />
            </>
          )}

          {/* CORE - Rectus Abdominis (Abs 6-Pack) */}
          {renderMuscleGroup(
            'rectus_abdominis',
            'Abs (Rectus Abdominis)',
            <>
              {/* Top Pair */}
              <path
                d="M 90,105 C 93,104 96,104 98,104 L 98,116 C 95,116 92,116 90,115 C 88,112 88,108 90,105 Z"
                fill={getMuscleFill('rectus_abdominis')}
                stroke={getMuscleStroke('rectus_abdominis')}
                strokeWidth={getStrokeWidth('rectus_abdominis')}
                opacity={getOpacity('rectus_abdominis')}
              />
              <path
                d="M 110,105 C 107,104 104,104 102,104 L 102,116 C 105,116 108,116 110,115 C 112,112 112,108 110,105 Z"
                fill={getMuscleFill('rectus_abdominis')}
                stroke={getMuscleStroke('rectus_abdominis')}
                strokeWidth={getStrokeWidth('rectus_abdominis')}
                opacity={getOpacity('rectus_abdominis')}
              />

              {/* Middle Pair */}
              <path
                d="M 89,119 C 93,118 96,118 98,118 L 98,131 C 94,131 91,131 89,130 C 87,126 87,122 89,119 Z"
                fill={getMuscleFill('rectus_abdominis')}
                stroke={getMuscleStroke('rectus_abdominis')}
                strokeWidth={getStrokeWidth('rectus_abdominis')}
                opacity={getOpacity('rectus_abdominis')}
              />
              <path
                d="M 111,119 C 107,118 104,118 102,118 L 102,131 C 106,131 109,131 111,130 C 113,126 113,122 111,119 Z"
                fill={getMuscleFill('rectus_abdominis')}
                stroke={getMuscleStroke('rectus_abdominis')}
                strokeWidth={getStrokeWidth('rectus_abdominis')}
                opacity={getOpacity('rectus_abdominis')}
              />

              {/* Lower Pair */}
              <path
                d="M 90,134 C 93,133 96,133 98,133 L 98,148 C 95,148 93,147 91,145 C 88,140 88,136 90,134 Z"
                fill={getMuscleFill('rectus_abdominis')}
                stroke={getMuscleStroke('rectus_abdominis')}
                strokeWidth={getStrokeWidth('rectus_abdominis')}
                opacity={getOpacity('rectus_abdominis')}
              />
              <path
                d="M 110,134 C 107,133 104,133 102,133 L 102,148 C 105,148 107,147 109,145 C 112,140 112,136 110,134 Z"
                fill={getMuscleFill('rectus_abdominis')}
                stroke={getMuscleStroke('rectus_abdominis')}
                strokeWidth={getStrokeWidth('rectus_abdominis')}
                opacity={getOpacity('rectus_abdominis')}
              />
            </>
          )}

          {/* CORE - Obliques */}
          {renderMuscleGroup(
            'obliques',
            'Obliques',
            <>
              {/* Left Oblique Flank */}
              <path
                d="M 85,105 C 79,106 72,114 71,126 C 70,138 72,146 76,149 C 81,148 85,145 87,142 C 86,132 86,118 85,105 Z"
                fill={getMuscleFill('obliques')}
                stroke={getMuscleStroke('obliques')}
                strokeWidth={getStrokeWidth('obliques')}
                opacity={getOpacity('obliques')}
              />
              {/* Right Oblique Flank */}
              <path
                d="M 115,105 C 121,106 128,114 129,126 C 130,138 128,146 124,149 C 119,148 115,145 113,142 C 114,132 114,118 115,105 Z"
                fill={getMuscleFill('obliques')}
                stroke={getMuscleStroke('obliques')}
                strokeWidth={getStrokeWidth('obliques')}
                opacity={getOpacity('obliques')}
              />
            </>
          )}

          {/* LEGS - Quadriceps (Vastus Lateralis, Rectus Femoris, Vastus Medialis) */}
          {renderMuscleGroup(
            'quadriceps',
            'Quadriceps',
            <>
              {/* Left Quad */}
              <path
                d="M 74,154 C 68,165 65,188 66,212 C 67,226 71,235 77,236 C 84,237 88,231 91,224 C 94,204 94,178 93,156 C 86,154 79,153 74,154 Z"
                fill={getMuscleFill('quadriceps')}
                stroke={getMuscleStroke('quadriceps')}
                strokeWidth={getStrokeWidth('quadriceps')}
                opacity={getOpacity('quadriceps')}
              />
              {/* Right Quad */}
              <path
                d="M 126,154 C 132,165 135,188 134,212 C 133,226 129,235 123,236 C 116,237 112,231 109,224 C 106,204 106,178 107,156 C 114,154 121,153 126,154 Z"
                fill={getMuscleFill('quadriceps')}
                stroke={getMuscleStroke('quadriceps')}
                strokeWidth={getStrokeWidth('quadriceps')}
                opacity={getOpacity('quadriceps')}
              />
            </>
          )}

          {/* LEGS - Adductors (Inner Thighs) */}
          {renderMuscleGroup(
            'adductors',
            'Inner Thighs (Adductors)',
            <>
              {/* Left Adductor */}
              <path
                d="M 94,162 C 95,175 95,195 93,215 C 91,215 90,205 91,185 C 92,172 93,165 94,162 Z"
                fill={getMuscleFill('adductors')}
                stroke={getMuscleStroke('adductors')}
                strokeWidth={getStrokeWidth('adductors')}
                opacity={getOpacity('adductors')}
              />
              {/* Right Adductor */}
              <path
                d="M 106,162 C 105,175 105,195 107,215 C 109,215 110,205 109,185 C 108,172 107,165 106,162 Z"
                fill={getMuscleFill('adductors')}
                stroke={getMuscleStroke('adductors')}
                strokeWidth={getStrokeWidth('adductors')}
                opacity={getOpacity('adductors')}
              />
            </>
          )}

          {/* LEGS - Calves (Gastrocnemius & Tibialis Anterior) */}
          {renderMuscleGroup(
            'calves',
            'Calves & Shins',
            <>
              {/* Left Calf (Front) */}
              <path
                d="M 75,250 C 69,258 68,272 70,290 C 72,306 74,318 77,322 C 81,322 84,316 86,305 C 89,288 88,266 85,250 Z"
                fill={getMuscleFill('calves')}
                stroke={getMuscleStroke('calves')}
                strokeWidth={getStrokeWidth('calves')}
                opacity={getOpacity('calves')}
              />
              {/* Right Calf (Front) */}
              <path
                d="M 125,250 C 131,258 132,272 130,290 C 128,306 126,318 123,322 C 119,322 116,316 114,305 C 111,288 112,266 115,250 Z"
                fill={getMuscleFill('calves')}
                stroke={getMuscleStroke('calves')}
                strokeWidth={getStrokeWidth('calves')}
                opacity={getOpacity('calves')}
              />
            </>
          )}
        </g>
      )}

      {/* ============================================================ */}
      {/* BACK (POSTERIOR) MUSCLES                                     */}
      {/* ============================================================ */}
      {view === 'back' && (
        <g id="back-muscles">
          {/* BACK - Trapezius (Diamond Back) */}
          {renderMuscleGroup(
            'trapezius',
            'Trapezius',
            <>
              {/* Left & Right Trapezius Diamond */}
              <path
                d="M 100,45 C 108,49 119,53 128,58 C 129,64 126,72 120,80 C 113,92 106,105 100,114 C 94,105 87,92 80,80 C 74,72 71,64 72,58 C 81,53 92,49 100,45 Z"
                fill={getMuscleFill('trapezius')}
                stroke={getMuscleStroke('trapezius')}
                strokeWidth={getStrokeWidth('trapezius')}
                opacity={getOpacity('trapezius')}
              />
            </>
          )}

          {/* SHOULDERS - Posterior Deltoid (Rear Delts) */}
          {renderMuscleGroup(
            'posterior_deltoid',
            'Rear Deltoids',
            <>
              {/* Left Rear Delt */}
              <path
                d="M 68,58 C 62,60 56,66 55,74 C 55,80 58,85 64,86 C 68,82 70,74 70,66 Z"
                fill={getMuscleFill('posterior_deltoid')}
                stroke={getMuscleStroke('posterior_deltoid')}
                strokeWidth={getStrokeWidth('posterior_deltoid')}
                opacity={getOpacity('posterior_deltoid')}
              />
              {/* Right Rear Delt */}
              <path
                d="M 132,58 C 138,60 144,66 145,74 C 145,80 142,85 136,86 C 132,82 130,74 130,66 Z"
                fill={getMuscleFill('posterior_deltoid')}
                stroke={getMuscleStroke('posterior_deltoid')}
                strokeWidth={getStrokeWidth('posterior_deltoid')}
                opacity={getOpacity('posterior_deltoid')}
              />
            </>
          )}

          {/* SHOULDERS - Lateral Deltoid (Side Delts - Back View) */}
          {renderMuscleGroup(
            'lateral_deltoid',
            'Side Deltoids',
            <>
              {/* Left Lateral Delt */}
              <path
                d="M 54,68 C 49,72 48,79 50,86 C 52,90 56,92 58,90 C 56,82 55,75 54,68 Z"
                fill={getMuscleFill('lateral_deltoid')}
                stroke={getMuscleStroke('lateral_deltoid')}
                strokeWidth={getStrokeWidth('lateral_deltoid')}
                opacity={getOpacity('lateral_deltoid')}
              />
              {/* Right Lateral Delt */}
              <path
                d="M 146,68 C 151,72 152,79 150,86 C 148,90 144,92 142,90 C 144,82 145,75 146,68 Z"
                fill={getMuscleFill('lateral_deltoid')}
                stroke={getMuscleStroke('lateral_deltoid')}
                strokeWidth={getStrokeWidth('lateral_deltoid')}
                opacity={getOpacity('lateral_deltoid')}
              />
            </>
          )}

          {/* ARMS - Triceps (Horseshoe Lateral & Long Heads) */}
          {renderMuscleGroup(
            'triceps',
            'Triceps',
            <>
              {/* Left Tricep */}
              <path
                d="M 57,92 C 51,96 50,108 51,120 C 52,126 56,128 60,127 C 65,122 66,112 65,100 C 64,94 61,92 57,92 Z"
                fill={getMuscleFill('triceps')}
                stroke={getMuscleStroke('triceps')}
                strokeWidth={getStrokeWidth('triceps')}
                opacity={getOpacity('triceps')}
              />
              {/* Right Tricep */}
              <path
                d="M 143,92 C 149,96 150,108 149,120 C 148,126 144,128 140,127 C 135,122 134,112 135,100 C 136,94 139,92 143,92 Z"
                fill={getMuscleFill('triceps')}
                stroke={getMuscleStroke('triceps')}
                strokeWidth={getStrokeWidth('triceps')}
                opacity={getOpacity('triceps')}
              />
            </>
          )}

          {/* ARMS - Forearms (Posterior Extensors) */}
          {renderMuscleGroup(
            'forearms',
            'Forearms',
            <>
              {/* Left Forearm (Back) */}
              <path
                d="M 52,130 C 47,135 45,145 46,160 C 47,172 49,182 52,183 C 55,183 58,175 60,165 C 62,152 62,138 59,132 Z"
                fill={getMuscleFill('forearms')}
                stroke={getMuscleStroke('forearms')}
                strokeWidth={getStrokeWidth('forearms')}
                opacity={getOpacity('forearms')}
              />
              {/* Right Forearm (Back) */}
              <path
                d="M 148,130 C 153,135 155,145 154,160 C 153,172 151,182 148,183 C 145,183 142,175 140,165 C 138,152 138,138 141,132 Z"
                fill={getMuscleFill('forearms')}
                stroke={getMuscleStroke('forearms')}
                strokeWidth={getStrokeWidth('forearms')}
                opacity={getOpacity('forearms')}
              />
            </>
          )}

          {/* BACK - Latissimus Dorsi (Lats V-Taper) */}
          {renderMuscleGroup(
            'latissimus_dorsi',
            'Lats (Latissimus Dorsi)',
            <>
              {/* Left Lat Wing */}
              <path
                d="M 70,72 C 67,82 66,108 72,128 C 76,134 82,137 87,138 C 88,124 88,112 87,98 C 82,90 76,82 70,72 Z"
                fill={getMuscleFill('latissimus_dorsi')}
                stroke={getMuscleStroke('latissimus_dorsi')}
                strokeWidth={getStrokeWidth('latissimus_dorsi')}
                opacity={getOpacity('latissimus_dorsi')}
              />
              {/* Right Lat Wing */}
              <path
                d="M 130,72 C 133,82 134,108 128,128 C 124,134 118,137 113,138 C 112,124 112,112 113,98 C 118,90 124,82 130,72 Z"
                fill={getMuscleFill('latissimus_dorsi')}
                stroke={getMuscleStroke('latissimus_dorsi')}
                strokeWidth={getStrokeWidth('latissimus_dorsi')}
                opacity={getOpacity('latissimus_dorsi')}
              />
            </>
          )}

          {/* BACK - Lower Back (Spinal Erectors) */}
          {renderMuscleGroup(
            'spinal_erectors',
            'Lower Back (Spinal Erectors)',
            <>
              {/* Left Erector Column */}
              <path
                d="M 91,116 C 94,116 97,116 98,116 L 98,152 C 95,152 92,151 90,149 C 89,140 89,126 91,116 Z"
                fill={getMuscleFill('spinal_erectors')}
                stroke={getMuscleStroke('spinal_erectors')}
                strokeWidth={getStrokeWidth('spinal_erectors')}
                opacity={getOpacity('spinal_erectors')}
              />
              {/* Right Erector Column */}
              <path
                d="M 109,116 C 106,116 103,116 102,116 L 102,152 C 105,152 108,151 110,149 C 111,140 111,126 109,116 Z"
                fill={getMuscleFill('spinal_erectors')}
                stroke={getMuscleStroke('spinal_erectors')}
                strokeWidth={getStrokeWidth('spinal_erectors')}
                opacity={getOpacity('spinal_erectors')}
              />
            </>
          )}

          {/* LEGS - Gluteus (Gluteus Maximus) */}
          {renderMuscleGroup(
            'gluteus',
            'Glutes (Gluteus Maximus)',
            <>
              {/* Left Glute */}
              <path
                d="M 75,153 C 71,162 71,178 77,187 C 84,192 93,191 98,185 L 98,154 C 91,152 83,151 75,153 Z"
                fill={getMuscleFill('gluteus')}
                stroke={getMuscleStroke('gluteus')}
                strokeWidth={getStrokeWidth('gluteus')}
                opacity={getOpacity('gluteus')}
              />
              {/* Right Glute */}
              <path
                d="M 125,153 C 129,162 129,178 123,187 C 116,192 107,191 102,185 L 102,154 C 109,152 117,151 125,153 Z"
                fill={getMuscleFill('gluteus')}
                stroke={getMuscleStroke('gluteus')}
                strokeWidth={getStrokeWidth('gluteus')}
                opacity={getOpacity('gluteus')}
              />
            </>
          )}

          {/* LEGS - Hamstrings (Biceps Femoris & Semitendinosus) */}
          {renderMuscleGroup(
            'hamstrings',
            'Hamstrings',
            <>
              {/* Left Hamstring */}
              <path
                d="M 75,193 C 71,202 70,220 72,234 C 77,237 84,236 88,232 C 92,218 94,204 95,192 C 87,191 80,191 75,193 Z"
                fill={getMuscleFill('hamstrings')}
                stroke={getMuscleStroke('hamstrings')}
                strokeWidth={getStrokeWidth('hamstrings')}
                opacity={getOpacity('hamstrings')}
              />
              {/* Right Hamstring */}
              <path
                d="M 125,193 C 129,202 130,220 128,234 C 123,237 116,236 112,232 C 108,218 106,204 105,192 C 113,191 120,191 125,193 Z"
                fill={getMuscleFill('hamstrings')}
                stroke={getMuscleStroke('hamstrings')}
                strokeWidth={getStrokeWidth('hamstrings')}
                opacity={getOpacity('hamstrings')}
              />
            </>
          )}

          {/* LEGS - Calves (Gastrocnemius Diamond Bellies) */}
          {renderMuscleGroup(
            'calves',
            'Calves (Gastrocnemius & Soleus)',
            <>
              {/* Left Calf (Back) */}
              <path
                d="M 75,250 C 69,258 68,272 70,288 C 72,304 74,318 77,322 C 82,322 84,316 86,305 C 89,288 88,266 85,250 Z"
                fill={getMuscleFill('calves')}
                stroke={getMuscleStroke('calves')}
                strokeWidth={getStrokeWidth('calves')}
                opacity={getOpacity('calves')}
              />
              {/* Right Calf (Back) */}
              <path
                d="M 125,250 C 131,258 132,272 130,288 C 128,304 126,318 123,322 C 118,322 116,316 114,305 C 111,288 112,266 115,250 Z"
                fill={getMuscleFill('calves')}
                stroke={getMuscleStroke('calves')}
                strokeWidth={getStrokeWidth('calves')}
                opacity={getOpacity('calves')}
              />
            </>
          )}
        </g>
      )}
    </svg>
  );
};
