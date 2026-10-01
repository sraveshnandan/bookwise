import React, { useState } from 'react';
import { ScrollView, StyleSheet, Platform } from 'react-native';
import { Box, Text, Button } from '@/components';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LucideIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { PREMIUM_FEATURES, SUBSCRIPTION_PRODUCTS } from '@/constants/app';

const plans = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 9.99,
    period: 'month',
    savings: 0,
    popular: false,
    productId: SUBSCRIPTION_PRODUCTS.monthly,
  },
  {
    id: 'annual',
    name: 'Annual',
    price: 79.99,
    period: 'year',
    savings: 33,
    popular: true,
    productId: SUBSCRIPTION_PRODUCTS.annual,
  },
];

const features = [
  { icon: 'infinity', label: 'Unlimited Summaries', free: false, premium: true },
  { icon: 'download', label: 'Offline Downloads', free: false, premium: true },
  { icon: 'headphones', label: 'Audio Summaries', free: false, premium: true },
  { icon: 'x', label: 'Ad-Free Experience', free: false, premium: true },
  { icon: 'highlighter', label: 'Unlimited Highlights', free: '10 total', premium: true },
  { icon: 'bar-chart-2', label: 'Advanced Statistics', free: false, premium: true },
  { icon: 'palette', label: 'All Themes & Fonts', free: '3 themes', premium: true },
  { icon: 'smartphone', label: 'Sync 5 Devices', free: '1 device', premium: true },
  { icon: 'book-open', label: '3 Free Summaries/Day', free: true, premium: true },
  { icon: 'library', label: 'Library Access', free: true, premium: true },
  { icon: 'search', label: 'Search & Discovery', free: true, premium: true },
];

