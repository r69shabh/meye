// Match free-text exercise names ("push ups 3x12" → Push-up) against the
// @bryllim/workout-guide catalog. Pure module: no DOM, unit-testable.
import manifest from '@bryllim/workout-guide/manifest.json' with { type: 'json' };

const ALIASES = {
  curls: 'bicep-curl',
  biceps: 'bicep-curl',
  tricep: 'dip',
  triceps: 'dip',
  'tricep dip': 'dip',
  'tricep dips': 'dip',
  situp: 'decline-sit-up',
  situps: 'decline-sit-up',
  'sit up': 'decline-sit-up',
  'sit ups': 'decline-sit-up',
};

function norm(s) {
  return (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Plural handling is messy English ("burpees"→"burpee", "lunges"→"lunge",
// "crunches"→"crunch"), so generate all plausible singulars and try each.
function singulars(s) {
  const out = [s];
  if (s.endsWith('ies')) out.push(s.slice(0, -3) + 'y');
  if (s.endsWith('es')) { out.push(s.slice(0, -2), s.slice(0, -1)); }
  if (s.endsWith('s') && !s.endsWith('ss')) out.push(s.slice(0, -1));
  return out;
}

// slug/name index, shortest name first so "lunge" prefers the plainest variant
const INDEX = manifest
  .map(e => ({ slug: e.slug, name: e.name, n: norm(e.name) }))
  .sort((a, b) => a.name.length - b.name.length);

const cache = new Map();

export function exerciseThumbUrl(slug, frame = 1) {
  return `/workouts/${slug}/frame-${frame}.png`;
}

export function matchExercise(text) {
  const q = norm(text)
    .replace(/\b\d+\w*\b/g, '')
    .replace(/\b(seconds?|secs?|minutes?|mins?|reps?|sets?|kg|kgs|lbs?|km|mi|miles?)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!q) return null;
  if (cache.has(q)) return cache.get(q);

  const qs = singulars(q);
  const aliasSlug = ALIASES[q] || ALIASES[qs[qs.length - 1]];
  let hit =
    INDEX.find(e => qs.includes(e.n) || e.slug === q.replace(/ /g, '-')) ||
    (aliasSlug ? INDEX.find(e => e.slug === aliasSlug) : null) ||
    qs.map(s => INDEX.find(e => new RegExp(`\\b${s}\\b`).test(e.n))).find(Boolean) ||
    INDEX.find(e => e.n && new RegExp(`\\b${e.n}\\b`).test(q)) ||
    null;

  const result = hit ? { slug: hit.slug, name: hit.name } : null;
  cache.set(q, result);
  return result;
}
