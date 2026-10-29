import * as Network from "expo-network";

export interface ConnectivitySnapshot {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
  checkedAtIso: string;
}

export async function getConnectivitySnapshot(): Promise<ConnectivitySnapshot> {
  try {
    const state = await Network.getNetworkStateAsync();
    const isConnected = Boolean(state.isConnected);
    const isInternetReachable = state.isInternetReachable ?? isConnected;
    return {
      isConnected,
      isInternetReachable,
      type: String(state.type ?? "UNKNOWN"),
      checkedAtIso: new Date().toISOString(),
    };
  } catch {
    return {
      isConnected: true,
      isInternetReachable: true,
      type: "UNKNOWN",
      checkedAtIso: new Date().toISOString(),
    };
  }
}

