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
const bestScoreEl = document.getElementById('best-score-value');
const restartBtn = document.getElementById('restart-btn');
const diffBtns = document.querySelectorAll('.diff-btn');
const pauseBtn = document.getElementById('pause-btn');
const pauseOverlay = document.getElementById('pause-overlay');

// ── Sound Effects ──────────────────────────────────
const eatSound = new Audio('assets/Point_SFX.mp3');
const gameOverSound = new Audio('assets/Game_Over_SFX.mp3');

function playEatSound() {
    if (window.CyberSystem && window.CyberSystem.Audio && window.CyberSystem.Audio.isMuted()) return;
    eatSound.currentTime = 0;
    eatSound.play().catch(() => {});
}

function playGameOverSound() {
    if (window.CyberSystem && window.CyberSystem.Audio && window.CyberSystem.Audio.isMuted()) return;
    gameOverSound.currentTime = 0;
    gameOverSound.play().catch(() => {});
}

// ── Game State ─────────────────────────────────────
let snake, direction, nextDirection, food, score, gameOver, loopId;
let waitingForStart;
let isPaused = false;

function updateBestScoreUI() {
    if (bestScoreEl && window.CyberSystem && window.CyberSystem.Scores) {
        const best = window.CyberSystem.Scores.get('snake');
        bestScoreEl.textContent = best;
    }
}

// ── Initialise / Reset ─────────────────────────────
function init() {
    snake = [{ x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) }];
    direction = { x: 0, y: 0 };
    nextDirection = { x: 0, y: 0 };
    score = 0;
    gameOver = false;
    waitingForStart = true;
    isPaused = false;

    if (pauseOverlay) pauseOverlay.style.display = 'none';
    if (pauseBtn) pauseBtn.textContent = '[PAUSE: P]';

    diffBtns.forEach(btn => btn.disabled = false);

    scoreEl.textContent = '0';
    restartBtn.style.display = 'none';

    updateBestScoreUI();
    spawnFood();

    if (loopId) clearInterval(loopId);
    loopId = setInterval(gameLoop, tickMs);

    draw();
}

// ── Pause Toggle ───────────────────────────────────
function togglePause() {
    if (gameOver || waitingForStart) return;
    isPaused = !isPaused;

    if (isPaused) {
        if (pauseOverlay) pauseOverlay.style.display = 'flex';
        if (pauseBtn) pauseBtn.textContent = '[RESUME: P]';
        if (window.CyberSystem) window.CyberSystem.Audio.playAlert();
    } else {
        if (pauseOverlay) pauseOverlay.style.display = 'none';
        if (pauseBtn) pauseBtn.textContent = '[PAUSE: P]';
        if (window.CyberSystem) window.CyberSystem.Audio.playClick();
    }
}

// ── Food Generation ─────────────────────────────────
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

// ── Direction Input Helper ──────────────────────────
function handleDirectionInput(dirKey) {
    if (isPaused) {
        togglePause();
        return;
    }

    switch (dirKey) {
        case 'ArrowUp':
        case 'Up':
        case 'w':
        case 'W':
            if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
        case 'Down':
        case 's':
        case 'S':
            if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
        case 'Left':
        case 'a':
        case 'A':
            if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
        case 'Right':
        case 'd':
        case 'D':
            if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
            break;
    }

    if (waitingForStart && (nextDirection.x !== 0 || nextDirection.y !== 0)) {
        waitingForStart = false;
        diffBtns.forEach(btn => btn.disabled = true);
    }
}

// ── Keyboard Input ──────────────────────────────────
document.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        togglePause();
        e.preventDefault();
        return;
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', ' '].includes(e.key)) {
        e.preventDefault();
    }

    handleDirectionInput(e.key);
});

