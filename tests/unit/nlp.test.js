import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

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
});
