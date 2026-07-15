import client from './client';

type ApiResponse<T> = { data: T };

interface SubscriptionStatusRaw {
  subscription: {
    plan: 'free' | 'premium';
    status: 'active' | 'cancelled' | 'expired' | 'trialing';
    current_period_end: string | null;
  };
  features: string[];
}

export interface SubscriptionStatus {
  plan: 'free' | 'premium';
  status: 'active' | 'cancelled' | 'expired' | 'trialing';
  currentPeriodEnd: string | null;
  features: string[];
  isPremium: boolean;
}

export const subscriptionApi = {
  getStatus: async (): Promise<SubscriptionStatus> => {
    const { data } = await client.get<ApiResponse<SubscriptionStatusRaw>>('/subscription/status');
    const { subscription, features } = data.data;
    return {
      plan: subscription.plan,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end,
      features,
      isPremium: subscription.plan === 'premium' && (subscription.status === 'active' || subscription.status === 'trialing'),
    };
  },
};
