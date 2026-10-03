import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';

type NetworkListener = (isOnline: boolean) => void;

class NetworkService {
  private static instance: NetworkService;
  private listeners: NetworkListener[] = [];
  private subscription: NetInfoSubscription | null = null;
  private currentState: NetInfoState | null = null;

  static getInstance(): NetworkService {
    if (!NetworkService.instance) {
      NetworkService.instance = new NetworkService();
    }
    return NetworkService.instance;
  }

  initialize() {
    this.subscription = NetInfo.addEventListener((state) => {
      this.currentState = state;
      this.notifyListeners(state.isConnected ?? false);
    });

    NetInfo.fetch().then((state) => {
      this.currentState = state;
      this.notifyListeners(state.isConnected ?? false);
    });
  }

  private notifyListeners(isOnline: boolean) {
    this.listeners.forEach(listener => listener(isOnline));
  }

  addListener(listener: NetworkListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  isOnline(): boolean {
    return this.currentState?.isConnected ?? false;
  }

  isInternetReachable(): boolean | null {
    return this.currentState?.isInternetReachable ?? null;
  }

  getNetworkType(): NetInfoState['type'] {
    return this.currentState?.type ?? 'unknown';
  }

  isWifi(): boolean {
    return this.currentState?.type === 'wifi';
  }

  isCellular(): boolean {
    return this.currentState?.type === 'cellular';
  }

  getDetails(): NetInfoState['details'] {
    return this.currentState?.details ?? null;
  }

  async checkConnectivity(): Promise<boolean> {
    const state = await NetInfo.fetch();
    this.currentState = state;
    return state.isConnected ?? false;
  }

  destroy() {
    if (this.subscription) {
      this.subscription();
      this.subscription = null;
    }
    this.listeners = [];
  }
}

export const networkService = NetworkService.getInstance();
export default networkService;