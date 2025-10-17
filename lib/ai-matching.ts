// AI-Powered Matching System for SkillSwap Hub
import { Skill, User } from '@prisma/client';

export interface SkillMatch {
  userId: string;
  userName: string;
  userEmail: string;
  skillId: string;
  skillTitle: string;
  skillCategory: string;
  skillLevel: string;
  compatibilityScore: number;
  matchReasons: string[];
  distance?: number;
  availability?: string[];
}

export interface MatchPreferences {
  maxDistance?: number;
  preferredLevels?: string[];
  preferredCategories?: string[];
  availability?: string[];
}

// Enhanced skill compatibility scoring
export function calculateSkillCompatibility(
  userSkill: Skill,
  targetSkill: Skill,
  preferences: MatchPreferences = {}
): number {
  let score = 0;
  const reasons: string[] = [];

  // Category matching (40% weight)
  if (userSkill.category === targetSkill.category) {
    score += 40;
    reasons.push('Same skill category');
  } else if (areRelatedCategories(userSkill.category, targetSkill.category)) {
    score += 25;
    reasons.push('Related skill categories');
  }

  // Level compatibility (30% weight)
  const levelScore = calculateLevelCompatibility(userSkill.level, targetSkill.level);
  score += levelScore * 0.3;
  if (levelScore > 20) reasons.push('Compatible skill levels');

  // Skill type matching (20% weight)
  if (userSkill.type !== targetSkill.type) {
    score += 20;
    reasons.push('Complementary skill types (offer ↔ seek)');
  }

  // Recency bonus (10% weight)
  const daysSinceCreated = Math.floor(
    (Date.now() - new Date(targetSkill.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceCreated < 7) {
    score += 10;
    reasons.push('Recently posted');
  }

  // Preference bonuses
  if (preferences.preferredCategories?.includes(targetSkill.category)) {
    score += 15;
    reasons.push('Matches your preferred categories');
  }

  if (preferences.preferredLevels?.includes(targetSkill.level)) {
    score += 10;
    reasons.push('Matches your preferred skill levels');
  }

  return Math.min(score, 100); // Cap at 100%
}

function areRelatedCategories(cat1: string, cat2: string): boolean {
  const relatedCategories: Record<string, string[]> = {
    'Programming': ['Web Development', 'Mobile Development', 'Data Science', 'DevOps'],
    'Web Development': ['Programming', 'Design', 'DevOps'],
    'Mobile Development': ['Programming', 'Design', 'UI/UX'],
    'Design': ['UI/UX', 'Web Development', 'Mobile Development', 'Marketing'],
    'UI/UX': ['Design', 'Web Development', 'Mobile Development'],
    'Data Science': ['Programming', 'Analytics', 'Machine Learning'],
    'Marketing': ['Design', 'Content Creation', 'Social Media'],
    'Content Creation': ['Marketing', 'Writing', 'Video Production'],
    'Writing': ['Content Creation', 'Marketing', 'Translation'],
    'Music': ['Audio Production', 'Performance', 'Composition'],
    'Photography': ['Video Production', 'Design', 'Marketing'],
    'Video Production': ['Photography', 'Content Creation', 'Marketing'],
  };

  return relatedCategories[cat1]?.includes(cat2) || relatedCategories[cat2]?.includes(cat1) || false;
}

function calculateLevelCompatibility(level1: string, level2: string): number {
  const levels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const level1Index = levels.indexOf(level1);
  const level2Index = levels.indexOf(level2);

  if (level1Index === -1 || level2Index === -1) return 0;

  const difference = Math.abs(level1Index - level2Index);
  
  // Perfect match
  if (difference === 0) return 30;
  
  // One level apart (ideal for learning)
  if (difference === 1) return 25;
  
  // Two levels apart (still beneficial)
  if (difference === 2) return 15;
  
  // Too far apart
  return 5;
}

// AI-powered match finding algorithm
export async function findAIMatches(
  userId: string,
  userSkills: Skill[],
  allSkills: (Skill & { user: { id: string; name: string; email: string } })[],
  preferences: MatchPreferences = {}
): Promise<SkillMatch[]> {
  const matches: SkillMatch[] = [];

  for (const userSkill of userSkills) {
    for (const targetSkill of allSkills) {
      // Skip own skills
      if (targetSkill.userId === userId) continue;
      
      // Skip same skill type (can't offer what you're seeking)
      if (userSkill.type === targetSkill.type) continue;

      const compatibilityScore = calculateSkillCompatibility(userSkill, targetSkill, preferences);
      
      // Only include high-quality matches (70%+ compatibility)
      if (compatibilityScore >= 70) {
        matches.push({
          userId: targetSkill.userId,
          userName: targetSkill.user.name,
          userEmail: targetSkill.user.email,
          skillId: targetSkill.id,
          skillTitle: targetSkill.title,
          skillCategory: targetSkill.category,
          skillLevel: targetSkill.level,
          compatibilityScore,
          matchReasons: [], // Will be populated by calculateSkillCompatibility
        });
      }
    }
  }

  // Sort by compatibility score (highest first)
  return matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}

// Enhanced match analysis with ML insights
export function analyzeMatchPatterns(matches: SkillMatch[]): {
  topCategories: { category: string; count: number }[];
  averageCompatibility: number;
  skillGaps: string[];
  recommendations: string[];
} {
  const categoryCounts: Record<string, number> = {};
  let totalCompatibility = 0;

  matches.forEach(match => {
    categoryCounts[match.skillCategory] = (categoryCounts[match.skillCategory] || 0) + 1;
    totalCompatibility += match.compatibilityScore;
  });

  const topCategories = Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const averageCompatibility = matches.length > 0 ? totalCompatibility / matches.length : 0;

  // Generate skill gap analysis
  const skillGaps = analyzeSkillGaps(matches);
  
  // Generate recommendations
  const recommendations = generateRecommendations(matches, averageCompatibility);

  return {
    topCategories,
    averageCompatibility,
    skillGaps,
    recommendations,
  };
}

function analyzeSkillGaps(matches: SkillMatch[]): string[] {
  const gaps: string[] = [];
  const lowScoreMatches = matches.filter(m => m.compatibilityScore < 80);
  
  if (lowScoreMatches.length > 0) {
    gaps.push('Consider developing complementary skills');
  }

  const categories = [...new Set(matches.map(m => m.skillCategory))];
  if (categories.length < 3) {
    gaps.push('Explore skills in different categories for better matching');
  }

  return gaps;
}

function generateRecommendations(matches: SkillMatch[], averageCompatibility: number): string[] {
  const recommendations: string[] = [];

  if (averageCompatibility > 85) {
    recommendations.push('Excellent match quality! Consider expanding your skill portfolio');
  } else if (averageCompatibility > 70) {
    recommendations.push('Good matches available. Try refining your skill descriptions');
  } else {
    recommendations.push('Consider adding more diverse skills to improve matching');
  }

  if (matches.length > 10) {
    recommendations.push('Many potential matches found! Use filters to narrow down results');
  } else if (matches.length < 3) {
    recommendations.push('Few matches available. Consider broadening your skill categories');
  }

  return recommendations;
}

// Smart notification system
export function generateMatchNotifications(matches: SkillMatch[]): {
  type: 'high_match' | 'new_match' | 'trending_skill' | 'skill_gap';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
}[] {
  const notifications = [];

  // High compatibility matches
  const highMatches = matches.filter(m => m.compatibilityScore > 90);
  if (highMatches.length > 0) {
    notifications.push({
      type: 'high_match' as const,
      title: 'Perfect Match Found!',
      message: `${highMatches[0].userName} has a ${highMatches[0].skillTitle} skill with ${highMatches[0].compatibilityScore}% compatibility`,
      priority: 'high' as const,
    });
  }

  // New trending skills
  const trendingCategories = [...new Set(matches.map(m => m.skillCategory))].slice(0, 3);
  if (trendingCategories.length > 0) {
    notifications.push({
      type: 'trending_skill' as const,
      title: 'Trending Skills',
      message: `Skills in ${trendingCategories.join(', ')} are in high demand`,
      priority: 'medium' as const,
    });
  }

  return notifications;
}
