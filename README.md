# Project: MathQuest PWA - A Science Fair Adventure

Welcome to MathQuest! This is an educational website designed for a science fair, featuring a collection of fun, replayable math games. The goal is to make learning math interactive by embedding mathematical concepts directly into gameplay.

This project is built as a **Progressive Web App (PWA)**, ensuring it is:
*   **Instantly Accessible:** Launchable from a URL or QR code on any device with a web browser (Chromebooks, iPads, phones).
*   **Installable:** Can be added to the home screen for an app-like experience.
*   **Offline Capable:** Core gameplay will be available even with intermittent network connectivity.

This project explores how different gamification mechanics—ranging from casual visual puzzles to real-time physics simulations—impact player engagement and math learning across various age groups.

The project is hosted live on GitHub Pages: [kaisiwon.github.io/science-fair-2026](https://github.io)

---

## How to Use the Site

### Creating an Account
To save your high scores and track your progress, you'll need to create an account.
1.  On the main page, click the "Sign Up" link.
2.  Choose a username.
3.  Create a password that meets the security requirements (you'll see the checklist as you type).
4.  Confirm your password and click "Sign Up".

### Logging In
Once you have an account, you can log in to access your saved data and compete on the leaderboards.

### Playing as a Guest
If you just want to jump in and play, click the "Play as Guest" button. Your scores for the current session will be recorded, but they won't be saved permanently if you close your browser.

---

## How to Play the Games

---

## 🎮 Game Catalogue & How to Play

### 1. Pizza Fraction Parlour
* **Math Focus:** Visual Fractions & Proportions
* **Gameplay Style:** Casual Drag-and-Drop
* **How to Play:** Customers enter your shop and order specific fractional amounts of pizza (e.g., $\frac{3}{4}$ cheese, $\frac{1}{2}$ pepperoni). Drag the correct pre-cut slices onto the serving tray to fulfill the order. Build up speed combos to maximize your score before time runs out.

### 2. Balance Island
* **Math Focus:** Weight Equivalence & Basic Equations
* **Gameplay Style:** Physics-Based Puzzle
* **How to Play:** You are presented with a tilting seesaw. Quirky animals of varying weights appear on screen. Click and place animals on either side of the scale to balance it perfectly. Visual physics cues help you determine values without heavy text reading.

### 3. Merge Matrix
* **Math Focus:** Grid-Based Addition & Factor Modifiers
* **Gameplay Style:** 2048-Inspired Puzzle
* **How to Play:** Use your arrow keys or swipe to slide numbered tiles across a grid. When two identical numbers hit each other, they merge and add together. Special "Operator" tiles (like $+1$ or $\times 2$) occasionally spawn, altering the values of entire rows they pass through.

### 4. Number Forge (The Crafting Rogue-lite)
* **Math Focus:** Pre-Algebra & Order of Operations (PEMDAS/BODMAS)
* **Gameplay Style:** Turn-Based Card Strategy
* **How to Play:** Click on the number and operator cards in your hand to construct a mathematical expression matching the target blueprint number. You must strictly alternate between numbers and operators. Use the `DEL` button to clear mistakes, and hit `Submit` when your equation balances.

### 5. Equation Dungeon
* **Math Focus:** Mental Arithmetic & Processing Speed
* **Gameplay Style:** Turn-Based RPG Solver
* **How to Play:** Navigate a dark dungeon encountering fantasy monsters. Enemy health bars are displayed as math problems. Type the correct answer to launch an attack. Answering quickly triggers critical hit damage, while slower inputs let the monster strike back.

### 6. Number Nomad
* **Math Focus:** Multiples, Factors, and Sign Changes
* **Gameplay Style:** Real-Time Infinite Runner
* **How to Play:** Your character runs forward automatically. Barriers blocking your path are marked with numbers, and your character holds a target score. Use the arrow keys to jump onto platforms containing factors or multiples that adjust your score to match the obstacle's threshold.

### 7. Cipher Heist
* **Math Focus:** Variable Isolation & Algebraic Inequalities
* **Gameplay Style:** Linear Logical Puzzle
* **How to Play:** Bypass a high-security vault system by solving cryptographic puzzles. Isolate the variable $x$ in algebra problems to cut laser wires, crack code matrices by completing abstract number patterns, and balance complex inequality equations before the security countdown triggers.

### 8. Lava Balance (The Physics Challenge)
* **Math Focus:** Angular Geometry & Reactive Trigonometry
* **Gameplay Style:** Real-Time Simulation
* **How to Play:** A bowl filled with molten lava sits on a platform that randomly tilts out of balance. Watch the real-time angle display. Type the exact geometric degree adjustment into the command field and press `Enter` to counteract the drift. Survive as long as possible without spilling!

### 9. Fraction Farmer
* **Math Focus:** Common Denominators & Ratio Scaling
* **Gameplay Style:** Resource Management Strategy
* **How to Play:** Manage a grid-based farm where crops require specific fractional amounts of water and soil. To water fields efficiently, you must find common denominators between different watering cans. Trade harvested crops at the town market using ratio conversion tables to earn profit.

### 10. Market Tycoon (The Simulation Game)
* **Math Focus:** Statistics, Data Literacy, and Percentages
* **Gameplay Style:** Menu-Driven Economic Sim
* **How to Play:** Buy and sell resources across a fluctuating marketplace using menu buttons. Read live line graphs to spot pricing trends. Reinvest cash into stock portfolios or borrow money from banks, balancing compound interest rates and running percentage discounts to avoid bankruptcy.

### 11. Vector Voyage
* **Math Focus:** Coordinate Planes & Matrix Vector Math
* **Gameplay Style:** Spatial Physics Navigator
* **How to Play:** Guide a lost spaceship through an asteroid belt mapped out on a Cartesian coordinate plane. Input movement vectors $(x, y)$ to pilot your ship. Calculate exact line slopes to chart courses around high-gravity black holes that alter your trajectory via dynamic gravitational matrices.

---

## You do not have to read this if you are just playing the game.

## 🛠️ Local Development & Contribution

If you want to run or test these games locally on your machine, follow these simple terminal commands:

1. Clone the repository:
   ```bash
   git clone https://github.com
   ```
2. Navigate to the project directory:
   ```bash
   cd science-fair-2026
   ```
3. Open the main game file in your default browser:
   ```bash
   open index.html
   ```

*Note: For testing file changes instantly without browser cache tracking, it is recommended to open `index.html` inside a Private/Incognito browser window.*
