export type ThemePaletteId =
  | 'default'      // Classic Slate & Azure
  | 'monochrome'   // Black & White / Minimalist Noir
  | 'emerald'      // Shades of Green / Forest Matrix
  | 'pink'         // Pink & White / Rose Blush
  | 'violet'       // Electric Purple / Cyberpunk
  | 'amber'        // Solar Gold / Titanium Amber
  | 'crimson'      // Crimson Iron / Blood Red
  | 'cyan';        // Ocean Cyan / Neon Abyss

export interface ThemePalette {
  id: ThemePaletteId;
  name: string;
  tagline: string;
  primaryHex: string;
  secondaryHex: string;
  previewBg: string;
  previewSwatches: string[];
}

export const THEME_PALETTES: ThemePalette[] = [
  {
    id: 'default',
    name: 'Classic Azure',
    tagline: 'Deep navy & electric blue athletic slate',
    primaryHex: '#2563eb',
    secondaryHex: '#3b82f6',
    previewBg: '#0f172a',
    previewSwatches: ['#0f172a', '#1e293b', '#2563eb', '#38bdf8']
  },
  {
    id: 'monochrome',
    name: 'Monochrome Noir',
    tagline: 'High-contrast black & white minimalism',
    primaryHex: '#ffffff',
    secondaryHex: '#e2e8f0',
    previewBg: '#000000',
    previewSwatches: ['#000000', '#18181b', '#71717a', '#ffffff']
  },
  {
    id: 'emerald',
    name: 'Shades of Green',
    tagline: 'Deep forest night & tactical neon emerald',
    primaryHex: '#059669',
    secondaryHex: '#10b981',
    previewBg: '#051b11',
    previewSwatches: ['#051b11', '#064e3b', '#059669', '#34d399']
  },
  {
    id: 'pink',
    name: 'Rose & White',
    tagline: 'Vibrant neon blush, hot pink & clean white',
    primaryHex: '#db2777',
    secondaryHex: '#ec4899',
    previewBg: '#180713',
    previewSwatches: ['#180713', '#831843', '#db2777', '#f472b6']
  },
  {
    id: 'violet',
    name: 'Cyberpunk Violet',
    tagline: 'Deep dark indigo & electric lavender purple',
    primaryHex: '#7e22ce',
    secondaryHex: '#9333ea',
    previewBg: '#130722',
    previewSwatches: ['#130722', '#581c87', '#9333ea', '#c084fc']
  },
  {
    id: 'amber',
    name: 'Solar Gold',
    tagline: 'Titanium dark charcoal & warm amber gold',
    primaryHex: '#d97706',
    secondaryHex: '#f59e0b',
    previewBg: '#171107',
    previewSwatches: ['#171107', '#78350f', '#d97706', '#fbbf24']
  },
  {
    id: 'crimson',
    name: 'Crimson Iron',
    tagline: 'Hardcore gym matte black & blood crimson',
    primaryHex: '#dc2626',
    secondaryHex: '#ef4444',
    previewBg: '#1a0808',
    previewSwatches: ['#1a0808', '#7f1d1d', '#dc2626', '#f87171']
  },
  {
    id: 'cyan',
    name: 'Ocean Cyan',
    tagline: 'Deep marine trench & vivid electric turquoise',
    primaryHex: '#0891b2',
    secondaryHex: '#06b6d4',
    previewBg: '#05171e',
    previewSwatches: ['#05171e', '#164e63', '#0891b2', '#22d3ee']
  }
];

const STORAGE_KEY = 'training_intel_palette';

export function getSavedThemePalette(): ThemePaletteId {
  if (typeof window === 'undefined') return 'default';
  const saved = localStorage.getItem(STORAGE_KEY) as ThemePaletteId | null;
  if (saved && THEME_PALETTES.some(p => p.id === saved)) {
    return saved;
  }
  return 'default';
}

export function applyThemePalette(paletteId: ThemePaletteId): void {
  if (typeof document === 'undefined') return;
  const validId = THEME_PALETTES.some(p => p.id === paletteId) ? paletteId : 'default';
  document.documentElement.setAttribute('data-palette', validId);
  try {
    localStorage.setItem(STORAGE_KEY, validId);
  } catch {
    // Ignore localStorage errors
  }
}

export function getThemePrimaryHex(paletteId: ThemePaletteId): string {
  const found = THEME_PALETTES.find(p => p.id === paletteId);
  return found ? found.primaryHex : '#2563eb';
}

export function getThemeSecondaryHex(paletteId: ThemePaletteId): string {
  const found = THEME_PALETTES.find(p => p.id === paletteId);
  return found ? found.secondaryHex : '#3b82f6';
}
