let canvas = document.querySelector("#tetris");
let scoreboard = document.querySelector("#score");
let ctx = canvas.getContext("2d");
ctx.scale(24, 24);

// ── Sound Effects ──
const pointSFX = new Audio("./assets/Point_SFX.mp3");
const gameOverSFX = new Audio("./assets/Game_Over_SFX.mp3");

function playPointSound() {
    pointSFX.currentTime = 0;
    pointSFX.play().catch(() => { });
}

function playGameOverSound() {
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
]

// Apple × Nothing color palette — monochrome + red accent
const COLORS = [
    "rgba(10, 10, 10, 0.9)",   // Background (empty cell)
    "#D71921",                  // Nothing Red — I piece
    "#FFFFFF",                  // Pure White — L piece
    "#B0B0B0",                  // Silver — J piece
    "#707070",                  // Gunmetal — S piece
    "#E0E0E0",                  // Light Gray — Z piece
    "#404040",                  // Charcoal — T piece
    "#C8C8C8"                   // Platinum — O piece
]

// Subtle glow colors matching the palette
const GLOW_COLORS = [
    "transparent",
    "rgba(215, 25, 33, 0.35)",  // Red glow
    "rgba(255, 255, 255, 0.2)", // White glow
    "rgba(176, 176, 176, 0.2)", // Silver glow
    "rgba(112, 112, 112, 0.2)", // Gunmetal glow
    "rgba(224, 224, 224, 0.2)", // Light gray glow
    "rgba(64, 64, 64, 0.2)",    // Charcoal glow
    "rgba(200, 200, 200, 0.2)"  // Platinum glow
]

const ROWS = 20;
const COLS = 10;

let grid = generateGrid();
let fallingPieceObj = null;
let score = 0;
let lastScore = 0;
let gameSpeed = 500;
let gameInterval = setInterval(newGameState, gameSpeed);
let animationFrame = 0;

// Start animation loop
requestAnimationFrame(animateGame);

function animateGame() {
    animationFrame++;
    if (animationFrame % 3 === 0) {
        renderGame();
    }
    requestAnimationFrame(animateGame);
}

function newGameState() {
    checkGrid();
    if (!fallingPieceObj) {
        fallingPieceObj = randomPieceObject();
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
                allFilled = false
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
        score += 100
    }

    // Play point sound and update score
    if (score !== lastScore) {
        playPointSound();
        updateScore();
        lastScore = score;
    }
}

function flashLine(lineIndex) {
    const originalLine = [...grid[lineIndex]];
    grid[lineIndex] = grid[lineIndex].map(() => 0);
    setTimeout(() => {
        if (grid[lineIndex]) {
            renderGame();
        }
    }, 50);
}

function updateScore() {
    scoreboard.innerHTML = "Score: " + score;
    scoreboard.classList.remove('score-pulse');
    void scoreboard.offsetWidth;
    scoreboard.classList.add('score-pulse');

    // Speed up game as score increases
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
            grid[i].push(0)
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
    return { piece, colorIndex, x, y }
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

    // Main block fill
    ctx.fillStyle = COLORS[colorIndex];
    ctx.fillRect(x + padding, y + padding, blockSize - padding * 2, blockSize - padding * 2);

    if (colorIndex !== 0) {
        // Top-left highlight — subtle 3D
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(x + padding, y + padding, blockSize - padding * 2, 0.12);
        ctx.fillRect(x + padding, y + padding, 0.12, blockSize - padding * 2);

        // Bottom-right shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fillRect(x + padding, y + blockSize - padding - 0.08, blockSize - padding * 2, 0.08);
        ctx.fillRect(x + blockSize - padding - 0.08, y + padding, 0.08, blockSize - padding * 2);

        // Subtle glow for active pieces
        if (isActive) {
            ctx.shadowColor = GLOW_COLORS[colorIndex];
            ctx.shadowBlur = 6;
            ctx.fillStyle = COLORS[colorIndex];
            ctx.fillRect(x + padding, y + padding, blockSize - padding * 2, blockSize - padding * 2);
            ctx.shadowBlur = 0;
        }

        // Inner shine dot — small and subtle
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath();
        ctx.arc(x + 0.25, y + 0.25, 0.06, 0, Math.PI * 2);
        ctx.fill();
    }
}

