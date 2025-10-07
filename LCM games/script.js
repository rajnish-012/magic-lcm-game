// =======================================
// LCM FUN GAME - polished script.js
// =======================================

// 🎯 Element References
const num1Elem = document.getElementById('num1');
const num2Elem = document.getElementById('num2');
const lcmInput = document.getElementById('lcmInput');
const submitBtn = document.getElementById('submitBtn');
const showStepsBtn = document.getElementById('showStepsBtn');
const feedback = document.getElementById('feedback');
const card = document.querySelector('.card');
const scoreElem = document.getElementById('score');
const starsContainer = document.getElementById('stars-container');
const mascot = document.getElementById('mascot');
const badgeContainer = document.getElementById('badge-container');
const nextBtn = document.getElementById('nextBtn');

// 🎵 Sounds
const correctSound = document.getElementById('correctSound');
const wrongSound = document.getElementById('wrongSound');
const levelUpSound = document.getElementById('levelUpSound');
const buttonClick = document.getElementById('buttonClick');

// State
let num1, num2;
let score = 0;
let confettiActive = false;
let confettiParticles = [];
let confettiAnimationId = null;

// --------- Difficulty Scaling ---------
function getMaxNumber() {
  if (score < 5) return 10;
  if (score < 10) return 20;
  if (score < 20) return 50;
  return 100;
}

// --------- Generate Numbers ---------
function generateNumbers() {
  const maxNum = getMaxNumber();
  num1 = Math.floor(Math.random() * maxNum) + 1;
  num2 = Math.floor(Math.random() * maxNum) + 1;

  num1Elem.textContent = num1;
  num2Elem.textContent = num2;
  lcmInput.value = '';
  feedback.textContent = '';
  card.classList.remove('correct', 'wrong');
  mascot.classList.remove('happy', 'sad', 'cheer');

  // hide next button until needed
  nextBtn.style.display = 'none';

  // cleanup steps
  const stepsDiv = document.getElementById('stepsDisplay');
  if (stepsDiv) stepsDiv.remove();
}

// --------- LCM Calculation ---------
function calculateLCM(a, b) {
  const gcd = (x, y) => (y === 0 ? Math.abs(x) : gcd(y, x % y));
  return Math.abs((a * b) / gcd(a, b));
}

// --------- Multiples hint generator (for steps) ---------
function generateMultiplesHint(a, b, count = 7) {
  const multiplesA = Array.from({ length: count }, (_, i) => a * (i + 1));
  const multiplesB = Array.from({ length: count }, (_, i) => b * (i + 1));
  const common = multiplesA.filter((x) => multiplesB.includes(x));
  return { multiplesA, multiplesB, common };
}

// --------- Sound helper (reset and play) ---------
function playSound(audioEl) {
  try {
    audioEl.currentTime = 0;
    audioEl.play();
  } catch (e) {
    // ignore autoplay restrictions or missing file issues
    // console.warn('sound play failed', e);
  }
}

// --------- Stars animation (temporary DOM stars) ---------
function createStars() {
  for (let i = 0; i < 6; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    // random positions near the stars container
    star.style.left = `${Math.random() * 60 + 20}%`;
    star.style.top = `${Math.random() * 15 + 40}%`;
    star.style.fontSize = `${16 + Math.random() * 20}px`;
    starsContainer.appendChild(star);
    // remove after animation
    setTimeout(() => star.remove(), 1600 + Math.random() * 800);
  }
}

// --------- Confetti (burst for a limited time) ---------
const confettiCanvas = document.getElementById('confetti');
const confettiCtx = confettiCanvas.getContext('2d');

function resizeCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', () => {
  resizeCanvas();
  // regenerate confetti to fit new size if active
  if (confettiActive) generateConfettiParticles();
});
resizeCanvas();

function generateConfettiParticles(count = 120) {
  confettiParticles = [];
  for (let i = 0; i < count; i++) {
    confettiParticles.push({
      x: Math.random() * confettiCanvas.width,
      y: Math.random() * -confettiCanvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * 50,
      color: `hsl(${Math.random() * 360}, 90%, 55%)`,
      tilt: Math.random() * 10 - 5,
      tiltSpeed: Math.random() * 0.2 + 0.05,
      vx: Math.random() * 2 - 1
    });
  }
}

function drawConfettiFrame() {
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  for (let p of confettiParticles) {
    confettiCtx.fillStyle = p.color;
    confettiCtx.beginPath();
    confettiCtx.moveTo(p.x + p.tilt, p.y);
    confettiCtx.lineTo(p.x + p.tilt + p.r / 2, p.y + p.r);
    confettiCtx.lineTo(p.x + p.tilt + p.r, p.y);
    confettiCtx.closePath();
    confettiCtx.fill();

    p.y += 2 + p.d / 20;
    p.x += p.vx;
    p.tilt += p.tiltSpeed;

    if (p.y > confettiCanvas.height + 20) {
      p.y = -10 - Math.random() * confettiCanvas.height * 0.2;
      p.x = Math.random() * confettiCanvas.width;
    }
  }
  confettiAnimationId = confettiActive ? requestAnimationFrame(drawConfettiFrame) : null;
}

