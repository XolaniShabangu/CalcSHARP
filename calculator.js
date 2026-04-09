let currentVal = '0';
let storedVal = null;
let operator = null;
let justEvaluated = false;
let expressionStr = '';

const resultEl = document.getElementById('result');
const expressionEl = document.getElementById('expression');
const acBtn = document.getElementById('btn-ac');
const opBtns = {
  '÷': document.getElementById('btn-div'),
  '×': document.getElementById('btn-mul'),
  '−': document.getElementById('btn-sub'),
  '+': document.getElementById('btn-add'),
};

function updateDisplay() {
  resultEl.textContent = formatNumber(currentVal);
  expressionEl.textContent = expressionStr;

  const len = resultEl.textContent.length;
  resultEl.classList.remove('shrink', 'shrink-more');
  if (len > 12) resultEl.classList.add('shrink-more');
  else if (len > 9) resultEl.classList.add('shrink');

  acBtn.textContent = (currentVal !== '0' || justEvaluated) ? 'C' : 'AC';
}

function formatNumber(val) {
  if (val === 'Error') return 'Error';
  const num = parseFloat(val);
  if (isNaN(num)) return '0';
  const str = parseFloat(num.toPrecision(10)).toString();
  const parts = str.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

function clearOperatorHighlight() {
  Object.values(opBtns).forEach(b => b.classList.remove('active'));
}

function highlightOperator(op) {
  clearOperatorHighlight();
  if (op && opBtns[op]) opBtns[op].classList.add('active');
}

function pressDigit(d) {
  clearOperatorHighlight();
  if (justEvaluated) {
    currentVal = d;
    expressionStr = '';
    justEvaluated = false;
  } else if (currentVal === '0') {
    currentVal = d;
  } else {
    if (currentVal.replace('-', '').replace('.', '').length >= 9) return;
    currentVal += d;
  }
  updateDisplay();
}

function pressDecimal() {
  clearOperatorHighlight();
  if (justEvaluated) {
    currentVal = '0.';
    expressionStr = '';
    justEvaluated = false;
  } else if (!currentVal.includes('.')) {
    currentVal += '.';
  }
  updateDisplay();
}

function pressOperator(op) {
  if (currentVal === 'Error') return;
  justEvaluated = false;

  if (storedVal !== null && operator && !justEvaluated) {
    const res = calculate(parseFloat(storedVal), parseFloat(currentVal), operator);
    currentVal = String(res);
    storedVal = String(res);
    expressionStr = formatNumber(storedVal) + ' ' + op;
  } else {
    storedVal = currentVal;
    expressionStr = formatNumber(currentVal) + ' ' + op;
  }

  operator = op;
  highlightOperator(op);
  justEvaluated = true;
  updateDisplay();
}

function pressEquals() {
  if (operator === null || storedVal === null) {
    expressionStr = '';
    justEvaluated = true;
    updateDisplay();
    return;
  }

  const a = parseFloat(storedVal);
  const b = parseFloat(currentVal);
  expressionStr = formatNumber(storedVal) + ' ' + operator + ' ' + formatNumber(currentVal) + ' =';
  const res = calculate(a, b, operator);
  currentVal = String(res);
  storedVal = null;
  operator = null;
  justEvaluated = true;
  clearOperatorHighlight();
  updateDisplay();
}

function calculate(a, b, op) {
  switch (op) {
    case '+': return roundResult(a + b);
    case '−': return roundResult(a - b);
    case '×': return roundResult(a * b);
    case '÷':
      if (b === 0) { currentVal = 'Error'; return 'Error'; }
      return roundResult(a / b);
    default: return b;
  }
}

function roundResult(n) {
  if (!isFinite(n)) return 'Error';
  return parseFloat(n.toPrecision(10));
}

function pressAC() {
  if (currentVal !== '0' && !justEvaluated) {
    currentVal = '0';
  } else {
    currentVal = '0';
    storedVal = null;
    operator = null;
    expressionStr = '';
    justEvaluated = false;
  }
  clearOperatorHighlight();
  updateDisplay();
}

function pressPlusMinus() {
  if (currentVal === '0' || currentVal === 'Error') return;
  if (currentVal.startsWith('-')) {
    currentVal = currentVal.slice(1);
  } else {
    currentVal = '-' + currentVal;
  }
  updateDisplay();
}

function pressPercent() {
  if (currentVal === 'Error') return;
  const n = parseFloat(currentVal);
  currentVal = String(roundResult(n / 100));
  updateDisplay();
}

document.addEventListener('keydown', e => {
  if (e.key >= '0' && e.key <= '9') pressDigit(e.key);
  else if (e.key === '.') pressDecimal();
  else if (e.key === '+') pressOperator('+');
  else if (e.key === '-') pressOperator('−');
  else if (e.key === '*') pressOperator('×');
  else if (e.key === '/') { e.preventDefault(); pressOperator('÷'); }
  else if (e.key === 'Enter' || e.key === '=') pressEquals();
  else if (e.key === 'Backspace') pressAC();
  else if (e.key === 'Escape') { pressAC(); pressAC(); }
  else if (e.key === '%') pressPercent();
});

updateDisplay();
