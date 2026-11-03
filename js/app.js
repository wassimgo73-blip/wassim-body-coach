import { t, L, setLang, getLang, num, fmtDate } from './i18n.js';
import { store, photos, compressImage, blobToDataURL, dataURLToBlob } from './store.js';
import {
  bmi, bmiCategory, dailyTargets, waistToHeight, isoDate, weeklyAverages, weeklyCounts,
  dayStreak, fieldChange, trainingPhase, validateMeasurement, weekStart,
} from './calc.js';
import {
  EXERCISES, WORKOUTS, SCHEDULE, WARMUP, COOLDOWN, WALK_MINUTES, MEAL_DAYS, MEAL_SLOTS,
  SHOPPING, NUTRITION_TIPS, dayTotals,
} from './data.js';
import { renderChart } from './chart.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const view = () => $('#view');

// ---------- icons ----------
const ICON = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  workout: '<path d="M6 7v10M18 7v10M3 9v6M21 9v6M6 12h12"/>',
  meals: '<path d="M7 3v8a2 2 0 0 0 2 2v8M11 3v8M3 3v8a2 2 0 0 0 2 2M17 21V3c2.5 1 4 3.5 4 7s-1.5 4-4 4"/>',
  progress: '<path d="M3 20h18M5 16l4-5 4 3 6-8"/>',
  photos: '<path d="M4 7h3l2-3h6l2 3h3v13H4z"/><circle cx="12" cy="13" r="3.5"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
};
const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICON[name]}</svg>`;

// ---------- toast ----------
let toastTimer;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.hidden = false;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove('show');
    el.hidden = true;
  }, 2600);
}

// ---------- shared helpers ----------
const profile = () => store.get().profile;
const phase = () => trainingPhase(profile().startDate);
const today = () => isoDate();

function latest(field) {
  const s = store.get();
  const list = [...s.measurements].filter((m) => m[field] > 0);
  if (list.length) return list[list.length - 1][field];
  return field === 'weight' ? profile().weight : null;
}

function activeDates() {
  const s = store.get();
  return [...new Set([...s.workouts.map((w) => w.date), ...s.walks])];
}

function setsText(ex, ph) {
  const [sets, amount] = ex.sets[ph];
  return ex.type === 'time' ? `${sets} × ${amount} ${t('seconds')}` : `${sets} × ${amount} ${t('reps')}`;
}

function dayPlan(date = new Date()) {
  return SCHEDULE[date.getDay()];
}

// ---------- views ----------
function renderHome() {
  const s = store.get();
  const p = profile();
  const w = latest('weight');
  const targets = dailyTargets({ ...p, weight: w });
  const wChange = fieldChange([{ date: p.startDate, weight: p.weight }, ...s.measurements], 'weight');
  const waistCh = fieldChange(s.measurements, 'waist');
  const waist = latest('waist');
  const b = bmi(w, p.height);
  const whtr = waistToHeight(waist, p.height);
  const plan = dayPlan();
  const doneWorkout = s.workouts.some((x) => x.date === today());
  const walked = s.walks.includes(today());
  const streak = dayStreak(activeDates());
  const ws = weekStart(today());
  const weekCount = s.workouts.filter((x) => x.date >= ws).length;
  const water = s.water[today()] || 0;
  const glassesGoal = Math.round((targets.water * 1000) / 250);
  const mealsDone = (s.meals[today()] || []).length;
  const dayName = t('dayNames')[new Date().getDay()];

  let planHtml;
  if (plan.type === 'workout') {
    const wk = WORKOUTS.find((x) => x.id === plan.id);
    planHtml = `
      <h3>${esc(L(wk.name))}</h3>
      <p class="muted">${wk.exercises.length} × ${t('sets')} · ≈ ${wk.duration} ${t('minutes')} · ${t(`phase${phase()}`)}</p>
      ${doneWorkout ? `<p class="ok">${t('doneToday')}</p>` : ''}
      <a class="btn primary block" href="#/session/${wk.id}">${t('startWorkout')}</a>`;
  } else if (plan.type === 'walk') {
    planHtml = `
      <h3>🚶 ${t('walkDay')}</h3>
      <p>${t('walkDesc', { n: WALK_MINUTES[phase()] })}</p>
      <button class="btn ${walked ? 'ok-btn' : 'primary'} block" data-action="walk">${walked ? t('walkDone') : t('markWalkDone')}</button>`;
  } else {
    planHtml = `<h3>😴 ${t('restDay')}</h3><p>${t('restDesc')}</p>`;
  }

  const change = (c, unit) =>
    c && c.count > 1 ? `<span class="delta ${c.change <= 0 ? 'down' : 'up'}">${c.change > 0 ? '+' : ''}${num(c.change, 1)} ${unit} ${t('sinceStart')}</span>` : '';

  view().innerHTML = `
    <section class="hero">
      <p class="muted">${dayName} · ${fmtDate(today(), { day: 'numeric', month: 'long' })}</p>
      <h2>${t('hello')} ${esc(p.name)} 👋</h2>
    </section>

    <section class="card plan-card">
      <p class="eyebrow">${t('todayPlan')}</p>
      ${planHtml}
    </section>

    <section class="grid2">
      <div class="card stat">
        <p class="eyebrow">${t('currentWeight')}</p>
        <p class="big">${num(w, 1)} <small>${t('kg')}</small></p>
        ${change(wChange, t('kg'))}
      </div>
      <div class="card stat">
        <p class="eyebrow">${t('currentWaist')}</p>
        <p class="big">${waist ? `${num(waist, 1)} <small>${t('cm')}</small>` : '—'}</p>
        ${waist ? change(waistCh, t('cm')) : `<a class="link" href="#/progress">${t('addMeasurement')}</a>`}
      </div>
    </section>

    <section class="card">
      <p class="eyebrow">${t('targets')}</p>
      <div class="targets">
        <div><b>${num(targets.calories)}</b><span>${t('kcal')}</span><small>${t('calories')}</small></div>
        <div><b>${num(targets.protein)}</b><span>${t('g')}</span><small>${t('protein')}</small></div>
        <div><b>${num(targets.water, 1)}</b><span>${t('liters')}</span><small>${t('water')}</small></div>
      </div>
      <p class="muted small">${t('maintenance', { n: num(targets.maintenance), d: num(targets.deficit) })}</p>
    </section>

    <section class="card">
      <div class="row-between">
        <p class="eyebrow">${t('waterToday')}</p>
        <span class="muted small">${water} / ${glassesGoal} ${t('glasses')}</span>
      </div>
      <div class="water">
        <button class="icon-btn" data-action="water-" aria-label="−">${icon('minus')}</button>
        <div class="glasses" aria-hidden="true">${Array.from({ length: glassesGoal }, (_, i) => `<span class="${i < water ? 'full' : ''}"></span>`).join('')}</div>
        <button class="icon-btn" data-action="water+" aria-label="+">${icon('plus')}</button>
      </div>
    </section>

    <section class="grid2">
      <div class="card stat">
        <p class="eyebrow">${t('streak')}</p>
        <p class="big">🔥 ${streak} <small>${t('days')}</small></p>
      </div>
      <div class="card stat">
        <p class="eyebrow">${t('thisWeek')}</p>
        <p class="big">${weekCount} <small>${t('of')} 3</small></p>
        <div class="meter"><span style="width:${Math.min(100, (weekCount / 3) * 100)}%"></span></div>
      </div>
    </section>

    <section class="grid2">
      <div class="card stat">
        <p class="eyebrow">${t('bmi')}</p>
        <p class="big">${num(b, 1)}</p>
        <span class="muted small">${b ? t(`bmi_${bmiCategory(b)}`) : ''}</span>
      </div>
      <div class="card stat">
        <p class="eyebrow">${t('whtr')}</p>
        <p class="big">${whtr ? num(whtr, 2) : '—'}</p>
        <span class="muted small">${t('whtrHint')}</span>
      </div>
    </section>
    <p class="muted small pad">${t('bmiNote')}</p>

    <a class="card link-card" href="#/meals">
      <span>🍲 ${t('mealsDone')}</span><b>${mealsDone} / 4</b>
    </a>

    <section class="card note">
      <p class="eyebrow">ℹ️ ${t('honestTitle')}</p>
      <p>${t('honestText')}</p>
    </section>
  `;

  view().onclick = (e) => {
    const a = e.target.closest('[data-action]')?.dataset.action;
    if (!a) return;
    if (a === 'walk') store.toggleWalk();
    if (a === 'water+') store.setWater(water + 1);
    if (a === 'water-') store.setWater(water - 1);
    renderHome();
  };
}

function exerciseCard(id, ph, extra = '') {
  const ex = EXERCISES[id];
  return `
    <details class="exercise">
      <summary>
        <span class="ex-icon" aria-hidden="true">${ex.icon}</span>
        <span class="ex-main"><b>${esc(L(ex.name))}</b><small>${setsText(ex, ph)} · ${t('rest')} ${ex.rest} ${t('seconds')}</small></span>
      </summary>
      <div class="ex-body">
        <p class="muted small">${t('muscles')}: ${esc(L(ex.muscles))}</p>
        <p class="eyebrow">${t('howTo')}</p>
        <ol>${L(ex.steps).map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
        <p class="small"><b>${t('easier')}:</b> ${esc(L(ex.easier))}</p>
      </div>
      ${extra}
    </details>`;
}

function renderWorkout() {
  const ph = phase();
  const s = store.get();
  const order = [6, 0, 1, 2, 3, 4, 5];
  const todayDow = new Date().getDay();
  view().innerHTML = `
    <h2>${t('workoutTitle')}</h2>
    <p class="muted">${t('workoutIntro')}</p>
    <div class="chip-row" role="group" aria-label="${t('phase')}">
      ${[0, 1, 2].map((i) => `<span class="chip ${i === ph ? 'active' : ''}">${t(`phase${i}`)}</span>`).join('')}
    </div>

    <section class="card">
      <p class="eyebrow">${t('weekSchedule')}</p>
      <ul class="schedule">
        ${order.map((d) => {
          const p = SCHEDULE[d];
          const label = p.type === 'workout' ? `${t('session')} ${p.id}` : p.type === 'walk' ? `${t('walk')} ${WALK_MINUTES[ph]} ${t('minutes')}` : t('restShort');
          return `<li class="${d === todayDow ? 'today' : ''} ${p.type}"><span>${t('dayNames')[d]}</span><b>${label}</b></li>`;
        }).join('')}
      </ul>
    </section>

    <section class="card">
      <details>
        <summary class="eyebrow">🔥 ${t('warmup')}</summary>
        <ul class="plain">${L(WARMUP).map((w) => `<li>${esc(w)}</li>`).join('')}</ul>
      </details>
    </section>

    ${WORKOUTS.map((w) => `
      <section class="card">
        <div class="row-between">
          <h3>${esc(L(w.name))}</h3>
          <span class="muted small">≈ ${w.duration} ${t('minutes')}</span>
        </div>
        ${w.exercises.map((id) => exerciseCard(id, ph)).join('')}
        <a class="btn primary block" href="#/session/${w.id}">${t('start')} — ${t('session')} ${w.id}</a>
      </section>`).join('')}

    <section class="card">
      <details>
        <summary class="eyebrow">🧘 ${t('cooldown')}</summary>
        <ul class="plain">${L(COOLDOWN).map((w) => `<li>${esc(w)}</li>`).join('')}</ul>
      </details>
    </section>

    <p class="note small pad">⚠️ ${t('safety')}</p>

    <section class="card">
      <p class="eyebrow">${t('history')}</p>
      ${s.workouts.length ? `<ul class="list">${[...s.workouts].reverse().slice(0, 20).map((w) => `
        <li><span>${fmtDate(w.date, { weekday: 'short', day: 'numeric', month: 'short' })} — ${t('session')} ${esc(w.workoutId)}</span>
        <span class="muted small">${w.setsDone}/${w.setsTotal}</span>
        <button class="icon-btn danger" data-del="${esc(w.id)}" aria-label="${t('delete')}">${icon('trash')}</button></li>`).join('')}</ul>`
        : `<p class="muted">${t('noWorkouts')}</p>`}
    </section>`;

  view().onclick = (e) => {
    const id = e.target.closest('[data-del]')?.dataset.del;
    if (id && confirm(t('confirmDelete'))) {
      store.deleteWorkout(id);
      renderWorkout();
    }
  };
}

// --- guided session ---
let session = null;
let restInterval = null;
let holdInterval = null;

function clearTimers() {
  clearInterval(restInterval);
  clearInterval(holdInterval);
  restInterval = holdInterval = null;
}

function startRest(seconds) {
  clearInterval(restInterval);
  const bar = $('#rest-bar');
  if (!bar) return;
  let left = seconds;
  bar.hidden = false;
  const tick = () => {
    $('#rest-left').textContent = `${left}`;
    $('#rest-progress').style.width = `${(left / seconds) * 100}%`;
    if (left <= 0) {
      clearInterval(restInterval);
      bar.hidden = true;
      if (navigator.vibrate) navigator.vibrate(200);
    }
    left -= 1;
  };
  tick();
  restInterval = setInterval(tick, 1000);
}

function renderSession(id) {
  const wk = WORKOUTS.find((w) => w.id === id);
  if (!wk) return go('#/workout');
  const ph = phase();
  if (!session || session.id !== id) {
    session = { id, started: Date.now(), done: Object.fromEntries(wk.exercises.map((e) => [e, 0])) };
  }
  const total = wk.exercises.reduce((a, e) => a + EXERCISES[e].sets[ph][0], 0);
  const doneCount = () => Object.values(session.done).reduce((a, b) => a + b, 0);

  view().innerHTML = `
    <div class="row-between">
      <a class="btn ghost" href="#/workout">← ${t('back')}</a>
      <span class="muted small" id="sess-count">${t('completedSets')}: ${doneCount()}/${total}</span>
    </div>
    <h2>${esc(L(wk.name))}</h2>
    <div class="meter"><span id="sess-meter" style="width:${(doneCount() / total) * 100}%"></span></div>
    ${wk.exercises.map((exId) => {
      const ex = EXERCISES[exId];
      const [sets, amount] = ex.sets[ph];
      const buttons = Array.from({ length: sets }, (_, i) => `
        <button class="set-btn ${i < session.done[exId] ? 'done' : ''}" data-ex="${exId}" data-set="${i}" aria-pressed="${i < session.done[exId]}">
          ${t('set')} ${i + 1}</button>`).join('');
      const timer = ex.type === 'time' ? `<button class="btn small-btn" data-hold="${exId}">⏱ ${t('holdFor', { n: amount })}</button>` : '';
      return exerciseCard(exId, ph, `<div class="sets">${buttons}${timer}</div>`).replace('<details class="exercise">', '<details class="exercise" open>');
    }).join('')}
    <button class="btn primary block" data-action="finish">${icon('check')} ${t('finishWorkout')}</button>
    <a class="btn ghost block" href="#/workout" data-action="cancel">${t('cancel')}</a>

    <div id="hold" class="overlay" hidden>
      <div class="overlay-card"><p class="eyebrow" id="hold-name"></p><p class="huge" id="hold-left"></p>
      <button class="btn" data-action="hold-stop">${t('skip')}</button></div>
    </div>
    <div id="rest-bar" class="rest-bar" hidden>
      <div class="rest-progress"><span id="rest-progress"></span></div>
      <span>${t('restTimer')}: <b id="rest-left"></b> ${t('seconds')}</span>
      <button class="btn small-btn" data-action="rest-skip">${t('skip')}</button>
    </div>`;

  view().onclick = (e) => {
    const setBtn = e.target.closest('[data-set]');
    if (setBtn) {
      e.preventDefault();
      const exId = setBtn.dataset.ex;
      const i = Number(setBtn.dataset.set);
      const was = session.done[exId];
      session.done[exId] = i < was ? i : i + 1; // tap a done set to undo it (and the ones after)
      $$(`[data-ex="${exId}"]`).forEach((b, j) => {
        b.classList.toggle('done', j < session.done[exId]);
        b.setAttribute('aria-pressed', j < session.done[exId]);
      });
      $('#sess-count').textContent = `${t('completedSets')}: ${doneCount()}/${total}`;
      $('#sess-meter').style.width = `${(doneCount() / total) * 100}%`;
      if (session.done[exId] > was) startRest(EXERCISES[exId].rest);
      return;
    }
    const hold = e.target.closest('[data-hold]')?.dataset.hold;
    if (hold) {
      e.preventDefault();
      const ex = EXERCISES[hold];
      let left = ex.sets[ph][1];
      $('#hold').hidden = false;
      $('#hold-name').textContent = L(ex.name);
      clearInterval(holdInterval);
      const tick = () => {
        $('#hold-left').textContent = left;
        if (left <= 0) {
          clearInterval(holdInterval);
          $('#hold').hidden = true;
          if (navigator.vibrate) navigator.vibrate([150, 80, 150]);
          const next = session.done[hold];
          if (next < ex.sets[ph][0]) $(`[data-ex="${hold}"][data-set="${next}"]`)?.click();
        }
        left -= 1;
      };
      tick();
      holdInterval = setInterval(tick, 1000);
      return;
    }
    const a = e.target.closest('[data-action]')?.dataset.action;
    if (a === 'hold-stop') {
      clearInterval(holdInterval);
      $('#hold').hidden = true;
    } else if (a === 'rest-skip') {
      clearInterval(restInterval);
      $('#rest-bar').hidden = true;
    } else if (a === 'finish') {
      clearTimers();
      store.addWorkout({
        workoutId: id,
        setsDone: doneCount(),
        setsTotal: total,
        minutes: Math.max(1, Math.round((Date.now() - session.started) / 60000)),
        phase: ph,
      });
      session = null;
      toast(t('workoutSaved'));
      go('#/home');
    } else if (a === 'cancel') {
      clearTimers();
      session = null;
    }
  };
}

function renderMeals() {
  const s = store.get();
  const p = profile();
  const targets = dailyTargets({ ...p, weight: latest('weight') });
  const todayIdx = (new Date().getDay() + 1) % 7; // Saturday = day 1
  const sel = Number(sessionStorage.getItem('mealDay') ?? todayIdx);
  const day = MEAL_DAYS[sel] || MEAL_DAYS[0];
  const tot = dayTotals(day);
  const eaten = s.meals[today()] || [];
  const isToday = sel === todayIdx;

  view().innerHTML = `
    <h2>${t('mealsTitle')}</h2>
    <p class="muted">${t('mealsIntro')}</p>
    <div class="chip-row scroll" role="tablist">
      ${MEAL_DAYS.map((d, i) => `<button class="chip ${i === sel ? 'active' : ''}" role="tab" aria-selected="${i === sel}" data-day="${i}">${t('day')} ${i + 1}${i === todayIdx ? ' •' : ''}</button>`).join('')}
    </div>
    <section class="card">
      <div class="row-between"><h3>${esc(L(day.name))}</h3><span class="muted small">${t('costDay', { n: num(day.cost) })}</span></div>
      <ul class="meals">
        ${MEAL_SLOTS.map((slot) => {
          const meal = day.meals[slot];
          const done = isToday && eaten.includes(slot);
          return `<li class="${done ? 'done' : ''}">
            <div><p class="eyebrow">${t(slot)}</p><p>${esc(L(meal))}</p><small class="muted">≈ ${meal.kcal} ${t('kcal')} · ${meal.p} ${t('g')} ${t('protein')}</small></div>
            ${isToday ? `<button class="check ${done ? 'on' : ''}" data-meal="${slot}" aria-pressed="${done}" aria-label="${t('eaten')}">${icon('check')}</button>` : ''}
          </li>`;
        }).join('')}
      </ul>
      <p class="total">${t('dayTotal')} <b>${num(tot.kcal)} ${t('kcal')}</b> · <b>${tot.p} ${t('g')}</b> ${t('protein')}</p>
      <p class="muted small">${t('adjustHint', { t: num(targets.calories) })}</p>
      <p class="muted small">${t('costNote')}</p>
    </section>
    <section class="card">
      <details>
        <summary class="eyebrow">🛒 ${t('shopping')}</summary>
        <dl class="shopping">${L(SHOPPING).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
      </details>
    </section>
    <section class="card">
      <p class="eyebrow">💡 ${t('tips')}</p>
      <ul class="plain">${L(NUTRITION_TIPS).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    </section>`;

  view().onclick = (e) => {
    const d = e.target.closest('[data-day]')?.dataset.day;
    if (d != null) {
      sessionStorage.setItem('mealDay', d);
      return renderMeals();
    }
    const m = e.target.closest('[data-meal]')?.dataset.meal;
    if (m) {
      store.toggleMeal(m);
      renderMeals();
    }
  };
}

let showTables = false;
function renderProgress() {
  const s = store.get();
  const p = profile();
  const lastW = latest('weight');
  // plain d/m digits: avoids bidi control marks from Intl inside the LTR chart
  const fmtW = (wk) => { const [, mo, da] = wk.split('-').map(Number); return `${da}/${mo}`; };
  view().innerHTML = `
    <h2>${t('progressTitle')}</h2>
    <form class="card form" id="m-form" novalidate>
      <div class="grid3">
        <label>${t('date')}<input type="date" name="date" value="${today()}" max="${today()}" required></label>
        <label>${t('weight')} (${t('kg')})<input type="number" name="weight" inputmode="decimal" step="0.1" min="30" max="300" placeholder="${num(lastW, 1)}"></label>
        <label>${t('waist')} (${t('cm')})<input type="number" name="waist" inputmode="decimal" step="0.5" min="40" max="200" placeholder="—"></label>
      </div>
      <p class="error" id="m-err" role="alert"></p>
      <button class="btn primary block" type="submit">${t('save')}</button>
      <p class="muted small">${t('measureHint')}</p>
    </form>

    ${['weight', 'waist'].map((f) => `
      <section class="card">
        <div class="row-between"><p class="eyebrow">${t(f === 'weight' ? 'weeklyWeight' : 'weeklyWaist')}</p><span class="muted small" id="chg-${f}"></span></div>
        <div id="chart-${f}" class="chart"></div>
      </section>`).join('')}
    <section class="card">
      <p class="eyebrow">${t('weeklyWorkouts')}</p>
      <div id="chart-workouts" class="chart"></div>
    </section>
    <button class="btn ghost block" data-action="tables">${showTables ? t('hideTable') : t('showTable')}</button>
    <div id="tables"></div>

    <section class="card">
      <p class="eyebrow">${t('entries')}</p>
      ${s.measurements.length ? `<ul class="list">${[...s.measurements].reverse().map((m) => `
        <li><span>${fmtDate(m.date, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        <span>${m.weight ? `${num(m.weight, 1)} ${t('kg')}` : '—'} · ${m.waist ? `${num(m.waist, 1)} ${t('cm')}` : '—'}</span>
        <button class="icon-btn danger" data-del="${esc(m.id)}" aria-label="${t('delete')}">${icon('trash')}</button></li>`).join('')}</ul>`
        : `<p class="muted">${t('noData')}</p>`}
    </section>`;

  const tables = [];
  for (const f of ['weight', 'waist']) {
    const data = weeklyAverages(s.measurements, f).slice(-12).map((d) => ({ label: fmtW(d.week), value: d.value }));
    const box = $(`#chart-${f}`);
    const unit = f === 'weight' ? t('kg') : t('cm');
    if (data.length < 2) box.innerHTML = `<p class="muted small empty">${t('needTwo')}</p>`;
    else renderChart(box, data, { type: 'line', unit, fmt: (n) => num(n, 1), ariaLabel: t(f === 'weight' ? 'weeklyWeight' : 'weeklyWaist') });
    const c = fieldChange(s.measurements, f);
    if (c && c.count > 1) $(`#chg-${f}`).textContent = `${t('change')}: ${c.change > 0 ? '+' : ''}${num(c.change, 1)} ${unit}`;
    if (data.length) tables.push([t(f === 'weight' ? 'weeklyWeight' : 'weeklyWaist'), data, unit]);
  }
  const wc = weeklyCounts(s.workouts.map((w) => w.date), 8).map((d) => ({ label: fmtW(d.week), value: d.value }));
  renderChart($('#chart-workouts'), wc, { type: 'bar', unit: '', fmt: (n) => num(n), ariaLabel: t('weeklyWorkouts') });
  tables.push([t('weeklyWorkouts'), wc, '']);
  if (showTables) {
    $('#tables').innerHTML = tables.map(([title, data, unit]) => `
      <section class="card"><p class="eyebrow">${title}</p><table class="table"><thead><tr><th>${t('week')}</th><th>${t('value')}</th></tr></thead>
      <tbody>${data.map((d) => `<tr><td>${d.label}</td><td>${num(d.value, 1)} ${unit}</td></tr>`).join('')}</tbody></table></section>`).join('');
  }

  $('#m-form').onsubmit = (e) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.target));
    const err = validateMeasurement(fd);
    if (err) {
      $('#m-err').textContent = t(err);
      return;
    }
    store.addMeasurement(fd);
    toast(t('saved'));
    renderProgress();
  };
  view().onclick = (e) => {
    const id = e.target.closest('[data-del]')?.dataset.del;
    if (id && confirm(t('confirmDelete'))) {
      store.deleteMeasurement(id);
      renderProgress();
    }
    if (e.target.closest('[data-action="tables"]')) {
      showTables = !showTables;
      renderProgress();
    }
  };
}

