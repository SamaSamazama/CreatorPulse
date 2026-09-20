import { PLANS, PlanId } from './index';
const FEATURE_TIERS: Record<string, PlanId[]> = {
  ab_testing: ['starter', 'pro', 'agency'],
  outlier_scanner: ['starter', 'pro', 'agency'],
  ai_coach: ['pro', 'agency'],
  script_writer: ['pro', 'agency'],
  thumbnail_ai: ['pro', 'agency'],
  bulk_editor: ['pro', 'agency'],
  public_api: ['agency'],
  team_seats: ['agency'],
  thumbnail_ab_testing: ['pro', 'agency'],
  bulk_end_screens: ['pro', 'agency'],
  bulk_cards: ['pro', 'agency'],
  channel_audit: ['starter', 'pro', 'agency'],
  daily_ideas: ['pro', 'agency'],
  trend_alerts: ['pro', 'agency'],
  retention_analyzer: ['pro', 'agency'],
  channelytics: ['pro', 'agency'],
  keyword_trends: ['starter', 'pro', 'agency'],
  thumbnail_analyzer: ['pro', 'agency'],
  comment_manager: ['pro', 'agency'],
  upload_profiles: ['pro', 'agency'],
  playlist_actions: ['pro', 'agency'],
  sunset_videos: ['pro', 'agency'],
  scheduled_updates: ['pro', 'agency'],
  channel_backup: ['pro', 'agency'],
  demonetization_audit: ['pro', 'agency'],
  milestones: ['starter', 'pro', 'agency'],
  niche_leaderboard: ['pro', 'agency'],
  exports: ['pro', 'agency'],
  click_magnet: ['pro', 'agency'],
  seo_scorecard: ['starter', 'pro', 'agency'],
};
export function hasAccess(userTier: PlanId, feature: string): boolean {
  const requiredTiers = FEATURE_TIERS[feature];
  if (!requiredTiers) return true;
  return requiredTiers.includes(userTier);
}
