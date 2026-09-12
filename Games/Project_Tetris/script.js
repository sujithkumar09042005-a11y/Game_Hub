let canvas = document.querySelector("#tetris");
let scoreboard = document.querySelector("#score");
let bestScoreEl = document.querySelector("#best-score");
let nextCanvas = document.querySelector("#next-canvas");
let pauseBtn = document.querySelector("#pause-btn");
let pauseOverlay = document.querySelector("#pause-overlay");

let ctx = canvas.getContext("2d");
ctx.scale(24, 24);

let nextCtx = nextCanvas.getContext("2d");
nextCtx.scale(24, 24);

// ── Sound Effects ──
const pointSFX = new Audio("./assets/Point_SFX.mp3");
const gameOverSFX = new Audio("./assets/Game_Over_SFX.mp3");

function playPointSound() {
    if (window.CyberSystem && window.CyberSystem.Audio && window.CyberSystem.Audio.isMuted()) return;
    pointSFX.currentTime = 0;
    pointSFX.play().catch(() => { });
}

function playGameOverSound() {
    if (window.CyberSystem && window.CyberSystem.Audio && window.CyberSystem.Audio.isMuted()) return;
    gameOverSFX.currentTime = 0;
    gameOverSFX.play().catch(() => { });
}

function stopGameOverSound() {
    gameOverSFX.pause();
    gameOverSFX.currentTime = 0;
}

// ── Tetromino Shapes ──
const SHAPES = [
    [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0]
    ],
    [
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 0]
    ],
    [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 1]
    ],
    [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ],
    [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],
    [
        [1, 1, 1],
        [0, 1, 0],
        [0, 0, 0]
    ],
    [
        [1, 1],
        [1, 1],
    ]
];

// Cyberpunk Neon Color Palette
const COLORS = [
    "rgba(10, 10, 15, 0.95)",   // Background (empty cell)
    "#00ff88",                  // Matrix Green — I piece
    "#ff00ff",                  // Hot Magenta — L piece
    "#00d4ff",                  // Electric Cyan — J piece
    "#ffe600",                  // Neon Yellow — S piece
    "#a855f7",                  // Neon Violet — Z piece
    "#ff6b00",                  // Cyber Orange — T piece
    "#ff0055"                   // Crimson Pink — O piece
];

// Cyberpunk Neon Glow Stacks
const GLOW_COLORS = [
    "transparent",
    "rgba(0, 255, 136, 0.65)",  // Green glow
    "rgba(255, 0, 255, 0.65)",  // Magenta glow
    "rgba(0, 212, 255, 0.65)",  // Cyan glow
    "rgba(255, 230, 0, 0.65)",  // Yellow glow
    "rgba(168, 85, 247, 0.65)", // Violet glow
    "rgba(255, 107, 0, 0.65)",  // Orange glow
    "rgba(255, 0, 85, 0.65)"    // Crimson glow
];

const ROWS = 20;
const COLS = 10;

let grid = generateGrid();
let fallingPieceObj = null;
let nextPieceObj = randomPieceObject();
let score = 0;
let lastScore = 0;
let gameSpeed = 500;
let gameInterval = setInterval(newGameState, gameSpeed);
let animationFrame = 0;
let isPaused = false;

function updateBestScoreUI() {
    if (bestScoreEl && window.CyberSystem && window.CyberSystem.Scores) {
        const best = window.CyberSystem.Scores.get('tetris');
        bestScoreEl.textContent = best;
    }
}
updateBestScoreUI();

// ── Next Piece Canvas Rendering ─────────────────────
function renderNextPiece() {
    nextCtx.clearRect(0, 0, 4, 4);

    // Subtle dark background
    nextCtx.fillStyle = 'rgba(10, 10, 15, 0.9)';
    nextCtx.fillRect(0, 0, 4, 4);

    if (!nextPieceObj) return;

    const piece = nextPieceObj.piece;
    const colorIndex = nextPieceObj.colorIndex;

    // Center offset calculation
    const offsetX = (4 - piece[0].length) / 2;
    const offsetY = (4 - piece.length) / 2;

    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            if (piece[i][j] === 1) {
                const px = offsetX + j;
                const py = offsetY + i;
                const blockSize = 1;
                const padding = 0.08;

                nextCtx.fillStyle = COLORS[colorIndex];
                nextCtx.fillRect(px + padding, py + padding, blockSize - padding * 2, blockSize - padding * 2);

                nextCtx.strokeStyle = '#ffffff';
                nextCtx.lineWidth = 0.05;
                nextCtx.strokeRect(px + padding, py + padding, blockSize - padding * 2, blockSize - padding * 2);
            }
        }
    }
}

