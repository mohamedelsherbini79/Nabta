// Pure, client-safe BMI helpers — deliberately kept out of src/lib/selfAssessment.ts
// so client components can import them without dragging in the Prisma/pg module
// graph (which pulls in Node built-ins like `dns` and breaks the browser bundle).

export type BmiCategory = "UNDERWEIGHT" | "NORMAL" | "OVERWEIGHT" | "OBESE";

export function computeBmi(heightCm: number, weightKg: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function getBmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return "UNDERWEIGHT";
  if (bmi < 25) return "NORMAL";
  if (bmi < 30) return "OVERWEIGHT";
  return "OBESE";
}
