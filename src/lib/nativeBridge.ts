import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App as CapApp } from '@capacitor/app';
import { Keyboard } from '@capacitor/keyboard';

export const isNativeApp = (): boolean => {
  return Capacitor.isNativePlatform();
};

export const getPlatform = (): string => {
  return Capacitor.getPlatform();
};

/**
 * Initialize native device integrations when running inside Capacitor (iOS / Android)
 */
export const initNativeApp = async (onBackPressed?: () => boolean): Promise<void> => {
  if (!isNativeApp()) {
    // Web fallback
    return;
  }

  try {
    // 1. Configure Status Bar
    await StatusBar.setStyle({ style: Style.Dark });
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#0f172a' });
      await StatusBar.setOverlaysWebView({ overlay: false });
    }
  } catch (err) {
    console.warn('[NativeBridge] StatusBar config warning:', err);
  }

  try {
    // 2. Hide Splash Screen smoothly once UI is ready
    await SplashScreen.hide();
  } catch (err) {
    console.warn('[NativeBridge] SplashScreen hide warning:', err);
  }

  try {
    // 3. Handle Android Hardware Back Button
    CapApp.addListener('backButton', ({ canGoBack }) => {
      if (onBackPressed && onBackPressed()) {
        // Consumer handled the back action (e.g. closed a modal or active workout)
        return;
      }
      if (canGoBack) {
        window.history.back();
      } else {
        CapApp.exitApp();
      }
    });
  } catch (err) {
    console.warn('[NativeBridge] BackButton listener warning:', err);
  }

  try {
    // 4. Keyboard handling
    Keyboard.addListener('keyboardWillShow', () => {
      document.body.classList.add('keyboard-open');
    });
    Keyboard.addListener('keyboardWillHide', () => {
      document.body.classList.remove('keyboard-open');
    });
  } catch (err) {
    console.warn('[NativeBridge] Keyboard listener warning:', err);
  }
};

/**
 * Tactile Haptic Feedback for workout interactions
 * (e.g. checkmark set, timer finish, PR celebration, button tap)
 */
export const nativeHaptics = {
  light: async (): Promise<void> => {
    try {
      if (isNativeApp()) {
        await Haptics.impact({ style: ImpactStyle.Light });
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(10);
      }
    } catch {
      // Ignore vibration errors on unsupported environments
    }
  },

  medium: async (): Promise<void> => {
    try {
      if (isNativeApp()) {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(25);
      }
    } catch {
      // Ignore
    }
  },

  heavy: async (): Promise<void> => {
    try {
      if (isNativeApp()) {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(50);
      }
    } catch {
      // Ignore
    }
  },

  success: async (): Promise<void> => {
    try {
      if (isNativeApp()) {
        await Haptics.notification({ type: NotificationType.Success });
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([30, 50, 30]);
      }
    } catch {
      // Ignore
    }
  },

  warning: async (): Promise<void> => {
    try {
      if (isNativeApp()) {
        await Haptics.notification({ type: NotificationType.Warning });
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([50, 100, 50]);
      }
    } catch {
      // Ignore
    }
  },

  error: async (): Promise<void> => {
    try {
      if (isNativeApp()) {
        await Haptics.notification({ type: NotificationType.Error });
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    } catch {
      // Ignore
    }
  },

  selection: async (): Promise<void> => {
    try {
      if (isNativeApp()) {
        await Haptics.selectionStart();
        await Haptics.selectionChanged();
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(8);
      }
    } catch {
      // Ignore
    }
  }
};
