/**
 * Resolves a clean, human-friendly athlete name from display name, username, or email.
 * Properly parses email prefixes removing trailing digits, underscores, dots, or concatenated handles.
 */
export function formatAthleteName(rawName?: string | null, email?: string | null): string {
  const cleanEmail = (email || '').trim().toLowerCase();
  let candidate = (rawName || '').trim();

  // 1. If user explicitly provided a real display name (not an email and not generic placeholders)
  if (
    candidate &&
    !candidate.includes('@') &&
    candidate.toLowerCase() !== 'athlete' &&
    candidate.toLowerCase() !== 'user' &&
    candidate.toLowerCase() !== 'guest'
  ) {
    // Capitalize each word nicely (e.g. "john doe" -> "John Doe", "alex vance" -> "Alex Vance")
    const words = candidate.split(/\s+/).filter(Boolean);
    if (words.length > 0) {
      return words
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }
    return candidate.charAt(0).toUpperCase() + candidate.slice(1);
  }

  // 2. If no valid name was provided, extract from email
  let handle = '';
  if (cleanEmail && cleanEmail.includes('@')) {
    handle = cleanEmail.split('@')[0];
  } else if (candidate && candidate.includes('@')) {
    handle = candidate.split('@')[0];
  }

  if (handle) {
    // Convert handle into clean athlete name:
    // e.g. "alex_vance" -> "Alex Vance", "john.doe" -> "John Doe", "marcus-fit" -> "Marcus Fit"
    let stripped = handle.replace(/^[0-9]+/, '').replace(/[0-9]+$/, '');
    if (/[._+-]/.test(stripped)) {
      const parts = stripped.split(/[._+-]+/).filter(Boolean);
      if (parts.length > 0) {
        return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
      }
    }

    if (stripped.length >= 2) {
      return stripped.charAt(0).toUpperCase() + stripped.slice(1).toLowerCase();
    }
    return handle.charAt(0).toUpperCase() + handle.slice(1);
  }

  if (candidate && candidate.length > 0) {
    return candidate.charAt(0).toUpperCase() + candidate.slice(1);
  }

  return 'Athlete';
}