// --- photos ---
let photoUrls = [];
let compareSel = [];
function revokePhotoUrls() {
  photoUrls.forEach((u) => URL.revokeObjectURL(u));
  photoUrls = [];
}

async function renderPhotos() {
  revokePhotoUrls();
  view().innerHTML = `
    <h2>${t('photosTitle')}</h2>
    <section class="card privacy">${icon('lock')}<div><p>${t('photosPrivacy')}</p><p class="muted small">${t('photosDisclaimer')}</p></div></section>
    <form class="card form" id="p-form">
      <div class="grid3">
        <label>${t('date')}<input type="date" name="date" value="${today()}" max="${today()}" required></label>
        <label>${t('pose')}<select name="pose"><option value="front">${t('front')}</option><option value="side">${t('side')}</option><option value="back">${t('backPose')}</option></select></label>
        <label>${t('note')}<input type="text" name="note" maxlength="80"></label>
      </div>
      <label class="btn primary block file-btn">${icon('photos')} ${t('addPhoto')}
        <input type="file" id="p-file" accept="image/*" hidden></label>
      <p class="muted small">${t('photoTips')}</p>
    </form>
    <div class="row-between pad">
      <span class="muted small" id="cmp-hint">${t('selectTwo')}</span>
      <button class="btn" data-action="compare" disabled>${t('compare')}</button>
    </div>
    <div id="p-grid" class="photo-grid"></div>
    <div id="modal" class="overlay" hidden></div>`;

  compareSel = [];
  const list = await photos.all().catch(() => []);
  const grid = $('#p-grid');
  if (!grid) return; // navigated away
  const poseLabel = { front: t('front'), side: t('side'), back: t('backPose') };
  const urlById = {};
  grid.innerHTML = list.length
    ? list.map((ph) => {
        const u = URL.createObjectURL(ph.blob);
        photoUrls.push(u);
        urlById[ph.id] = u;
        return `<figure class="photo" data-id="${esc(ph.id)}">
          <button class="thumb" data-view="${esc(ph.id)}"><img src="${u}" alt="${esc(ph.date)} ${esc(poseLabel[ph.pose] || '')}" loading="lazy"></button>
          <figcaption><span>${fmtDate(ph.date, { day: 'numeric', month: 'short', year: '2-digit' })} · ${esc(poseLabel[ph.pose] || '')}</span>
          ${ph.note ? `<small>${esc(ph.note)}</small>` : ''}</figcaption>
          <div class="photo-actions">
            <label class="select"><input type="checkbox" data-sel="${esc(ph.id)}"> ${t('compare')}</label>
            <button class="icon-btn danger" data-pdel="${esc(ph.id)}" aria-label="${t('delete')}">${icon('trash')}</button>
          </div></figure>`;
      }).join('')
    : `<p class="muted pad">${t('noPhotos')}</p>`;
  const byId = Object.fromEntries(list.map((p) => [p.id, p]));

  $('#p-file').onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = Object.fromEntries(new FormData($('#p-form')));
    try {
      const blob = await compressImage(file);
      await photos.add({ date: fd.date || today(), pose: fd.pose, note: fd.note?.trim() || '', blob });
      toast(t('photoSaved'));
    } catch {
      toast(t('photoError'));
    }
    renderPhotos();
  };

  const modal = $('#modal');
  const openModal = (html) => {
    modal.innerHTML = `<div class="overlay-card wide">${html}<button class="btn block" data-action="close">${t('close')}</button></div>`;
    modal.hidden = false;
  };

  view().onclick = async (e) => {
    const v = e.target.closest('[data-view]')?.dataset.view;
    if (v) {
      const ph = byId[v];
      return openModal(`<img class="full" src="${urlById[v]}" alt=""><p class="muted small">${fmtDate(ph.date, { day: 'numeric', month: 'long', year: 'numeric' })} ${ph.note ? `· ${esc(ph.note)}` : ''}</p>`);
    }
    const del = e.target.closest('[data-pdel]')?.dataset.pdel;
    if (del) {
      if (confirm(t('confirmDelete'))) {
        await photos.remove(del);
        renderPhotos();
      }
      return;
    }
    const a = e.target.closest('[data-action]')?.dataset.action;
    if (a === 'close' || e.target === modal) {
      modal.hidden = true;
      modal.innerHTML = '';
    }
    if (a === 'compare' && compareSel.length === 2) {
      const [p1, p2] = compareSel.map((id) => byId[id]).sort((x, y) => (x.date < y.date ? -1 : 1));
      openModal(`<p class="eyebrow">${t('compareTitle')}</p><div class="compare">
        <figure><img src="${urlById[p1.id]}" alt=""><figcaption>${t('before')} · ${fmtDate(p1.date, { day: 'numeric', month: 'short', year: 'numeric' })}</figcaption></figure>
        <figure><img src="${urlById[p2.id]}" alt=""><figcaption>${t('after')} · ${fmtDate(p2.date, { day: 'numeric', month: 'short', year: 'numeric' })}</figcaption></figure>
      </div><p class="muted small">${t('photosDisclaimer')}</p>`);
    }
  };
  view().onchange = (e) => {
    const id = e.target.dataset?.sel;
    if (!id) return;
    if (e.target.checked) {
      compareSel.push(id);
      if (compareSel.length > 2) {
        const drop = compareSel.shift();
        const box = $(`[data-sel="${drop}"]`);
        if (box) box.checked = false;
      }
    } else compareSel = compareSel.filter((x) => x !== id);
    $('[data-action="compare"]').disabled = compareSel.length !== 2;
  };
}

