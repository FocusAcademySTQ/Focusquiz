const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const { runInNewContext } = require('node:vm');

const source = readFileSync(require.resolve('../math.js'), 'utf8');

function arithmeticWithOperands(...operands) {
  let index = 0;
  const context = { rng: () => operands[index++ % operands.length] };
  runInNewContext(source, context);
  return context.FocusMathGenerators.arithmetic;
}

test('subtraction of positive operands produces a negative answer only when enabled', () => {
  const arithmetic = arithmeticWithOperands(3, 7);
  assert.ok(arithmetic(1, { ops: ['-'] }).answer >= 0);

  const question = arithmetic(1, { ops: ['-'], allowNegResult: true });
  assert.equal(question.text, '3 - 7 = ?');
  assert.equal(question.answer, -4);
});

test('negative operands and negative results are independent options', () => {
  const arithmetic = arithmeticWithOperands(-3, 7);
  const question = arithmetic(1, { ops: ['×'], allowNeg: true, allowNegResult: true });
  assert.equal(question.answer, -21);
  assert.ok(arithmetic(1, { ops: ['×'], allowNeg: true }).answer >= 0);
});

test('three-operand questions apply the sign restriction to the final answer', () => {
  const arithmetic = arithmeticWithOperands(3, 7, 2);
  const options = { ops: ['-'], tri: true };

  assert.ok(arithmetic(1, options).answer >= 0);
  assert.equal(arithmetic(1, { ...options, allowNegResult: true }).answer, -6);
});
