import test from 'node:test';
import assert from 'node:assert/strict';
import {
  bmi, bmiCategory, bmr, tdee, dailyTargets, waistToHeight, weekStart, weeklyAverages,
  weeklyCounts, dayStreak, fieldChange, trainingPhase, validateMeasurement, isoDate,
} from '../js/calc.js';
import { EXERCISES, WORKOUTS, SCHEDULE, MEAL_DAYS, MEAL_SLOTS, dayTotals, SHOPPING, NUTRITION_TIPS, WARMUP, COOLDOWN } from '../js/data.js';
import { STRINGS } from '../js/i18n.js';

const wassim = { sex: 'male', age: 24, height: 190, weight: 85, activity: 'light' };

test('BMI and category', () => {
  assert.equal(bmi(85, 190), 23.5);
  assert.equal(bmiCategory(23.5), 'normal');
  assert.equal(bmiCategory(31), 'obese');
  assert.equal(bmi(0, 190), null);
});

test('BMR (Mifflin-St Jeor) and TDEE', () => {
  assert.equal(bmr(wassim), 1923); // 850 + 1187.5 - 120 + 5
  assert.equal(tdee(wassim), 2644);
  assert.equal(bmr({ ...wassim, sex: 'female' }), 1757);
});

test('daily targets are a moderate deficit with adequate protein', () => {
  const tg = dailyTargets(wassim);
  assert.equal(tg.calories, 2250);
  assert.ok(tg.deficit > 250 && tg.deficit <= 500, `deficit ${tg.deficit}`);
  assert.equal(tg.protein, 136); // 1.6 g/kg
  assert.equal(tg.water, 3);
  assert.ok(Math.abs(tg.protein * 4 + tg.fat * 9 + tg.carbs * 4 - tg.calories) < 10);
  assert.ok(dailyTargets({ ...wassim, weight: 45, height: 150, age: 70, activity: 'sedentary' }).calories >= 1600);
});

test('waist-to-height', () => {
  assert.equal(waistToHeight(95, 190), 0.5);
  assert.equal(waistToHeight(null, 190), null);
});

test('weeks start on Saturday', () => {
  assert.equal(weekStart('2026-11-03'), '2026-10-31'); // Tue → Sat
  assert.equal(weekStart('2026-10-31'), '2026-10-31');
  assert.equal(weekStart('2026-11-06'), '2026-10-31'); // Fri
  assert.equal(weekStart('2026-11-07'), '2026-11-07');
});

test('weekly averages group and sort', () => {
  const r = weeklyAverages([
    { date: '2026-11-08', weight: 84 },
    { date: '2026-11-01', weight: 85 },
    { date: '2026-11-02', weight: 84.6 },
    { date: '2026-11-09', weight: null, waist: 90 },
  ], 'weight');
  assert.deepEqual(r, [
    { week: '2026-10-31', value: 84.8, count: 2 },
    { week: '2026-11-07', value: 84, count: 1 },
  ]);
});

test('weekly counts include empty weeks', () => {
  const r = weeklyCounts(['2026-11-01', '2026-11-03', '2026-10-20'], 3, '2026-11-03');
  assert.deepEqual(r.map((x) => x.value), [1, 0, 2]);
  assert.equal(r.at(-1).week, '2026-10-31');
});

test('streak counts consecutive days, tolerant of today not done yet', () => {
  assert.equal(dayStreak(['2026-11-01', '2026-11-02', '2026-11-03'], '2026-11-03'), 3);
  assert.equal(dayStreak(['2026-11-01', '2026-11-02'], '2026-11-03'), 2);
  assert.equal(dayStreak(['2026-11-01'], '2026-11-03'), 0);
  assert.equal(dayStreak([], '2026-11-03'), 0);
});

test('field change', () => {
  const c = fieldChange([{ date: '2026-11-10', weight: 84.2 }, { date: '2026-11-01', weight: 85 }], 'weight');
  assert.equal(c.change, -0.8);
  assert.equal(c.count, 2);
  assert.equal(fieldChange([], 'waist'), null);
});

test('training phase progresses every two weeks', () => {
  assert.equal(trainingPhase('2026-11-01', '2026-11-10'), 0);
  assert.equal(trainingPhase('2026-11-01', '2026-11-15'), 1);
  assert.equal(trainingPhase('2026-11-01', '2026-12-01'), 2);
  assert.equal(trainingPhase('2026-12-01', '2026-11-01'), 0);
});

test('measurement validation', () => {
  assert.equal(validateMeasurement({ date: '2026-11-03', weight: '85', waist: '' }), null);
  assert.equal(validateMeasurement({ date: '2026-11-03', weight: '', waist: '92' }), null);
  assert.equal(validateMeasurement({ date: '2026-11-03', weight: '', waist: '' }), 'errEmpty');
  assert.equal(validateMeasurement({ date: '', weight: '85' }), 'errDate');
  assert.equal(validateMeasurement({ date: '2026-11-03', weight: '8' }), 'errWeight');
  assert.equal(validateMeasurement({ date: '2026-11-03', waist: '500' }), 'errWaist');
});

test('isoDate formats local date', () => {
  assert.equal(isoDate(new Date(2026, 0, 5)), '2026-01-05');
});

test('workout data integrity', () => {
  for (const w of WORKOUTS) for (const id of w.exercises) assert.ok(EXERCISES[id], `missing ${id}`);
  for (const [id, ex] of Object.entries(EXERCISES)) {
    assert.equal(ex.sets.length, 3, id);
    for (const lang of ['ar', 'fr']) {
      assert.ok(ex.name[lang] && ex.muscles[lang] && ex.easier[lang], `${id} ${lang}`);
      assert.ok(ex.steps[lang].length >= 3, `${id} steps ${lang}`);
    }
    assert.equal(ex.steps.ar.length, ex.steps.fr.length, `${id} step count`);
  }
  assert.equal(Object.keys(SCHEDULE).length, 7);
  const sessions = Object.values(SCHEDULE).filter((d) => d.type === 'workout');
  assert.equal(sessions.length, 3);
  assert.equal(WARMUP.ar.length, WARMUP.fr.length);
  assert.equal(COOLDOWN.ar.length, COOLDOWN.fr.length);
});

test('meal plans: 7 days, near calorie & protein targets', () => {
  assert.equal(MEAL_DAYS.length, 7);
  const tg = dailyTargets(wassim);
  for (const d of MEAL_DAYS) {
    for (const s of MEAL_SLOTS) assert.ok(d.meals[s].ar && d.meals[s].fr, `${d.name.fr} ${s}`);
    const tot = dayTotals(d);
    assert.ok(Math.abs(tot.kcal - tg.calories) <= 150, `${d.name.fr} kcal ${tot.kcal}`);
    assert.ok(tot.p >= tg.protein * 0.9, `${d.name.fr} protein ${tot.p}`);
  }
  assert.equal(SHOPPING.ar.length, SHOPPING.fr.length);
  assert.equal(NUTRITION_TIPS.ar.length, NUTRITION_TIPS.fr.length);
});

test('every UI string exists in both languages', () => {
  const ar = Object.keys(STRINGS.ar).sort();
  const fr = Object.keys(STRINGS.fr).sort();
  assert.deepEqual(ar, fr);
  assert.equal(STRINGS.ar.dayNames.length, 7);
});
