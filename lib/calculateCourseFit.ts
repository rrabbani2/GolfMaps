export function calculateCourseFit(
  slope: number,
  yardage: number,
  options?: { slopeWeight?: number; yardageWeight?: number }
): number {
  const wSlope = options?.slopeWeight ?? 0.5;
  const wYard  = options?.yardageWeight ?? 0.5;

  // ensure weights sum to 1
  const totalW = wSlope + wYard || 1;
  const ws = wSlope / totalW;
  const wy = wYard  / totalW;

  // typical course ranges
  const slopeMin = 55;
  const slopeMax = 155;
  const yardMin  = 5000;
  const yardMax  = 7500;

  const clamp = (x: number) => Math.max(0, Math.min(1, x));

  // normalize both values to 0–1
  const normSlope   = clamp((slope   - slopeMin) / (slopeMax - slopeMin));
  const normYardage = clamp((yardage - yardMin)  / (yardMax  - yardMin));

  // combined fit score (0–1)
  const fit0to1 = ws * normSlope + wy * normYardage;

  // return 0–100 score
  return Math.round(fit0to1 * 100);
}