// ── Game Loop ──────────────────────────────────────
function gameLoop() {
    if (gameOver || waitingForStart || isPaused) return;

    direction = nextDirection;

    // Move body
    for (let i = snake.length - 1; i > 0; i--) {
        snake[i] = { ...snake[i - 1] };
    }

    // Move head
    snake[0].x += direction.x;
    snake[0].y += direction.y;

    // Wall collision
    if (snake[0].x < 0 || snake[0].x >= COLS || snake[0].y < 0 || snake[0].y >= ROWS) {
        endGame();
        return;
    }

    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            endGame();
            return;
        }
    }

    // Food collision
    if (snake[0].x === food.x && snake[0].y === food.y) {
        score += 10;
        scoreEl.textContent = score;
        scoreEl.classList.remove('bump');
        void scoreEl.offsetWidth;
        scoreEl.classList.add('bump');

        // Check high score record
        if (window.CyberSystem && window.CyberSystem.Scores) {
            window.CyberSystem.Scores.set('snake', score);
            updateBestScoreUI();
        }

        snake.push({ ...snake[snake.length - 1] });
        spawnFood();
        playEatSound();
    }

    draw();
}

// ── Canvas Rendering ────────────────────────────────
function draw() {
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, BOARD_W, BOARD_H);

    // High-Tech Grid Coordinates
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.05)';
    ctx.lineWidth = 1;
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

    // Corrupted Data Core (Food)
    const fx = food.x * TILE;
    const fy = food.y * TILE;

    const glow = ctx.createRadialGradient(
        fx + TILE / 2, fy + TILE / 2, 2,
        fx + TILE / 2, fy + TILE / 2, TILE * 1.2
    );
    glow.addColorStop(0, '#ff00ff');
    glow.addColorStop(0.5, 'rgba(255, 0, 255, 0.4)');
    glow.addColorStop(1, 'rgba(255, 0, 255, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(fx - 6, fy - 6, TILE + 12, TILE + 12);

    ctx.fillStyle = '#ff00ff';
    ctx.beginPath();
    ctx.moveTo(fx + TILE / 2, fy + 2);
    ctx.lineTo(fx + TILE - 2, fy + TILE / 2);
    ctx.lineTo(fx + TILE / 2, fy + TILE - 2);
    ctx.lineTo(fx + 2, fy + TILE / 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(fx + TILE / 2 - 2, fy + TILE / 2 - 2, 4, 4);

    // Snake Segments
    snake.forEach((seg, i) => {
        const sx = seg.x * TILE;
        const sy = seg.y * TILE;

        if (i === 0) {
            const grad = ctx.createLinearGradient(sx, sy, sx + TILE, sy + TILE);
            grad.addColorStop(0, '#00ff88');
            grad.addColorStop(1, '#00d4ff');
            ctx.fillStyle = grad;
            ctx.fillRect(sx + 1, sy + 1, TILE - 2, TILE - 2);

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(sx + 1, sy + 1, TILE - 2, TILE - 2);
        } else {
            const ratio = i / Math.max(snake.length, 1);
            if (i % 2 === 0) {
                ctx.fillStyle = `rgba(0, 255, 136, ${Math.max(0.35, 1 - ratio * 0.6)})`;
            } else {
                ctx.fillStyle = `rgba(0, 212, 255, ${Math.max(0.35, 1 - ratio * 0.6)})`;
            }
            ctx.fillRect(sx + 2, sy + 2, TILE - 4, TILE - 4);
        }
    });

    drawEyes();

    // Prompt when waiting for start
    if (waitingForStart) {
        ctx.fillStyle = 'rgba(10, 10, 15, 0.75)';
        ctx.fillRect(BOARD_W / 2 - 240, BOARD_H / 2 + 15, 480, 50);
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 1;
        ctx.strokeRect(BOARD_W / 2 - 240, BOARD_H / 2 + 15, 480, 50);

        ctx.fillStyle = '#00ff88';
        ctx.font = '600 16px "Share Tech Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('> PRESS ARROW KEY OR SWIPE TO INJECT WORM <', BOARD_W / 2, BOARD_H / 2 + 40);
    }
}

// ── Draw Cybernetic Eyes ────────────────────────────
function drawEyes() {
    const head = snake[0];
    const hx = head.x * TILE;
    const hy = head.y * TILE;
    const eyeSize = 3;
    let e1, e2;

    const dx = direction.x || 1;
    const dy = direction.y;

    if (dx === 1 && dy === 0) {
        e1 = { x: hx + 18, y: hy + 6 };
        e2 = { x: hx + 18, y: hy + 16 };
    } else if (dx === -1 && dy === 0) {
        e1 = { x: hx + 4, y: hy + 6 };
        e2 = { x: hx + 4, y: hy + 16 };
    } else if (dy === -1) {
        e1 = { x: hx + 6, y: hy + 4 };
        e2 = { x: hx + 16, y: hy + 4 };
    } else {
        e1 = { x: hx + 6, y: hy + 18 };
        e2 = { x: hx + 16, y: hy + 18 };
    }

    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(e1.x, e1.y, eyeSize, eyeSize);
    ctx.fillRect(e2.x, e2.y, eyeSize, eyeSize);
}

// ── End Game Terminal Overlay ───────────────────────
function endGame() {
    gameOver = true;
    clearInterval(loopId);
    playGameOverSound();

    ctx.fillStyle = 'rgba(10, 10, 15, 0.88)';
    ctx.fillRect(0, 0, BOARD_W, BOARD_H);

    ctx.strokeStyle = '#ff3366';
    ctx.lineWidth = 2;
    ctx.strokeRect(BOARD_W / 2 - 250, BOARD_H / 2 - 100, 500, 200);

    ctx.fillStyle = '#ff3366';
    ctx.font = '900 36px "Orbitron", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CONNECTION TERMINATED', BOARD_W / 2, BOARD_H / 2 - 35);

    ctx.fillStyle = '#00ff88';
    ctx.font = '600 20px "Share Tech Mono", monospace';
    ctx.fillText(`TOTAL BYTES CAPTURED: [${score}]`, BOARD_W / 2, BOARD_H / 2 + 15);

    ctx.fillStyle = '#6b7280';
    ctx.font = '14px "JetBrains Mono", monospace';
    ctx.fillText('SECURITY DAEMON: HOSTILE TRACE SUCCESSFUL', BOARD_W / 2, BOARD_H / 2 + 50);

    restartBtn.style.display = 'inline-block';
}

