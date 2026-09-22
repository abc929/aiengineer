/* ============================================================
   AI ENGINEER: LEVEL UP — game engine
   No build step, no dependencies, no server. Pure browser JS.
   ============================================================ */

/* ---------- seeded RNG so every run is a different universe ---------- */
function makeRandom(seed) {
  let s = seed >>> 0;
  const next = () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5;  s >>>= 0;
    return s / 4294967296;
  };
  const R = {
    seed,
    f: next,
    int: (a, b) => a + Math.floor(next() * (b - a + 1)),
    pick: arr => arr[Math.floor(next() * arr.length)],
    shuffle: arr => {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
    sample: (arr, n) => R.shuffle(arr).slice(0, n)
  };
  return R;
}

/* ---------- game state ---------- */
const S = {
  R: null,
  runSeed: 0,
  level: 1,
  qIndex: 0,
  queue: [],
  score: 0,
  streak: 0,
  bestStreak: 0,
  lives: 3,
  correct: 0,
  asked: 0,
  timer: null,
  timeLeft: 0,
  locked: false,
  fingerprints: new Set(),
  log: [],
  earned: [],
  avatar: {
    name: '',
    gender: 'girl',
    hair: 'long',
    hairColor: '#191320',
    skin: '#7a4a28',
    outfit: '#7c3aed',
    gear: {}
  }
};

const QUESTIONS_PER_LEVEL = n => Math.min(3 + Math.floor(n / 2), 7);
const TIME_FOR_LEVEL = n => Math.max(40 - n * 2, 20);

/* ---------- build a fresh, non-repeating queue for a level ---------- */
function buildQueue(levelNum) {
  const L = window.LEVELS[levelNum - 1];
  const want = QUESTIONS_PER_LEVEL(levelNum);
  const out = [];
  let guard = 0;

  // Callback questions: from level 4 onward, mix in earlier levels so you
  // can never coast on one topic.
  const pool = L.gens.map(g => ({ g, from: levelNum }));
  if (levelNum >= 4 && levelNum < 10) {
    const earlier = S.R.sample(window.LEVELS.slice(0, levelNum - 1), 2);
    earlier.forEach(e => {
      const g = S.R.pick(e.gens);
      pool.push({ g, from: e.n });
    });
  }
  if (levelNum === 10) {
    window.LEVELS.slice(0, 9).forEach(e => pool.push({ g: S.R.pick(e.gens), from: e.n }));
  }

  const order = S.R.shuffle(pool);
  let i = 0;
  while (out.length < want && guard < 300) {
    guard++;
    const item = order[i % order.length]; i++;
    const q = item.g(S.R);
    const fp = (q.text || '').slice(0, 80);
    if (S.fingerprints.has(fp)) continue;   // never repeat a question in one run
    S.fingerprints.add(fp);
    q.from = item.from;
    out.push(prepare(q));
  }
  return out;
}

/* ---------- normalize + shuffle each question ---------- */
function prepare(q) {
  if (q.type === 'mc') {
    q.options = S.R.shuffle(q.choices.map(c => ({ t: c.t, ok: !!c.ok })));
  } else if (q.type === 'tf') {
    q.options = [{ t: 'True', ok: q.answer === true }, { t: 'False', ok: q.answer === false }];
  } else if (q.type === 'order') {
    let sh = S.R.shuffle(q.steps);
    if (sh.join('|') === q.steps.join('|')) sh = S.R.shuffle(q.steps);
    q.shuffled = sh;
    q.picked = [];
  }
  return q;
}

/* ---------- DOM helpers ---------- */
const $ = id => document.getElementById(id);
const el = (tag, cls, txt) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (txt !== undefined) e.textContent = txt;
  return e;
};

