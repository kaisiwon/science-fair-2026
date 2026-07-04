document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements & Engine Setup ---
    const { Engine, Render, Runner, World, Bodies, Body, Events, Composite } = Matter;

    const canvasContainer = document.getElementById('canvas-container');
    const timeDisplay = document.getElementById('time-display');
    const angleForm = document.getElementById('angle-form');
    const angleInput = document.getElementById('angle-input');
    const gameOverOverlay = document.getElementById('game-over-overlay');
    const finalTimeDisplay = document.getElementById('final-time');
    const playAgainBtn = document.getElementById('play-again-btn');
    const leaderboardBtn = document.getElementById('leaderboard-btn');
    const leaderboardOverlay = document.getElementById('leaderboard-overlay');
    const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');
    const logoutBtn = document.getElementById('logout-btn');

    // --- User Session ---
    const currentUserId = sessionStorage.getItem('currentUserId');
    if (!currentUserId) {
        window.location.href = 'index.html';
    }

    // --- Game State ---
    let startTime;
    let timerInterval;
    let isGameOver = false;
    let targetAngle = 0;
    const TILT_SPEED = 0.0025; // Radians per update. Faster for more challenge.

    // --- IndexedDB Setup ---
    let db;
    const DB_NAME = 'NumberForgeDB';
    const HIGH_SCORES_STORE = 'highScores';

    function openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 3); // Match version from other game files
            request.onsuccess = () => {
                db = request.result;
                resolve(db);
            };
            request.onerror = () => reject(request.error);
        });
    }

    function saveHighScore(newScore) {
        if (!db || newScore <= 0) return;
        const transaction = db.transaction([HIGH_SCORES_STORE], 'readwrite');
        const store = transaction.objectStore(HIGH_SCORES_STORE);
        // Add a specific game identifier to distinguish scores
        store.add({ score: newScore, date: new Date(), userId: currentUserId, game: 'LavaBalance' });
    }

    function displayLeaderboard() {
        if (!db) return;
        const transaction = db.transaction([HIGH_SCORES_STORE], 'readonly');
        const store = transaction.objectStore(HIGH_SCORES_STORE);
        const index = store.index('score');
        const highScoresList = document.getElementById('high-scores-list');
        highScoresList.innerHTML = ''; // Clear previous list

        const request = index.openCursor(null, 'prev'); // 'prev' for descending order
        let count = 0;
        request.onsuccess = event => {
            const cursor = event.target.result;
            if (cursor && count < 10) {
                const scoreData = cursor.value;
                // Only show scores for this specific game
                if (scoreData.game === 'LavaBalance') {
                    const li = document.createElement('li');
                    const username = scoreData.userId && scoreData.userId.startsWith('guest-') ? 'Anonymous' : scoreData.userId;
                    li.textContent = `${scoreData.score.toFixed(1)}s - ${username || 'Anonymous'}`;
                    highScoresList.appendChild(li);
                    count++;
                }
                cursor.continue();
            }
        };
        leaderboardOverlay.classList.add('active');
    }

    // --- Matter.js Setup ---
    const engine = Engine.create();
    const world = engine.world;
    const render = Render.create({
        element: canvasContainer,
        engine: engine,
        options: {
            width: canvasContainer.clientWidth,
            height: 450,
            wireframes: false,
            background: '#1a1a2e' // Re-apply background directly to the canvas
        }
    });

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    // --- Game Objects ---
    let bowl;

    function createBowl() {
        // --- Create a rounder bowl using more segments ---
        const bowlX = render.options.width / 2;
        const bowlY = 300; // Position the center of the curve
        const radius = 80; // Make the bowl wider
        const sides = 12; // Use more segments for a smoother curve
        const segmentWidth = 48; // Slightly wider to ensure overlap
        const thickness = 15;

        const parts = [];
        for (let i = 0; i < sides; i++) {
            // Arrange segments in an upward-facing semi-circle (from 0 to PI radians)
            const angle = (Math.PI / (sides - 1)) * i;
            const x = bowlX + radius * Math.cos(angle);
            const y = bowlY + radius * Math.sin(angle);
            // The angle of the body part should be perpendicular to the radius
            const partAngle = angle - Math.PI / 2;
            const part = Bodies.rectangle(x, y, segmentWidth, thickness, { isStatic: true, angle: partAngle });
            parts.push(part);
        }

        bowl = Body.create({
            parts: parts,
            isStatic: true,
            // The bowl is now rendered directly on the canvas.
            render: { fillStyle: '#dcdcdc' }
        });

        return bowl;
    }

    const ground = Bodies.rectangle(
        render.options.width / 2,
        render.options.height - 10,
        render.options.width, 20,
        { isStatic: true, label: 'ground', render: { fillStyle: '#c0392b' } }
    );

    let lavaParticles = [];

    function createLava() {
        lavaParticles.forEach(p => World.remove(world, p));
        lavaParticles = [];
        for (let i = 0; i < 50; i++) {
            const particle = Bodies.circle(
                bowl.position.x - 25 + Math.random() * 50, // Narrower spawn area to keep particles inside
                bowl.position.y - 40, // Spawn lower and closer to the bowl's base
                4,
                {
                    restitution: 0.4,
                    friction: 0.01,
                    label: 'lava',
                    render: { fillStyle: '#e94560' }
                }
            );
            lavaParticles.push(particle);
        }
        return lavaParticles;
    }

    // --- Game Logic ---
    function startGame() {
        isGameOver = false;
        gameOverOverlay.classList.remove('active');
        World.clear(world);

        bowl = createBowl();
        const lava = createLava();
        World.add(world, [bowl, ground, ...lava]);

        // Reset bowl rotation and world gravity
        Body.setAngle(bowl, 0);
        engine.world.gravity.y = 1; // Standard downward gravity
        engine.world.gravity.x = 0; // No sideways gravity

        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 100);

        // Every 5 seconds, set a new target angle for the bowl to tilt towards.
        setInterval(() => {
            if (!isGameOver) {
                const randomAngleDegrees = Math.random() * 90 - 45; // -45 to +45 degrees
                targetAngle = randomAngleDegrees * (Math.PI / 180);
            }
        }, 2500); // Choose a new angle every 2.5 seconds instead of 5
    }

    function updateTimer() {
        if (!isGameOver) {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            timeDisplay.textContent = elapsed;
        }
    }

    function endGame() {
        if (isGameOver) return;
        isGameOver = true;
        clearInterval(timerInterval);
        const finalTime = ((Date.now() - startTime) / 1000).toFixed(1);
        finalTimeDisplay.textContent = finalTime;
        gameOverOverlay.classList.add('active');
        saveHighScore(parseFloat(finalTime));
    }

    // --- Event Handlers ---
    angleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (isGameOver) return;

        const angleDegrees = parseFloat(angleInput.value);
        if (!isNaN(angleDegrees)) {
            const angleRadians = angleDegrees * (Math.PI / 180);
            // Use setAngle to make the user's correction responsive and absolute
            Body.setAngle(bowl, bowl.angle + angleRadians);
            targetAngle = bowl.angle; // The user's action overrides the random tilt target
        }
        angleInput.value = '';
    });

    Events.on(engine, 'collisionStart', (event) => {
        const pairs = event.pairs;
        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i];
            if ((pair.bodyA.label === 'lava' && pair.bodyB.label === 'ground') ||
                (pair.bodyB.label === 'lava' && pair.bodyA.label === 'ground')) {
                endGame();
                break;
            }
        }
    });

    Events.on(engine, 'beforeUpdate', () => {
        if (isGameOver || !bowl) return;

        // Gradually move the bowl's angle towards the target angle
        if (Math.abs(bowl.angle - targetAngle) > TILT_SPEED) {
            const direction = Math.sign(targetAngle - bowl.angle);
            Body.rotate(bowl, direction * TILT_SPEED);
        }
    });

    playAgainBtn.addEventListener('click', startGame);
    leaderboardBtn.addEventListener('click', displayLeaderboard);
    closeLeaderboardBtn.addEventListener('click', () => leaderboardOverlay.classList.remove('active'));

    logoutBtn.addEventListener('click', () => {
        // Save score on logout if the game is currently running
        if (!isGameOver) {
            const finalTime = ((Date.now() - startTime) / 1000);
            saveHighScore(finalTime);
        }
        sessionStorage.removeItem('currentUserId');
        window.location.href = 'index.html';
    });

    // --- Initial Start ---
    openDB();
    startGame();
});