// --- settings ---
let deferredInstall = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstall = e;
  if (location.hash.startsWith('#/settings')) renderSettings();
});
window.addEventListener('appinstalled', () => {
  deferredInstall = null;
  if (location.hash.startsWith('#/settings')) renderSettings();
});
const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

function renderSettings() {
  const p = profile();
  const lang = getLang();
  let installHtml;
  if (isStandalone()) installHtml = `<p class="ok">${t('installed')}</p>`;
  else if (deferredInstall) installHtml = `<button class="btn primary block" data-action="install">${t('installBtn')}</button>`;
  else installHtml = `<p class="muted small">${isIos() ? t('installIos') : t('installManual')}</p>`;

  view().innerHTML = `
    <h2>${t('settingsTitle')}</h2>
    <section class="card">
      <p class="eyebrow">${t('language')}</p>
      <div class="seg" role="radiogroup">
        <button role="radio" aria-checked="${lang === 'ar'}" class="${lang === 'ar' ? 'active' : ''}" data-lang="ar">العربية</button>
        <button role="radio" aria-checked="${lang === 'fr'}" class="${lang === 'fr' ? 'active' : ''}" data-lang="fr">Français</button>
      </div>
    </section>
    <form class="card form" id="profile-form">
      <p class="eyebrow">${t('profile')}</p>
      <div class="grid2">
        <label>${t('name')}<input name="name" value="${esc(p.name)}" maxlength="30"></label>
        <label>${t('sex')}<select name="sex"><option value="male" ${p.sex === 'male' ? 'selected' : ''}>${t('male')}</option><option value="female" ${p.sex === 'female' ? 'selected' : ''}>${t('female')}</option></select></label>
        <label>${t('age')}<input type="number" name="age" min="14" max="90" value="${p.age}" required></label>
        <label>${t('height')} (${t('cm')})<input type="number" name="height" min="120" max="230" value="${p.height}" required></label>
        <label>${t('startWeight')} (${t('kg')})<input type="number" name="weight" min="30" max="300" step="0.1" value="${p.weight}" required></label>
        <label>${t('programStart')}<input type="date" name="startDate" value="${p.startDate}" required></label>
      </div>
      <label>${t('activity')}<select name="activity">${['sedentary', 'light', 'moderate', 'active'].map((a) => `<option value="${a}" ${p.activity === a ? 'selected' : ''}>${t(`act_${a}`)}</option>`).join('')}</select></label>
      <button class="btn primary block" type="submit">${t('save')}</button>
    </form>
    <section class="card">
      <p class="eyebrow">${t('install')}</p>
      ${installHtml}
    </section>
    <section class="card">
      <p class="eyebrow">${icon('lock')} ${t('data')}</p>
      <p class="small">${t('dataInfo')}</p>
      <label class="check-line"><input type="checkbox" id="exp-photos"> ${t('exportPhotos')}</label>
      <button class="btn block" data-action="export">${t('exportData')}</button>
      <label class="btn block file-btn">${t('importData')}<input type="file" id="imp-file" accept="application/json,.json" hidden></label>
      <p class="muted small">${t('backupWarn')}</p>
      <button class="btn danger-btn block" data-action="clear">${t('clearData')}</button>
    </section>
    <section class="card">
      <p class="eyebrow">${t('about')}</p>
      <p class="small">${t('aboutText')}</p>
    </section>`;

  $('#profile-form').onsubmit = (e) => {
    e.preventDefault();
    if (!e.target.reportValidity()) return;
    const fd = Object.fromEntries(new FormData(e.target));
    store.updateProfile({
      name: fd.name.trim() || 'وسيم',
      sex: fd.sex,
      age: Number(fd.age),
      height: Number(fd.height),
      weight: Number(fd.weight),
      startDate: fd.startDate,
      activity: fd.activity,
    });
    toast(t('saved'));
  };

  $('#imp-file').onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const obj = JSON.parse(await file.text());
      if (!obj || obj.app !== 'wassim-body-coach' || !obj.data) throw new Error('bad');
      store.replaceAll(obj.data);
      if (Array.isArray(obj.photos)) {
        for (const ph of obj.photos) {
          if (!ph.id || !String(ph.dataURL).startsWith('data:image/')) continue;
          await photos.put({ id: ph.id, date: ph.date, pose: ph.pose, note: ph.note || '', blob: await dataURLToBlob(ph.dataURL) });
        }
      }
      applyLang();
      toast(t('importOk'));
      renderSettings();
    } catch {
      toast(t('importFail'));
    }
  };

  view().onclick = async (e) => {
    const lg = e.target.closest('[data-lang]')?.dataset.lang;
    if (lg) {
      store.setLang(lg);
      applyLang();
      return renderSettings();
    }
    const a = e.target.closest('[data-action]')?.dataset.action;
    if (a === 'install' && deferredInstall) {
      deferredInstall.prompt();
      await deferredInstall.userChoice.catch(() => {});
      deferredInstall = null;
      renderSettings();
    } else if (a === 'export') {
      const payload = { app: 'wassim-body-coach', exportedAt: new Date().toISOString(), data: store.get() };
      if ($('#exp-photos').checked) {
        const list = await photos.all();
        payload.photos = await Promise.all(list.map(async (ph) => ({ id: ph.id, date: ph.date, pose: ph.pose, note: ph.note, dataURL: await blobToDataURL(ph.blob) })));
      }
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `wassim-body-coach-${today()}.json`;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } else if (a === 'clear') {
      if (!confirm(t('confirmClear'))) return;
      store.reset();
      await photos.clear().catch(() => {});
      applyLang();
      toast(t('cleared'));
      renderSettings();
    }
  };
}

