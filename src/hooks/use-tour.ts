import { useState, useEffect } from 'react';

interface UseTourOptions {
  tourId: string;
  autoStart?: boolean;
  showOnce?: boolean;
}

export const useTour = ({ tourId, autoStart = false, showOnce = true }: UseTourOptions) => {
  const [runTour, setRunTour] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState(false);

  // Check if user has seen this tour
  useEffect(() => {
    const seen = localStorage.getItem(`tour-${tourId}`);
    if (seen) {
      setHasSeenTour(true);
    }
  }, [tourId]);

  // Auto-start tour if enabled and not seen before
  useEffect(() => {
    if (autoStart && !hasSeenTour && showOnce) {
      setRunTour(true);
    }
  }, [autoStart, hasSeenTour, showOnce]);

  const startTour = () => {
    setRunTour(true);
  };

  const stopTour = () => {
    setRunTour(false);
  };

  const markTourSeen = () => {
    if (showOnce) {
      localStorage.setItem(`tour-${tourId}`, 'true');
      setHasSeenTour(true);
    }
  };

  const resetTour = () => {
    localStorage.removeItem(`tour-${tourId}`);
    setHasSeenTour(false);
  };

  return {
    runTour,
    hasSeenTour,
    startTour,
    stopTour,
    markTourSeen,
    resetTour,
  };
};

export default useTour; 