export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function scoreFromRatio(value: number, ideal: number, tolerance: number): number {
  const ratio = value / Math.max(ideal, 1);
  const deviation = Math.abs(ratio - 1);
  const score = 100 - deviation * 100 / Math.max(tolerance, 0.01);
  return clamp(Math.round(score), 0, 100);
}

export function scoreFromLength(text: string, ideal: number, tolerance: number): number {
  return scoreFromRatio(text.length, ideal, tolerance);
}

export function scoreFromCount(count: number, ideal: number, tolerance: number): number {
  return scoreFromRatio(count, ideal, tolerance);
}

export function computeSeoScore({ title, description, tags }: { title?: string | null; description?: string | null; tags?: string[] | null }): number {
  const titleText = title || '';
  const descriptionText = description || '';
  const tagCount = Array.isArray(tags) ? tags.length : 0;

  const titleScore = scoreFromLength(titleText, 60, 0.6);
  const descriptionScore = scoreFromLength(descriptionText, 200, 0.7);
  const tagScore = scoreFromCount(tagCount, 8, 0.7);

  const weighted = titleScore * 0.4 + descriptionScore * 0.35 + tagScore * 0.25;
  return clamp(Math.round(weighted), 0, 100);
}

export function computeClickMagnetScore({ title, description }: { title?: string | null; description?: string | null }): number {
  const titleText = title || '';
  const descriptionText = description || '';

  const titleLengthScore = scoreFromLength(titleText, 55, 0.65);
  const descriptionLengthScore = scoreFromLength(descriptionText, 180, 0.75);
  const combined = titleLengthScore * 0.7 + descriptionLengthScore * 0.3;

  return clamp(Math.round(combined), 0, 100);
}

export function computeThumbnailScore(input?: { thumbnailUrl?: string | null; score?: number | null }): number {
  if (input && typeof input.score === 'number') {
    return clamp(Math.round(input.score), 0, 100);
  }
  if (input && input.thumbnailUrl) {
    const hasQuery = input.thumbnailUrl.includes('?');
    return hasQuery ? 72 : 65;
  }
  return 50;
}

export function computeAuditMetrics({
  channel,
  videosList,
}: {
  channel: { subscriberCount?: number | null; videoCount?: number | null; viewCount?: number | null };
  videosList: Array<{ snippet?: { title?: string | null; description?: string | null; tags?: string[] | null } | null; statistics?: { viewCount?: string | null; likeCount?: string | null; commentCount?: string | null } | null }>;
}) {
  const videoCount = videosList.length || channel.videoCount || 0;
  const viewCount = Number(channel.viewCount || 0);
  const subscriberCount = Number(channel.subscriberCount || 0);

  const uploadConsistency = clamp(60 + videoCount * 1.5, 0, 100);
  const engagementRate = clamp(45 + (viewCount > 0 ? (subscriberCount / viewCount) * 1000 : 0), 0, 100);
  const seoOptimization = clamp(50 + videoCount * 0.8, 0, 100);
  const thumbnailQuality = clamp(55 + Math.min(videoCount, 20) * 1.2, 0, 100);
  const titleOptimization = clamp(50 + Math.min(videosList.length, 10) * 2, 0, 100);
  const descriptionQuality = clamp(45 + Math.min(videosList.length, 10) * 2.2, 0, 100);
  const tagUsage = clamp(40 + Math.min(videosList.length, 10) * 2.5, 0, 100);
  const audienceRetention = clamp(48 + Math.min(videosList.length, 15) * 1.8, 0, 100);
  const growthRate = clamp(40 + (subscriberCount > 0 ? Math.log10(subscriberCount + 1) * 8 : 0), 0, 100);
  const communityEngagement = clamp(45 + Math.min(videosList.length, 10) * 2, 0, 100);
  const monetizationHealth = clamp(35 + Math.min(videoCount, 50) * 1.1, 0, 100);
  const brandConsistency = clamp(50 + Math.min(videosList.length, 15) * 1.4, 0, 100);

  const metrics = {
    uploadConsistency: Math.round(uploadConsistency),
    engagementRate: Math.round(engagementRate),
    seoOptimization: Math.round(seoOptimization),
    thumbnailQuality: Math.round(thumbnailQuality),
    titleOptimization: Math.round(titleOptimization),
    descriptionQuality: Math.round(descriptionQuality),
    tagUsage: Math.round(tagUsage),
    audienceRetention: Math.round(audienceRetention),
    growthRate: Math.round(growthRate),
    communityEngagement: Math.round(communityEngagement),
    monetizationHealth: Math.round(monetizationHealth),
    brandConsistency: Math.round(brandConsistency),
  };

  const overallScore = Math.round(Object.values(metrics).reduce((a, b) => a + b, 0) / Object.keys(metrics).length);

  const recommendations: string[] = [];
  if (metrics.uploadConsistency < 70) recommendations.push('Increase upload frequency to at least once per week for better algorithm performance');
  if (metrics.engagementRate < 70) recommendations.push('Add calls-to-action in your videos to boost engagement');
  if (metrics.seoOptimization < 70) recommendations.push('Optimize video titles and descriptions with target keywords');
  if (metrics.thumbnailQuality < 70) recommendations.push('Improve thumbnail quality with better contrast and text overlay');
  if (metrics.audienceRetention < 70) recommendations.push('Hook viewers in the first 3 seconds to improve retention');
  if (recommendations.length === 0) recommendations.push('Great job! Your channel is well optimized. Keep up the good work.');

  return { overallScore, metrics, recommendations };
}
