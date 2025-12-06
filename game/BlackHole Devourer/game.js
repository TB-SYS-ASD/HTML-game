const gameContainer = document.getElementById('gameContainer');
const blackHole = document.getElementById('blackHole');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreDisplay = document.getElementById('finalScore');
const survivalTimeDisplay = document.getElementById('survivalTime');
const restartBtn = document.getElementById('restartBtn');

let score = 0;
let gameTime = 0;
let gameRunning = true;
let foods = [];
let blackHoleSize = 60;

blackHole.style.left = '370px';
blackHole.style.top = '270px';

gameContainer.addEventListener('mousemove', e => {
    if (!gameRunning) return;
    const rect = gameContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    blackHole.style.left = (x - blackHoleSize / 2) + 'px';
    blackHole.style.top = (y - blackHoleSize / 2) + 'px';
    checkCollisions();
});

function createFood() {
    const food = document.createElement('div');
    food.className = 'food';
    food.style.left = Math.random() * (gameContainer.offsetWidth - 20) + 'px';
    food.style.top = Math.random() * (gameContainer.offsetHeight - 20) + 'px';
    gameContainer.appendChild(food);
    foods.push(food);
}

function checkCollisions() {
    const blackHoleRect = blackHole.getBoundingClientRect();
    foods.forEach((food, idx) => {
        if (!food.parentNode) return;
        const foodRect = food.getBoundingClientRect();
        if (isColliding(blackHoleRect, foodRect)) {
            food.remove();
            foods.splice(idx, 1);
            score += 10;
            scoreDisplay.textContent = `Score: ${score}`;
            blackHoleSize += 2;
            blackHole.style.width = blackHoleSize + 'px';
            blackHole.style.height = blackHoleSize + 'px';
            createFood();
        }
    });
}

function isColliding(r1, r2) {
    return !(r1.right < r2.left || r1.left > r2.right ||
             r1.bottom < r2.top || r1.top > r2.bottom);
}

setInterval(() => {
    if (gameRunning) {
        gameTime++;
        timerDisplay.textContent = `Time: ${gameTime}s`;
        if (gameTime % 10 === 0) createFood();
    }
}, 1000);

function endGame() {
    gameRunning = false;
    finalScoreDisplay.textContent = `Final Score: ${score}`;
    survivalTimeDisplay.textContent = `Survived: ${gameTime}s`;
    gameOverScreen.style.display = 'block';
}

restartBtn.addEventListener('click', () => {
    score = 0;
    gameTime = 0;
    gameRunning = true;
    blackHoleSize = 60;
    scoreDisplay.textContent = 'Score: 0';
    timerDisplay.textContent = 'Time: 0s';
    blackHole.style.width = '60px';
    blackHole.style.height = '60px';
    blackHole.style.left = '370px';
    blackHole.style.top = '270px';
    foods.forEach(f => f.remove());
    foods = [];
    gameOverScreen.style.display = 'none';
    for (let i = 0; i < 5; i++) createFood();
});

for (let i = 0; i < 5; i++) createFood();
setTimeout(() => { if (gameRunning) endGame(); }, 30000);
