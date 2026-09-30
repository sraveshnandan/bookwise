import { useEffect, useState } from 'react';
import { NetInfo, NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: NetInfoState['type'];
  isWifi: boolean;
  isCellular: boolean;
  details: NetInfoState['details'];
}

export function useNetwork(): NetworkState {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    isInternetReachable: null,
    type: 'unknown',
    isWifi: false,
    isCellular: false,
    details: null,
  });

  useEffect(() => {
    const unsubscribe: NetInfoSubscription = NetInfo.addEventListener((state) => {
      setNetworkState({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        isWifi: state.type === 'wifi',
        isCellular: state.type === 'cellular',
        details: state.details,
      });
    });

    // Initial fetch
    NetInfo.fetch().then((state) => {
      setNetworkState({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        isWifi: state.type === 'wifi',
        isCellular: state.type === 'cellular',
        details: state.details,
      });
    });

    return () => unsubscribe();
  }, []);

  return networkState;
}

export function useIsOnline(): boolean {
  const { isConnected, isInternetReachable } = useNetwork();
  return isConnected && (isInternetReachable !== false);
}

export function useIsWifi(): boolean {
  const { isWifi } = useNetwork();
  return isWifi;
}

export function useNetworkType(): NetworkState['type'] {
  const { type } = useNetwork();
  return type;
}