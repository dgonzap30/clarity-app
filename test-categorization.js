// Quick test script to verify categorization improvements
import { categorizeTransactionSimple } from './src/lib/categorizer.ts';

const testCases = [
  { description: 'UBER', expected: 'transportation' },
  { description: 'GOOGLE*WORKSPACE THISNU', expected: 'work-ai' },
  { description: 'UW MADISON WISC UNION 0 MADISON', expected: 'school-housing' },
  { description: 'DD *DOORDASHDASHPASS', expected: 'eating-out-delivery' },
  { description: 'TELEFONICA MOVISTAR PEGASO', expected: 'personal' },
  { description: 'ATT MOB', expected: 'personal' },
  { description: 'LEVY@ 2UWM CONC', expected: 'eating-out-delivery' },
  { description: 'MONDAY`S', expected: 'eating-out-delivery' },
  { description: 'THE ORPHEUM THEATER', expected: 'entertainment' },
  { description: 'GOOGLE*YT PRIMETIME', expected: 'entertainment' },
  { description: 'AMAZON MX MARKETPLACE', expected: 'personal' },
  { description: 'United Airlines', expected: 'transportation' },
  { description: 'DELTA AIR LINES', expected: 'transportation' },
  { description: 'Canteen Madison', expected: 'eating-out-delivery' },
];

console.log('Testing categorization improvements:\n');

let passed = 0;
let failed = 0;

for (const test of testCases) {
  const result = categorizeTransactionSimple(test.description);
  const success = result === test.expected;

  if (success) {
    passed++;
    console.log(`✓ "${test.description}" → ${result}`);
  } else {
    failed++;
    console.log(`✗ "${test.description}" → ${result} (expected: ${test.expected})`);
  }
}

console.log(`\nResults: ${passed} passed, ${failed} failed`);
