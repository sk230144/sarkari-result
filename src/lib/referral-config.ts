// Referral milestones: { referrals needed -> days of premium reward }
export const REFERRAL_MILESTONES = [
  { refs: 10, days: 7 },
  { refs: 20, days: 18 },
  { refs: 35, days: 30 },
  { refs: 60, days: 60 },
  { refs: 100, days: 90 },
];

/** Total premium days earned for a given referral count */
export function calcReferralDays(count: number): number {
  let days = 0;
  for (const m of REFERRAL_MILESTONES) {
    if (count >= m.refs) days = m.days;
  }
  return days;
}
