================================================================================
                                    TETRIS
================================================================================

OVERVIEW
--------
A premium, browser-based Tetris game built with pure HTML5, CSS3, and 
JavaScript.


DESIGN INSPIRATION
------------------
The visual style is inspired by Apple (apple.com) and Nothing (nothing.tech).

  From Apple: clean minimalism, smooth cubic-bezier transitions, rounded 
  corners, glassmorphic panels with backdrop-filter blur, and a premium feel.

  From Nothing: pure black backgrounds, dot-grid patterns, monochrome color 
  palette with a signature red accent (#D71921), and geometric typography 
  (Space Grotesk font).


COLOR PALETTE
-------------
  Background:     #000000  (Pure Black)
  Surface:        #0A0A0A, #0E0E0E  (Near-black grids)
  Container:      rgba(255,255,255,0.03) with blur  (Glassmorphism)
  Primary Accent: #D71921  (Red)
  Text Primary:   #FFFFFF  (White)
  Text Secondary: rgba(255,255,255,0.6)  (Muted White)

  Piece Colors (monochrome + red accent):
    I-piece:  #D71921  (Red)
    L-piece:  #FFFFFF  (Pure White)
    J-piece:  #B0B0B0  (Silver)
    S-piece:  #707070  (Gunmetal)
    Z-piece:  #E0E0E0  (Light Gray)
    T-piece:  #404040  (Charcoal)
    O-piece:  #C8C8C8  (Platinum)


TECHNOLOGIES USED
-----------------
  • HTML5         — Semantic markup, Canvas API for game rendering
  • CSS3          — Custom properties, animations, backdrop-filter (blur),
                    keyframe animations, responsive media queries
  • JavaScript    — Game logic, collision detection, rendering, audio playback
  • Canvas API    — 2D rendering context scaled to 24x24 pixel blocks
  • Web Audio     — HTML5 Audio elements for sound effects
  • Google Fonts  — Space Grotesk (geometric, tech-inspired typeface)


FILE STRUCTURE
--------------
  Project_Tetris/
  ├── index.html              Main HTML page
  ├── style.css               All styling and theme
  ├── script.js               Game logic, rendering, and audio
  ├── README.txt              This file
  └── assets/
      ├── Point_SFX.mp3       Sound effect — plays on line clear (scoring)
      └── Game_Over_SFX.mp3   Sound effect — plays on game over


HOW THE GAME WORKS
------------------
1. GAME BOARD
   The game board is a 10-column × 20-row grid rendered on an HTML5 Canvas 
   element. Each cell is 24×24 pixels. The canvas is scaled using 
   ctx.scale(24, 24) so all drawing operations use unit coordinates.

2. TETROMINOES
   Seven standard Tetris pieces are defined as 2D arrays:
     I (4×4), L (3×3), J (3×3), S (3×3), Z (3×3), T (3×3), O (2×2)
   Each piece is assigned a color index that maps to the monochrome palette.

3. GAME LOOP
   A setInterval timer runs the main game loop at 500ms intervals (initial 
   speed). Each tick:
     - Checks for completed lines
     - Spawns a new piece if needed
     - Moves the active piece down by one row

4. RENDERING
   A requestAnimationFrame loop renders the game every 3 frames for smooth 
   visuals. Each frame draws:
     - Background grid (subtle checker pattern)
     - Placed blocks with 3D highlights and shadows
     - Ghost piece (transparent preview of landing position)
     - Active falling piece with subtle glow

5. COLLISION DETECTION
   Before any piece movement (left, right, down, rotate), the game checks 
   if the target position overlaps with existing blocks or is out of bounds. 
   If a downward move collides, the piece is locked into the grid.

6. LINE CLEARING
   After each piece is placed, every row is checked. If all 10 cells in a 
   row are filled, that row is cleared, all rows above shift down, and 
   points are awarded.

7. GAME OVER
   If a newly placed piece has its Y position at 0 (top of the board), the 
   game ends. The game-over sound plays and a modal overlay appears with the 
   final score and a restart button.


CONTROLS
--------
  ← Arrow Left    Move piece left
  → Arrow Right   Move piece right
  ↓ Arrow Down    Soft drop (move down one row)
  ↑ Arrow Up      Rotate piece 90° clockwise
  Spacebar        Hard drop (instantly drop to bottom)


SCORING SYSTEM
--------------
  1 line cleared:   10 points
  2 lines cleared:  30 points
  3 lines cleared:  50 points
  4+ lines cleared: 100 points

  The game speed increases every 100 points (interval decreases by 50ms, 
  minimum 100ms), making the game progressively harder.


SOUND EFFECTS
-------------
  • Point_SFX.mp3     — Plays each time the player clears one or more lines 
                         and earns points. The sound resets (currentTime = 0) 
                         before playing so rapid line clears replay correctly.

  • Game_Over_SFX.mp3 — Plays when the game ends. Automatically stops when 
                         the player clicks the Restart button.


VISUAL FEATURES
---------------
  • Dot-grid background pattern
  • Glassmorphic game container with backdrop blur
  • Ghost piece — shows where the active piece will land
  • Subtle 3D block rendering with highlights and shadows
  • Score pulse animation with red flash on point gain
  • Smooth modal animation for game-over screen
  • Clean, geometric restart button
  • Responsive design for mobile and desktop


HOW TO RUN
----------
  1. Open the Project_Tetris folder
  2. Double-click index.html (or open it in any modern web browser)
  3. No server, build tools, or dependencies required
  4. Recommended browsers: Chrome, Edge, Firefox, Safari


================================================================================
  Built with HTML5, CSS3, and JavaScript
================================================================================
