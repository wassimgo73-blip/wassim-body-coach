// Local-only persistence. Structured data → localStorage. Photos → IndexedDB (Blobs).
// Nothing here talks to the network.

import { isoDate } from './calc.js';

const KEY = 'wbc:v1';

export const DEFAULT_PROFILE = {
  name: 'وسيم',
  sex: 'male',
  age: 24,
  height: 190,
  weight: 85,
  activity: 'light',
  startDate: isoDate(),
};

function defaults() {
  return {
    version: 1,
    lang: 'ar',
    profile: { ...DEFAULT_PROFILE },
    measurements: [],
    workouts: [],
    walks: [],
    water: {},
    meals: {},
  };
}

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    return sanitize(JSON.parse(raw));
  } catch {
    return defaults();
  }
}

function sanitize(obj) {
  const d = defaults();
  if (!obj || typeof obj !== 'object') return d;
  return {
    ...d,
    lang: obj.lang === 'fr' ? 'fr' : 'ar',
    profile: { ...d.profile, ...(obj.profile || {}) },
    measurements: Array.isArray(obj.measurements) ? obj.measurements : [],
    workouts: Array.isArray(obj.workouts) ? obj.workouts : [],
    walks: Array.isArray(obj.walks) ? obj.walks : [],
    water: obj.water && typeof obj.water === 'object' ? obj.water : {},
    meals: obj.meals && typeof obj.meals === 'object' ? obj.meals : {},
  };
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save', e);
  }
}

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const store = {
  get: () => state,
  setLang(lang) {
    state.lang = lang;
    persist();
  },
  updateProfile(p) {
    state.profile = { ...state.profile, ...p };
    persist();
  },
  addMeasurement({ date, weight, waist }) {
    const entry = {
      id: uid(),
      date,
      weight: weight === '' || weight == null ? null : Number(weight),
      waist: waist === '' || waist == null ? null : Number(waist),
    };
    state.measurements.push(entry);
    state.measurements.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    persist();
    return entry;
  },
  deleteMeasurement(id) {
    state.measurements = state.measurements.filter((m) => m.id !== id);
    persist();
  },
  addWorkout(w) {
    state.workouts.push({ id: uid(), date: isoDate(), ...w });
    persist();
  },
  deleteWorkout(id) {
    state.workouts = state.workouts.filter((w) => w.id !== id);
    persist();
  },
  toggleWalk(date = isoDate()) {
    state.walks = state.walks.includes(date) ? state.walks.filter((d) => d !== date) : [...state.walks, date];
    persist();
  },
  setWater(n, date = isoDate()) {
    state.water[date] = Math.max(0, Math.min(20, n));
    persist();
  },
  toggleMeal(slot, date = isoDate()) {
    const list = state.meals[date] || [];
    state.meals[date] = list.includes(slot) ? list.filter((s) => s !== slot) : [...list, slot];
    persist();
  },
  replaceAll(obj) {
    state = sanitize(obj);
    persist();
  },
  reset() {
    state = defaults();
    try {
      localStorage.removeItem(KEY);
    } catch {}
  },
};

// ---------- Photos (IndexedDB) ----------
const DB_NAME = 'wbc-photos';
const STORE = 'photos';
let dbPromise;

function db() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

async function tx(mode, fn) {
  const d = await db();
  return new Promise((resolve, reject) => {
    const t = d.transaction(STORE, mode);
    const s = t.objectStore(STORE);
    const res = fn(s);
    t.oncomplete = () => resolve(res && 'result' in res ? res.result : undefined);
    t.onerror = () => reject(t.error);
  });
}

export const photos = {
  add: (p) => tx('readwrite', (s) => s.put({ id: uid(), ...p })),
  put: (p) => tx('readwrite', (s) => s.put(p)),
  async all() {
    const list = (await tx('readonly', (s) => s.getAll())) || [];
    return list.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  },
  remove: (id) => tx('readwrite', (s) => s.delete(id)),
  clear: () => tx('readwrite', (s) => s.clear()),
};

/** Resize + compress an image file on-device (max 1080px, JPEG). Returns a Blob. */
export function compressImage(file, max = 1080, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob((b) => (b ? resolve(b) : reject(new Error('encode'))), 'image/jpeg', quality);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('decode'));
    };
    img.src = url;
  });
}

export const blobToDataURL = (blob) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });

export async function dataURLToBlob(url) {
  const res = await fetch(url); // data: URL — decoded locally, no network
  return res.blob();
}
