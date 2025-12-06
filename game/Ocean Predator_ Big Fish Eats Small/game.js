/* game.js  Part 1  –  基础状态与常量  */
const gameState = {
    mode: '',
    character: '',
    score: 0,
    isPlaying: false,
    player: null,
    fishes: [],
    canvas: null,
    ctx: null,
    skillCooldown: 0,
    mouseX: 0,
    mouseY: 0
};

const GAME_CONFIG = {
    playerSpeed: 5,
    fishSpeed: 2,
    maxFishes: 15,
    growthRate: 0.1,
    skillCooldown: 5000
};

function initCanvas() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gameState.canvas = canvas;
    gameState.ctx = ctx;
}
/* game.js  Part 2  –  Fish 类  */
class Fish {
    constructor(x, y, size, color, speed, type = 'normal') {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.speed = speed;
        this.type = type;
        this.angle = Math.random() * Math.PI * 2;
        this.targetAngle = this.angle;
        this.alive = true;
    }

    update() {
        if (this.type !== 'player') {
            this.targetAngle += (Math.random() - 0.5) * 0.2;
            this.angle += (this.targetAngle - this.angle) * 0.1;
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            if (this.x < 0 || this.x > gameState.canvas.width) this.angle = Math.PI - this.angle;
            if (this.y < 0 || this.y > gameState.canvas.height) this.angle = -this.angle;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(this.size * 0.8, 0);
        ctx.lineTo(this.size * 1.3, -this.size * 0.4);
        ctx.lineTo(this.size * 1.3, this.size * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(-this.size * 0.3, -this.size * 0.2, this.size * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-this.size * 0.3, -this.size * 0.2, this.size * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    checkCollision(other) {
        const dx = this.x - other.x, dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy) < (this.size + other.size) * 0.8;
    }
}
/* game.js  Part 3  –  界面切换函数  */
function selectMode(mode) {
    gameState.mode = mode;
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('characterSelect').style.display = 'flex';
}

function selectCharacter(character) {
    gameState.character = character;
    document.getElementById('characterSelect').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    startGame();
}

function backToMenu() {
    document.getElementById('characterSelect').style.display = 'none';
    document.getElementById('mainMenu').style.display = 'flex';
}

function showMainMenu() {
    gameState.isPlaying = false;
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('mainMenu').style.display = 'flex';
    document.getElementById('gameOver').style.display = 'none';
}
/* game.js  Part 4  –  游戏初始化与主循环  */
function startGame() {
    initCanvas();
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.fishes = [];
    const playerColor = gameState.character === 'shark' ? '#4A90E2' :
                        gameState.character === 'squid' ? '#8B4513' : '#FFD700';
    gameState.player = new Fish(
        gameState.canvas.width / 2,
        gameState.canvas.height / 2,
        30, playerColor, GAME_CONFIG.playerSpeed, 'player'
    );
    for (let i = 0; i < GAME_CONFIG.maxFishes; i++) {
        const size = Math.random() * 20 + 10;
        const color = `hsl(${Math.random() * 360}, 70%, 60%)`;
        gameState.fishes.push(new Fish(
            Math.random() * gameState.canvas.width,
            Math.random() * gameState.canvas.height,
            size, color, GAME_CONFIG.fishSpeed + Math.random() * 2
        ));
    }
    updateScore();
    gameLoop();
}

function gameLoop() {
    if (!gameState.isPlaying) return;
    const ctx = gameState.ctx, canvas = gameState.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground(ctx, canvas);
    if (gameState.player) {
        updatePlayer();
        gameState.player.draw(ctx);
    }
    gameState.fishes = gameState.fishes.filter(fish => fish.alive);
    for (let fish of gameState.fishes) {
        fish.update();
        fish.draw(ctx);
        if (gameState.player && fish.alive && gameState.player.checkCollision(fish)) {
            if (gameState.player.size >= fish.size) {
                fish.alive = false;
                gameState.score += Math.floor(fish.size);
                gameState.player.size += GAME_CONFIG.growthRate * fish.size;
                updateScore();
            } else {
                endGame();
                return;
            }
        }
    }
    if (gameState.fishes.length < GAME_CONFIG.maxFishes) {
        const size = Math.random() * 25 + 5;
        const color = `hsl(${Math.random() * 360}, 70%, 60%)`;
        gameState.fishes.push(new Fish(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            size, color, GAME_CONFIG.fishSpeed + Math.random() * 3
        ));
    }
    if (gameState.skillCooldown > 0) {
        gameState.skillCooldown -= 16;
        updateSkillButton();
    }
    requestAnimationFrame(gameLoop);
}
/* game.js  Part 5  –  背景绘制 & 玩家控制  */
function drawBackground(ctx, canvas) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 20; i++) {
        const x = (Date.now() * 0.001 * 20 + i * 100) % canvas.width;
        const y = (Date.now() * 0.001 * 10 + i * 50) % canvas.height;
        const radius = 5 + Math.sin(Date.now() * 0.001 + i) * 3;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

function updatePlayer() {
    if (!gameState.player) return;
    const targetX = gameState.mouseX || gameState.player.x;
    const targetY = gameState.mouseY || gameState.player.y;
    const dx = targetX - gameState.player.x;
    const dy = targetY - gameState.player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 5) {
        gameState.player.x += (dx / distance) * gameState.player.speed;
        gameState.player.y += (dy / distance) * gameState.player.speed;
        gameState.player.angle = Math.atan2(dy, dx);
    }
}

document.addEventListener('mousemove', e => {
    gameState.mouseX = e.clientX;
    gameState.mouseY = e.clientY;
});
document.addEventListener('touchmove', e => {
    e.preventDefault();
    if (e.touches.length > 0) {
        gameState.mouseX = e.touches[0].clientX;
        gameState.mouseY = e.touches[0].clientY;
    }
});
/* game.js  Part 6  –  技能/UI/结束  */
function useSkill() {
    if (gameState.skillCooldown > 0 || !gameState.player) return;
    if (gameState.character === 'squid') {
        gameState.player.size *= 1.2;
        gameState.skillCooldown = GAME_CONFIG.skillCooldown;
        const ctx = gameState.ctx;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, gameState.canvas.width, gameState.canvas.height);
        setTimeout(() => {
            if (gameState.isPlaying) startGame();
        }, 1000);
    } else if (gameState.character === 'shark') {
        gameState.player.speed *= 2;
        gameState.skillCooldown = GAME_CONFIG.skillCooldown;
        setTimeout(() => {
            if (gameState.player) gameState.player.speed = GAME_CONFIG.playerSpeed;
        }, 3000);
    } else {
        gameState.player.size *= 1.5;
        gameState.skillCooldown = GAME_CONFIG.skillCooldown;
        setTimeout(() => {
            if (gameState.player) gameState.player.size /= 1.5;
        }, 5000);
    }
}

function updateSkillButton() {
    const button = document.getElementById('skillButton');
    if (gameState.skillCooldown > 0) {
        button.disabled = true;
        button.textContent = `冷却中 (${Math.ceil(gameState.skillCooldown / 1000)}s)`;
    } else {
        button.disabled = false;
        button.textContent = '使用技能';
    }
}

function updateScore() {
    document.getElementById('score').textContent = gameState.score;
}

function endGame() {
    gameState.isPlaying = false;
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('gameOver').style.display = 'flex';
}

function restartGame() {
    document.getElementById('gameOver').style.display = 'none';
    startGame();
}

window.addEventListener('resize', () => {
    if (gameState.canvas) {
        gameState.canvas.width = window.innerWidth;
        gameState.canvas.height = window.innerHeight;
    }
});
