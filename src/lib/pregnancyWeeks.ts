// Pure, client-safe pregnancy math and weekly reference data — deliberately
// kept out of src/lib/pregnancy.ts (which imports prisma) so client components
// can import this without dragging in the Prisma/pg module graph. Same
// reasoning as src/lib/cyclePrediction.ts, bmi.ts, and vitalsRange.ts.

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const GESTATION_DAYS = 280; // standard 40-week estimate, dated from the last menstrual period (LMP)
const MAX_WEEK = 42;

export interface PregnancyProgress {
  currentWeek: number;
  currentDay: number;
  trimester: 1 | 2 | 3;
  daysPregnant: number;
  daysUntilDue: number;
  babySize: string;
  tip: string;
}

export function computeDueDate(lastPeriodDate: Date): Date {
  return new Date(lastPeriodDate.getTime() + GESTATION_DAYS * MS_PER_DAY);
}

// Categorical trimester colors (rose / violet / sky), validated for
// colorblind-safety via the dataviz skill's palette validator.
export const TRIMESTER_BAR_COLOR: Record<1 | 2 | 3, string> = {
  1: "bg-rose-600",
  2: "bg-violet-600",
  3: "bg-sky-600",
};

export const TRIMESTER_BADGE_CLASSES: Record<1 | 2 | 3, string> = {
  1: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
  2: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200",
  3: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
};

// Fruit/produce size comparisons are a common, non-proprietary convention used
// across pregnancy-tracking apps and baby books; tips are generic, safe,
// general-population prenatal guidance — informational only.
const WEEKLY_INFO: Record<number, { babySize: string; tip: string }> = {
  1: { babySize: "Not yet conceived", tip: "Start a prenatal vitamin with folic acid if you haven't already." },
  2: { babySize: "Not yet conceived", tip: "Ovulation is approaching — this is the most fertile window of the cycle." },
  3: { babySize: "A grain of sand", tip: "Conception typically occurs around now. Avoid alcohol and smoking." },
  4: { babySize: "A poppy seed", tip: "A missed period may be the first sign — a home test is usually reliable now." },
  5: { babySize: "A sesame seed", tip: "Book your first prenatal appointment to confirm dates and get baseline labs." },
  6: { babySize: "A lentil", tip: "Nausea and fatigue are common. Small, frequent meals can help." },
  7: { babySize: "A blueberry", tip: "Stay hydrated, and keep taking your prenatal vitamin daily." },
  8: { babySize: "A raspberry", tip: "An early ultrasound around now can confirm a heartbeat." },
  9: { babySize: "A grape", tip: "Ligament stretching can cause mild cramping — rest if you feel discomfort." },
  10: { babySize: "A kumquat", tip: "Energy often dips in the first trimester — prioritize sleep when you can." },
  11: { babySize: "A fig", tip: "Ask your doctor about first-trimester screening options." },
  12: { babySize: "A lime", tip: "Nausea often starts easing around the end of this week for many people." },
  13: { babySize: "A pea pod", tip: "You're entering the second trimester — energy often starts to return." },
  14: { babySize: "A lemon", tip: "Appetite may pick up — focus on protein, iron, and calcium-rich foods." },
  15: { babySize: "An apple", tip: "Light, regular exercise (like walking) is generally encouraged — check with your doctor." },
  16: { babySize: "An avocado", tip: "Some people start feeling the first flutters of movement around now." },
  17: { babySize: "A turnip", tip: "Your growing belly may start to shift your center of gravity — watch your balance." },
  18: { babySize: "A bell pepper", tip: "An anatomy ultrasound is often scheduled around this time." },
  19: { babySize: "A tomato", tip: "Stretch marks and skin changes are common — moisturizing can ease itching." },
  20: { babySize: "A banana", tip: "Halfway there! This is a common time for the mid-pregnancy anatomy scan." },
  21: { babySize: "A carrot", tip: "Fetal movement usually becomes more noticeable and regular now." },
  22: { babySize: "A papaya", tip: "Backaches are common as your posture shifts — supportive shoes can help." },
  23: { babySize: "A grapefruit", tip: "Braxton Hicks (practice) contractions may start — usually painless and irregular." },
  24: { babySize: "An ear of corn", tip: "A glucose screening test is typically done around this time." },
  25: { babySize: "A cauliflower", tip: "Swelling in the feet and ankles is common — put your feet up when you can." },
  26: { babySize: "A head of lettuce", tip: "Sleeping on your side, with a pillow between your knees, can ease back pain." },
  27: { babySize: "A rutabaga", tip: "You're entering the third trimester — appointments become more frequent." },
  28: { babySize: "An eggplant", tip: "Start tracking kick counts if your doctor recommends it." },
  29: { babySize: "A butternut squash", tip: "Heartburn is common as the uterus presses upward — smaller meals may help." },
  30: { babySize: "A cabbage", tip: "Shortness of breath is common as baby takes up more room." },
  31: { babySize: "A coconut", tip: "Consider starting to pack a hospital bag if this is a first pregnancy." },
  32: { babySize: "A jicama", tip: "Braxton Hicks contractions may become more frequent — stay hydrated." },
  33: { babySize: "A pineapple", tip: "Sleep can get harder — a pregnancy pillow may help with comfort." },
  34: { babySize: "A cantaloupe", tip: "Discuss a birth plan and pain-management preferences with your provider." },
  35: { babySize: "A honeydew melon", tip: "Weekly checkups often begin around this point." },
  36: { babySize: "A head of romaine lettuce", tip: "Baby may 'drop' lower into the pelvis — this can ease breathing but increase pelvic pressure." },
  37: { babySize: "A bunch of Swiss chard", tip: "You're considered full-term soon — review the signs of labor with your provider." },
  38: { babySize: "A leek", tip: "Rest as much as you can — labor can start any time from here." },
  39: { babySize: "A mini watermelon", tip: "Watch for signs of labor: regular contractions, water breaking, or fluid leaking." },
  40: { babySize: "A watermelon", tip: "Your estimated due date — many pregnancies go a little before or after this date." },
  41: { babySize: "A watermelon (still growing)", tip: "Your provider may discuss options if labor hasn't started naturally yet." },
  42: { babySize: "A watermelon (still growing)", tip: "Your provider will likely discuss induction if labor hasn't begun." },
};