// ── Pause Feature ───────────────────────────────────
function togglePause() {
    isPaused = !isPaused;

    if (isPaused) {
        clearInterval(gameInterval);
        if (pauseOverlay) pauseOverlay.style.display = 'flex';
        if (pauseBtn) pauseBtn.textContent = '[RESUME: P]';
        if (window.CyberSystem && window.CyberSystem.Audio) window.CyberSystem.Audio.playAlert();
    } else {
        gameInterval = setInterval(newGameState, gameSpeed);
        if (pauseOverlay) pauseOverlay.style.display = 'none';
        if (pauseBtn) pauseBtn.textContent = '[PAUSE: P]';
        if (window.CyberSystem && window.CyberSystem.Audio) window.CyberSystem.Audio.playClick();
    }
}

// Start animation loop
requestAnimationFrame(animateGame);

function animateGame() {
    animationFrame++;
    if (animationFrame % 3 === 0 && !isPaused) {
        renderGame();
    }
    requestAnimationFrame(animateGame);
}

function newGameState() {
    if (isPaused) return;

    checkGrid();
    if (!fallingPieceObj) {
        fallingPieceObj = nextPieceObj || randomPieceObject();
        nextPieceObj = randomPieceObject();
        renderNextPiece();
        renderPiece();
    }
    moveDown();
}

function checkGrid() {
    let count = 0;
    for (let i = 0; i < grid.length; i++) {
        let allFilled = true;
        for (let j = 0; j < grid[0].length; j++) {
            if (grid[i][j] == 0) {
                allFilled = false;
            }
        }
        if (allFilled) {
            count++;
            flashLine(i);
            grid.splice(i, 1);
            grid.unshift([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        }
    }
    if (count == 1) {
        score += 10;
    } else if (count == 2) {
        score += 30;
    } else if (count == 3) {
        score += 50;
    } else if (count > 3) {
        score += 100;
    }

    // Play point sound and update score
    if (score !== lastScore) {
        playPointSound();
        updateScore();
        lastScore = score;

        if (window.CyberSystem && window.CyberSystem.Scores) {
            window.CyberSystem.Scores.set('tetris', score);
            updateBestScoreUI();
        }
    }
}

function flashLine(lineIndex) {
    grid[lineIndex] = grid[lineIndex].map(() => 0);
    setTimeout(() => {
        if (grid[lineIndex]) {
            renderGame();
        }
    }, 50);
}

function updateScore() {
    scoreboard.innerHTML = "DEFRAG_SCORE: " + score;
    scoreboard.classList.remove('score-pulse');
    void scoreboard.offsetWidth;
    scoreboard.classList.add('score-pulse');

    if (score > 0 && score % 100 === 0) {
        clearInterval(gameInterval);
        gameSpeed = Math.max(100, gameSpeed - 50);
        gameInterval = setInterval(newGameState, gameSpeed);
    }
}

function generateGrid() {
    let grid = [];
    for (let i = 0; i < ROWS; i++) {
        grid.push([]);
        for (let j = 0; j < COLS; j++) {
            grid[i].push(0);
        }
    }
    return grid;
}

function randomPieceObject() {
    let ran = Math.floor(Math.random() * 7);
    let piece = SHAPES[ran];
    let colorIndex = ran + 1;
    let x = 4;
    let y = 0;
    return { piece, colorIndex, x, y };
}

function renderPiece() {
    let piece = fallingPieceObj.piece;
    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            if (piece[i][j] == 1) {
                drawBlock(
                    fallingPieceObj.x + j,
                    fallingPieceObj.y + i,
                    fallingPieceObj.colorIndex,
                    true
                );
            }
        }
    }
}

