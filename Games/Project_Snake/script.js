// ── Constants ──────────────────────────────────────
const BOARD_W = 800;
const BOARD_H = 500;
const TILE = 25;
const COLS = BOARD_W / TILE;   // 32
const ROWS = BOARD_H / TILE;   // 20
let tickMs = 100;              // default = Medium

// ── DOM Elements ───────────────────────────────────
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score-value');
const restartBtn = document.getElementById('restart-btn');
const diffBtns = document.querySelectorAll('.diff-btn');

// ── Sound Effects ──────────────────────────────────
const eatSound = new Audio('assets/Point_SFX.mp3');
const gameOverSound = new Audio('assets/Game_Over_SFX.mp3');

function playEatSound() {
    eatSound.currentTime = 0;
    eatSound.play();
}

function playGameOverSound() {
    gameOverSound.currentTime = 0;
    gameOverSound.play();
}

// ── Game State ─────────────────────────────────────
let snake, direction, nextDirection, food, score, gameOver, loopId;
let waitingForStart;   // true until the first arrow key is pressed

// ── Initialise / Reset ─────────────────────────────
function init() {
    // Place head roughly in the centre of the grid
    snake = [{ x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) }];
    direction = { x: 0, y: 0 };   // stationary until first key
    nextDirection = { x: 0, y: 0 };
    score = 0;
    gameOver = false;
    waitingForStart = true;

    // Re-enable difficulty buttons
    diffBtns.forEach(btn => btn.disabled = false);

    scoreEl.textContent = '0';
    restartBtn.style.display = 'none';

    spawnFood();

    if (loopId) clearInterval(loopId);
    loopId = setInterval(gameLoop, tickMs);

    // Draw the initial frame so the snake is visible immediately
    draw();
}

// ── Food ───────────────────────────────────────────
function spawnFood() {
    let pos;
    do {
        pos = {
            x: Math.floor(Math.random() * COLS),
            y: Math.floor(Math.random() * ROWS)
        };
    } while (snake.some(seg => seg.x === pos.x && seg.y === pos.y));
    food = pos;
}

// ── Input ──────────────────────────────────────────
document.addEventListener('keydown', (e) => {
    // Prevent page scrolling on arrow keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }


    switch (e.key) {
        case 'ArrowUp':
            if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
            if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
            if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
            if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
            break;
    }

    // First valid arrow press starts the snake moving
    if (waitingForStart && (nextDirection.x !== 0 || nextDirection.y !== 0)) {
        waitingForStart = false;
        // Lock difficulty once the game starts
        diffBtns.forEach(btn => btn.disabled = true);
    }
});

// ── Game Loop ──────────────────────────────────────
function gameLoop() {
    if (gameOver) return;
    if (waitingForStart) return;   // sit still until first key

    // Apply queued direction
    direction = nextDirection;

    // 1. Move body (back → front, each copies the one ahead)
    for (let i = snake.length - 1; i > 0; i--) {
        snake[i] = { ...snake[i - 1] };
    }

    // 2. Move head
    snake[0].x += direction.x;
    snake[0].y += direction.y;

    // 3. Wall collision
    if (snake[0].x < 0 || snake[0].x >= COLS ||
        snake[0].y < 0 || snake[0].y >= ROWS) {
        endGame();
        return;
    }

    // 4. Self collision (skip index 0)
    for (let i = 1; i < snake.length; i++) {
        if (snake[0].x === snake[i].x && snake[0].y === snake[i].y) {
            endGame();
            return;
        }
    }

    // 5. Eat food?
    if (snake[0].x === food.x && snake[0].y === food.y) {
        score++;
        scoreEl.textContent = score;
        scoreEl.classList.add('bump');
        setTimeout(() => scoreEl.classList.remove('bump'), 150);
        snake.push({ ...snake[snake.length - 1] });
        spawnFood();
        playEatSound();
    }

    // 6. Draw
    draw();
}