function moveDown() {
    if (!collision(fallingPieceObj.x, fallingPieceObj.y + 1))
        fallingPieceObj.y += 1;
    else {
        let piece = fallingPieceObj.piece
        for (let i = 0; i < piece.length; i++) {
            for (let j = 0; j < piece[i].length; j++) {
                if (piece[i][j] == 1) {
                    let p = fallingPieceObj.x + j;
                    let q = fallingPieceObj.y + i;
                    grid[q][p] = fallingPieceObj.colorIndex;
                }
            }
        }
        // Subtle landing effect
        createLandingEffect();

        if (fallingPieceObj.y == 0) {
            showGameOver();
        }
        fallingPieceObj = null;
    }
    renderGame();
}

function createLandingEffect() {
    canvas.style.transform = 'scale(1.005)';
    setTimeout(() => {
        canvas.style.transform = 'scale(1)';
    }, 80);
}

function showGameOver() {
    clearInterval(gameInterval);

    // Play game over sound
    playGameOverSound();

    // Subtle shake
    canvas.style.animation = 'none';
    canvas.offsetHeight;
    canvas.style.animation = 'shake 0.4s ease-in-out';

    setTimeout(() => {
        const overlay = document.createElement('div');
        overlay.className = 'game-over';
        overlay.id = 'game-over-overlay';
        overlay.innerHTML = `
            <h2>Game Over</h2>
            <p>Final Score: ${score}</p>
            <button class="restart-btn" id="restart-btn">Restart</button>
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

    // Stop game over sound
    stopGameOverSound();

    // Reset all game variables
    grid = generateGrid();
    score = 0;
    lastScore = 0;
    gameSpeed = 500;
    fallingPieceObj = null;

    scoreboard.innerHTML = "Score: 0";

    clearInterval(gameInterval);
    gameInterval = setInterval(newGameState, gameSpeed);

    renderGame();
}

function moveLeft() {
    if (!collision(fallingPieceObj.x - 1, fallingPieceObj.y)) {
        fallingPieceObj.x -= 1;
    }
    renderGame();
}

function moveRight() {
    if (!collision(fallingPieceObj.x + 1, fallingPieceObj.y)) {
        fallingPieceObj.x += 1;
    }
    renderGame();
}

function rotate() {
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
            rotatedPiece[i][j] = piece[j][i]
        }
    }

    for (let i = 0; i < rotatedPiece.length; i++) {
        rotatedPiece[i] = rotatedPiece[i].reverse();
    }
    if (!collision(fallingPieceObj.x, fallingPieceObj.y, rotatedPiece)) {
        fallingPieceObj.piece = rotatedPiece;
    }
    renderGame()
}

function collision(x, y, rotatedPiece) {
    let piece = rotatedPiece || fallingPieceObj.piece
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

    // Draw background grid — subtle checker pattern
    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            ctx.fillStyle = (i + j) % 2 === 0
                ? 'rgba(10, 10, 10, 0.95)'
                : 'rgba(14, 14, 14, 0.95)';
            ctx.fillRect(j, i, 1, 1);

            if (grid[i][j] !== 0) {
                drawBlock(j, i, grid[i][j], false);
            }
        }
    }

    // Draw ghost piece
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
    ctx.globalAlpha = 0.12;
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

// Hard drop
function hardDrop() {
    while (!collision(fallingPieceObj.x, fallingPieceObj.y + 1)) {
        fallingPieceObj.y += 1;
    }
    canvas.style.transform = 'scale(1.015)';
    setTimeout(() => {
        canvas.style.transform = 'scale(1)';
    }, 80);
    moveDown();
}

document.addEventListener("keydown", function (e) {
    if (!fallingPieceObj) return;

    let key = e.key;
    if (key == "ArrowDown") {
        moveDown();
        e.preventDefault();
    } else if (key == "ArrowLeft") {
        moveLeft();
        e.preventDefault();
    } else if (key == "ArrowRight") {
        moveRight();
        e.preventDefault();
    } else if (key == "ArrowUp") {
        rotate();
        e.preventDefault();
    } else if (key == " " || key === "Space") {
        hardDrop();
        e.preventDefault();
    }
})

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

// Initial render
renderGame();