export default function SubscriptionScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { user, updateSubscription } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [isLoading, setIsLoading] = useState(false);

  const isPremium = user?.subscription?.tier === 'premium' || user?.subscription?.tier === 'lifetime';

  const handleSubscribe = async (planId: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock successful purchase
    updateSubscription({
      tier: 'premium',
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + (planId === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false,
      entitlements: ['premium', 'offline_access', 'audio_summaries', 'no_ads'],
    });
    
    setIsLoading(false);
    Alert.alert('Success!', 'Welcome to BookWise Premium!');
    router.back();
  };

  const handleRestore = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    Alert.alert('Restored', 'Your purchases have been restored.');
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
      <Box px={16} py={24} gap={16}>
        <Box flexDirection="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Text variant="headingXL" style={{ fontWeight: '800' }}>
              {isPremium ? 'Manage Subscription' : 'Upgrade to Premium'}
            </Text>
            <Text variant="bodyMD" color="gray">
              {isPremium ? 'You\'re a Premium member!' : 'Unlock unlimited reading & listening'}
            </Text>
          </Box>
          {isPremium && (
            <Box px={3} py={1.5} bg="amber-100" borderRadius={9999}>
              <Text variant="caption" color="amber-800" style={{ fontWeight: '700' }}>
                PREMIUM
              </Text>
            </Box>
          )}
        </Box>

        {!isPremium && (
          <Box gap={8} bg="primary-50" borderRadius={16} p={16} borderWidth={1} borderColor="primary-200">
            <Box flexDirection="row" alignItems="center" gap={12}>
              <Box p={3} bg="primary-100" borderRadius={12}>
                <LucideIcon name="star" size={24} color="primary-600" />
              </Box>
              <Box flex={1} gap={4}>
                <Text variant="bodyMD" style={{ fontWeight: '600', color: 'primary-900' }}>
                  Start your 7-day free trial
                </Text>
                <Text variant="caption" color="primary-700">
                  Cancel anytime. No charges until trial ends.
                </Text>
              </Box>
            </Box>
          </Box>
        )}

        <Text variant="headingSM" style={{ fontWeight: '700', marginTop: 8 }}>
          Choose Your Plan
        </Text>

        <Box gap={12}>
          {plans.map((plan) => (
            <Box
              key={plan.id}
              px={16}
              py={20}
              gap={12}
              bg={selectedPlan === plan.id ? 'primary-50' : 'gray-50'}
              borderWidth={2}
              borderColor={selectedPlan === plan.id ? 'primary-500' : 'gray-200'}
              borderRadius={16}
              onPress={() => setSelectedPlan(plan.id as 'monthly' | 'annual')}
            >
              <Box flexDirection="row" justifyContent="space-between" alignItems="flex-start">
                <Box gap={4} flex={1}>
                  <Box flexDirection="row" alignItems="center" gap={8}>
                    <Text variant="headingMD" style={{ fontWeight: '800' }}>
                      {plan.name}
                    </Text>
                    {plan.popular && (
                      <Box px={2} py={0.5} bg="amber-100" borderRadius={4}>
                        <Text variant="caption" color="amber-800" style={{ fontWeight: '700' }}>
                          BEST VALUE
                        </Text>
                      </Box>
                    )}
                  </Box>
                  <Text variant="bodySM" color="gray">
                    Billed ${plan.price.toFixed(2)} per {plan.period}
                  </Text>
                </Box>
                <Box alignItems="flex-end" gap={4}>
                  <Text variant="displaySM" style={{ fontWeight: '800', color: 'primary-600' }}>
                    ${plan.price.toFixed(2)}
                  </Text>
                  {plan.savings > 0 && (
                    <Text variant="caption" color="green-600" style={{ fontWeight: '600' }}>
                      Save {plan.savings}%
                    </Text>
                  )}
                </Box>
              </Box>
              {plan.savings > 0 && (
                <Box px={12} py={4} bg="green-100" borderRadius={9999} alignSelf="flex-start">
                  <Text variant="caption" color="green-800" style={{ fontWeight: '600' }}>
                    ${((plan.price * 12) - (plan.price * 12 * (plan.savings / 100))).toFixed(0)}/year vs monthly
                  </Text>
                </Box>
              )}
            </Box>
          ))}
        </Box>

        <Button
          variant="primary"
          size="lg"
          loading={isLoading}
          onPress={() => handleSubscribe(selectedPlan)}
          style={{ marginTop: 16 }}
        >
          {isPremium ? 'Manage in App Store' : `Start Free Trial • ${plans.find(p => p.id === selectedPlan)?.price.toFixed(2)}/${selectedPlan === 'monthly' ? 'mo' : 'yr'}`}
        </Button>

        <Button variant="ghost" size="md" onPress={handleRestore} disabled={isLoading}>
          <LucideIcon name="rotate-ccw" size={18} />
          Restore Purchases
        </Button>

        <Box pt={16} borderTopWidth={1} borderColor="gray-200" gap={16}>
          <Text variant="headingSM" style={{ fontWeight: '700' }}>
            Premium Features
          </Text>
          <Box gap={12}>
            {features.map((feature) => (
              <Box key={feature.label} flexDirection="row" alignItems="center" gap={12} px={4} py={8}>
                <Box p={2} bg={colorScheme === 'dark' ? '#252542' : '#fff'} borderWidth={1} borderColor="gray-200" borderRadius={8}>
                  <LucideIcon name={feature.icon} size={20} color={feature.premium ? 'primary-600' : 'gray'} />
                </Box>
                <Box flex={1}>
                  <Text variant="bodySM" style={{ fontWeight: '500' }}>
                    {feature.label}
                  </Text>
                </Box>
                <Box flexDirection="row" gap={8}>
                  {feature.free === true ? (
                    <Box px={2} py={0.5} bg="green-100" borderRadius={4}>
                      <Text variant="caption" color="green-800" style={{ fontWeight: '600' }}>Free</Text>
                    </Box>
                  ) : feature.free ? (
                    <Box px={2} py={0.5} bg="gray-100" borderRadius={4}>
                      <Text variant="caption" color="gray-800" style={{ fontWeight: '600' }}>{feature.free}</Text>
                    </Box>
                  ) : null}
                  {feature.premium && (
                    <Box px={2} py={0.5} bg="primary-100" borderRadius={4}>
                      <Text variant="caption" color="primary-800" style={{ fontWeight: '600' }}>Premium</Text>
                    </Box>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <Box pt={16} gap={8}>
          <Text variant="caption" color="gray" style={{ textAlign: 'center' }}>
            Payment will be charged to your App Store account. Subscription automatically renews unless cancelled 24 hours before the end of the current period.
          </Text>
          <Box flexDirection="row" justifyContent="center" gap={16}>
            <Button variant="ghost" size="sm" onPress={() => {}}>
              <Text variant="caption" style={{ textDecorationLine: 'underline' }}>Terms of Service</Text>
            </Button>
            <Button variant="ghost" size="sm" onPress={() => {}}>
              <Text variant="caption" style={{ textDecorationLine: 'underline' }}>Privacy Policy</Text>
            </Button>
          </Box>
        </Box>
      </Box>
    </ScrollView>
  );
}

import { Alert } from 'react-native';
import { Switch } from 'react-native';