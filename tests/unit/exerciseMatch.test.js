import { describe, it, expect } from 'vitest';
import { matchExercise, exerciseThumbUrl } from '../../exerciseMatch.js';

describe('exerciseMatch', () => {
  it('matches exact names case-insensitively', () => {
    expect(matchExercise('Squats')).toEqual({ slug: 'squat', name: 'Squat' });
    expect(matchExercise('push ups')).toMatchObject({ slug: 'push-up' });
  });

  it('matches plural and irregular forms', () => {
    expect(matchExercise('Burpees')).toMatchObject({ slug: 'burpee' });
    expect(matchExercise('Lunges')).toMatchObject({ slug: expect.stringContaining('lunge') });
    expect(matchExercise('Crunches')).toMatchObject({ slug: 'crunch' });
  });

  it('applies aliases for common variants', () => {
    expect(matchExercise('Curls')).toMatchObject({ slug: 'bicep-curl' });
    expect(matchExercise('Situps')).toMatchObject({ slug: 'decline-sit-up' });
    expect(matchExercise('Tricep dips')).toMatchObject({ slug: 'dip' });
  });

  it('strips numbers, sets/reps and units from text', () => {
    expect(matchExercise('Plank 60 sec')).toMatchObject({ slug: 'plank' });
    expect(matchExercise('Squats 3x15 kg')).toMatchObject({ slug: 'squat' });
  });

  it('matches when query contains the exercise name', () => {
    expect(matchExercise('Hold plank 2 min')).toMatchObject({ slug: 'plank' });
  });

  it('returns null for non-exercises', () => {
    expect(matchExercise('Walk the dog')).toBeNull();
    expect(matchExercise('Meditate')).toBeNull();
    expect(matchExercise('')).toBeNull();
    expect(matchExercise(null)).toBeNull();
  });

  it('builds local thumb URLs', () => {
    expect(exerciseThumbUrl('push-up', 1)).toBe('/workouts/push-up/frame-1.png');
    expect(exerciseThumbUrl('squat', 3)).toBe('/workouts/squat/frame-3.png');
  });
});
