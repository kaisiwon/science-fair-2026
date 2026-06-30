# Gemini Project Plan: MathQuest PWA

This document outlines the project's direction, goals, and development structure, ensuring we stay on track.

## Project Vision

To create a fun, highly replayable educational game for a science fair that teaches core math concepts through gameplay, not just gamified quizzes. The application will be a Progressive Web App (PWA) to ensure maximum accessibility in a school environment.

## Design Thinking Framework

We are following a design thinking process to ensure the final product is desirable for students, feasible to build, and viable as a learning tool.

### 1. Empathize (Current Phase)

This is our most critical first step. Before writing code, we must understand our users (students) and their context.

**Key Questions to Answer:**
1.  **Target Age Group:** Who are we building this for? (e.g., 5th graders, 8th graders, etc.) The answer dramatically changes the complexity and presentation.
2.  **Curriculum Pain Points:** What specific math topic is the most challenging, boring, or abstract for our target users? We should interview a few students and at least one teacher. This is where the real opportunity lies.
3.  **Existing Gaming Habits:** What games do our target users already play and enjoy?
    *   *Puzzle/Card Games?* -> Points toward **Number Forge**.
    *   *Sandbox/Physics Games (like Minecraft, Angry Birds)?* -> Points toward **Vector Vector**.
    *   *Simulation/Tycoon Games (like RollerCoaster Tycoon, Stardew Valley)?* -> Points toward **Market Tycoon**.

### 2. Define (Next Phase)

Based on the "Empathize" findings, we will define a clear problem statement.
*   **Example:** "8th-grade students struggle with understanding how variables in linear equations (`y = mx + b`) affect the slope of a line. They need a way to visualize this relationship in a dynamic and engaging way."

### 3. Ideate

The three concepts (`Number Forge`, `Vector Vector`, `Market Tycoon`) are our initial, broad ideas. The findings from the "Empathize" and "Define" phases will help us select one and refine it to perfectly match the user's needs.

---

## Epics & Stories

Below are the high-level epics for building out this project. Each epic will be broken down into smaller, manageable user stories.

### **Epic 1: Project & PWA Foundation**
*   **Goal:** Set up the basic scaffolding for a PWA.
*   **Stories:**
    *   As a developer, I want a basic `index.html`, `style.css`, and `app.js` so I can start building the UI.
    *   As a developer, I want to create a `manifest.json` file so the app can be installed on a device.
    *   As a developer, I want to implement a `service-worker.js` to cache the app shell (`HTML`, `CSS`, `JS`) for offline access.

---

### **Epic 2: Core Gameplay - Number Forge**
*   **Goal:** Build the main gameplay loop for the Number Forge concept.
*   **Stories:**
    *   As a player, I want to see a "Target Number" and a "Hand" of resource numbers on the screen.
    *   As a player, I want to be able to click on numbers and operators to build a mathematical expression.
    *   As a player, I want the game to validate my expression and tell me if it equals the target.
    *   As a player, I want my game state (current run, score, upgrades) to be saved automatically so I can resume later.

---

### **Epic 3: Core Gameplay - Vector Vector**
*   **Goal:** Build the main gameplay loop for the Vector Vector concept.
*   **Stories:**
    *   As a player, I want to see a game area rendered on an HTML5 Canvas with a base to defend and incoming enemies.
    *   As a player, I want to have an input area where I can type in coordinates or a simple equation (`y = mx + b`).
    *   As a player, I want to press a "Fire" button that launches a projectile along the path I defined.
    *   As a player, I want to see projectiles collide with enemies based on a 2D physics engine.

---

### **Epic 4: Core Gameplay - Market Tycoon**
*   **Goal:** Build the main gameplay loop for the Market Tycoon concept.
*   **Stories:**
    *   As a player, I want to see a dashboard UI with graphs showing supply/demand and charts for my resources.
    *   As a player, I want the game to present me with random event cards that describe a market change (e.g., "+20% value for item X").
    *   As a player, I want to have "Buy" and "Sell" buttons for different resources.
    *   As a player, I want to see my net worth update in real-time based on my decisions.
