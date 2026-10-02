import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import { AuthService } from './supabase';

const REVENUECAT_API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS || '';
const REVENUECAT_API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID || '';

const apiKey = Platform.OS === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;

export const SubscriptionService = {
  async initialize(appUserId?: string) {
    if (!apiKey) {
      console.warn('RevenueCat API key not configured');
      return;
    }

    await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    
    await Purchases.configure({
      apiKey,
      appUserId,
    });

    if (appUserId) {
      await Purchases.logIn(appUserId);
    }
  },

  async getOfferings(): Promise<PurchasesOffering | null> {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current || null;
    } catch (error) {
      console.error('Error fetching offerings:', error);
      return null;
    }
  },

  async getCustomerInfo(): Promise<CustomerInfo | null> {
    try {
      return await Purchases.getCustomerInfo();
    } catch (error) {
      console.error('Error fetching customer info:', error);
      return null;
    }
  },

  async purchasePackage(packageToPurchase: PurchasesPackage) {
    try {
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      return { customerInfo, error: null };
    } catch (error: any) {
      if (error.userCancelled) {
        return { customerInfo: null, error: { code: 'USER_CANCELLED', message: 'Purchase cancelled' } };
      }
      return { customerInfo: null, error };
    }
  },

  async restorePurchases() {
    try {
      const customerInfo = await Purchases.restorePurchases();
      return { customerInfo, error: null };
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return { customerInfo: null, error };
    }
  },

  async syncCustomerInfo(userId: string) {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const entitlements = Object.keys(customerInfo.entitlements.active);
      
      const isPremium = entitlements.includes('premium') || entitlements.includes('premium_lifetime');
      
      await AuthService.updateProfile({
        subscription_tier: isPremium ? 'premium' : 'free',
        subscription_status: isPremium ? 'active' : 'canceled',
        entitlements,
      });

      return { customerInfo, error: null };
    } catch (error) {
      console.error('Error syncing customer info:', error);
      return { customerInfo: null, error };
    }
  },

  async logIn(appUserId: string) {
    try {
      const { customerInfo } = await Purchases.logIn(appUserId);
      return { customerInfo, error: null };
    } catch (error) {
      console.error('Error logging in to RevenueCat:', error);
      return { customerInfo: null, error };
    }
  },

  async logOut() {
    try {
      await Purchases.logOut();
      return { error: null };
    } catch (error) {
      console.error('Error logging out from RevenueCat:', error);
      return { error };
    }
  },

  getEntitlements(customerInfo: CustomerInfo): string[] {
    return Object.keys(customerInfo.entitlements.active);
  },

  hasActiveEntitlement(customerInfo: CustomerInfo, entitlementId: string): boolean {
    return customerInfo.entitlements.active[entitlementId] !== undefined;
  },

  isPremium(customerInfo: CustomerInfo): boolean {
    return this.hasActiveEntitlement(customerInfo, 'premium') || 
           this.hasActiveEntitlement(customerInfo, 'premium_lifetime');
  },

  getSubscriptionStatus(customerInfo: CustomerInfo): 'active' | 'canceled' | 'past_due' | 'trialing' | 'free' {
    if (this.isPremium(customerInfo)) {
      const entitlement = customerInfo.entitlements.active['premium'] || 
                          customerInfo.entitlements.active['premium_lifetime'];
      if (!entitlement) return 'free';
      
      if (entitlement.willRenew) return 'active';
      if (entitlement.periodType === 'trial') return 'trialing';
      return 'canceled';
    }
    return 'free';
  },

  getCurrentPeriodEnd(customerInfo: CustomerInfo): Date | null {
    const entitlement = customerInfo.entitlements.active['premium'] || 
                        customerInfo.entitlements.active['premium_lifetime'];
    if (!entitlement || !entitlement.expirationDate) return null;
    return new Date(entitlement.expirationDate);
  },

  async setEmail(email: string) {
    try {
      await Purchases.setEmail(email);
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  async setAttributes(attributes: Record<string, string>) {
    try {
      await Purchases.setAttributes(attributes);
      return { error: null };
    } catch (error) {
      return { error };
    }
  },
};

export const PLANS = {
  monthly: {
    id: 'premium_monthly',
    name: 'Monthly',
    price: 9.99,
    period: 'month',
    savings: 0,
    productId: 'premium_monthly',
  },
  annual: {
    id: 'premium_annual',
    name: 'Annual',
    price: 79.99,
    period: 'year',
    savings: 33,
    productId: 'premium_annual',
  },
  lifetime: {
    id: 'lifetime_access',
    name: 'Lifetime',
    price: 199.99,
    period: 'lifetime',
    savings: 100,
    productId: 'lifetime_access',
  },
};

export type PlanId = keyof typeof PLANS;