let codeMode = false;
let floatingBtns    = [];   // { clone, rect }
let floatingDisplay = null; // { el, rect, placeholder }
let placedRects     = [];   // collision registry

const calculatorEl  = document.getElementById('calculator');
const calcInner     = document.getElementById('calc-inner');
const modeToggleBtn = document.getElementById('mode-toggle');
const consoleInput  = document.getElementById('console-input');
const consoleOutput = document.getElementById('console-output');
const runBtn        = document.getElementById('console-run');

// ── Toggle ───────────────────────────────────────────────────

function toggleMode() {
  codeMode = !codeMode;
  modeToggleBtn.classList.toggle('active', codeMode);
  if (codeMode) enterCodeMode();
  else          exitCodeMode();
}

// ── Enter code mode ──────────────────────────────────────────

function enterCodeMode() {
  const calcRect  = calculatorEl.getBoundingClientRect();
  const displayEl = calcInner.querySelector('.display');
  const buttons   = Array.from(calcInner.querySelectorAll('.btn'));

  placedRects = [];

  // ── 1. Extract & float the real display element ──
  const dr = displayEl.getBoundingClientRect();

  // Leave an invisible placeholder so calc-inner keeps its shape
  const placeholder = document.createElement('div');
  placeholder.style.cssText = `width:${dr.width}px;height:${dr.height}px;flex-shrink:0;`;
  calcInner.insertBefore(placeholder, displayEl);

  // Snap it fixed at its current screen position
  Object.assign(displayEl.style, {
    position:  'fixed',
    left:      dr.left + 'px',
    top:       dr.top  + 'px',
    width:     dr.width  + 'px',
    height:    dr.height + 'px',
    margin:    '0',
    zIndex:    '201',
    transition:'none',
  });
  document.body.appendChild(displayEl);
  floatingDisplay = { el: displayEl, rect: dr, placeholder };

  // ── 2. Create button clones at original positions ──
  buttons.forEach(btn => {
    const r     = btn.getBoundingClientRect();
    const clone = btn.cloneNode(true);
    // cloneNode copies onclick attrs — already wired up
    Object.assign(clone.style, {
      position: 'fixed',
      left:     r.left   + 'px',
      top:      r.top    + 'px',
      width:    r.width  + 'px',
      height:   r.height + 'px',
      margin:   '0',
      zIndex:   '200',
      transition: 'none',
      cursor:   'pointer',
    });
    document.body.appendChild(clone);
    floatingBtns.push({ clone, rect: r });
  });

  // Hide original buttons (display already removed)
  calcInner.style.visibility = 'hidden';

  // ── 3. Compute non-overlapping targets ──

  // Display first — give it a slight rotation, no more
  const dispTarget = placeNoOverlap(dr.width, dr.height, calcRect);

  // Each button
  const btnTargets = floatingBtns.map(({ rect: r }) =>
    placeNoOverlap(r.width, r.height, calcRect)
  );

  // ── 4. Animate display ──
  requestAnimationFrame(() => requestAnimationFrame(() => {
    Object.assign(displayEl.style, {
      transition: `left .6s cubic-bezier(.25,.8,.25,1),
                   top  .6s cubic-bezier(.25,.8,.25,1),
                   transform .6s ease, opacity .5s ease`,
      left:      dispTarget.x + 'px',
      top:       dispTarget.y + 'px',
      transform: `rotate(${rand(-6, 6)}deg)`,
      opacity:   '0.92',
    });
  }));

  // ── 5. Animate buttons with stagger ──
  floatingBtns.forEach(({ clone }, i) => {
    const tgt = btnTargets[i];
    setTimeout(() => {
      Object.assign(clone.style, {
        transition: `left .55s cubic-bezier(.25,.8,.25,1),
                     top  .55s cubic-bezier(.25,.8,.25,1),
                     transform .55s ease, opacity .4s ease`,
        left:      tgt.x + 'px',
        top:       tgt.y + 'px',
        transform: `rotate(${rand(-24, 24)}deg) scale(.85)`,
        opacity:   '0.82',
      });
    }, i * 18 + 10);
  });

  // ── 6. Slide console in ──
  setTimeout(() => {
    calculatorEl.classList.add('code-mode');
    setTimeout(() => consoleInput.focus(), 520);
  }, 200);
}

// ── Exit code mode ───────────────────────────────────────────

