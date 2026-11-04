import { useEffect, useState } from "react";

// Pretends to fetch data for `delay` ms so every screen can show a real
// loading state with mock data. In the final term this becomes the API call.
// Changing `reloadKey` (e.g. on pull-to-refresh) runs the load again.
export function useSimulatedLoading(delay = 600, reloadKey = 0) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timeoutId = setTimeout(() => setIsLoading(false), delay);

    // Cleanup: cancel the timer if the screen unmounts first
    return () => clearTimeout(timeoutId);
  }, [delay, reloadKey]);

  return isLoading;
}
