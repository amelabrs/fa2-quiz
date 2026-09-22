// ── My Body, My Home — quiz data ───────────────────────────────────────
// Each question: { type, prompt, options?, answer, image?, emoji?, hint? }
// type: 'choice' (2-4 buttons), 'truefalse' (✔/✖ buttons), 'type' (typed answer)
// image/emoji: shown above the prompt. Body-part close-ups live in images/
// (hair.png, neck.png, hand.png, knee.png, feet.png).

const QUIZ = [
  {
    section: "Choose the Right Word",
    questions: [
      { type: 'choice', prompt: "We rest and sleep in ___.", options: ['living room', 'bathroom'], answer: 'living room' },
      { type: 'choice', prompt: "A house becomes a ___ when it is filled with love.", options: ['people', 'home'], answer: 'home' },
      { type: 'choice', prompt: "The ___ has eyes, nose, ears, lips and mouth.", options: ['leg', 'head'], answer: 'head' },
      { type: 'choice', prompt: "There are ___ toes on each foot.", options: ['five', 'ten'], answer: 'five' },
    ],
  },
  {
    section: "Match the Sense",
    questions: [
      { type: 'choice', prompt: "This is your nose. Which sense does it help with?", image: 'images/smell.jpg', emoji: '👃', options: ['Feel', 'Smell', 'See', 'Taste'], answer: 'Smell' },
      { type: 'choice', prompt: "This is your eye. Which sense does it help with?", image: 'images/see.jpg', emoji: '👁️', options: ['Feel', 'Smell', 'See', 'Taste'], answer: 'See' },
      { type: 'choice', prompt: "This is your tongue. Which sense does it help with?", image: 'images/taste.jpg', emoji: '👅', options: ['Feel', 'Smell', 'See', 'Taste'], answer: 'Taste' },
      { type: 'choice', prompt: "This is your skin. Which sense does it help with?", image: 'images/feel.jpg', emoji: '✋', options: ['Feel', 'Smell', 'See', 'Taste'], answer: 'Feel' },
    ],
  },
  {
    section: "True or False",
    questions: [
      { type: 'truefalse', prompt: "A house is made of bricks, cement and sand.", answer: true },
      { type: 'truefalse', prompt: "A house protects us from heat and cold.", answer: true },
      { type: 'truefalse', prompt: "Our eyes help us to see.", answer: true },
      { type: 'truefalse', prompt: "A bad touch makes you feel happy.", answer: false },
    ],
  },
  {
    section: "Name the Body Part",
    questions: [
      { type: 'type', prompt: "What part of the body is this?", image: 'images/hair.png', emoji: '💇', answer: ['hair', 'head'], hint: 'It grows on your head' },
      { type: 'type', prompt: "What part of the body is this?", image: 'images/neck.png', emoji: '🧑', answer: ['neck'], hint: 'It joins your head to your body' },
      { type: 'type', prompt: "What part of the body is this?", image: 'images/hand.png', emoji: '✋', answer: ['hand'], hint: 'You wave with it' },
      { type: 'type', prompt: "What part of the body is this?", image: 'images/knee.png', emoji: '🦵', answer: ['knee', 'leg'], hint: 'It bends in the middle of your leg' },
      { type: 'type', prompt: "What part of the body is this?", image: 'images/feet.png', emoji: '🦶', answer: ['feet', 'foot'], hint: 'You stand on these' },
    ],
  },
];

// ── Engine ──────────────────────────────────────────────────────────────
const flat = [];
QUIZ.forEach(sec => sec.questions.forEach(q => flat.push({ ...q, section: sec.section })));

let idx = 0;
let stars = 0;
let locked = false;

const el = id => document.getElementById(id);

function startQuiz() {
  showScreen('quiz-screen');
  idx = 0;
  stars = 0;
  el('stars').textContent = '0';
  renderQuestion();
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  el(id).classList.add('active');
}

