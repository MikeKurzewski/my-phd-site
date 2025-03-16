import { useState, useEffect } from 'react';
import { useSubscription } from './useSubscription';

export interface SubscriptionLimits {
  maxProjects: number;
  availableLayouts: string[];
  availableThemes: string[];
  canCustomize: boolean;
  canHaveProjectPages: boolean;
}

const FREE_LIMITS: SubscriptionLimits = {
  maxProjects: 1,
  availableLayouts: ['default'],
  availableThemes: ['dark-teal', 'minimal'],
  canCustomize: false,
  canHaveProjectPages: false,
};

const PRO_LIMITS: SubscriptionLimits = {
  maxProjects: Infinity,
  availableLayouts: ['default', 'academic'],
  availableThemes: ['dark-teal', 'light-teal', 'dark-blue', 'light-blue', 'minimal'],
  canCustomize: true,
  canHaveProjectPages: true,
};

export function useSubscriptionLimits() {
  const { subscription, loading } = useSubscription();
  const [limits, setLimits] = useState<SubscriptionLimits>(FREE_LIMITS);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    if (!loading) {
      // Check if the plan is the pro plan ID and status is active
      const isProPlan = subscription?.plan === 'price_1R2lN7GIpe9EVtMncwbxlefE' && 
                        subscription?.status === 'active';
      setIsPro(isProPlan);
      setLimits(isProPlan ? PRO_LIMITS : FREE_LIMITS);
    }
  }, [subscription, loading]);

  const checkCanAddProject = (currentCount: number): boolean => {
    return currentCount < limits.maxProjects;
  };

  return {
    limits,
    isPro,
    loading,
    checkCanAddProject
  };
}
