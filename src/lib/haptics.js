/**
 * Simple haptic feedback wrapper for the Vibration API.
 * Provides a native feel on iOS and Android when used in a standalone PWA.
 */
export const haptics = {
  // A light tap for toggling checkboxes
  light: () => {
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  },
  // A slightly stronger tap for deleting or reordering
  medium: () => {
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate(20);
    }
  },
  // For error states or alerts
  error: () => {
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate([10, 50, 10]);
    }
  }
};