function renderQuestion() {
  locked = false;
  const q = flat[idx];

  el('round-info').textContent = `${idx + 1} / ${flat.length}`;
  el('progress-fill').style.width = `${(idx / flat.length) * 100}%`;
  el('section-label').textContent = q.section;
  el('prompt').textContent = q.prompt;

  // media
  const mediaBox = el('media-box');
  const img = el('media-img');
  const emoji = el('media-emoji');
  if (q.image || q.emoji) {
    mediaBox.classList.remove('hidden');
    img.src = q.image || '';
    img.onerror = () => { img.removeAttribute('src'); };
    emoji.textContent = q.emoji || '';
    emoji.style.display = q.image ? 'none' : '';
    img.onload = () => { emoji.style.display = 'none'; };
    if (!q.image) emoji.style.display = '';
  } else {
    mediaBox.classList.add('hidden');
  }

  // feedback + hint reset
  el('feedback').classList.add('hidden');
  el('hint').classList.add('hidden');

  const optionsBox = el('options');
  const typeBox = el('type-answer');
  optionsBox.innerHTML = '';

  if (q.type === 'type') {
    optionsBox.classList.add('hidden');
    typeBox.classList.remove('hidden');
    const input = el('type-input');
    input.value = '';
    input.classList.remove('correct', 'wrong');
    input.disabled = false;
    setTimeout(() => input.focus(), 50);
    input.onkeydown = e => { if (e.key === 'Enter') submitTyped(); };
  } else {
    optionsBox.classList.remove('hidden');
    typeBox.classList.add('hidden');

    if (q.type === 'truefalse') {
      optionsBox.appendChild(makeOptRow([
        { label: '✔️', value: true },
        { label: '✖️', value: false },
      ], q, true));
    } else {
      optionsBox.appendChild(makeOptRow(q.options.map(o => ({ label: o, value: o })), q, false));
    }
  }
}

function makeOptRow(items, q, isTF) {
  const row = document.createElement('div');
  row.className = 'opt-row';
  items.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'opt-btn' + (isTF ? ' tf' : '');
    btn.textContent = item.label;
    btn.onclick = () => choose(item.value, q, btn);
    row.appendChild(btn);
  });
  return row;
}

function choose(value, q, btn) {
  if (locked) return;
  const correct = value === q.answer;
  if (correct) {
    locked = true;
    btn.classList.add('correct', 'disabled');
    Array.from(el('options').querySelectorAll('.opt-btn')).forEach(b => b.classList.add('disabled'));
    stars++;
    el('stars').textContent = stars;
    showFeedback(true);
    setTimeout(nextQuestion, 1100);
  } else {
    btn.classList.add('wrong', 'disabled');
    showFeedback(false);
  }
}

function submitTyped() {
  if (locked) return;
  const q = flat[idx];
  const input = el('type-input');
  const val = input.value.trim().toLowerCase();
  if (!val) return;
  const accepted = Array.isArray(q.answer) ? q.answer.map(a => a.toLowerCase()) : [String(q.answer).toLowerCase()];
  const correct = accepted.includes(val);

  if (correct) {
    locked = true;
    input.classList.remove('wrong');
    input.classList.add('correct');
    input.disabled = true;
    stars++;
    el('stars').textContent = stars;
    showFeedback(true);
    setTimeout(nextQuestion, 1100);
  } else {
    input.classList.remove('correct');
    input.classList.add('wrong');
    if (q.hint) {
      el('hint').textContent = `Hint: ${q.hint}`;
      el('hint').classList.remove('hidden');
    }
    showFeedback(false);
    input.select();
  }
}

function showFeedback(correct) {
  const fb = el('feedback');
  fb.classList.remove('hidden', 'good', 'bad');
  el('feedback-emoji').textContent = correct ? '🎉' : '🤔';
  el('feedback-text').textContent = correct ? 'Great job!' : 'Try again!';
  fb.classList.add(correct ? 'good' : 'bad');
  if (!correct) {
    setTimeout(() => fb.classList.add('hidden'), 900);
  }
}

function nextQuestion() {
  idx++;
  if (idx >= flat.length) {
    el('progress-fill').style.width = '100%';
    el('final-score').textContent = stars;
    el('final-total').textContent = flat.length;
    showScreen('done-screen');
  } else {
    renderQuestion();
  }
}