// ── Event Listeners ─────────────────────────────────
restartBtn.addEventListener('click', () => {
    init();
});

if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
        togglePause();
    });
}

if (pauseOverlay) {
    pauseOverlay.addEventListener('click', () => {
        togglePause();
    });
}

// Mobile Virtual D-Pad buttons
document.querySelectorAll('#virtual-dpad .dpad-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const dir = btn.dataset.dir;
        handleDirectionInput(dir);
    });
});

// Mobile Canvas Touch Swipe
if (window.CyberSystem && window.CyberSystem.attachSwipeListener) {
    window.CyberSystem.attachSwipeListener(canvas, (swipeDir) => {
        handleDirectionInput(swipeDir);
    });
}

// Difficulty Selector
diffBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        diffBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        tickMs = parseInt(btn.dataset.speed, 10);

        if (loopId) clearInterval(loopId);
        loopId = setInterval(gameLoop, tickMs);
    });
});

// Wire up HUD toggles
const audioBtn = document.getElementById('hud-audio-toggle');
if (audioBtn && window.CyberSystem) {
    audioBtn.addEventListener('click', () => {
        window.CyberSystem.Audio.toggleMute();
    });
}

const crtBtn = document.getElementById('hud-crt-toggle');
if (crtBtn && window.CyberSystem) {
    crtBtn.addEventListener('click', () => {
        window.CyberSystem.CRT.toggle();
    });
}

// ── Start ──────────────────────────────────────────
init();