const GENERIC_INFO = {
  babySize: "—",
  tip: "Keep up with your scheduled prenatal appointments and a balanced diet.",
};

export function getWeeklyInfo(week: number): { babySize: string; tip: string } {
  const clamped = Math.min(Math.max(Math.round(week), 1), MAX_WEEK);
  return WEEKLY_INFO[clamped] ?? GENERIC_INFO;
}

export function computePregnancyProgress(lastPeriodDate: Date, today: Date = new Date()): PregnancyProgress {
  const daysPregnant = Math.max(0, Math.floor((today.getTime() - lastPeriodDate.getTime()) / MS_PER_DAY));
  const currentWeek = Math.min(Math.floor(daysPregnant / 7) + 1, MAX_WEEK);
  const currentDay = (daysPregnant % 7) + 1; // 1-7, matching currentWeek's 1-based numbering
  const trimester: 1 | 2 | 3 = currentWeek <= 13 ? 1 : currentWeek <= 27 ? 2 : 3;
  const dueDate = computeDueDate(lastPeriodDate);
  const daysUntilDue = Math.max(0, Math.round((dueDate.getTime() - today.getTime()) / MS_PER_DAY));
  const info = getWeeklyInfo(currentWeek);

  return {
    currentWeek,
    currentDay,
    trimester,
    daysPregnant,
    daysUntilDue,
    babySize: info.babySize,
    tip: info.tip,
  };
}
