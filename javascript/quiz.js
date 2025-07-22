// Questions array
const data = [
  {question: "What is the biggest state in Nigeria?", a: "Lagos", b: "Niger", c: "Abuja", d: "Kaduna", correct: "b"},
  {question: "What is the most populated state in Nigeria?", a: "Lagos", b: "Ibadan", c: "Abuja", d: "Kaduna", correct: "a"},
  {question: "What is the capital of Nigeria?", a: "Lagos", b: "Ibadan", c: "Abuja", d: "Kaduna", correct: "c"},
  {question: "What is your tutor's name?", a: "Mr Tayo", b: "Mr Lanre", c: "Mr Michael", d: "I don't know", correct: "a"},
  {question: "What is the function of css?", a: "To style your project", b: "I don't know", c: "To give functionality", d: "To save data", correct: "a"},
  {question: "What is the work of js?", a: "To give answer", b: "To style your project", c: "To give functionality", d: "To design", correct: "c"},
  {question: "Javascript is the same as Java", a: "True", b: "False", correct: "b"},
  {question: "What is the odd one out?", a: "Html", b: "Css", c: "Java", d: "Javascript", correct: "c"},
  {question: "Front-end is made for Java?", a: "True", b: "False", correct: "b"},
  {question: "Webapplication is the same as webpage?", a: "True", b: "False", correct: "b"}
];

// Get elements
let quiz = document.getElementById('quiz');
let questionEl = document.getElementById('question');
let answerEls = document.querySelectorAll('.answer');
let labels = {};
"abcdefghij".split("").forEach(l => labels[l] = document.getElementById(l+"_text"));
let timerEl = document.getElementById('timer');
let nextBtn = document.getElementById('next');
let prevBtn = document.getElementById('prev');
let progressBar = document.getElementById('progress-bar');


// Quiz state
let currentQuiz = 0, score = 0, timer, baseTime = 5, maxTime = 10, totalTime = baseTime, timeLeft = totalTime;
let userAnswers = Array(data.length).fill(null), answeredStatus = Array(data.length).fill(null);
const startScreen = document.getElementById('start-screen'), startBtn = document.getElementById('start-btn');

// Start button event
startBtn.addEventListener('click', () => {
  startScreen.style.display = 'none';
  quiz.style.display = 'block';
  loadQuiz();
});


function loadQuiz() {
  clearInterval(timer);
  deselectAnswers();
  resetLabelColors();
  let q = data[currentQuiz];
  questionEl.innerText = q.question;
  Object.keys(labels).forEach(k => {
    if (q[k]) {
      labels[k].innerText = q[k];
      labels[k].parentElement.style.display = 'block';
    } else {
      labels[k].innerText = '';
      labels[k].parentElement.style.display = 'none';
      let el = document.getElementById(k);
      if (el) el.checked = false;
    }
  });
  updateProgressBar();
  let selected = userAnswers[currentQuiz];
  if (selected && document.getElementById(selected)) document.getElementById(selected).checked = true;
  prevBtn.disabled = currentQuiz === 0 || userAnswers[currentQuiz] === null;
  answerEls.forEach(i => i.disabled = false);
  startTimer();
}
// Add styles for progress indicator
if (!document.getElementById('quiz-progress-style')) {
  const style = document.createElement('style');
  style.id = 'quiz-progress-style';
  style.innerHTML = `
    .progress-indicator { display: flex; gap: 8px; justify-content: center; margin-bottom: 10px; }
    .progress-dot { width: 18px; height: 18px; border-radius: 50%; background: #ccc; display: inline-block; border: 2px solid #bbb; transition: background 0.2s, border 0.2s; }
    .progress-dot.current { background: #e74c3c; border-color: #e74c3c; }
    .progress-dot.answered { background: #27ae60; border-color: #27ae60; }
    .progress-dot.unanswered { background: #ccc; border-color: #bbb; }
    .progress-dot:hover { box-shadow: 0 0 0 2px #888; cursor: pointer; }
  `;
  document.head.appendChild(style);
}

function updateProgressBar() {
  let bar = '<div class="progress-indicator">';
  for (let i = 0; i < data.length; i++) {
    let cls = 'progress-dot ';
    if (i === currentQuiz) cls += 'current';
    else if (userAnswers[i]) cls += 'answered';
    else cls += 'unanswered';
    bar += `<span class="${cls}" data-idx="${i}"></span>`;
  }
  bar += '</div>';
  progressBar.innerHTML = bar + `<div style="text-align:center">Question ${currentQuiz + 1} of ${data.length}</div>`;
  // Add click to jump to question
  document.querySelectorAll('.progress-dot').forEach(dot => {
    dot.onclick = function() {
      let idx = +this.getAttribute('data-idx');
      if (idx === currentQuiz) return;
      if (userAnswers[currentQuiz] === null && idx < currentQuiz) return alert("You must answer the current question before going back.");
      clearInterval(timer);
      currentQuiz = idx;
      totalTime = baseTime;
      timeLeft = totalTime;
      loadQuiz();
    };
  });
}

const deselectAnswers = () => answerEls.forEach(el => el.checked = false);

const getSelected = () => {
  let ans = null;
  answerEls.forEach(el => { if (el.checked) ans = el.id; });
  return ans;
};

const resetLabelColors = () => Object.values(labels).forEach(l => l.classList.remove('correct','wrong','greyed'));