function drawBlock(x, y, colorIndex, isActive = false) {
    const blockSize = 1;
    const padding = 0.05;

    ctx.fillStyle = COLORS[colorIndex];
    ctx.fillRect(x + padding, y + padding, blockSize - padding * 2, blockSize - padding * 2);

    if (colorIndex !== 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fillRect(x + padding, y + padding, blockSize - padding * 2, 0.12);
        ctx.fillRect(x + padding, y + padding, 0.12, blockSize - padding * 2);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fillRect(x + padding, y + blockSize - padding - 0.08, blockSize - padding * 2, 0.08);
        ctx.fillRect(x + blockSize - padding - 0.08, y + padding, 0.08, blockSize - padding * 2);

        if (isActive) {
            ctx.shadowColor = GLOW_COLORS[colorIndex];
            ctx.shadowBlur = 6;
            ctx.fillStyle = COLORS[colorIndex];
            ctx.fillRect(x + padding, y + padding, blockSize - padding * 2, blockSize - padding * 2);
            ctx.shadowBlur = 0;
        }

        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.beginPath();
        ctx.arc(x + 0.25, y + 0.25, 0.06, 0, Math.PI * 2);
        ctx.fill();
    }
}

function moveDown() {
    if (isPaused || !fallingPieceObj) return;

    if (!collision(fallingPieceObj.x, fallingPieceObj.y + 1)) {
        fallingPieceObj.y += 1;
    } else {
        let piece = fallingPieceObj.piece;
        for (let i = 0; i < piece.length; i++) {
            for (let j = 0; j < piece[i].length; j++) {
                if (piece[i][j] == 1) {
                    let p = fallingPieceObj.x + j;
                    let q = fallingPieceObj.y + i;
                    grid[q][p] = fallingPieceObj.colorIndex;
                }
            }
        }
        createLandingEffect();

        if (fallingPieceObj.y == 0) {
            showGameOver();
        }
        fallingPieceObj = null;
    }
    renderGame();
}

function createLandingEffect() {
    canvas.style.transform = 'scale(1.008)';
    setTimeout(() => {
        canvas.style.transform = 'scale(1)';
    }, 80);
}