// ---------- shell / router ----------
const NAV = [
  ['home', 'navHome'],
  ['workout', 'navWorkout'],
  ['meals', 'navMeals'],
  ['progress', 'navProgress'],
  ['photos', 'navPhotos'],
];

function renderShell() {
  $('#app-title').textContent = t('appName');
  document.title = t('appName');
  $('#settings-link').setAttribute('aria-label', t('navSettings'));
  $('#settings-link').innerHTML = icon('settings');
  $('#lang-toggle').textContent = getLang() === 'ar' ? 'FR' : 'ع';
  $('#lang-toggle').setAttribute('aria-label', t('language'));
  $('#nav').innerHTML = NAV.map(([r, k]) => `<a href="#/${r}" data-route="${r}">${icon(r)}<span>${t(k)}</span></a>`).join('');
  highlightNav();
}

function highlightNav() {
  const r = (location.hash.split('/')[1] || 'home').replace('session', 'workout');
  $$('#nav a').forEach((a) => a.setAttribute('aria-current', a.dataset.route === r ? 'page' : 'false'));
}

function applyLang() {
  setLang(store.get().lang);
  renderShell();
}

function go(hash) {
  if (location.hash === hash) route();
  else location.hash = hash;
}

function route() {
  const [, name = 'home', arg] = location.hash.split('/');
  if (name !== 'session') clearTimers();
  if (name !== 'photos') revokePhotoUrls();
  view().onclick = null;
  view().onchange = null;
  highlightNav();
  const routes = {
    home: renderHome,
    workout: renderWorkout,
    session: () => renderSession(arg),
    meals: renderMeals,
    progress: renderProgress,
    photos: renderPhotos,
    settings: renderSettings,
  };
  (routes[name] || renderHome)();
  window.scrollTo(0, 0);
  view().focus({ preventScroll: true });
}

function init() {
  applyLang();
  $('#lang-toggle').onclick = () => {
    store.setLang(getLang() === 'ar' ? 'fr' : 'ar');
    applyLang();
    route();
  };
  window.addEventListener('hashchange', route);
  if (!location.hash) location.replace('#/home');
  route();

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        nw?.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) toast(t('updateReady'));
        });
      });
    }).catch(() => {});
  }
}

init();
