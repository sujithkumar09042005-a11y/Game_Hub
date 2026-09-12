document.addEventListener('DOMContentLoaded', () => {
    const reticle = document.getElementById('cyber-reticle');
    const dot = document.getElementById('cursor-dot');
    const interactiveElements = document.querySelectorAll('a, button, .game-card');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let reticleX = mouseX;
    let reticleY = mouseY;

    // ── Mouse & Reticle Tracking ────────────────────────────────────
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (dot) {
            dot.style.left = `${mouseX}px`;
            dot.style.top = `${mouseY}px`;
        }
    });

    function animateReticle() {
        reticleX += (mouseX - reticleX) * 0.18;
        reticleY += (mouseY - reticleY) * 0.18;

        if (reticle) {
            reticle.style.left = `${reticleX}px`;
            reticle.style.top = `${reticleY}px`;
        }

        requestAnimationFrame(animateReticle);
    }
    animateReticle();

    interactiveElements.forEach((el) => {
        el.addEventListener('mouseenter', () => {
            if (reticle) reticle.classList.add('hovered');
        });

        el.addEventListener('mouseleave', () => {
            if (reticle) reticle.classList.remove('hovered');
        });
    });

    // ── Populate Personal Best Records (localStorage) ──────────────
    if (window.CyberSystem && window.CyberSystem.Scores) {
        const scores = window.CyberSystem.Scores.getAll();

        const memoryEl = document.getElementById('record-memory');
        if (memoryEl) {
            memoryEl.textContent = `BEST: LVL ${scores.memory}`;
        }

        const rpsEl = document.getElementById('record-rps');
        if (rpsEl) {
            rpsEl.textContent = `BEST STREAK: ${scores.rps} WINS`;
        }

        const snakeEl = document.getElementById('record-snake');
        if (snakeEl) {
            snakeEl.textContent = `RECORD: ${scores.snake} BYTES`;
        }

        const tetrisEl = document.getElementById('record-tetris');
        if (tetrisEl) {
            tetrisEl.textContent = `HIGH SCORE: ${scores.tetris}`;
        }
    }

    // ── Wire up HUD System Toggles ──────────────────────────────────
    const audioToggle = document.getElementById('hud-audio-toggle');
    if (audioToggle && window.CyberSystem) {
        audioToggle.addEventListener('click', () => {
            window.CyberSystem.Audio.toggleMute();
        });
    }

    const crtToggle = document.getElementById('hud-crt-toggle');
    if (crtToggle && window.CyberSystem) {
        crtToggle.addEventListener('click', () => {
            window.CyberSystem.CRT.toggle();
        });
    }

    // ── Random Micro-Glitch on Title ────────────────────────────────
    const glitchTitle = document.querySelector('.cyber-glitch');
    if (glitchTitle) {
        setInterval(() => {
            if (Math.random() > 0.7) {
                glitchTitle.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 2 - 1}px)`;
                setTimeout(() => {
                    glitchTitle.style.transform = 'translate(0, 0)';
                }, 80);
            }
        }, 2400);
    }
});
