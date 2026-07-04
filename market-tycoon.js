document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const dayDisplay = document.getElementById('day-display');
    const cashDisplay = document.getElementById('cash-display');
    const eventTitle = document.getElementById('event-title');
    const eventDescription = document.getElementById('event-description');
    const nextDayBtn = document.getElementById('next-day-btn');
    const inventorySection = document.getElementById('inventory-section');
    const loanSection = document.getElementById('loan-section');
    const gameOverOverlay = document.getElementById('game-over-overlay');
    const finalNetWorthDisplay = document.getElementById('final-net-worth');
    const playAgainBtn = document.getElementById('play-again-btn');
    const leaderboardBtn = document.getElementById('leaderboard-btn');
    const leaderboardOverlay = document.getElementById('leaderboard-overlay');
    const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');
    const debtDisplay = document.getElementById('debt-display');
    const muteBtn = document.getElementById('mute-btn');
    const logoutBtn = document.getElementById('logout-btn');
    
    // --- User Session ---
    const currentUserId = sessionStorage.getItem('currentUserId');

    // If no user ID is found, redirect back to the login page.
    if (!currentUserId) {
        window.location.href = 'index.html';
    }

    // --- Background Music ---    
    const audioManager = {
        // NOTE: For this to work, you must create an 'audio' folder inside your project
        // and move the mp3 file into it. Then, run a local web server.
        bgMusic: new Audio('audio/1102538_Teminite---The-Deep.mp3'),
        isMuted: true,
        hasBeenUnlocked: false,
        init: function() {
            this.bgMusic.loop = true;
            this.bgMusic.volume = 0.2;
            muteBtn.textContent = this.isMuted ? '🔇' : '🔊';
        },
        toggleMute: function() {
            this.isMuted = !this.isMuted;
            this.bgMusic.muted = this.isMuted;
            muteBtn.textContent = this.isMuted ? '🔇' : '🔊';

            // On the first unmute, try to play the music. This is a robust way
            // to handle browser autoplay policies, as it's a direct user action.
            if (!this.isMuted && !this.hasBeenUnlocked) {
                this.bgMusic.play().catch(e => console.error("Audio could not be started:", e));
                this.hasBeenUnlocked = true;
            }
        },
        // This function should be called on the first major user interaction.
        unlock: function() {
            if (!this.hasBeenUnlocked) {
                this.bgMusic.play().catch(e => console.error("Audio could not be started:", e));
                this.hasBeenUnlocked = true;
            }
        }
    };
    audioManager.init();

    // --- Resource Configuration ---
    const RESOURCES = {
        crystals: { name: 'Crystals', basePrice: 100, volatility: 0.2, color: '#e94560' },
        technetium: { name: 'Technetium', basePrice: 500, volatility: 0.5, color: '#00d1ff' },
        water: { name: 'Water', basePrice: 20, volatility: 0.05, color: '#a2ff91' }
    };

    // --- Game State ---
    let gameState = {
        day: 1,
        cash: 1000,
        debt: 0,
        maxDebt: 5000,
        inventory: {},
        prices: {},
        priceHistory: {}
    };
    const INTEREST_RATE = 0.05; // 5% daily interest

    // Initialize game state from RESOURCES config
    for (const key in RESOURCES) {
        gameState.inventory[key] = 0;
        gameState.prices[key] = RESOURCES[key].basePrice;
        gameState.priceHistory[key] = [RESOURCES[key].basePrice];
    }

    // --- IndexedDB Setup ---
    let db;
    const DB_NAME = 'NumberForgeDB';
    const HIGH_SCORES_STORE = 'highScores';

    function openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 4); // Use latest version
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
        // Add a 'game' identifier to distinguish scores from other games.
        store.add({ score: newScore, date: new Date(), userId: currentUserId, game: 'MarketTycoon' });
    }

    function displayLeaderboard() {
        if (!db) return;
        const transaction = db.transaction([HIGH_SCORES_STORE], 'readonly');
        const store = transaction.objectStore(HIGH_SCORES_STORE);
        const index = store.index('score');
        const highScoresList = document.getElementById('high-scores-list');
        highScoresList.innerHTML = ''; // Clear previous list

        // Open a cursor to iterate over scores in descending order
        const request = index.openCursor(null, 'prev');
        let count = 0;

        request.onsuccess = event => {
            const cursor = event.target.result;
            if (cursor && count < 10) { // Display top 10 scores
                const scoreData = cursor.value;
                // Only display scores for this specific game.
                if (scoreData.game === 'MarketTycoon') {
                    const li = document.createElement('li');
                    const username = scoreData.userId && scoreData.userId.startsWith('guest-') ? 'Anonymous' : scoreData.userId;
                    li.textContent = `$${scoreData.score.toFixed(2)} - ${username || 'Anonymous'}`;
                    highScoresList.appendChild(li);
                    count++;
                }
                cursor.continue();
            }
        };
        leaderboardOverlay.classList.add('active');
    }


    // --- Events Data ---
    const events = [
        {
            title: "Crystal Boom!",
            description: "A new tech breakthrough increases demand for crystals. Price surges!",
            resource: 'crystals',
            effect: (price) => Math.round(price * (1.5 + Math.random() * 0.5)) // +50% to +100%
        },
        {
            title: "Market Crash",
            description: "A large asteroid mine floods the market with cheap goods. All prices plummet!",
            resource: 'all',
            effect: (price) => Math.round(price * (0.4 + Math.random() * 0.2)) // -40% to -60%
        },
        {
            title: "Technetium Find",
            description: "A rare vein of Technetium has been discovered. Prices are temporarily lower.",
            resource: 'technetium',
            effect: (price) => Math.round(price * 0.5)
        }
    ];

    // --- Chart.js Setup ---
    const ctx = document.getElementById('price-chart').getContext('2d');
    const chartDatasets = Object.keys(RESOURCES).map(key => ({
        label: RESOURCES[key].name,
        data: gameState.priceHistory[key],
        borderColor: RESOURCES[key].color,
        backgroundColor: `${RESOURCES[key].color}33`, // Add alpha for fill
        tension: 0.1,
        fill: true
    }));

    const priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [`Day 1`],
            datasets: chartDatasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // --- UI Rendering ---
    function renderResources() {
        inventorySection.innerHTML = ''; // Clear existing resources
        for (const key in RESOURCES) {
            const resource = RESOURCES[key];
            const element = document.createElement('div');
            element.className = 'resource';
            element.innerHTML = `
                <h4>${resource.name}</h4>
                <div class="price">$${gameState.prices[key]}</div>
                <div class="owned">Owned: <span>${gameState.inventory[key]}</span></div>
                <div class="trade-controls">
                    <button class="control-btn" data-resource="${key}" data-action="buy">Buy</button>
                    <button class="control-btn" data-resource="${key}" data-action="sell">Sell</button>
                </div>
            `;
            inventorySection.appendChild(element);
        }
    }

    function updateUI() {
        dayDisplay.textContent = gameState.day;
        cashDisplay.textContent = gameState.cash.toFixed(2);
        debtDisplay.textContent = gameState.debt.toFixed(2);
        renderResources();

        // Update Chart
        priceChart.data.labels = Array.from({ length: gameState.day }, (_, i) => `Day ${i + 1}`);
        priceChart.data.datasets.forEach(dataset => {
            const resourceKey = Object.keys(RESOURCES).find(key => RESOURCES[key].name === dataset.label);
            dataset.data = gameState.priceHistory[resourceKey];
        });
        priceChart.update();
    }

    // --- Game Logic ---
    function nextDay() {
        gameState.day++;

        // Apply interest to any outstanding debt
        if (gameState.debt > 0) {
            gameState.debt *= (1 + INTEREST_RATE);
        }

        // Update prices for all resources based on their volatility
        for (const key in RESOURCES) {
            const volatility = RESOURCES[key].volatility;
            // Use a geometric random walk for more stable long-term prices.
            // A positive drift creates a slow, general inflation over time.
            const drift = 0.01; // Represents a 1% daily upward drift
            // Bias the random shock to be slightly more positive than negative.
            const randomShock = (Math.random() - 0.48) * volatility;
            gameState.prices[key] = Math.max(5, Math.round(gameState.prices[key] * Math.exp(drift + randomShock)));
        }

        // 30% chance of a special event
        if (Math.random() < 0.3) {
            const randomEvent = events[Math.floor(Math.random() * events.length)];
            eventTitle.textContent = randomEvent.title;
            eventDescription.textContent = randomEvent.description;
            if (randomEvent.resource === 'all') {
                for (const key in RESOURCES) {
                    gameState.prices[key] = randomEvent.effect(gameState.prices[key]);
                }
            } else {
                gameState.prices[randomEvent.resource] = randomEvent.effect(gameState.prices[randomEvent.resource]);
            }
        } else {
            eventTitle.textContent = "Market Open";
            eventDescription.textContent = "Prices are stable. Plan your trades for the day.";
        }

        // Record new prices in history
        for (const key in RESOURCES) {
            gameState.priceHistory[key].push(gameState.prices[key]);
        }

        updateUI();
        checkGameOver(); // Check for game over after prices and debt change.

    }

    function checkGameOver() {
        const totalInventory = Object.values(gameState.inventory).reduce((sum, val) => sum + val, 0);
       const isBankrupt = gameState.cash <= 0 && totalInventory <= 0;
        const isOverleveraged = gameState.debt > 0 && gameState.debt > gameState.cash;
        if (isBankrupt || isOverleveraged) {            const netWorth = calculateNetWorth();
            finalNetWorthDisplay.textContent = `$${netWorth.toFixed(2)}`;
            gameOverOverlay.classList.add('active');
            saveHighScore(netWorth);
        }
    }

    function calculateNetWorth() {
        const inventoryValue = Object.keys(gameState.inventory).reduce((sum, key) => sum + (gameState.inventory[key] * gameState.prices[key]), 0);
        return gameState.cash + inventoryValue - gameState.debt;
    }

    function handleTrade(resource, action) {
        const price = gameState.prices[resource];
        if (action === 'buy') {
            if (gameState.cash >= price) {
                gameState.cash -= price;
                gameState.inventory[resource]++;
            } else {
                alert("Not enough cash!");
            }
        } else if (action === 'sell') {
            if (gameState.inventory[resource] > 0) {
                gameState.cash += price;
                gameState.inventory[resource]--;
            } else {
                alert("You don't own any to sell!");
            }
        }
        updateUI();
        checkGameOver();
    }

    function handleLoan(action) {
        const amount = 500;
        if (action === 'borrow') {
            if (gameState.debt + amount <= gameState.maxDebt) {
                gameState.debt += amount;
                gameState.cash += amount;
            } else {
                alert(`Cannot exceed the maximum debt limit of $${gameState.maxDebt}.`);
            }
        } else if (action === 'repay') {
            const repayAmount = Math.min(amount, gameState.debt);
            if (repayAmount <= 0) {
                alert("You have no debt to repay.");
                return;
            }
            if (gameState.cash >= repayAmount) {
                gameState.debt -= repayAmount;
                gameState.cash -= repayAmount;
            } else {
                alert("Not enough cash to make a repayment.");
            }
        }
        updateUI();
    }

    // --- Event Listeners ---
    nextDayBtn.addEventListener('click', () => {
        // On the first click of the main game button, unlock the audio context.
        audioManager.unlock();
        nextDay();
    });

    inventorySection.addEventListener('click', (e) => {
        if (e.target.matches('.control-btn')) {
            const { resource, action } = e.target.dataset;
            handleTrade(resource, action);
        }
    });

    loanSection.addEventListener('click', (e) => {
        if (e.target.matches('.control-btn')) {
            const { action } = e.target.dataset;
            handleLoan(action);
        }
    });

    playAgainBtn.addEventListener('click', () => {
        // Reset game state
        gameState.day = 1;
        gameState.cash = 1000;
        gameState.debt = 0;
        for (const key in RESOURCES) {
            gameState.inventory[key] = 0;
            gameState.prices[key] = RESOURCES[key].basePrice;
            gameState.priceHistory[key] = [RESOURCES[key].basePrice];
        }
        gameOverOverlay.classList.remove('active');
        updateUI();
    });

    leaderboardBtn.addEventListener('click', displayLeaderboard);
    closeLeaderboardBtn.addEventListener('click', () => leaderboardOverlay.classList.remove('active'));
    muteBtn.addEventListener('click', () => audioManager.toggleMute());
    logoutBtn.addEventListener('click', () => {
        const netWorth = calculateNetWorth();
        saveHighScore(netWorth);
        sessionStorage.removeItem('currentUserId');
        window.location.href = 'index.html';
    });

    // --- Initial Game Start ---
    openDB();
    updateUI();
});