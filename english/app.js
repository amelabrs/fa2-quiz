// ── Tina's Friends — quiz data ─────────────────────────────────────────
// Each question: { type, prompt, options?, answer, image?, emoji?, hint? }
// type: 'choice' (2-3 buttons), 'truefalse' (✔/✖ buttons), 'type' (typed answer)
// image/emoji: shown above the prompt. Real photos live in images/ (cat.jpg,
// elephant.jpg, stick.jpg, vet.jpg) and replace the emoji automatically.

const QUIZ = [
  {
    section: "Choose the Right Word",
    questions: [
      { type: 'choice', prompt: "All of Tina's friends have ___.", options: ['toys', 'pets'], answer: 'pets' },
      // GUESS — confirm against the story: parakeets are usually red/green/yellow
      { type: 'choice', prompt: "Manoj's parakeet is of red, green and ___ colour.", options: ['black', 'yellow'], answer: 'yellow' },
      // GUESS — inferred from "friends have pets" / "wanted a tiger" being false
      { type: 'choice', prompt: "Tina wanted to have a ___.", options: ['pet', 'friend'], answer: 'pet' },
      { type: 'choice', prompt: "Nalini's dog is called ___.", options: ['Tangy', 'Bingy'], answer: 'Tangy' },
    ],
  },
  {
    section: "True or False",
    questions: [
      { type: 'truefalse', prompt: "The parakeet is grey in colour.", answer: false },
      { type: 'truefalse', prompt: "The parakeet is called Coco.", answer: false },
      { type: 'truefalse', prompt: "Boats sail across the sky.", answer: false },
      { type: 'truefalse', prompt: "Tina wanted a tiger.", answer: false },
    ],
  },
  {
    section: "Am, Is or Are?",
    questions: [
      { type: 'choice', prompt: "I ___ going to the market.", options: ['am', 'is', 'are'], answer: 'am' },
      { type: 'choice', prompt: "She ___ my friend.", options: ['am', 'is', 'are'], answer: 'is' },
      { type: 'choice', prompt: "We ___ going to study.", options: ['am', 'is', 'are'], answer: 'are' },
      { type: 'choice', prompt: "My friends ___ coming today.", options: ['am', 'is', 'are'], answer: 'are' },
    ],
  },
  {
    section: "Describe the Picture",
    questions: [
      { type: 'choice', prompt: "It is a ___ cat.", image: 'images/cat.jpg', emoji: '🐱', options: ['thin', 'fat'], answer: 'fat' },
      { type: 'choice', prompt: "It is a ___ elephant.", image: 'images/elephant.jpg', emoji: '🐘', options: ['tiny', 'large'], answer: 'large' },
      { type: 'choice', prompt: "It is a ___ stick.", image: 'images/stick.jpg', emoji: '🥢', options: ['long', 'short'], answer: 'long' },
    ],
  },
  {
    section: "Who Am I?",
    questions: [
      { type: 'type', prompt: "What type of doctor is shown in the picture?", image: 'images/vet.jpg', emoji: '🐾', answer: ['vet', 'veterinarian'], hint: 'Takes care of sick animals' },
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
