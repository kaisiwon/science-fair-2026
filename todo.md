# Project Todo List: MathQuest PWA

This is a checklist of tasks to guide the development of the project from setup to completion.

### Phase 1: Pre-production & Research (Week 1)
- [x] **Identify Target Audience:** 6th-8th Grade (Ages 11-14). This aligns with Pre-Algebra and Order of Operations curriculum.
- [x] **Conduct User Research:**
    - [x] **Pain Point:** Students struggle with multi-step problems and remembering the order of operations (PEMDAS). Factoring feels abstract.
    - [x] **Gaming Habits:** Students enjoy puzzle games, crafting/alchemy games, and card-based strategy games. This validates the "Number Forge" concept.
- [x] **Select Game Concept:** Based on research, choose one of the three concepts (`Number Forge`, `Vector Vector`, or `Market Tycoon`) to develop.
- [x] **Define MVP (Minimum Viable Product):** A single-screen game where a player can use a static set of numbers and operators to hit a static target number. The core loop of building, submitting, and clearing an expression must be functional.

### Phase 2: Project Setup & Prototyping (Week 2)
- [x] **Initialize Git Repository:** Set up the project on a platform like GitHub.
- [ ] **Create PWA Boilerplate:**
    - [x] `index.html` with basic structure.
    - [x] `style.css` for initial styling.
    - [x] `app.js` for main application logic.
    - [x] `manifest.json` with app name, icons, and colors.
    - [x] `service-worker.js` for basic offline caching of the app shell.
- [x] **Create Wireframes:** Sketch out the main screens for the chosen game concept (e.g., main menu, game screen, game over screen).

### Phase 3: Core Gameplay Development (Weeks 3-5)
- [x] **Implement Main Game Screen UI:** Translate the wireframe into HTML and CSS.
- [ ] **Develop Core Game Logic (JavaScript):**
    - **If `Number Forge`:**
        - [x] Function to generate random target numbers and hands.
        - [x] Logic to handle player input and expression evaluation.
        - [x] State management for the current run.
    - **If `Vector Vector`:**
        - [ ] Set up HTML5 Canvas and rendering loop.
        - [ ] Integrate Matter.js or another physics engine.
        - [ ] Logic to parse user input (equations/vectors) and create projectiles.
    - **If `Market Tycoon`:**
        - [ ] Create data structures for resources and market values.
        - [ ] Implement a game loop for passing "days" and triggering events.
        - [ ] Logic for buying/selling and updating player net worth.
- [x] **Implement State Saving:** Use IndexedDB to save the game state so players can close the browser and resume their session.

### Phase 4: Polish & Testing (Week 6)
- [x] **Add Sound Effects & Visual Polish:** Implement simple animations and sounds for feedback. *(Card flip animation complete)*
- [ ] **User Testing:** Have students from your target audience play the game.
    - [x] Create a user testing plan.
    - [ ] Conduct testing sessions and collect feedback on fun, difficulty, and bugs.
- [ ] **Iterate on Feedback:** Make adjustments based on user testing.
- [ ] **Final Bug Squashing:** Test thoroughly on different devices (laptop, tablet, phone).

### Phase 5: Deployment for Science Fair
- [ ] **Deploy to a Hosting Service:** Use a free service like GitHub Pages, Netlify, or Vercel.
- [ ] **Generate QR Code:** Create a QR code that links to the deployed URL for easy access at the science fair.
- [ ] **Prepare Presentation Materials:** Create a poster or slides explaining the project, the design thinking process, and the technology used.
