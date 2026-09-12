/* ==========================================================================
   CYBERPUNK SYSTEM - SHARED UTILITIES & AUDIO SYNTHESIZER
   Zero-Asset Web Audio API, Persistent High Scores & HUD Controls
   ========================================================================== */

(function (window) {
    'use strict';

    // ── 1. Web Audio API Procedural Synthesizer ───────────────────────
    let audioCtx = null;

    function getAudioContext() {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                audioCtx = new AudioContextClass();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    const CyberAudio = {
        isMuted() {
            return localStorage.getItem('cyber_audio_muted') === 'true';
        },

        setMuted(muted) {
            localStorage.setItem('cyber_audio_muted', muted ? 'true' : 'false');
            this.updateToggles();
        },

        toggleMute() {
            const newMuted = !this.isMuted();
            this.setMuted(newMuted);
            if (!newMuted) {
                this.playClick();
            }
            return newMuted;
        },

        updateToggles() {
            const muted = this.isMuted();
            document.querySelectorAll('.hud-audio-toggle').forEach(btn => {
                btn.textContent = muted ? '[VOL: OFF]' : '[VOL: ON]';
                btn.classList.toggle('off', muted);
            });
        },

        // Subtle high-frequency hover blip (1600Hz -> 2200Hz, 25ms)
        playHover() {
            if (this.isMuted()) return;
            try {
                const ctx = getAudioContext();
                if (!ctx) return;

                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(1400, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(2200, ctx.currentTime + 0.03);

                gain.gain.setValueAtTime(0.04, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start();
                osc.stop(ctx.currentTime + 0.035);
            } catch (e) { }
        },

        // Tactical laser click chirp (2800Hz -> 400Hz, 40ms)
        playClick() {
            if (this.isMuted()) return;
            try {
                const ctx = getAudioContext();
                if (!ctx) return;

                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(2800, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.04);

                gain.gain.setValueAtTime(0.08, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start();
                osc.stop(ctx.currentTime + 0.045);
            } catch (e) { }
        },

        // Harmonic Cyber Success Chime (Twin notes: 523Hz & 784Hz)
        playSuccess() {
            if (this.isMuted()) return;
            try {
                const ctx = getAudioContext();
                if (!ctx) return;

                [523.25, 783.99].forEach((freq, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();

                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

                    gain.gain.setValueAtTime(0.07, ctx.currentTime + idx * 0.08);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.15);

                    osc.connect(gain);
                    gain.connect(ctx.destination);

                    osc.start(ctx.currentTime + idx * 0.08);
                    osc.stop(ctx.currentTime + idx * 0.08 + 0.16);
                });
            } catch (e) { }
        },

        // Breach / Alert Sawtooth Tone
        playAlert() {
            if (this.isMuted()) return;
            try {
                const ctx = getAudioContext();
                if (!ctx) return;

                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(320, ctx.currentTime);
                osc.frequency.linearRampToValueAtTime(140, ctx.currentTime + 0.12);

                gain.gain.setValueAtTime(0.09, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start();
                osc.stop(ctx.currentTime + 0.13);
            } catch (e) { }
        }
    };

    // ── 2. Player Records Manager (localStorage) ─────────────────────
    const CyberScores = {
        KEYS: {
            memory: 'cyber_memory_best_level',
            rps: 'cyber_rps_best_streak',
            snake: 'cyber_snake_max_bytes',
            tetris: 'cyber_tetris_high_score'
        },

        get(gameKey) {
            const key = this.KEYS[gameKey] || gameKey;
            const val = localStorage.getItem(key);
            return val ? parseInt(val, 10) : 0;
        },

        set(gameKey, val) {
            const current = this.get(gameKey);
            const numVal = parseInt(val, 10) || 0;
            if (numVal > current) {
                const key = this.KEYS[gameKey] || gameKey;
                localStorage.setItem(key, numVal.toString());
                CyberAudio.playSuccess();
                return true; // New record set!
            }
            return false;
        },

        getAll() {
            return {
                memory: this.get('memory'),
                rps: this.get('rps'),
                snake: this.get('snake'),
                tetris: this.get('tetris')
            };
        }
    };

    // ── 3. CRT Scanline Toggle ───────────────────────────────────────
    const CyberCRT = {
        isDisabled() {
            return localStorage.getItem('cyber_crt_disabled') === 'true';
        },

        apply() {
            const disabled = this.isDisabled();
            document.body.classList.toggle('no-scanlines', disabled);
            this.updateToggles();
        },

        toggle() {
            const newDisabled = !this.isDisabled();
            localStorage.setItem('cyber_crt_disabled', newDisabled ? 'true' : 'false');
            this.apply();
            CyberAudio.playClick();
            return newDisabled;
        },

        updateToggles() {
            const disabled = this.isDisabled();
            document.querySelectorAll('.hud-crt-toggle').forEach(btn => {
                btn.textContent = disabled ? '[CRT: OFF]' : '[CRT: ON]';
                btn.classList.toggle('off', disabled);
            });
        }
    };

    // ── 4. Mobile Swipe Gesture Helper ──────────────────────────────
    function attachSwipeListener(element, onSwipe) {
        let touchStartX = 0;
        let touchStartY = 0;
        const MIN_DISTANCE = 30;

        element.addEventListener('touchstart', (e) => {
            if (e.touches && e.touches.length > 0) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }
        }, { passive: true });

        element.addEventListener('touchend', (e) => {
            if (!e.changedTouches || e.changedTouches.length === 0) return;
            const deltaX = e.changedTouches[0].clientX - touchStartX;
            const deltaY = e.changedTouches[0].clientY - touchStartY;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (Math.abs(deltaX) >= MIN_DISTANCE) {
                    onSwipe(deltaX > 0 ? 'Right' : 'Left');
                }
            } else {
                if (Math.abs(deltaY) >= MIN_DISTANCE) {
                    onSwipe(deltaY > 0 ? 'Down' : 'Up');
                }
            }
        }, { passive: true });
    }

    // ── 5. Auto-Initialize Audio on Interaction ──────────────────────
    document.addEventListener('DOMContentLoaded', () => {
        CyberCRT.apply();
        CyberAudio.updateToggles();

        // Attach audio blips to interactive elements
        function attachAudioListeners() {
            const interactives = document.querySelectorAll('a, button, .game-card, .choice, .diff-btn, .btn');
            interactives.forEach(el => {
                if (!el.dataset.cyberAudioBound) {
                    el.dataset.cyberAudioBound = 'true';
                    el.addEventListener('mouseenter', () => CyberAudio.playHover());
                    el.addEventListener('click', () => CyberAudio.playClick());
                }
            });
        }
        attachAudioListeners();

        // Observe DOM for dynamic element creation (modals, buttons, etc.)
        const observer = new MutationObserver(() => {
            attachAudioListeners();
        });
        observer.observe(document.body, { childList: true, subtree: true });

        // Initialize AudioContext on first touch/click
        const startAudioOnce = () => {
            getAudioContext();
            document.removeEventListener('click', startAudioOnce);
            document.removeEventListener('keydown', startAudioOnce);
            document.removeEventListener('touchstart', startAudioOnce);
        };
        document.addEventListener('click', startAudioOnce);
        document.addEventListener('keydown', startAudioOnce);
        document.addEventListener('touchstart', startAudioOnce);
    });

    // Expose global API
    window.CyberSystem = {
        Audio: CyberAudio,
        Scores: CyberScores,
        CRT: CyberCRT,
        attachSwipeListener: attachSwipeListener
    };

})(window);
