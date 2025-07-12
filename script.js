let questions = [];
let currentQuestion = 0;
let score = 0;

const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const resultEl = document.getElementById("result");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");

// ✅ Your live Google Sheet API link
const GOOGLE_SHEET_API = "https://script.google.com/macros/s/AKfycbzrvneqHBMEwANEmi8tTrpkf8TtWSL2Z67tEskE87TUkL7eG00iV7mwu2eIVLACFzuU/exec";

async function fetchQuestions() {
  try {
    const res = await fetch(GOOGLE_SHEET_API);
    questions = await res.json();
    startQuiz();
  } catch (error) {
    questionEl.innerText = "Failed to load quiz questions.";
    console.error("Error fetching questions:", error);
  }
}

function startQuiz() {
  currentQuestion = 0;
  score = 0;
  resultEl.innerText = "";
  nextBtn.style.display = "none";
  restartBtn.style.display = "none";
  showQuestion();
}

function showQuestion() {
  const q = questions[currentQuestion];
  questionEl.innerText = q.question;
  optionsEl.innerHTML = "";

  q.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.innerText = opt;
    btn.onclick = () => checkAnswer(idx);
    optionsEl.appendChild(btn);
  });
}

function checkAnswer(selected) {
  const q = questions[currentQuestion];
  const buttons = document.querySelectorAll("button.option");
  buttons.forEach(btn => btn.disabled = true);

  if (selected === q.answer) {
    score++;
    buttons[selected].style.background = "#a2f3a2"; // green
    resultEl.innerText = "✅ Correct!";
  } else {
    buttons[selected].style.background = "#f3a2a2"; // red
    buttons[q.answer].style.background = "#a2f3a2"; // show correct
    resultEl.innerText = "❌ Wrong!";
  }

  nextBtn.style.display = "inline-block";
}

function nextQuestion() {
  currentQuestion++;
  resultEl.innerText = "";
  nextBtn.style.display = "none";

  if (currentQuestion < questions.length) {
    showQuestion();
  } else {
    showScore();
  }
}

function showScore() {
  questionEl.innerText = `🎉 You scored ${score} out of ${questions.length}`;
  optionsEl.innerHTML = "";
  restartBtn.style.display = "inline-block";
}

window.onload = fetchQuestions;
