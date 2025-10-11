/**
 * Calculate BMI (Body Mass Index)
 * @param weight - Weight in kilograms
 * @param height - Height in centimeters
 * @returns BMI value
 */
export function calculateBMI(weight: number, height: number): number {
  if (!weight || !height || weight <= 0 || height <= 0) {
    throw new Error('Invalid weight or height values');
  }

  // Convert height from cm to meters
  const heightInMeters = height / 100;

  // BMI = weight (kg) / height² (m²)
  const bmi = weight / (heightInMeters * heightInMeters);

  // Round to 2 decimal places
  return Math.round(bmi * 100) / 100;
}

/**
 * Get ideal weight range based on height
 * @param height - Height in centimeters
 * @returns Object with min and max ideal weight in kg
 */
export function getIdealWeightRange(height: number): { min: number; max: number } {
  if (!height || height <= 0) {
    throw new Error('Invalid height value');
  }

  const heightInMeters = height / 100;

  // Using BMI range 18.5 - 24.9 as healthy range
  const minWeight = 18.5 * (heightInMeters * heightInMeters);
  const maxWeight = 24.9 * (heightInMeters * heightInMeters);

  return {
    min: Math.round(minWeight * 10) / 10,
    max: Math.round(maxWeight * 10) / 10,
  };
}

/**
 * Get BMI category
 * @param bmi - BMI value
 * @returns BMI category string
 */
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

/**
 * Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
 * @param weight - Weight in kilograms
 * @param height - Height in centimeters
 * @param age - Age in years
 * @param gender - 'male' or 'female'
 * @returns BMR in calories
 */
export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: string,
): number {
  if (!weight || !height || !age || weight <= 0 || height <= 0 || age <= 0) {
    throw new Error('Invalid input values for BMR calculation');
  }

  // Mifflin-St Jeor Equation:
  // Men: BMR = 10W + 6.25H - 5A + 5
  // Women: BMR = 10W + 6.25H - 5A - 161

  const baseBMR = 10 * weight + 6.25 * height - 5 * age;

  if (gender.toLowerCase() === 'male') {
    return Math.round(baseBMR + 5);
  } else {
    return Math.round(baseBMR - 161);
  }
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 * @param bmr - Basal Metabolic Rate
 * @param activityLevel - Activity level multiplier
 * @returns TDEE in calories
 */
export function calculateTDEE(bmr: number, activityLevel: string): number {
  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };

  const multiplier = activityMultipliers[activityLevel] || 1.55;
  return Math.round(bmr * multiplier);
}
