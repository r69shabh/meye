import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { matchExercise } from '../../exerciseMatch.js';

// Load SmartParser from main.js
let SmartParser;

beforeAll(() => {
    // Setup global mocks
    global.localStorage = { getItem: () => null };
    global.document = { addEventListener: () => {} };
    global.today = new Date('2026-07-26T12:00:00');
    global.formatDateKey = function(d) {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    // Extract SmartParser from main.js
    const mainJsPath = path.resolve(__dirname, '../../main.js');
    const code = fs.readFileSync(mainJsPath, 'utf8');
    const startIndex = code.indexOf('const SmartParser = {');
    const endIndex = code.indexOf('// ============================================', startIndex);

    // Inject it into global scope
    const parserCode = code.substring(startIndex, endIndex).replace('const SmartParser', 'global.SmartParser');
    eval(parserCode);
    SmartParser = global.SmartParser;
    // Same injection main.js does at boot
    SmartParser.exerciseLookup = matchExercise;
});

describe('SmartParser NLP Logic', () => {
    it('should parse a todo with time', () => {
        const res = SmartParser.parse('remind me to buy grocery at 8pm');
        expect(res.type).toBe('todo');
        expect(res.content).toBe('Buy grocery');
        expect(res.reminderTime || res.eventTime).toBe('20:00');
    });

    it('should parse a routine', () => {
        const res = SmartParser.parse('gym');
        expect(res.type).toBe('routine');
        expect(res.content).toBe('Gym');
    });

    it('should parse a note', () => {
        const res = SmartParser.parse('idea for a new app');
        expect(res.type).toBe('note');
        expect(res.content).toBe('Idea for a new app');
    });

    // ── Regression: voice-transcript failure modes ──────────────────

    it('should not mangle mid-sentence discourse words', () => {
        const res = SmartParser.parse('note: I like running');
        expect(res.type).toBe('note');
        expect(res.content).toBe('I like running');
    });

    it('should still strip fillers at the start', () => {
        const res = SmartParser.parse('um so like remind me to call mom tomorrow at 5pm');
        expect(res.content).toBe('Call mom');
        expect(res.date).not.toBe(null);
        expect(res.reminderTime).toBe('17:00');
    });

    it('should assume AM for bare hours with morning cues', () => {
        const res = SmartParser.parse('wake up at 7');
        expect(res.reminderTime).toBe('07:00');
    });

    it('should still assume PM for bare hours without morning cues', () => {
        const res = SmartParser.parse('take meds at 8 every day');
        expect(res.reminderTime).toBe('20:00');
        expect(res.type).toBe('routine');
        expect(res.subItems[0].text).toBe('Take meds');
    });

    it('should prefer one-time todo over daily routine when date/time is explicit', () => {
        const res = SmartParser.parse('yoga class tomorrow at 6');
        expect(res.type).toBe('todo');
        expect(res.date).not.toBe('daily');
        expect(res.reminderTime).toBe('18:00');
    });

    it('should split unpunctuated exercise lists before known exercise names', () => {
        const res = SmartParser.parse('every day leg day: squats 3x12 lunges 3x15');
        expect(res.type).toBe('routine');
        expect(res.subItems).toHaveLength(2);
        expect(res.subItems[0]).toMatchObject({ text: 'Squats', meta: '3x12' });
        expect(res.subItems[1]).toMatchObject({ text: 'Lunges', meta: '3x15' });
    });

    it('should keep modifier words attached to the exercise they modify', () => {
        const res = SmartParser.parse('push day: bench press 4x8 incline press 3x10 tricep dips 12');
        expect(res.subItems).toHaveLength(3);
        expect(res.subItems[0]).toMatchObject({ text: 'Bench press', meta: '4x8' });
        expect(res.subItems[1]).toMatchObject({ text: 'Incline press', meta: '3x10' });
        expect(res.subItems[2].text).toBe('Tricep dips 12');
    });

    it('should parse "add" utterances as todos', () => {
        const res = SmartParser.parse('add milk to grocery list');
        expect(res.type).toBe('todo');
    });
});
