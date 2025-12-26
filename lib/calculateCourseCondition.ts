/**
 * Calculate Course Condition Score (0-100) based on weather conditions
 * 
 * Formula: condition = 100 - (rainPenalty + windPenalty + tempPenalty)
 * 
 * @param weather - Weather data with precipitation, windSpeed, and temperature
 * @returns Course condition score clamped between 0 and 100
 */
export function calculateCourseCondition(weather: {
  precipitation: number;   // mm/hr or approximate
  windSpeed: number;       // mph
  temperature: number;     // F
}): number {
  // 1. Rain Penalty (0-40 points)
  const rainPenalty = calculateRainPenalty(weather.precipitation);
  
  // 2. Wind Penalty (0-30 points)
  const windPenalty = calculateWindPenalty(weather.windSpeed);
  
  // 3. Temperature Penalty (0-30 points)
  const tempPenalty = calculateTemperaturePenalty(weather.temperature);
  
  // 4. Final Score
  const condition = 100 - (rainPenalty + windPenalty + tempPenalty);
  
  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, Math.round(condition)));
}

/**
 * Calculate rain penalty based on precipitation (mm/hr)
 * 
 * 0-0.2 mm/hr ⇒ 0 penalty
 * 0.2-1 mm/hr ⇒ 10 penalty
 * 1-3 mm/hr ⇒ 20 penalty
 * 3-6 mm/hr ⇒ 30 penalty
 * > 6 mm/hr ⇒ 40 penalty (maximum)
 */
function calculateRainPenalty(precipitation: number): number {
  if (precipitation <= 0.2) {
    return 0;
  } else if (precipitation <= 1) {
    return 10;
  } else if (precipitation <= 3) {
    return 20;
  } else if (precipitation <= 6) {
    return 30;
  } else {
    return 40;
  }
}

/**
 * Calculate wind penalty based on wind speed (mph)
 * 
 * 0-7 mph ⇒ 0 penalty
 * 7-12 mph ⇒ 5 penalty
 * 12-18 mph ⇒ 10 penalty
 * 18-25 mph ⇒ 20 penalty
 * >25 mph ⇒ 30 penalty
 */
function calculateWindPenalty(windSpeed: number): number {
  if (windSpeed <= 7) {
    return 0;
  } else if (windSpeed <= 12) {
    return 5;
  } else if (windSpeed <= 18) {
    return 10;
  } else if (windSpeed <= 25) {
    return 20;
  } else {
    return 30;
  }
}

/**
 * Calculate temperature penalty based on temperature (°F)
 * 
 * Ideal: 60-80°F ⇒ 0 penalty
 * 50-60 or 80-90°F ⇒ 10 penalty
 * 40-50 or 90-100°F ⇒ 20 penalty
 * <40 or >100°F ⇒ 30 penalty
 */
function calculateTemperaturePenalty(temperature: number): number {
  if (temperature >= 60 && temperature <= 80) {
    return 0;
  } else if ((temperature >= 50 && temperature < 60) || (temperature > 80 && temperature <= 90)) {
    return 10;
  } else if ((temperature >= 40 && temperature < 50) || (temperature > 90 && temperature <= 100)) {
    return 20;
  } else {
    return 30;
  }
}

