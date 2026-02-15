# 🐍 Snake Game

A classic Snake game built with **vanilla JavaScript** and **HTML5 Canvas**, featuring a premium dark-neon visual theme, sound effects, and three difficulty levels.

## ✨ Features

| Feature | Details |
|---|---|
| **Canvas Board** | 800 × 500 px (32 × 20 tile grid, 25 px tiles) |
| **Smooth Controls** | Arrow-key input with 180° turn prevention |
| **Difficulty Levels** | 🟢 Easy · 🟡 Medium · 🔴 Hard — controls snake speed |
| **Sound Effects** | Point chime on food eat, dramatic tone on game over |
| **Idle Start** | Snake waits at centre until you press an arrow key |
| **Score Tracking** | Live score counter with scale-bump animation |
| **Game Over** | Overlay with final score + restart button |
| **Visuals** | Gradient snake head with directional eyes, glowing food, subtle grid lines |

## 🚀 Getting Started

1. **Clone** the repository:
   ```bash
   git clone https://github.com/<your-username>/Project_Snake.git
   ```
2. **Open** `index.html` in any modern browser — no build step required.

## 🎮 How to Play

- Press any **arrow key** (↑ ↓ ← →) to start moving.
- Eat the **red food** to grow and earn points.
- Avoid **walls** and your own **tail**.
- Pick a difficulty before starting — buttons lock once the game begins.
- Click **↻ Play Again** after game over to restart.

## 📁 Project Structure

```
Project_Snake/
├── index.html          # Page structure — canvas, score, difficulty bar, restart button
├── style.css           # Dark gradient theme, neon glow, animations
├── script.js           # Game logic — movement, food, collision, scoring, sounds
├── assets/
│   ├── Point_SFX.mp3   # Sound effect — eating food
│   └── Game_Over_SFX.mp3  # Sound effect — game over
└── README.md
```

## ⚙️ Tech Stack

- **HTML5 Canvas** — rendering
- **Vanilla CSS** — styling (dark theme, glassmorphism, animations)
- **Vanilla JavaScript** — game logic (no frameworks or libraries)
- **Google Fonts** — [Outfit](https://fonts.google.com/specimen/Outfit)

## 🎚️ Difficulty Levels

| Level | Tick Interval | Feel |
|---|---|---|
| 🟢 Easy | 140 ms | Relaxed, beginner-friendly |
| 🟡 Medium | 100 ms | Balanced (default) |
| 🔴 Hard | 60 ms | Fast and challenging |

## 📜 License

This project is open source and available under the [MIT License](https://opensource.org/licenses/MIT).
