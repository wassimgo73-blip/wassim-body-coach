// Pure calculation helpers — no DOM, fully unit-tested (tests/unit.test.mjs).

export const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

const round = (n, d = 0) => {
  const f = 10 ** d;
  return Math.round(n * f) / f;
};

/** Body-mass index (kg / m²). */
export function bmi(weightKg, heightCm) {
  if (!weightKg || !heightCm) return null;
  const m = heightCm / 100;
  return round(weightKg / (m * m), 1);
}

export function bmiCategory(value) {
  if (value == null) return null;
  if (value < 18.5) return 'under';
  if (value < 25) return 'normal';
  if (value < 30) return 'over';
  return 'obese';
}

/** Basal metabolic rate, Mifflin-St Jeor equation. */
export function bmr({ weight, height, age, sex = 'male' }) {
  if (!weight || !height || !age) return null;
  const base = 10 * weight + 6.25 * height - 5 * age;
  return round(sex === 'female' ? base - 161 : base + 5);
}

export function tdee(profile) {
  const b = bmr(profile);
  if (b == null) return null;
  const f = ACTIVITY_FACTORS[profile.activity] ?? ACTIVITY_FACTORS.light;
  return round(b * f);
}

/**
 * Daily targets for gradual fat loss while building muscle (body recomposition).
 * A moderate deficit (~15%, capped at 500 kcal) protects muscle and energy.
 */
export function dailyTargets(profile) {
  const maintenance = tdee(profile);
  if (maintenance == null) return null;
  const deficit = Math.min(500, round(maintenance * 0.15));
  const minimum = profile.sex === 'female' ? 1400 : 1600;
  const calories = Math.max(minimum, round((maintenance - deficit) / 10) * 10);
  const protein = round(profile.weight * 1.6); // g/day — evidence-based minimum for muscle gain (1.6–2.2 g/kg)
  const fat = round((calories * 0.27) / 9);
  const carbs = Math.max(0, round((calories - protein * 4 - fat * 9) / 4));
  const water = round(profile.weight * 0.035, 1); // litres
  return { maintenance, calories, deficit: maintenance - calories, protein, fat, carbs, water };
}

/** Waist-to-height ratio — a simple health indicator (< 0.5 is generally healthy). */
export function waistToHeight(waistCm, heightCm) {
  if (!waistCm || !heightCm) return null;
  return round(waistCm / heightCm, 2);
}

/** ISO date string (YYYY-MM-DD) in local time. */
export function isoDate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseIso(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Start of the week (Saturday, as commonly used in Algeria) for an ISO date. */
export function weekStart(iso, firstDay = 6) {
  const d = parseIso(iso);
  const diff = (d.getDay() - firstDay + 7) % 7;
  d.setDate(d.getDate() - diff);
  return isoDate(d);
}

/**
 * Average a numeric field per week.
 * entries: [{date:'YYYY-MM-DD', weight, waist}] → [{week, value, count}] ascending.
 */
export function weeklyAverages(entries, field) {
  const buckets = new Map();
  for (const e of entries) {
    const v = Number(e[field]);
    if (!e.date || !Number.isFinite(v) || v <= 0) continue;
    const w = weekStart(e.date);
    const b = buckets.get(w) || { sum: 0, count: 0 };
    b.sum += v;
    b.count += 1;
    buckets.set(w, b);
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([week, b]) => ({ week, value: round(b.sum / b.count, 1), count: b.count }));
}

/** Count of logged items per week for the last `weeks` weeks (zeros included). */
export function weeklyCounts(dates, weeks = 8, today = isoDate()) {
  const counts = new Map();
  for (const d of dates) {
    const w = weekStart(d);
    counts.set(w, (counts.get(w) || 0) + 1);
  }
  const out = [];
  const cur = parseIso(weekStart(today));
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(cur);
    d.setDate(d.getDate() - i * 7);
    const w = isoDate(d);
    out.push({ week: w, value: counts.get(w) || 0 });
  }
  return out;
}

/** Consecutive-day streak ending today (or yesterday, so it doesn't break mid-day). */
export function dayStreak(dates, today = isoDate()) {
  const set = new Set(dates);
  const d = parseIso(today);
  if (!set.has(today)) d.setDate(d.getDate() - 1);
  let streak = 0;
  while (set.has(isoDate(d))) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

/** Sort measurement entries by date and return first/last/change for a field. */
export function fieldChange(entries, field) {
  const list = entries
    .filter((e) => Number.isFinite(Number(e[field])) && Number(e[field]) > 0)
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  if (!list.length) return null;
  const first = Number(list[0][field]);
  const last = Number(list[list.length - 1][field]);
  return { first, last, change: round(last - first, 1), count: list.length, lastDate: list[list.length - 1].date };
}

/** Days between two ISO dates (b - a). */
export function daysBetween(a, b) {
  return Math.round((parseIso(b) - parseIso(a)) / 86400000);
}

/**
 * Training phase from programme start date: weeks 1–2 → 0, 3–4 → 1, 5+ → 2.
 * Used to progress sets/reps gradually for a beginner.
 */
export function trainingPhase(startIso, today = isoDate()) {
  if (!startIso) return 0;
  const weeks = Math.floor(Math.max(0, daysBetween(startIso, today)) / 7);
  if (weeks < 2) return 0;
  if (weeks < 4) return 1;
  return 2;
}

/** Validate a measurement input. Returns error key or null. */
export function validateMeasurement({ date, weight, waist }) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return 'errDate';
  const w = weight === '' || weight == null ? null : Number(weight);
  const wa = waist === '' || waist == null ? null : Number(waist);
  if (w == null && wa == null) return 'errEmpty';
  if (w != null && !(w >= 30 && w <= 300)) return 'errWeight';
  if (wa != null && !(wa >= 40 && wa <= 200)) return 'errWaist';
  return null;
}
