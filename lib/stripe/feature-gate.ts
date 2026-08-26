import { PLANS, PlanId } from './index';
const FEATURE_TIERS: Record<string, PlanId[]> = {
  'ab_testing': ['starter', 'pro', 'agency'], 'outlier_scanner': ['starter', 'pro', 'agency'],
  'ai_coach': ['pro', 'agency'], 'script_writer': ['pro', 'agency'], 'thumbnail_ai': ['pro', 'agency'],
  'bulk_editor': ['pro', 'agency'], 'public_api': ['agency'], 'team_seats': ['agency'],
};
export function hasAccess(userTier: PlanId, feature: string): boolean {
  const requiredTiers = FEATURE_TIERS[feature];
  if (!requiredTiers) return true;
  return requiredTiers.includes(userTier);
}
