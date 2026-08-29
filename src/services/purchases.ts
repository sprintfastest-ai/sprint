import { Platform } from 'react-native';
import Purchases, { type PurchasesOffering } from 'react-native-purchases';
import * as Sentry from '@sentry/react-native';

const IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
const ANDROID_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;

let configured = false;

/**
 * Whether RevenueCat has an API key available for this platform/build.
 * This does NOT mean Purchases.configure() actually succeeded — only that
 * there's a key to try it with. Use isPurchasesReady() to gate any real
 * Purchases.* call; this one is only for "should we even attempt this /
 * show purchase UI at all" checks before configuration has necessarily run.
 */
export function isPurchasesConfigured(): boolean {
  return Platform.OS === 'ios' ? !!IOS_API_KEY : !!ANDROID_API_KEY;
}

/**
 * Whether Purchases.configure() has actually run successfully. Every real
 * Purchases.* call (getOfferings, purchasePackage, restorePurchases) must
 * gate on this, not isPurchasesConfigured() — an invalid/misconfigured key
 * still has isPurchasesConfigured() === true (the key string exists) but
 * leaves the native SDK's singleton never created, so any call throws
 * "There is no singleton instance. Make sure you configure Purchases
 * before trying to get the default instance."
 */
export function isPurchasesReady(): boolean {
  return configured;
}

export function configurePurchases(appUserId?: string): void {
  if (configured || !isPurchasesConfigured()) return;
  const apiKey = Platform.OS === 'ios' ? IOS_API_KEY : ANDROID_API_KEY;
  try {
    Purchases.configure({ apiKey: apiKey as string, appUserID: appUserId });
    configured = true;
  } catch (err) {
    // A misconfigured/invalid RevenueCat key should degrade to "purchases
    // unavailable", not take the whole app down. `configured` stays false
    // — every downstream Purchases.* call gates on isPurchasesReady(), not
    // isPurchasesConfigured(), so nothing else gets attempted after this.
    Sentry.captureException(err, { tags: { context: 'configurePurchases' } });
  }
}

export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  if (!isPurchasesReady()) return null;
  const offerings = await Purchases.getOfferings();
  return offerings.current;
}

export async function purchasePremium(pkgIdentifier?: string): Promise<{ success: boolean; error?: string }> {
  if (!isPurchasesReady()) {
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
  if (!isPurchasesReady()) {
    return { success: false, error: 'Purchases are not available yet. Please check back soon.' };
  }
  try {
    await Purchases.restorePurchases();
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message ?? 'Restore failed. Please try again.' };
  }
}