/* ---------- screens ---------- */
function show(screen) {
  ['screen-start', 'screen-creator', 'screen-game', 'screen-level', 'screen-reward', 'screen-over', 'screen-cert']
    .forEach(s => $(s).classList.add('hidden'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
  $(screen).classList.remove('hidden');
}

function startRun(seedInput) {
  const seed = seedInput || (Date.now() ^ Math.floor(Math.random() * 1e9));
  S.runSeed = seed >>> 0;
  S.R = makeRandom(S.runSeed);
  S.level = 1; S.score = 0; S.streak = 0; S.bestStreak = 0;
  S.lives = 3; S.correct = 0; S.asked = 0; S.log = [];
  S.fingerprints = new Set();
  S.earned = [];
  S.avatar.gear = {};          // gear is earned fresh each run
  startLevel();
}

function startLevel() {
  S.queue = buildQueue(S.level);
  S.qIndex = 0;
  const L = window.LEVELS[S.level - 1];
  $('level-badge').textContent = L.n === 10 ? 'FINAL LEVEL' : `Level ${L.n}`;
  $('level-title').textContent = L.title;
  $('level-principle').textContent = L.principle;
  paintAvatar('game-avatar', 66);
  $('game-avatar-name').textContent = S.avatar.name || 'You';
  show('screen-game');
  renderQuestion();
}

/* ---------- rendering a question ---------- */
function renderQuestion() {
  S.locked = false;
  const q = S.queue[S.qIndex];
  const L = window.LEVELS[S.level - 1];

  $('hud-level').textContent = `L${S.level}/10`;
  $('hud-score').textContent = S.score;
  $('hud-streak').textContent = `🔥 ${S.streak}`;
  $('hud-lives').textContent = '❤️'.repeat(Math.max(S.lives, 0)) || '💀';
  $('q-counter').textContent = `Question ${S.qIndex + 1} of ${S.queue.length}`;
  $('q-progress').style.width = `${(S.qIndex / S.queue.length) * 100}%`;

  const tag = $('q-tag');
  if (q.from && q.from !== S.level) {
    tag.textContent = `↩ callback to Week ${q.from}`;
    tag.classList.remove('hidden');
  } else {
    tag.classList.add('hidden');
  }

  $('q-text').textContent = q.text;
  $('feedback').className = 'feedback hidden';
  $('feedback').innerHTML = '';
  $('next-btn').classList.add('hidden');

  const box = $('answers');
  box.innerHTML = '';

  if (q.type === 'order') {
    $('q-hint').textContent = 'Click the steps in the correct order.';
    const tray = el('div', 'tray');
    const slot = el('div', 'slot');
    slot.id = 'order-slot';
    q.shuffled.forEach((step, i) => {
      const b = el('button', 'chip', step);
      b.onclick = () => {
        if (S.locked || b.disabled) return;
        b.disabled = true;
        q.picked.push(step);
        const s = el('div', 'slot-item', `${q.picked.length}. ${step}`);
        slot.appendChild(s);
        if (q.picked.length === q.steps.length) {
          const ok = q.picked.join('|') === q.steps.join('|');
          judge(ok, q);
        }
      };
      tray.appendChild(b);
    });
    const reset = el('button', 'reset-btn', '↺ Start over');
    // Starting over must NOT refill the clock — no free time exploit.
    reset.onclick = () => {
      if (S.locked) return;
      const carry = S.timeLeft;
      q.picked = [];
      renderQuestion();
      S.timeLeft = carry;
      paintTimer();
    };
    box.appendChild(slot);
    box.appendChild(tray);
    box.appendChild(reset);
  } else {
    $('q-hint').textContent = q.type === 'tf' ? 'True or false?' : 'Pick the best answer.';
    q.options.forEach(opt => {
      const b = el('button', 'answer', opt.t);
      b.onclick = () => {
        if (S.locked) return;
        [...box.children].forEach(c => c.classList.add('dim'));
        b.classList.remove('dim');
        b.classList.add(opt.ok ? 'right' : 'wrong');
        if (!opt.ok) {
          [...box.children].forEach((c, i) => { if (q.options[i].ok) c.classList.add('right'); });
        }
        judge(opt.ok, q);
      };
      box.appendChild(b);
    });
  }

  startTimer();
}

/* ---------- timer ---------- */
function startTimer() {
  clearInterval(S.timer);
  S.timeLeft = TIME_FOR_LEVEL(S.level);
  paintTimer();
  S.timer = setInterval(() => {
    S.timeLeft--;
    paintTimer();
    if (S.timeLeft <= 0) {
      clearInterval(S.timer);
      if (!S.locked) judge(false, S.queue[S.qIndex], true);
    }
  }, 1000);
}
function paintTimer() {
  const total = TIME_FOR_LEVEL(S.level);
  $('timer-text').textContent = `${S.timeLeft}s`;
  const bar = $('timer-bar');
  bar.style.width = `${(S.timeLeft / total) * 100}%`;
  bar.className = 'timer-bar' + (S.timeLeft <= 5 ? ' danger' : '');
}

/* ---------- scoring ---------- */
function judge(ok, q, timedOut) {
  S.locked = true;
  clearInterval(S.timer);
  S.asked++;

  // On a timeout nobody clicked, so reveal the right answer.
  if (timedOut && q.type !== 'order') {
    const kids = [...$('answers').children];
    kids.forEach((c, i) => {
      c.classList.add('dim');
      if (q.options[i] && q.options[i].ok) { c.classList.remove('dim'); c.classList.add('right'); }
    });
  }

  const base = 100 * S.level;
  const speed = Math.round((S.timeLeft / TIME_FOR_LEVEL(S.level)) * 50 * S.level);
  const streakBonus = S.streak * 25;

  if (ok) {
    S.correct++;
    S.streak++;
    S.bestStreak = Math.max(S.bestStreak, S.streak);
    S.score += base + speed + streakBonus;
  } else {
    // Running out of time breaks your streak but does NOT cost a life.
    // Only a genuinely wrong answer costs a life.
    S.streak = 0;
    if (!timedOut) S.lives--;
  }

  S.log.push({ level: S.level, text: q.text, ok });

  const fb = $('feedback');
  fb.className = 'feedback ' + (ok ? 'good' : 'bad');
  const head = el('div', 'fb-head', ok
    ? S.streak >= 3 ? `Correct — ${S.streak} in a row! +${base + speed + streakBonus}` : `Correct! +${base + speed + streakBonus}`
    : timedOut ? 'Out of time — streak reset, but no life lost.' : 'Not quite. −1 life.');
  const body = el('div', 'fb-body', q.explain);
  fb.appendChild(head);
  fb.appendChild(body);
  fb.classList.remove('hidden');

  if (q.type === 'order' && !ok) {
    const right = el('div', 'fb-body', 'Correct order: ' + q.steps.map((s, i) => `${i + 1}. ${s}`).join('  →  '));
    fb.appendChild(right);
  }

  $('hud-score').textContent = S.score;
  $('hud-streak').textContent = `🔥 ${S.streak}`;
  $('hud-lives').textContent = '❤️'.repeat(Math.max(S.lives, 0)) || '💀';

  if (S.lives <= 0) {
    setTimeout(() => gameOver(false), 900);
    return;
  }
  const nb = $('next-btn');
  nb.classList.remove('hidden');
  nb.textContent = (S.qIndex + 1 >= S.queue.length)
    ? (S.level === 10 ? 'Finish →' : 'Complete level →')
    : 'Next →';
  nb.focus();
}

function nextQuestion() {
  S.qIndex++;
  if (S.qIndex >= S.queue.length) {
    if (S.level === 10) { gameOver(true); return; }
    levelComplete();
    return;
  }
  renderQuestion();
}

/* ============================================================
   CHARACTER CREATOR
   ============================================================ */
const AV = () => window.AVATAR_SYS;

/* Drawing must never be able to blank the screen. If the art fails,
   the game keeps running and the space simply stays empty. */
function paintAvatar(targetId, size) {
  const t = $(targetId);
  if (!t) return;
  try {
    t.innerHTML = AV().renderAvatar(S.avatar, size || 150);
  } catch (e) {
    t.innerHTML = '<div style="padding:18px;color:#a89cc8;font-size:13px">🙂</div>';
    console.error('Avatar draw failed:', e);
  }
}

function buildCreator() {
  const A = S.avatar, sys = AV();

  const swatchRow = (containerId, list, key, isColor) => {
    const box = $(containerId);
    box.innerHTML = '';
    list.forEach(item => {
      const b = el('button', 'swatch');
      if (isColor) {
        b.style.background = item.hex;
        b.title = item.name;
        if (A[key] === item.hex) b.classList.add('sel');
        b.onclick = () => { A[key] = item.hex; buildCreator(); paintAvatar('creator-avatar', 170); };
      } else {
        b.classList.add('wide');
        b.textContent = item.label || item.name;
        if (A[key] === item.id) b.classList.add('sel');
        b.onclick = () => {
          A[key] = item.id;
          if (key === 'gender') A.hair = item.hair;   // sensible default, changeable below
          buildCreator(); paintAvatar('creator-avatar', 170);
        };
      }
      box.appendChild(b);
    });
  };

  swatchRow('pick-gender', sys.GENDERS, 'gender', false);
  swatchRow('pick-hairstyle', sys.HAIRSTYLES, 'hair', false);
  swatchRow('pick-skin', sys.SKINS, 'skin', true);
  swatchRow('pick-haircolor', sys.HAIRCOLORS, 'hairColor', true);
  swatchRow('pick-outfit', sys.OUTFITS, 'outfit', true);
}

function openCreator() {
  // Show the screen FIRST, so even if something below fails the player
  // is never left staring at a blank page.
  show('screen-creator');
  try {
    const saved = localStorage.getItem('ai-levelup-avatar');
    if (saved) { try { Object.assign(S.avatar, JSON.parse(saved)); S.avatar.gear = {}; } catch (e) {} }
    $('cc-name').value = S.avatar.name || '';
    buildCreator();
    paintAvatar('creator-avatar', 170);
  } catch (e) {
    fatal('The character creator could not load.', e);
  }
}

function confirmCreator() {
  S.avatar.name = ($('cc-name').value || '').trim().slice(0, 28);
  const keep = Object.assign({}, S.avatar); keep.gear = {};
  localStorage.setItem('ai-levelup-avatar', JSON.stringify(keep));
  startRun();
}

function randomizeLook() {
  const sys = AV(), r = a => a[Math.floor(Math.random() * a.length)];
  const g = r(sys.GENDERS);
  S.avatar.gender = g.id;
  S.avatar.hair = r(sys.HAIRSTYLES).id;
  S.avatar.skin = r(sys.SKINS).hex;
  S.avatar.hairColor = r(sys.HAIRCOLORS).hex;
  S.avatar.outfit = r(sys.OUTFITS).hex;
  buildCreator();
  paintAvatar('creator-avatar', 170);
}

/* ---------- level complete + GEAR DROP ---------- */
function levelComplete() {
  const L = window.LEVELS[S.level - 1];
  $('lc-title').textContent = `Level ${L.n} cleared — ${L.title}`;
  $('lc-principle').textContent = L.principle;
  $('lc-score').textContent = S.score.toLocaleString();
  $('lc-lives').textContent = '❤️'.repeat(S.lives);
  const next = window.LEVELS[S.level];
  $('lc-next').textContent = `Next up: Level ${next.n} — ${next.title}`;

  if (S.lives < 3 && S.bestStreak >= 4) {
    S.lives++;
    $('lc-bonus').textContent = '🎁 Streak bonus: +1 life';
    $('lc-bonus').classList.remove('hidden');
  } else {
    $('lc-bonus').classList.add('hidden');
  }

  /* Offer two pieces of gear at random from this level's drop table */
  const sys = AV();
  const pool = (sys.REWARDS[S.level] || []).filter(id => !S.earned.includes(id));
  const offer = S.R.sample(pool.length >= 2 ? pool : (sys.REWARDS[S.level] || []), 2);

  const box = $('lc-rewards');
  box.innerHTML = '';
  if (!offer.length) {
    const b = el('button', 'btn', 'Continue →');
    b.onclick = () => { S.level++; startLevel(); };
    box.appendChild(b);
  } else {
    offer.forEach(id => {
      const item = sys.GEAR[id];
      const card = el('button', 'gear-card');
      card.innerHTML =
        `<div class="gear-art">${sys.renderGearPreview(id, S.avatar)}</div>
         <div class="gear-name">${item.name}</div>
         <div class="gear-slot">${item.slot}</div>
         <div class="gear-blurb">${item.blurb}</div>
         <div class="gear-cta">Equip &amp; continue →</div>`;
      card.onclick = () => {
        S.avatar.gear[item.slot] = id;
        S.earned.push(id);
        S.level++;
        startLevel();
      };
      box.appendChild(card);
    });
  }
  paintAvatar('lc-avatar', 130);
  show('screen-level');
}

/* ---------- game over ---------- */
function gameOver(won) {
  clearInterval(S.timer);

  /* BOSS DROP: clearing Level 10 always crowns you. */
  if (won) {
    S.avatar.gear.head = 'crown';
    if (!S.earned.includes('crown')) S.earned.push('crown');
  }

  const pct = S.asked ? Math.round((S.correct / S.asked) * 100) : 0;
  $('go-title').textContent = won ? '👑 YOU BEAT THE CAPSTONE' : 'Run over';
  $('go-sub').textContent = won
    ? 'All 10 levels cleared. The Capstone Crown is yours — claim your certificate below.'
    : `You made it to Level ${S.level}: ${window.LEVELS[S.level - 1].title}.`;
  paintAvatar('go-avatar', 140);
  $('go-crowned').classList.toggle('hidden', !won);
  $('go-cert-btn').classList.toggle('hidden', !won);

  const gearList = $('go-gear');
  gearList.innerHTML = '';
  if (S.earned.length) {
    $('go-gear-wrap').classList.remove('hidden');
    S.earned.forEach(id => gearList.appendChild(el('span', 'gear-pill', AV().GEAR[id].name)));
  } else {
    $('go-gear-wrap').classList.add('hidden');
  }
  $('go-score').textContent = S.score.toLocaleString();
  $('go-acc').textContent = `${pct}%`;
  $('go-streak').textContent = S.bestStreak;
  $('go-level').textContent = `${S.level}/10`;

  const best = Number(localStorage.getItem('ai-levelup-best') || 0);
  if (S.score > best) {
    localStorage.setItem('ai-levelup-best', String(S.score));
    $('go-best').textContent = 'NEW HIGH SCORE!';
  } else {
    $('go-best').textContent = `Best: ${best.toLocaleString()}`;
  }

  const weak = {};
  S.log.filter(l => !l.ok).forEach(l => { weak[l.level] = (weak[l.level] || 0) + 1; });
  const list = $('go-weak');
  list.innerHTML = '';
  const entries = Object.entries(weak).sort((a, b) => b[1] - a[1]).slice(0, 3);
  if (entries.length) {
    $('go-weak-wrap').classList.remove('hidden');
    entries.forEach(([lvl, n]) => {
      const L = window.LEVELS[Number(lvl) - 1];
      list.appendChild(el('li', null, `Level ${L.n} ${L.title} — ${L.principle} (${n} missed)`));
    });
  } else {
    $('go-weak-wrap').classList.add('hidden');
  }

  $('go-seed').textContent = S.runSeed;
  show('screen-over');
}

/* ============================================================
   CERTIFICATE (boss reward)
   ============================================================ */
function showCertificate() {
  const pct = S.asked ? Math.round((S.correct / S.asked) * 100) : 0;
  const name = S.avatar.name || 'AI Engineer';
  const d = new Date();
  const date = d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  $('cert-name').textContent = name;
  $('cert-date').textContent = date;
  $('cert-score').textContent = S.score.toLocaleString();
  $('cert-acc').textContent = `${pct}%`;
  $('cert-streak').textContent = S.bestStreak;
  $('cert-avatar').innerHTML = AV().renderAvatar(S.avatar, 150);

  const list = $('cert-levels');
  list.innerHTML = '';
  window.LEVELS.forEach(L => list.appendChild(el('li', null, `Level ${L.n} — ${L.title}`)));

  const gear = $('cert-gear');
  gear.textContent = S.earned.map(id => AV().GEAR[id].name).join(' · ');

  show('screen-cert');
}

/* ============================================================
   FAILSAFE — never show a blank screen
   ============================================================ */
function fatal(msg, err) {
  const box = $('boot-error');
  if (!box) { alert(msg); return; }
  $('boot-error-msg').textContent = msg;
  $('boot-error-detail').textContent = err ? String(err.message || err) : '';
  box.classList.remove('hidden');
  console.error(msg, err);
}

/* If a script is missing (a partial download, or a stale cached page),
   say exactly which one instead of dying quietly. */
function checkDependencies() {
  const missing = [];
  if (typeof window.LEVELS === 'undefined') missing.push('questions.js');
  if (typeof window.AVATAR_SYS === 'undefined') missing.push('avatar.js');
  if (missing.length) {
    fatal(
      `Missing game file${missing.length > 1 ? 's' : ''}: ${missing.join(' and ')}. ` +
      `All of index.html, questions.js, avatar.js and game.js must sit in the same folder. ` +
      `If you just re-downloaded them, hard-refresh this page (Ctrl+Shift+R, or Cmd+Shift+R on a Mac).`
    );
    return false;
  }
  return true;
}

window.addEventListener('error', e => {
  if ($('screen-start') && $('boot-error') && $('boot-error').classList.contains('hidden')) {
    fatal('Something went wrong while running the game.', e.error || e);
  }
});

/* ---------- wiring ---------- */
window.addEventListener('DOMContentLoaded', () => {
  if (!checkDependencies()) return;
  const best = Number(localStorage.getItem('ai-levelup-best') || 0);
  if (best) $('start-best').textContent = `Best score: ${best.toLocaleString()}`;

  const map = window.LEVELS.map(L =>
    `<li><b>L${L.n}</b> ${L.title}<em>${L.n === 10 ? '👑 crown + certificate' : 'unlock gear'}</em></li>`).join('');
  $('start-map').innerHTML = map;

  $('play-btn').onclick = openCreator;
  $('next-btn').onclick = nextQuestion;
  $('cc-start').onclick = confirmCreator;
  $('cc-random').onclick = randomizeLook;
  $('cc-back').onclick = () => show('screen-start');
  $('go-again').onclick = openCreator;
  $('go-home').onclick = () => show('screen-start');
  $('go-cert-btn').onclick = showCertificate;
  $('cert-print').onclick = () => window.print();
  $('cert-back').onclick = () => show('screen-over');
  $('quit-btn').onclick = () => { clearInterval(S.timer); show('screen-start'); };

  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !$('next-btn').classList.contains('hidden')) nextQuestion();
    if (/^[1-4]$/.test(e.key)) {
      const btns = [...document.querySelectorAll('#answers .answer')];
      const b = btns[Number(e.key) - 1];
      if (b) b.click();
    }
  });
});
