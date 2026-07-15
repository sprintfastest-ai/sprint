import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp, BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp, CompositeScreenProps } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  AthleteTabs: undefined;
  CoachTabs: undefined;
  ParentTabs: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  /** token comes from the deep-link query param ?token=<jwt> */
  ResetPassword: { token: string };
};

export type AthleteTabParamList = {
  Dashboard: undefined;
  Training: undefined;
  Progress: undefined;
  Chat: undefined;
  Profile: undefined;
};

/** Screens pushed above the athlete bottom-tab navigator (modals/detail views). */
export type AthleteStackParamList = {
  Tabs: undefined;
  DiagnosisQuiz: undefined;
  DiagnosisResults: { diagnosis: import('@/types').Diagnosis };
  Achievements: undefined;
  Paywall: { context?: string } | undefined;
};

export type CoachTabParamList = {
  Athletes: undefined;
  Plans: undefined;
  Notes: undefined;
  Profile: undefined;
};

export type ParentTabParamList = {
  Overview: undefined;
  Progress: undefined;
  Profile: undefined;
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export type AthleteTabScreenProps<T extends keyof AthleteTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<AthleteTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

export type CoachTabScreenProps<T extends keyof CoachTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<CoachTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

export type ParentTabScreenProps<T extends keyof ParentTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<ParentTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;
