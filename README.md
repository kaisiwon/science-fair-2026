# Project: MathQuest PWA - A Science Fair Adventure

Welcome to the MathQuest PWA project! This repository contains the source code and documentation for an educational game designed for a science fair. The goal is to create an application that makes learning math fun and interactive by embedding mathematical concepts directly into the core gameplay mechanics.

This project is built as a **Progressive Web App (PWA)**, ensuring it is:
*   **Instantly Accessible:** Launchable from a URL or QR code on any device with a web browser (Chromebooks, iPads, phones).
*   **Installable:** Can be added to the home screen for an app-like experience.
*   **Offline Capable:** Core gameplay will be available even with intermittent network connectivity.

---

## The Game Concepts

We are exploring three distinct game concepts, each targeting different mathematical skills.

### 1. Number Forge (The Crafting Rogue-lite)
*   **Math Focus:** Pre-Algebra, Order of Operations (PEMDAS/BODMAS), Factoring.
*   **Gameplay:** Players are given a "Target Number" and a hand of resource numbers. They must use mathematical operators (+, -, ×, ÷) to combine their numbers and hit the target, defeating monsters or crafting items in a dungeon-crawl setting. Replayability comes from random numbers, procedural maps, and unlockable upgrades like exponents or brackets.

### 2. Lava Balance (The Physics Challenge)
*   **Math Focus:** Angles, Physics Simulation, and Reaction Time.
*   **Gameplay:** A physics-based survival game where players must keep a bowl of lava balanced. The bowl tilts to random angles, and the player must input corrective angles to prevent the lava from spilling. The goal is to survive as long as possible, making it a game of constant, reactive adjustments.

### 3. Market Tycoon (The Simulation Game)
*   **Math Focus:** Statistics, Probability, Percentages, and Graph Literacy.
*   **Gameplay:** Players manage a business (like a space station or theme park) by analyzing real-time data streams, charts, and graphs. They must make quick decisions on buying, selling, and resource allocation based on calculating probabilities and interpreting trends to maximize their net worth.

---

## Tech Stack

*   **Frontend:** HTML5, CSS3, JavaScript (ES6+)
*   **PWA Features:** Service Workers for offline caching, Web App Manifest for installability.
*   **State Management:** IndexedDB for persisting game state instantly (e.g., saving a "Number Forge" run).
*   **Physics & Graphics:** HTML5 Canvas API with Matter.js for the 2D physics simulation in "Lava Balance".

This `README.md` will serve as the front page for your project, helping anyone who discovers it understand its purpose and scope.
