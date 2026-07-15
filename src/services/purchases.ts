import { Platform } from 'react-native';
import Purchases, { type PurchasesOffering } from 'react-native-purchases';

const IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
const ANDROID_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;

let configured = false;

/** Whether RevenueCat has API keys available for this platform/build. */
export function isPurchasesConfigured(): boolean {
  return Platform.OS === 'ios' ? !!IOS_API_KEY : !!ANDROID_API_KEY;
}

export function configurePurchases(appUserId?: string): void {
  if (configured || !isPurchasesConfigured()) return;
  const apiKey = Platform.OS === 'ios' ? IOS_API_KEY : ANDROID_API_KEY;
  Purchases.configure({ apiKey: apiKey as string, appUserID: appUserId });
  configured = true;
}

export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  if (!isPurchasesConfigured()) return null;
  const offerings = await Purchases.getOfferings();
  return offerings.current;
}

export async function purchasePremium(pkgIdentifier?: string): Promise<{ success: boolean; error?: string }> {
  if (!isPurchasesConfigured()) {
    return { success: false, error: 'Purchases are not available yet. Please check back soon.' };
  }
  try {
    const offering = await getCurrentOffering();
    const pkg = pkgIdentifier
      ? offering?.availablePackages.find((p) => p.identifier === pkgIdentifier)
      : offering?.availablePackages[0];
    if (!pkg) {
      return { success: false, error: 'No subscription plans are available right now.' };
    }
    await Purchases.purchasePackage(pkg);
    return { success: true };
  } catch (err) {
    const rcErr = err as { userCancelled?: boolean; message?: string };
    if (rcErr.userCancelled) return { success: false };
    return { success: false, error: rcErr.message ?? 'Purchase failed. Please try again.' };
  }
}

export async function restorePurchases(): Promise<{ success: boolean; error?: string }> {
  if (!isPurchasesConfigured()) {
    return { success: false, error: 'Purchases are not available yet. Please check back soon.' };
  }
  try {
    await Purchases.restorePurchases();
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message ?? 'Restore failed. Please try again.' };
  }
}
