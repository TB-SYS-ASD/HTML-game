const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
const player = document.getElementById('player');
const timerDisplay = document.getElementById('timer');
const gameOverModal = document.getElementById('gameOverModal');
const restartBtn = document.getElementById('restartBtn');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gameTime = 0, gameRunning = true, bullets = [];
let mouseX = canvas.width / 2, mouseY = canvas.height / 2;
let playerX = mouseX, playerY = mouseY;

class Bullet {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = -20;
        this.speed = Math.random() * 3 + 2;
        this.angle = Math.random() * Math.PI * 2;
        this.radius = Math.random() * 8 + 4;
        this.color = Math.random() > .5 ? '#ff4d4d' : '#ffcc00';
        this.waveAmplitude = Math.random() * 50 + 20;
        this.waveFrequency = Math.random() * .05 + .02;
        this.time = 0;
        this.rotationSpeed = (Math.random() - .5) * .1;
    }
    update() {
        this.time++;
        this.y += this.speed;
        this.x += Math.sin(this.time * this.waveFrequency) * this.waveAmplitude * .1;
        this.x += Math.cos(this.angle + this.time * .01) * .5;
        this.speed += .01;
        if (gameTime > 30) this.color = gameTime % 2 ? '#ff4d4d' : '#ffcc00';
        if (this.x < -50) this.x = canvas.width + 50;
        if (this.x > canvas.width + 50) this.x = -50;
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.time * this.rotationSpeed);
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        const grad = ctx.createRadialGradient(0,0,0,0,0,this.radius*2);
        grad.addColorStop(0, this.color + '80');
        grad.addColorStop(1, this.color + '00');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
    }
}

document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
});

function updateTimer() {
    if (!gameRunning) return;
    gameTime++;
    const m = String(Math.floor(gameTime / 60)).padStart(2,'0');
    const s = String(gameTime % 60).padStart(2,'0');
    timerDisplay.textContent = `${m}:${s}`;
    if (gameTime >= 60) endGame();
}

function endGame() {
    gameRunning = false;
    gameOverModal.style.display = 'block';
}

restartBtn.addEventListener('click', () => {
    gameTime = 0; gameRunning = true; bullets = [];
    gameOverModal.style.display = 'none';
});

function checkCollision() {
    const pr = player.getBoundingClientRect();
    const px = pr.left + pr.width/2, py = pr.top + pr.height/2;
    const r  = pr.width/2;
    for (let b of bullets) {
        const dx = b.x - px, dy = b.y - py;
        if (Math.hypot(dx, dy) < b.radius + r) { endGame(); return; }
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (gameRunning) {
        playerX += (mouseX - playerX) * .1;
        playerY += (mouseY - playerY) * .1;
        player.style.left = (playerX - 12.5) + 'px';
        player.style.top  = (playerY - 12.5) + 'px';

        if (Math.random() < Math.min(.05 + gameTime * .001, .15))
            bullets.push(new Bullet());

        bullets = bullets.filter(b => {
            b.update(); b.draw(); return b.y < canvas.height + 50;
        });
        checkCollision();
    }
    requestAnimationFrame(gameLoop);
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

setInterval(updateTimer, 1000);
gameLoop();
