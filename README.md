# Project: MathQuest PWA - A Science Fair Adventure

Welcome to the MathQuest PWA project! This repository contains the source code and documentation for an educational game designed for a science fair. The goal is to create an application that makes learning math fun and interactive by embedding mathematical concepts directly into the core gameplay mechanics.

This project is built as a **Progressive Web App (PWA)**, ensuring it is:
*   **Instantly Accessible:** Launchable from a URL or QR code on any device with a web browser (Chromebooks, iPads, phones).
*   **Installable:** Can be added to the home screen for an app-like experience.
*   **Offline Capable:** Core gameplay will be available even with intermittent network connectivity.

---

## Implemented Games

Here are the games currently playable in the MathQuest PWA.

### 1. Lava Balance (The Physics Challenge)
*   **Math Focus:** Angles, Physics Simulation, and Reaction Time.
*   **Gameplay:** A physics-based survival game where players must keep a bowl of lava balanced. The bowl tilts to random angles, and the player must input corrective angles to prevent the lava from spilling. The goal is to survive as long as possible, making it a game of constant, reactive adjustments.

### 2. Market Tycoon (The Simulation Game)
*   **Math Focus:** Statistics, Probability, Percentages, and Graph Literacy.
*   **Gameplay:** Players manage a business (like a space station or theme park) by analyzing real-time data streams, charts, and graphs. They must make quick decisions on buying, selling, and resource allocation based on calculating probabilities and interpreting trends to maximize their net worth.

---

## Future Concepts

### Number Forge (The Crafting Rogue-lite)
*   **Math Focus:** Pre-Algebra, Order of Operations (PEMDAS/BODMAS), Factoring.
*   **Gameplay:** Players are given a "Target Number" and a hand of resource numbers. They must use mathematical operators (+, -, ×, ÷) to combine their numbers and hit the target, defeating monsters or crafting items in a dungeon-crawl setting. Replayability comes from random numbers, procedural maps, and unlockable upgrades like exponents or brackets.

---

## Tech Stack

*   **Frontend:** HTML5, CSS3, JavaScript (ES6+)
*   **PWA Features:** Service Workers for offline caching, Web App Manifest for installability.
*   **State Management:** IndexedDB for persisting game state instantly (e.g., saving a "Number Forge" run).
*   **Physics & Graphics:** HTML5 Canvas API with Matter.js for the 2D physics simulation in "Lava Balance".
*   **Authentication:** Local user accounts are managed via IndexedDB with password hashing using the Web Crypto API.

This `README.md` will serve as the front page for your project, helping anyone who discovers it understand its purpose and scope.

---

## Deployment

This project is a static web application, which makes it very easy to deploy on a variety of free hosting services.

### Recommended Service: GitHub Pages

**GitHub Pages** is the simplest and most direct way to deploy this project, as the code is already hosted on GitHub.

**Steps to Deploy:**

1.  **Ensure `index.html` is in the Root:** Your main `index.html` file should be in the root directory of your repository.
2.  **Navigate to Repository Settings:** In your GitHub repository, go to `Settings` > `Pages`.
3.  **Select a Source:** Under the "Build and deployment" section, choose `Deploy from a branch`.
4.  **Choose the Branch:** Select your main branch (e.g., `main` or `master`) from the dropdown and keep the folder as `/root`. Click `Save`.
5.  **Wait for Deployment:** GitHub Actions will start a deployment process. After a minute or two, your site will be live at a URL like `https://<your-username>.github.io/science-fair-26/`. The URL will be displayed on the Pages settings screen.

### Other Free Options

If you need more advanced features in the future (like server-side logic), you could consider these platforms:

*   **Netlify:** Offers a simple drag-and-drop interface or Git-based deployments. It's very fast and has a generous free tier.
*   **Vercel:** Similar to Netlify, Vercel is another excellent platform for deploying static sites and serverless functions. It's known for its speed and great developer experience.
*   **Cloudflare Pages:** A strong competitor focused on performance and security, also with a great free tier for static projects.
