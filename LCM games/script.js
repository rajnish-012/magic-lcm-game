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

const correctSound = document.getElementById('correctSound');
const wrongSound = document.getElementById('wrongSound');
const levelUpSound = document.getElementById('levelUpSound');
const buttonClick = document.getElementById('buttonClick');

let num1, num2, score = 0;

// Adaptive difficulty
function getMaxNumber() {
    if (score < 5) return 10;
    if (score < 10) return 20;
    if (score < 20) return 50;
    return 100;
}

// Generate random numbers
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
    const stepsDiv = document.getElementById('stepsDisplay');
    if (stepsDiv) stepsDiv.innerHTML = ''; // clear old steps
}

// LCM calculation
function calculateLCM(a, b) {
    const gcd = (x, y) => y === 0 ? x : gcd(y, x % y);
    return (a * b) / gcd(a, b);
}

// Confetti animation setup
const confettiCanvas = document.getElementById('confetti');
const confettiCtx = confettiCanvas.getContext('2d');
confettiCanvas.width = window.innerWidth;
confettiCanvas.height = window.innerHeight;
let confettiParticles = [];
function createConfetti() {
    for (let i = 0; i < 120; i++) {
        confettiParticles.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight - window.innerHeight,
            r: Math.random() * 6 + 4,
            d: Math.random() * 50,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            tilt: Math.random() * 10 - 10
        });
    }
}
function drawConfetti() {
    confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    confettiParticles.forEach(p => {
        confettiCtx.fillStyle = p.color;
        confettiCtx.beginPath();
        confettiCtx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        confettiCtx.lineTo(p.x + p.tilt, p.y + p.r);
        confettiCtx.lineTo(p.x + p.tilt + p.r, p.y + p.r);
        confettiCtx.closePath();
        confettiCtx.fill();
        p.y += 2 + p.d / 10;
        p.tilt += 0.1;
        if (p.y > window.innerHeight) {
            p.y = -10;
            p.x = Math.random() * window.innerWidth;
        }
    });
    requestAnimationFrame(drawConfetti);
}
createConfetti();
drawConfetti();

// Stars animation
function createStars() {
    for (let i = 0; i < 5; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 80 + 10}%`;
        star.style.top = `50%`;
        starsContainer.appendChild(star);
        setTimeout(() => star.remove(), 1000);
    }
}

// Button click sound
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => buttonClick.play());
});

// Multiples hint
function generateMultiplesHint(a, b) {
    let multiplesA = [], multiplesB = [];
    for (let i = 1; i <= 5; i++) multiplesA.push(a * i);
    for (let i = 1; i <= 5; i++) multiplesB.push(b * i);
    let common = multiplesA.filter(x => multiplesB.includes(x));
    return {
        multiplesA,
        multiplesB,
        common,
        lcm: common[0]
    };
}

// ✅ Show Steps directly in page (not alert)
showStepsBtn.addEventListener('click', () => {
    const stepsDiv = document.getElementById('stepsDisplay') || document.createElement('div');
    stepsDiv.id = 'stepsDisplay';
    const { multiplesA, multiplesB, common, lcm } = generateMultiplesHint(num1, num2);
    stepsDiv.innerHTML = `
        <div class="steps-box">
            <p>🔹 <strong>Multiples of ${num1}</strong>: ${multiplesA.join(', ')}</p>
            <p>🔹 <strong>Multiples of ${num2}</strong>: ${multiplesB.join(', ')}</p>
            <p>💡 <strong>Common multiples</strong>: ${common.join(', ')}</p>
            <p>✅ <strong>LCM = ${lcm}</strong></p>
        </div>
    `;
    feedback.insertAdjacentElement('afterend', stepsDiv);
});

// Submit Answer
submitBtn.addEventListener('click', () => {
    const userLCM = parseInt(lcmInput.value);
    const correctLCM = calculateLCM(num1, num2);

    if (userLCM === correctLCM) {
        feedback.textContent = '✅ Correct! Great job!';
        card.classList.add('correct');
        score++;
        scoreElem.textContent = score;
        correctSound.play();
        mascot.classList.add('happy');
        createStars();

        if (score % 5 === 0) {
            badgeContainer.innerHTML = `🏅 Level Up! You’re now an LCM Star (Level ${score/5})!`;
            levelUpSound.play();
            mascot.classList.add('cheer');
            setTimeout(() => mascot.classList.remove('cheer'), 2000);
        }

        setTimeout(() => {
            generateNumbers();
        }, 700);
    } else {
        feedback.textContent = `❌ Oops! Try again!`;
        const { multiplesA, multiplesB, common } = generateMultiplesHint(num1, num2);
        const stepsDiv = document.getElementById('stepsDisplay') || document.createElement('div');
        stepsDiv.id = 'stepsDisplay';
        stepsDiv.innerHTML = `
            <div class="steps-box wrong-steps">
                <p>🔹 Multiples of ${num1}: ${multiplesA.join(', ')}</p>
                <p>🔹 Multiples of ${num2}: ${multiplesB.join(', ')}</p>
                <p>💡 Common multiples: ${common.join(', ')}</p>
            </div>
        `;
        feedback.insertAdjacentElement('afterend', stepsDiv);
        card.classList.add('wrong');
        wrongSound.play();
        mascot.classList.add('sad');
        setTimeout(() => mascot.classList.remove('sad'), 500);
    }
});

// Start game
generateNumbers();