function startConfetti(duration = 2200) {
  if (confettiActive) return; // prevent stacking
  confettiActive = true;
  generateConfettiParticles();
  drawConfettiFrame();
  // stop after duration
  setTimeout(() => {
    confettiActive = false;
    // give one last frame to clear
    if (confettiAnimationId) {
      cancelAnimationFrame(confettiAnimationId);
      confettiAnimationId = null;
    }
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiParticles = [];
  }, duration);
}

// --------- UI helpers ---------
function showSteps(showLCM = true) {
  // remove old
  const old = document.getElementById('stepsDisplay');
  if (old) old.remove();

  const stepsDiv = document.createElement('div');
  stepsDiv.id = 'stepsDisplay';
  stepsDiv.className = 'steps-box';

  const { multiplesA, multiplesB, common } = generateMultiplesHint(num1, num2, 8);
  const trueLCM = calculateLCM(num1, num2);

  stepsDiv.innerHTML = `
    <p>🔹 <strong>Multiples of ${num1}</strong>: ${multiplesA.join(', ')}</p>
    <p>🔹 <strong>Multiples of ${num2}</strong>: ${multiplesB.join(', ')}</p>
    <p>💡 <strong>First common multiple shown</strong>: ${common.length ? common[0] : '— (not in first few multiples)'}</p>
    ${showLCM ? `<p>✅ <strong>LCM = ${trueLCM}</strong></p>` : ''}
  `;
  feedback.insertAdjacentElement('afterend', stepsDiv);
}

// scoreboard glow animation
function animateScore() {
  scoreElem.classList.add('score-glow');
  setTimeout(() => scoreElem.classList.remove('score-glow'), 700);
}

// badge pop
function animateBadge() {
  badgeContainer.classList.add('badge-pop');
  setTimeout(() => badgeContainer.classList.remove('badge-pop'), 900);
}

// --------- Button sound for clicks (global) ---------
document.querySelectorAll('button').forEach(button => {
  button.addEventListener('click', () => {
    if (buttonClick) {
      try {
        buttonClick.currentTime = 0;
        buttonClick.play();
      } catch (e) {}
    }
  });
});

// --------- Show Steps Button Handler ---------
showStepsBtn.addEventListener('click', () => showSteps(true));

// --------- Submit Answer Handler ---------
submitBtn.addEventListener('click', () => {
  const userLCM = parseInt(lcmInput.value, 10);
  const correctLCM = calculateLCM(num1, num2);

  if (isNaN(userLCM)) {
    feedback.textContent = '⚠️ Please enter a number!';
    return;
  }

  if (userLCM === correctLCM) {
    // correct
    feedback.textContent = '✅ Correct! Great job!';
    card.classList.remove('wrong');
    card.classList.add('correct');
    score++;
    scoreElem.textContent = score;
    animateScore();

    playSound(correctSound);
    mascot.classList.add('happy');
    setTimeout(() => mascot.classList.remove('happy'), 900);

    createStars();
    startConfetti(2200); // burst confetti for 2.2s

    // level-up every 5 points
    if (score % 5 === 0) {
      const level = score / 5;
      badgeContainer.innerHTML = `🏅 Level Up! You’re now an LCM Star — Level ${level}!`;
      playSound(levelUpSound);
      mascot.classList.add('cheer');
      animateBadge();
      setTimeout(() => mascot.classList.remove('cheer'), 2800);
    }

    // reveal Next button so player can control pace
    nextBtn.style.display = 'inline-block';

    // optional: auto-generate a new question after a short delay
    // (we keep Next visible so user can move on when ready)
    setTimeout(() => {
      // keep current numbers visible briefly, then if user hasn't clicked Next, auto-advance
      if (nextBtn.style.display === 'inline-block') {
        // auto advance after additional delay
        setTimeout(() => {
          // if still visible, auto-advance to keep flow
          if (nextBtn.style.display === 'inline-block') generateNumbers();
        }, 2500);
      }
    }, 800);

  } else {
    // wrong
    feedback.textContent = '❌ Oops! Try again — here are some hints.';
    card.classList.remove('correct');
    card.classList.add('wrong');

    playSound(wrongSound);
    mascot.classList.add('sad');
    setTimeout(() => mascot.classList.remove('sad'), 700);

    // show steps but hide final LCM so player can work it out
    showSteps(false);
  }
});

// --------- Next Button ---------
nextBtn.addEventListener('click', () => {
  generateNumbers();
  playSound(buttonClick);
});

// --------- Keyboard shortcuts ---------
// Enter to submit, S to show steps
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    // avoid Enter submitting empty input when typing negative/float signs; use parseInt check
    submitBtn.click();
  } else if (e.key.toLowerCase() === 's') {
    showSteps(true);
  }
});

// --------- Init Game & Small polish ---------
(function init() {
  // small: animate initial mascot entrance
  mascot.style.transformOrigin = '50% 50%';
  mascot.classList.add('cheer');
  setTimeout(() => mascot.classList.remove('cheer'), 700);

  // small CSS hooks — these classes should be defined in your CSS (score-glow, badge-pop)
  // if they don't exist, they'll be harmless no-ops.
  // Example CSS you can add:
  // .score-glow { animation: scorePulse 0.6s; }
  // @keyframes scorePulse { 0% { transform: scale(1); } 50% { transform: scale(1.12); } 100% { transform: scale(1); } }
  // .badge-pop { animation: pop 0.9s; }
  generateNumbers();
})();