function showAnswerFeedback(selected, correct) {
  resetLabelColors();
  if (!selected) {
    Object.entries(labels).forEach(([k, l]) => {
      if (k === correct) l.classList.add('correct');
      else if (l.parentElement.style.display === 'block') l.classList.add('greyed');
    });
  } else {
    if (selected === correct) labels[selected].classList.add('correct');
    else {
      labels[selected].classList.add('wrong');
      labels[correct].classList.add('correct');
    }
  }
}

function startTimer() {
  timeLeft = totalTime;
  timerEl.innerText = `Time Left: ${timeLeft}s`;
  timer = setInterval(() => {
    timerEl.innerText = `Time Left: ${--timeLeft}s`;
    if (timeLeft <= 0) { clearInterval(timer); handleNext(true); }
  }, 1000);
}

function handleNext(autoAdvance = false) {
  clearInterval(timer);
  const selected = getSelected(), correct = data[currentQuiz].correct;
  if (!autoAdvance && selected) userAnswers[currentQuiz] = selected;
  let status = 'none';
  if (selected) {
    if (selected === correct) {
      if (answeredStatus[currentQuiz] !== 'correct') score++;
      status = 'correct';
    } else status = 'wrong';
  }
  answeredStatus[currentQuiz] = status;
  showAnswerFeedback(selected, correct);
  setTimeout(() => {
    totalTime = Math.min(maxTime, baseTime + Math.max(0, timeLeft));
    timeLeft = totalTime;
    currentQuiz++;
    if (currentQuiz < data.length) loadQuiz();
    else showResults();
  }, 1000);
}

function handlePrevious() {
  if (userAnswers[currentQuiz] === null) return alert("You must answer the current question before going back.");
  if (currentQuiz > 0) {
    clearInterval(timer);
    currentQuiz--;
    totalTime = baseTime;
    timeLeft = totalTime;
    loadQuiz();
  }
}

function showResults() {
  let p = (score / data.length) * 100, remark = p === 100 ? 'Excellent! Perfect score!' : p >= 75 ? 'Great job! You did well.' : p >= 50 ? 'Not bad, but you can do better.' : 'Better luck next time.';
  quiz.innerHTML = `<h2>You answered ${score} out of ${data.length} questions correctly.</h2><h3>${remark}</h3><button id="restart-btn">Restart Quiz</button>`;
  document.getElementById('restart-btn').onclick = () => {
    currentQuiz = score = 0;
    userAnswers = Array(data.length).fill(null);
    answeredStatus = Array(data.length).fill(null);
    totalTime = baseTime; timeLeft = totalTime;
    quiz.style.display = 'none';
    startScreen.style.display = 'block';
    quiz.innerHTML = `<div id="progress-bar"></div><div class="quiz-header"><h2 id="timer">Time Left: 5s</h2><h2 id="question">Question text</h2><ul>${"abcdefghij".split("").map(l=>`<li><input type=\"radio\" class=\"answer\" name=\"answer\" id=\"${l}\" /><label for=\"${l}\" id=\"${l}_text\">Answer ${l.toUpperCase()}</label></li>`).join("")}</ul></div><button id="prev" disabled>Previous</button><button id="next" disabled>Next</button>`;
    reinitializeQuizElements();
  };
}

// Next button always disabled; selection advances automatically
nextBtn.disabled = true;
prevBtn.addEventListener('click', handlePrevious);
answerEls.forEach(el => el.addEventListener('change', () => {
  let selected = getSelected();
  if (!selected) return;
  answerEls.forEach(i => i.disabled = true);
  clearInterval(timer);
  let correct = data[currentQuiz].correct;
  userAnswers[currentQuiz] = selected;
  if (selected === correct) { if (answeredStatus[currentQuiz] !== 'correct') score++; answeredStatus[currentQuiz] = 'correct'; }
  else answeredStatus[currentQuiz] = 'wrong';
  showAnswerFeedback(selected, correct);
  setTimeout(() => {
    currentQuiz++;
    if (currentQuiz < data.length) { answerEls.forEach(i => i.disabled = false); loadQuiz(); }
    else showResults();
  }, 1500);
}));

function updateNextBtnState() {}

function reinitializeQuizElements() {
  questionEl = document.getElementById('question');
  answerEls = document.querySelectorAll('.answer');
  labels = {};
  "abcdefghij".split("").forEach(l => labels[l] = document.getElementById(l+"_text"));
  timerEl = document.getElementById('timer');
  nextBtn = document.getElementById('next');
  prevBtn = document.getElementById('prev');
  progressBar = document.getElementById('progress-bar');
  nextBtn.disabled = true;
  prevBtn.addEventListener('click', handlePrevious);
  answerEls.forEach(el => el.addEventListener('change', () => {
    let selected = getSelected();
    if (!selected) return;
    answerEls.forEach(i => i.disabled = true);
    clearInterval(timer);
    let correct = data[currentQuiz].correct;
    userAnswers[currentQuiz] = selected;
    if (selected === correct) { if (answeredStatus[currentQuiz] !== 'correct') score++; answeredStatus[currentQuiz] = 'correct'; }
    else answeredStatus[currentQuiz] = 'wrong';
    showAnswerFeedback(selected, correct);
    setTimeout(() => {
      currentQuiz++;
      if (currentQuiz < data.length) { answerEls.forEach(i => i.disabled = false); loadQuiz(); }
      else showResults();
    }, 1500);
  }));
  loadQuiz();
}
