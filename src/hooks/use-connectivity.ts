import { useCallback, useEffect, useState } from "react";

import {
  ConnectivitySnapshot,
  getConnectivitySnapshot,
} from "@/lib/offline/network-monitor";

export function useConnectivity() {
  const [snapshot, setSnapshot] = useState<ConnectivitySnapshot>({
    isConnected: true,
    isInternetReachable: true,
    type: "UNKNOWN",
    checkedAtIso: new Date().toISOString(),
  });

  const refreshConnectivity = useCallback(async () => {
    const next = await getConnectivitySnapshot();
    setSnapshot(next);
    return next;
  }, []);

  useEffect(() => {
    refreshConnectivity();
    const interval = setInterval(refreshConnectivity, 15_000);
    return () => clearInterval(interval);
  }, [refreshConnectivity]);

  return {
    ...snapshot,
    isOffline: !snapshot.isConnected || !snapshot.isInternetReachable,
    refreshConnectivity,
  };
}