// ── Drawing ────────────────────────────────────────
function draw() {
    // Clear
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, BOARD_W, BOARD_H);

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= COLS; i++) {
        ctx.beginPath();
        ctx.moveTo(i * TILE, 0);
        ctx.lineTo(i * TILE, BOARD_H);
        ctx.stroke();
    }
    for (let j = 0; j <= ROWS; j++) {
        ctx.beginPath();
        ctx.moveTo(0, j * TILE);
        ctx.lineTo(BOARD_W, j * TILE);
        ctx.stroke();
    }

    // Food — glowing red apple
    const fx = food.x * TILE;
    const fy = food.y * TILE;
    const glow = ctx.createRadialGradient(
        fx + TILE / 2, fy + TILE / 2, 2,
        fx + TILE / 2, fy + TILE / 2, TILE
    );
    glow.addColorStop(0, '#ff4757');
    glow.addColorStop(1, 'rgba(255,71,87,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(fx - 4, fy - 4, TILE + 8, TILE + 8);

    ctx.fillStyle = '#ff6b81';
    roundRect(fx + 2, fy + 2, TILE - 4, TILE - 4, 5);

    // Snake
    snake.forEach((seg, i) => {
        const sx = seg.x * TILE;
        const sy = seg.y * TILE;

        if (i === 0) {
            const grad = ctx.createLinearGradient(sx, sy, sx + TILE, sy + TILE);
            grad.addColorStop(0, '#00f260');
            grad.addColorStop(1, '#0575e6');
            ctx.fillStyle = grad;
        } else {
            const brightness = Math.max(40, 75 - i * 1.5);
            ctx.fillStyle = `hsl(145, 80%, ${brightness}%)`;
        }

        roundRect(sx + 1, sy + 1, TILE - 2, TILE - 2, 6);
    });

    // Eyes on head
    drawEyes();

    // "Press arrow key" hint while waiting
    if (waitingForStart) {
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.font = '600 22px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Press an arrow key to start', BOARD_W / 2, BOARD_H / 2 + 40);
    }
}

// ── Draw Eyes on Head ──────────────────────────────
function drawEyes() {
    const head = snake[0];
    const hx = head.x * TILE;
    const hy = head.y * TILE;
    const eyeR = 3;
    let e1, e2;

    // Default to "looking right" when stationary
    const dx = direction.x || 1;
    const dy = direction.y;

    if (dx === 1 && dy === 0) {             // right
        e1 = { x: hx + 18, y: hy + 6 };
        e2 = { x: hx + 18, y: hy + 16 };
    } else if (dx === -1 && dy === 0) {     // left
        e1 = { x: hx + 6, y: hy + 6 };
        e2 = { x: hx + 6, y: hy + 16 };
    } else if (dy === -1) {                 // up
        e1 = { x: hx + 6, y: hy + 6 };
        e2 = { x: hx + 16, y: hy + 6 };
    } else {                                // down
        e1 = { x: hx + 6, y: hy + 18 };
        e2 = { x: hx + 16, y: hy + 18 };
    }

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(e1.x, e1.y, eyeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(e2.x, e2.y, eyeR, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(e1.x + dx, e1.y + dy, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(e2.x + dx, e2.y + dy, 1.5, 0, Math.PI * 2);
    ctx.fill();
}

// ── Rounded Rectangle Helper ──────────────────────
function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
}

// ── Game Over ──────────────────────────────────────
function endGame() {
    gameOver = true;
    clearInterval(loopId);
    playGameOverSound();

    // Darken overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, 0, BOARD_W, BOARD_H);

    // "Game Over" text
    ctx.fillStyle = '#ff4757';
    ctx.font = '800 48px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Game Over', BOARD_W / 2, BOARD_H / 2 - 30);

    // Final score
    ctx.fillStyle = '#e0e0e0';
    ctx.font = '600 28px Outfit, sans-serif';
    ctx.fillText(`Score: ${score}`, BOARD_W / 2, BOARD_H / 2 + 20);

    // Show restart button
    restartBtn.style.display = 'inline-block';
}

// ── Restart ────────────────────────────────────────
restartBtn.addEventListener('click', () => {
    init();
});

// ── Difficulty Selector ────────────────────────────
diffBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active state
        diffBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update speed
        tickMs = parseInt(btn.dataset.speed, 10);

        // Restart the interval at the new speed (keeps current game state)
        if (loopId) clearInterval(loopId);
        loopId = setInterval(gameLoop, tickMs);
    });
});

// ── Start ──────────────────────────────────────────
init();
