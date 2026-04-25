import React, { createContext, useContext } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import type { SubscriptionPlan } from '@/types';

interface SubscriptionContextType {
  plan: SubscriptionPlan;
  isPro: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  plan: 'free',
  isPro: false,
});

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { preferences } = useProfile();
  const plan: SubscriptionPlan = preferences.subscription || 'free';

  return (
    <SubscriptionContext.Provider value={{ plan, isPro: plan === 'pro' }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}