function exitCodeMode() {
  // Slide console out first
  calculatorEl.classList.remove('code-mode');

  setTimeout(() => {
    // Return display
    if (floatingDisplay) {
      const { el, rect } = floatingDisplay;
      Object.assign(el.style, {
        transition: `left .5s cubic-bezier(.4,0,.2,1),
                     top  .5s cubic-bezier(.4,0,.2,1),
                     transform .5s ease, opacity .4s ease`,
        left:      rect.left + 'px',
        top:       rect.top  + 'px',
        transform: 'rotate(0deg)',
        opacity:   '1',
      });
    }

    // Return buttons with stagger
    floatingBtns.forEach(({ clone, rect }, i) => {
      setTimeout(() => {
        Object.assign(clone.style, {
          transition: `left .48s cubic-bezier(.4,0,.2,1),
                       top  .48s cubic-bezier(.4,0,.2,1),
                       transform .48s ease, opacity .35s ease`,
          left:      rect.left + 'px',
          top:       rect.top  + 'px',
          transform: 'rotate(0deg) scale(1)',
          opacity:   '1',
        });
      }, i * 15);
    });

    // After all animations finish: restore DOM
    const done = floatingBtns.length * 15 + 540;
    setTimeout(() => {
      // Move display back into calc-inner
      if (floatingDisplay) {
        const { el, placeholder } = floatingDisplay;
        // Clear all inline styles
        el.removeAttribute('style');
        placeholder.replaceWith(el);
        floatingDisplay = null;
      }

      // Remove button clones
      floatingBtns.forEach(({ clone }) => clone.remove());
      floatingBtns = [];
      placedRects  = [];

      calcInner.style.visibility = '';
    }, done);

  }, 220);
}

// ── Collision-free placement ─────────────────────────────────

function placeNoOverlap(w, h, calcRect) {
  const attempts = 120;
  for (let i = 0; i < attempts; i++) {
    const pos = randomLeftRight(w, h, calcRect);
    if (!overlapsAny(pos.x, pos.y, w, h, 10)) {
      placedRects.push({ x: pos.x, y: pos.y, w, h });
      return pos;
    }
  }
  // Fallback: accept overlap rather than fail
  const pos = randomLeftRight(w, h, calcRect);
  placedRects.push({ x: pos.x, y: pos.y, w, h });
  return pos;
}

function overlapsAny(x, y, w, h, pad) {
  return placedRects.some(o =>
    x < o.x + o.w + pad &&
    x + w + pad > o.x  &&
    y < o.y + o.h + pad &&
    y + h + pad > o.y
  );
}

function randomLeftRight(w, h, calcRect) {
  const vw  = window.innerWidth;
  const vh  = window.innerHeight;
  const gap = 14;

  const leftMax  = calcRect.left  - gap - w;
  const rightMin = calcRect.right + gap;
  const rightMax = vw - w - 6;

  // Determine which sides actually have room
  const hasLeft  = leftMax  > 6;
  const hasRight = rightMax > rightMin;

  let side;
  if (hasLeft && hasRight) side = Math.random() < 0.5 ? 'left' : 'right';
  else if (hasLeft)        side = 'left';
  else                     side = 'right';

  const x = side === 'left'
    ? rand(Math.max(6, calcRect.left - 240), leftMax)
    : rand(rightMin, Math.min(rightMax, calcRect.right + 240));

  const y = rand(6, vh - h - 6);

  return {
    x: Math.max(6, Math.min(vw - w - 6, x)),
    y: Math.max(6, Math.min(vh - h - 6, y)),
  };
}

function rand(min, max) {
  if (min >= max) return min;
  return min + Math.random() * (max - min);
}

// ── C# runner ────────────────────────────────────────────────

consoleInput.addEventListener('input', () => {
  consoleInput.style.height = 'auto';
  consoleInput.style.height = consoleInput.scrollHeight + 'px';
});

consoleInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    runCode();
  }
});

async function runCode() {
  const code = consoleInput.value.trim();
  if (!code || runBtn.disabled) return;

  appendLine('input', '> ' + code);
  consoleInput.value = '';
  consoleInput.style.height = 'auto';

  runBtn.disabled = true;
  const loadingLine = appendLine('info', 'running...');

  try {
    const res = await fetch('https://wandbox.org/api/compile.json', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        compiler: 'mono-6.12.0.199',
        code:     wrapCode(code),
      }),
    });

    loadingLine.remove();

    if (!res.ok) {
      appendLine('error', `Network error: ${res.status} ${res.statusText}`);
      return;
    }

    const data = await res.json();
    const out = data.program_output || '';
    const err = data.compiler_error || '';

    if (out.trim()) out.trimEnd().split('\n').forEach(l => appendLine('output', l));
    if (err.trim()) err.trimEnd().split('\n').forEach(l => appendLine('error',  l));
    if (!out.trim() && !err.trim()) appendLine('info', '(no output)');

  } catch {
    loadingLine.remove();
    appendLine('error', 'Could not reach execution server.');
  } finally {
    runBtn.disabled = false;
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
    consoleInput.focus();
  }
}

function wrapCode(code) {
  if (/\bclass\s+\w+/.test(code)) return code;
  return [
    'using System;',
    'using System.Collections.Generic;',
    'using System.Linq;',
    'class _P {',
    '  static void Main(string[] args) {',
    code.split('\n').map(l => '    ' + l).join('\n'),
    '  }',
    '}',
  ].join('\n');
}

function appendLine(type, text) {
  const line = document.createElement('div');
  line.className   = 'console-line ' + type;
  line.textContent = text;
  consoleOutput.appendChild(line);
  return line;
}

function clearConsole() {
  consoleOutput.innerHTML = '';
}
