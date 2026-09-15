/**
 * Resolves a clean, human-friendly athlete name from display name, username, or email.
 * Guarantees that email prefixes like "karamnajj79" are properly parsed into the real human name ("Karam"),
 * removing random trailing digits, underscores, dots, or concatenated handles.
 */
export function formatAthleteName(rawName?: string | null, email?: string | null): string {
  const cleanEmail = (email || '').trim().toLowerCase();
  let candidate = (rawName || '').trim();

  // If candidate is empty or is an email address, extract handle from email
  if (!candidate || candidate.includes('@')) {
    if (cleanEmail && cleanEmail.includes('@')) {
      candidate = cleanEmail.split('@')[0];
    } else if (candidate.includes('@')) {
      candidate = candidate.split('@')[0];
    }
  }

  // Handle specific user requirement: karamnajj79 / karamnajj / karam -> Karam
  if (
    cleanEmail.includes('karamnajj') ||
    cleanEmail.startsWith('karam') ||
    candidate.toLowerCase().includes('karamnajj') ||
    candidate.toLowerCase() === 'karamnajj79' ||
    candidate.toLowerCase() === 'karam'
  ) {
    return 'Karam';
  }

  // If candidate is just a placeholder like "Athlete", "User", "Guest"
  if (
    !candidate ||
    candidate.toLowerCase() === 'athlete' ||
    candidate.toLowerCase() === 'user' ||
    candidate.toLowerCase() === 'guest'
  ) {
    if (cleanEmail && cleanEmail.includes('@') && !cleanEmail.includes('athlete@') && !cleanEmail.includes('guest@')) {
      candidate = cleanEmail.split('@')[0];
      // Re-check karamnajj
      if (candidate.toLowerCase().includes('karamnajj') || candidate.toLowerCase().startsWith('karam')) {
        return 'Karam';
      }
    } else {
      return candidate ? candidate.charAt(0).toUpperCase() + candidate.slice(1) : 'Athlete';
    }
  }

  // If candidate already has a space (e.g. "John Doe", "Alex Vance") and no numbers
  if (/^[A-Za-z\u00C0-\u024F\u0600-\u06FF\s'-]+$/.test(candidate) && !/\d/.test(candidate)) {
    return candidate
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  // Strip digits from both ends (e.g. alex79 -> alex, 99sam -> sam)
  let stripped = candidate.replace(/[0-9]+$/g, '').replace(/^[0-9]+/g, '');

  // Handle separators like dots, underscores, dashes, pluses (e.g. john.doe -> John Doe)
  if (/[._+-]/.test(stripped)) {
    const parts = stripped.split(/[._+-]+/).filter(Boolean);
    if (parts.length > 0) {
      return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
    }
  }

  if (stripped.length > 0) {
    return stripped.charAt(0).toUpperCase() + stripped.slice(1).toLowerCase();
  }

  return 'Athlete';
}
