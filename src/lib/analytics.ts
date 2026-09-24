/**
 * Google Analytics 4 (GA4) Integration
 * 
 * Provides safe, declarative analytics tracking using the official Google Tag (gtag.js).
 * Automatically reads VITE_GA_MEASUREMENT_ID from the environment.
 */

// Extend window interface for Google Tag
declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

let isInitialized = false;

// Remove any legacy stored measurement id from previous sessions
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('training_intel_ga_id');
  } catch {}
}

/**
 * Returns the configured GA4 Measurement ID
 */
export function getMeasurementId(): string {
  return '';
}

/**
 * Persists a GA4 Measurement ID in browser storage and initializes tracking
 */
export function setMeasurementId(_id: string): boolean {
  return false;
}

/**
 * Initializes Google Analytics 4 (gtag.js)
 * Injects the tag asynchronously and sets up dataLayer queue
 */
export function initGA(overrideId?: string): boolean {
  if (typeof window === 'undefined') return false;

  const measurementId = (overrideId || '').trim();

  // Initialize dataLayer and stub gtag immediately so events can be queued safely
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
  }

  if (!measurementId || !measurementId.startsWith('G-')) {
    return false;
  }

  if (isInitialized) {
    return true;
  }

  try {
    // Check if script already exists in document
    const existingScript = document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`);
    if (!existingScript) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      document.head.appendChild(script);
    }

    // Configure GA4
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      send_page_view: false, // We dispatch custom page_views on tab navigation
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure'
    });

    isInitialized = true;
    console.info(`[Google Analytics] Initialized GA4 with ID: ${measurementId}`);
    return true;
  } catch (err) {
    console.warn('[Google Analytics] Failed to initialize gtag:', err);
    return false;
  }
}

/**
 * Dispatches a page view event to GA4
 */
export function trackPageView(pagePath: string, pageTitle?: string) {
  if (typeof window === 'undefined' || !window.gtag) return;

  const title = pageTitle || document.title;
  const path = pagePath.startsWith('/') ? pagePath : `/${pagePath}`;

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title,
    page_location: window.location.href
  });
}

/**
 * Dispatches a custom event to GA4
 */
export function trackEvent(eventName: string, params: Record<string, any> = {}) {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', eventName, params);
}

/**
 * Workout tracking events
 */
export function trackWorkoutStarted(workoutName: string, templateId?: string) {
  trackEvent('workout_started', {
    workout_name: workoutName,
    template_id: templateId || 'custom'
  });
}

export function trackWorkoutCompleted(workoutName: string, totalVolumeKg: number, totalSets: number, durationMinutes: number) {
  trackEvent('workout_completed', {
    workout_name: workoutName,
    total_volume_kg: Math.round(totalVolumeKg),
    total_sets: totalSets,
    duration_minutes: Math.round(durationMinutes)
  });
}

export function trackMuscleInspected(muscleId: string, freshnessStatus: string) {
  trackEvent('muscle_inspected', {
    muscle_id: muscleId,
    freshness_status: freshnessStatus
  });
}

export function trackAIGenerated(planType: string) {
  trackEvent('ai_plan_generated', {
    plan_type: planType
  });
}
