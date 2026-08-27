import { useEffect } from 'react';
import { configurePurchases } from '@/services/purchases';

/**
 * Initializes the RevenueCat SDK once a user is authenticated, using their
 * email as the RevenueCat app_user_id. This has to be email specifically —
 * the backend webhook handler (backend/src/controllers/subscription.controller.ts)
 * resolves the purchasing user via findUserByEmail(event.app_user_id), so a
 * mismatch here means a real purchase can never be attributed back to an
 * account and premium never activates.
 *
 * Without this hook running, Purchases.configure() is never called at all —
 * every other Purchases.* call (getOfferings, purchasePackage,
 * restorePurchases) throws, since the RevenueCat SDK requires configure()
 * before anything else.
 *
 * Known limitation: configurePurchases() only configures once per app
 * launch (see the `configured` flag in services/purchases.ts), so if a
 * second account logs into the same device in the same session without a
 * full app restart, RevenueCat keeps identifying purchases under the
 * first account's email. Not handled here — would need Purchases.logOut()
 * / Purchases.logIn() wired into the sign-out/sign-in flow instead of a
 * one-shot configure() call.
 */
export function usePurchasesConfiguration(email: string | undefined): void {
  useEffect(() => {
    if (!email) return;
    configurePurchases(email);
  }, [email]);
}
