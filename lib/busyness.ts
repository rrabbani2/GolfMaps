import { Course, CourseStats, BusynessScore } from './types';

export function computeBusynessScore(
  course: Course,
  stats: CourseStats | null,
  date: Date = new Date(),
  googleData?: { rating: number; userRatingsTotal: number }
): BusynessScore {
  let score = 50; // Base score

  // Start with base popularity if available
  if (stats?.base_popularity !== undefined) {
    score = stats.base_popularity;
  }

  // Adjust based on Google Places data
  if (googleData) {
    // Higher rating increases busyness
    const ratingFactor = (googleData.rating - 3.5) * 10; // Scale from -15 to +15
    // More reviews = more popular = busier
    const reviewFactor = Math.min(20, Math.log10(googleData.userRatingsTotal + 1) * 5);
    score += ratingFactor + reviewFactor;
  }

  // Check if it's a peak hour
  const hour = date.getHours();
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  if (stats?.peak_hours) {
    const peakHours = isWeekend ? stats.peak_hours.weekend : stats.peak_hours.weekday;
    
    if (peakHours && peakHours.length > 0) {
      const inPeakHour = peakHours.some(peakRange => {
        const [start, end] = peakRange.split('-').map(h => parseInt(h));
        return hour >= start && hour < end;
      });

      if (inPeakHour) {
        score += 25; // Significant increase during peak hours
      }
    }
  } else {
    // Default peak hours if not specified
    if (isWeekend) {
      // Weekend peak: 7 AM - 12 PM
      if (hour >= 7 && hour < 12) {
        score += 25;
      }
    } else {
      // Weekday peak: 7-10 AM and 3-6 PM
      if ((hour >= 7 && hour < 10) || (hour >= 15 && hour < 18)) {
        score += 20;
      }
    }
  }

  // Check for holidays (simplified - you could use a holiday library)
  const month = date.getMonth();
  const day = date.getDate();
  const isHoliday = 
    (month === 0 && day === 1) || // New Year's Day
    (month === 6 && day === 4) || // Independence Day
    (month === 11 && day === 25) || // Christmas
    (month === 10 && (day >= 22 && day <= 28) && date.getDay() === 4); // Thanksgiving

  if (isHoliday && stats?.holiday_factor !== undefined) {
    score += stats.holiday_factor * 30;
  } else if (isHoliday) {
    score += 30; // Default holiday boost
  }

  // Clamp score to 0-100
  score = Math.max(0, Math.min(100, score));

  // Assign label
  let label: string;
  if (score >= 75) {
    label = 'Very Busy';
  } else if (score >= 50) {
    label = 'Busy';
  } else if (score >= 25) {
    label = 'Moderate';
  } else {
    label = 'Quiet';
  }

  return { score: Math.round(score), label };
}

