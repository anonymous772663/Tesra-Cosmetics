/**
 * Danfe Express Shipping Calculator
 * -----------------------------------
 * Tesra Cosmetics delivery fees are calculated from a base fee (derived from
 * distance/zone/weight — supplied by the caller) and then rounded UP to the
 * nearest NPR 50 step, per Danfe partner rules.
 *
 * Rounding rules:
 *   - A base fee that is already an exact multiple of 50 is left unchanged.
 *       50   -> 50
 *       100  -> 100
 *       150  -> 150
 *   - A base fee that is NOT a multiple of 50 rounds UP to the next 50 tier.
 *       120  -> 150
 *       170  -> 200
 *       1    -> 50
 *       0    -> 0
 */

export const DANFE_STEP = 50;

export interface DeliveryZoneRate {
  /** Human-readable zone name, e.g. "Kathmandu Valley" */
  zone: string;
  /** Base fee in NPR before Danfe step-rounding is applied */
  baseFee: number;
}

/**
 * Rounds a raw base fee UP to the nearest Danfe step (50).
 * Exact multiples of the step are returned unchanged.
 */
export function roundToDanfeStep(baseFee: number, step: number = DANFE_STEP): number {
  if (baseFee <= 0) return 0;
  const remainder = baseFee % step;
  if (remainder === 0) return baseFee;
  return baseFee + (step - remainder);
}

/**
 * Full delivery fee calculation for an order.
 *
 * @param baseFee        Raw computed base fee (from distance/weight/zone table)
 * @param options.freeThreshold  Optional order subtotal above which delivery is free
 * @param options.orderSubtotal  Current order subtotal, used against freeThreshold
 */
export function calculateDeliveryFee(
  baseFee: number,
  options?: { freeThreshold?: number; orderSubtotal?: number }
): { fee: number; isFree: boolean; roundedFrom: number } {
  const { freeThreshold, orderSubtotal } = options ?? {};

  if (
    typeof freeThreshold === "number" &&
    typeof orderSubtotal === "number" &&
    orderSubtotal >= freeThreshold
  ) {
    return { fee: 0, isFree: true, roundedFrom: baseFee };
  }

  const fee = roundToDanfeStep(baseFee);
  return { fee, isFree: false, roundedFrom: baseFee };
}

/**
 * Example zone table — tune to match Danfe's actual rate card.
 * Distances/zones are illustrative; wire this up to real address data
 * (e.g. via a geocoding lookup) before going to production.
 */
export const DEFAULT_ZONE_RATES: DeliveryZoneRate[] = [
  { zone: "Kathmandu Valley", baseFee: 90 },
  { zone: "Pokhara", baseFee: 170 },
  { zone: "Chitwan", baseFee: 140 },
  { zone: "Other Districts", baseFee: 220 },
];

export function getDeliveryFeeForZone(
  zoneName: string,
  orderSubtotal: number,
  freeThreshold = 5000
): { fee: number; isFree: boolean; zone: string } {
  const match =
    DEFAULT_ZONE_RATES.find((z) => z.zone.toLowerCase() === zoneName.toLowerCase()) ??
    DEFAULT_ZONE_RATES[DEFAULT_ZONE_RATES.length - 1];

  const { fee, isFree } = calculateDeliveryFee(match.baseFee, {
    freeThreshold,
    orderSubtotal,
  });

  return { fee, isFree, zone: match.zone };
}
