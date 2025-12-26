import { Course, Profile, FitRating } from './types';

export function computeCourseFitRating(
  course: Course,
  profile?: Profile
): FitRating {
  // Base score calculation
  let score = 50; // Start with neutral score

  // If no profile or skill level, return neutral rating
  if (!profile || !profile.skill_level) {
    return { score: 50, label: 'Moderate' };
  }

  const skillLevel = profile.skill_level;
  const yardage = course.yardage || 6000; // Default to 6000 if not provided
  const slope = course.slope_rating || 113; // Default to 113 if not provided
  const condition = course.condition_score || 5; // Default to 5 if not provided

  // Calculate fit based on skill level
  switch (skillLevel) {
    case 'Beginner':
      // Beginners prefer shorter, easier courses
      // Shorter courses are better (inverse relationship)
      const beginnerYardageScore = Math.max(0, 100 - (yardage - 5000) / 20);
      // Lower slope is better
      const beginnerSlopeScore = Math.max(0, 100 - (slope - 113) * 2);
      // Better condition is better
      const beginnerConditionScore = condition * 10;
      
      score = (beginnerYardageScore * 0.4 + beginnerSlopeScore * 0.4 + beginnerConditionScore * 0.2);
      break;

    case 'Intermediate':
      // Intermediate players prefer moderate courses
      // Moderate yardage (5500-6500) is ideal
      const intermediateYardageScore = yardage >= 5500 && yardage <= 6500 
        ? 100 
        : 100 - Math.abs(yardage - 6000) / 10;
      // Moderate slope (113-130) is ideal
      const intermediateSlopeScore = slope >= 113 && slope <= 130
        ? 100
        : 100 - Math.abs(slope - 121.5) * 1.5;
      const intermediateConditionScore = condition * 10;
      
      score = (intermediateYardageScore * 0.35 + intermediateSlopeScore * 0.35 + intermediateConditionScore * 0.3);
      break;

    case 'Advanced':
      // Advanced players can handle longer, more challenging courses
      const advancedYardageScore = Math.min(100, 50 + (yardage - 5000) / 30);
      const advancedSlopeScore = Math.min(100, 50 + (slope - 113) * 0.5);
      const advancedConditionScore = condition * 10;
      
      score = (advancedYardageScore * 0.3 + advancedSlopeScore * 0.3 + advancedConditionScore * 0.4);
      break;

    case 'Expert':
      // Expert players prefer challenging, championship-level courses
      // Longer courses and higher slope are preferred
      const expertYardageScore = Math.min(100, 60 + (yardage - 6000) / 25);
      const expertSlopeScore = Math.min(100, 60 + (slope - 120) * 0.4);
      const expertConditionScore = condition * 10;
      
      score = (expertYardageScore * 0.3 + expertSlopeScore * 0.3 + expertConditionScore * 0.4);
      break;

    default:
      score = 50;
  }

  // Clamp score to 0-100
  score = Math.max(0, Math.min(100, score));

  // Assign label
  let label: string;
  if (score >= 80) {
    label = 'Excellent';
  } else if (score >= 60) {
    label = 'Good';
  } else if (score >= 40) {
    label = 'Moderate';
  } else {
    label = 'Challenging';
  }

  return { score: Math.round(score), label };
}