function showGameOver() {
    clearInterval(gameInterval);
    playGameOverSound();

    canvas.style.animation = 'none';
    canvas.offsetHeight;
    canvas.style.animation = 'shake 0.4s ease-in-out';

    setTimeout(() => {
        const overlay = document.createElement('div');
        overlay.className = 'game-over cyber-chamfer';
        overlay.id = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="cyber-badge" style="margin-bottom: 1rem;">FATAL CORRUPTION</div>
            <h2>SYSTEM OVERLOAD</h2>
            <p>&gt; DEFRAG BUFFER OVERFLOW</p>
            <p class="final-score-text">FINAL SCORE: [${score}]</p>
            <button class="restart-btn cyber-chamfer-sm" id="restart-btn">&gt; REBOOT CORE</button>
        `;
        document.body.appendChild(overlay);
        document.getElementById('restart-btn').addEventListener('click', restartGame);
    }, 400);
}

function restartGame() {
    const overlay = document.getElementById('game-over-overlay');
    if (overlay) {
        overlay.remove();
    }

    stopGameOverSound();

    grid = generateGrid();
    score = 0;
    lastScore = 0;
    gameSpeed = 500;
    fallingPieceObj = null;
    nextPieceObj = randomPieceObject();
    isPaused = false;

    if (pauseOverlay) pauseOverlay.style.display = 'none';
    if (pauseBtn) pauseBtn.textContent = '[PAUSE: P]';

    scoreboard.innerHTML = "DEFRAG_SCORE: 0";

    clearInterval(gameInterval);
    gameInterval = setInterval(newGameState, gameSpeed);

    renderNextPiece();
    renderGame();
}

function moveLeft() {
    if (isPaused || !fallingPieceObj) return;
    if (!collision(fallingPieceObj.x - 1, fallingPieceObj.y)) {
        fallingPieceObj.x -= 1;
    }
    renderGame();
}

function moveRight() {
    if (isPaused || !fallingPieceObj) return;
    if (!collision(fallingPieceObj.x + 1, fallingPieceObj.y)) {
        fallingPieceObj.x += 1;
    }
    renderGame();
}

function rotate() {
    if (isPaused || !fallingPieceObj) return;
    let rotatedPiece = [];
    let piece = fallingPieceObj.piece;
    for (let i = 0; i < piece.length; i++) {
        rotatedPiece.push([]);
        for (let j = 0; j < piece[i].length; j++) {
            rotatedPiece[i].push(0);
        }
    }
    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            rotatedPiece[i][j] = piece[j][i];
        }
    }

    for (let i = 0; i < rotatedPiece.length; i++) {
        rotatedPiece[i] = rotatedPiece[i].reverse();
    }
    if (!collision(fallingPieceObj.x, fallingPieceObj.y, rotatedPiece)) {
        fallingPieceObj.piece = rotatedPiece;
    }
    renderGame();
}

function collision(x, y, rotatedPiece) {
    let piece = rotatedPiece || fallingPieceObj.piece;
    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            if (piece[i][j] == 1) {
                let p = x + j;
                let q = y + i;
                if (p >= 0 && p < COLS && q >= 0 && q < ROWS) {
                    if (grid[q][p] > 0) {
                        return true;
                    }
                } else {
                    return true;
                }
            }
        }
    }
    return false;
}

function renderGame() {
    ctx.clearRect(0, 0, COLS, ROWS);

    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            ctx.fillStyle = (i + j) % 2 === 0
                ? 'rgba(10, 10, 15, 0.95)'
                : 'rgba(18, 18, 26, 0.95)';
            ctx.fillRect(j, i, 1, 1);

            if (grid[i][j] !== 0) {
                drawBlock(j, i, grid[i][j], false);
            }
        }
    }

    if (fallingPieceObj) {
        drawGhostPiece();
        renderPiece();
    }
}

function drawGhostPiece() {
    let ghostY = fallingPieceObj.y;
    while (!collision(fallingPieceObj.x, ghostY + 1)) {
        ghostY++;
    }

    let piece = fallingPieceObj.piece;
    ctx.globalAlpha = 0.15;
    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            if (piece[i][j] == 1) {
                ctx.fillStyle = COLORS[fallingPieceObj.colorIndex];
                ctx.fillRect(fallingPieceObj.x + j, ghostY + i, 0.9, 0.9);
            }
        }
    }
    ctx.globalAlpha = 1;
}

function hardDrop() {
    if (isPaused || !fallingPieceObj) return;
    while (!collision(fallingPieceObj.x, fallingPieceObj.y + 1)) {
        fallingPieceObj.y += 1;
    }
    canvas.style.transform = 'scale(1.02)';
    setTimeout(() => {
        canvas.style.transform = 'scale(1)';
    }, 80);
    moveDown();
}

// ── Keyboard Input ──────────────────────────────────
document.addEventListener("keydown", function (e) {
    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        togglePause();
        e.preventDefault();
        return;
    }

    if (isPaused || !fallingPieceObj) return;

    let key = e.key;
    if (key == "ArrowDown" || key === 's' || key === 'S') {
        moveDown();
        e.preventDefault();
    } else if (key == "ArrowLeft" || key === 'a' || key === 'A') {
        moveLeft();
        e.preventDefault();
    } else if (key == "ArrowRight" || key === 'd' || key === 'D') {
        moveRight();
        e.preventDefault();
    } else if (key == "ArrowUp" || key === 'w' || key === 'W') {
        rotate();
        e.preventDefault();
    } else if (key == " " || key === "Space") {
        hardDrop();
        e.preventDefault();
    }
});

// ── Mobile Controls Click Listeners ─────────────────
const ctrlLeft = document.getElementById("ctrl-left");
const ctrlRotate = document.getElementById("ctrl-rotate");
const ctrlRight = document.getElementById("ctrl-right");
const ctrlSoft = document.getElementById("ctrl-soft");
const ctrlHard = document.getElementById("ctrl-hard");

if (ctrlLeft) ctrlLeft.addEventListener("click", () => moveLeft());
if (ctrlRotate) ctrlRotate.addEventListener("click", () => rotate());
if (ctrlRight) ctrlRight.addEventListener("click", () => moveRight());
if (ctrlSoft) ctrlSoft.addEventListener("click", () => moveDown());
if (ctrlHard) ctrlHard.addEventListener("click", () => hardDrop());

if (pauseBtn) pauseBtn.addEventListener("click", () => togglePause());
if (pauseOverlay) pauseOverlay.addEventListener("click", () => togglePause());

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

// Shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
        20%, 40%, 60%, 80% { transform: translateX(3px); }
    }
`;
document.head.appendChild(style);

// Initial renders
renderNextPiece();
renderGame();