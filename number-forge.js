document.addEventListener('DOMContentLoaded', async () => {
    // --- DOM Elements ---
    const expressionDisplay = document.getElementById('expression-display');
    const numberCardContainer = document.getElementById('player-hand');
    const targetNumberDisplay = document.getElementById('target-number');
    const operatorCards = document.querySelectorAll('.operator-card');
    const clearBtn = document.getElementById('clear-btn');
    const submitBtn = document.getElementById('submit-btn');
    const deleteBtn = document.getElementById('delete-btn');
    const newGameBtn = document.getElementById('new-game-btn');
    const hintBtn = document.getElementById('hint-btn');
    const helpBtn = document.getElementById('help-btn');
    const tutorialOverlay = document.getElementById('tutorial-overlay');
    const tutorialPanels = document.querySelectorAll('.tutorial-panel');
    const leaderboardBtn = document.getElementById('leaderboard-btn');
    const leaderboardOverlay = document.getElementById('leaderboard-overlay');
    const logoutBtn = document.getElementById('logout-btn');
    const shareScoreBtn = document.getElementById('share-score-btn');
    const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');
    const muteBtn = document.getElementById('mute-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsOverlay = document.getElementById('settings-overlay');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const levelDisplay = document.getElementById('level-display');
    const levelUpOverlay = document.getElementById('level-up-overlay');
    const timeDisplay = document.getElementById('time-display');
    const scoreDisplay = document.getElementById('score-display');

    // --- Game State ---
    let expression = [];
    let lastInputType = null; // Can be 'number' or 'operator'
    let openBrackets = 0;
    let score = 0;
    let level = 1;
    const POINTS_PER_SUCCESS = 25;
    let scoreToNextLevel = 100;
    let volume = 1;
    let volumeBeforeMute = 1;
    let solutionForHint = '';
    let hintClickCount = 0;
    const HINT_COST = 5;
    let hasPlayedBefore = false;
    let timerInterval = null;
    let timeLeft = 60;

    // --- User Session ---
    const currentUserId = sessionStorage.getItem('currentUserId');

    // If no user ID is found, redirect back to the login page.
    if (!currentUserId) {
        window.location.href = 'index.html';
    }

    // We need a live collection of number cards that updates when we change them
    let numberCards = numberCardContainer.children;

    // --- IndexedDB Setup ---
    let db;
    const DB_NAME = 'NumberForgeDB';
    const GAME_STATE_STORE = 'gameState';
    const HIGH_SCORES_STORE = 'highScores';

    function openDB() {
        return new Promise((resolve, reject) => {
            // This is the single source of truth for the DB schema.
            // Any new stores or indexes should be added here.
            const request = indexedDB.open(DB_NAME, 4); // Incremented version

            request.onupgradeneeded = event => {
                const db = event.target.result;
                // Create all object stores here to ensure consistency.
                if (!db.objectStoreNames.contains('users')) {
                    db.createObjectStore('users', { keyPath: 'username' });
                }
                if (!db.objectStoreNames.contains(GAME_STATE_STORE)) {
                    db.createObjectStore(GAME_STATE_STORE, { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains(HIGH_SCORES_STORE)) {
                    const scoreStore = db.createObjectStore(HIGH_SCORES_STORE, { autoIncrement: true });
                    scoreStore.createIndex('score', 'score', { unique: false }); // For general high scores
                    scoreStore.createIndex('game', 'game', { unique: false }); // To filter by game
                }
            };

            request.onsuccess = event => {
                db = event.target.result;
                resolve(db);
            };

            request.onerror = event => {
                console.error('IndexedDB error:', event.target.errorCode);
                reject(event.target.errorCode);
            };
        });
    }

    function saveGameState() {
        if (!db) return;
        const transaction = db.transaction([GAME_STATE_STORE], 'readwrite');
        const objectStore = transaction.objectStore(GAME_STATE_STORE);
        const gameState = { id: currentUserId, score, level, scoreToNextLevel, volume, volumeBeforeMute, hasPlayedBefore };
        objectStore.put(gameState);
    }

    function loadGameState() {
        return new Promise((resolve) => {
            if (!db) return resolve();
            const transaction = db.transaction([GAME_STATE_STORE], 'readonly');
            const objectStore = transaction.objectStore(GAME_STATE_STORE);
            const request = objectStore.get(currentUserId);

            request.onsuccess = event => {
                if (event.target.result) {
                    const savedState = event.target.result;
                    // Use saved values if they exist, otherwise keep defaults
                    score = savedState.score || 0;
                    level = savedState.level || 1;
                    scoreToNextLevel = savedState.scoreToNextLevel || 100;
                    volume = typeof savedState.volume === 'number' ? savedState.volume : 1;
                    volumeBeforeMute = savedState.volumeBeforeMute || 1;
                    hasPlayedBefore = savedState.hasPlayedBefore || false;
                }
                resolve();
            };
            request.onerror = () => resolve(); // Resolve even if it fails, to start a new game
        });
    }

    function saveHighScore(newScore) {
        if (!db || newScore <= 0) return;
        const transaction = db.transaction([HIGH_SCORES_STORE], 'readwrite');
        const store = transaction.objectStore(HIGH_SCORES_STORE);
        store.add({ score: newScore, date: new Date(), userId: currentUserId });
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
                const li = document.createElement('li');
                const username = scoreData.userId && scoreData.userId.startsWith('guest-') ? 'Anonymous' : scoreData.userId;
                li.textContent = `${scoreData.score} points - ${username || 'Anonymous'}`;
                highScoresList.appendChild(li);
                count++;
                cursor.continue();
            }
        };
        leaderboardOverlay.classList.add('active');
    }

    function getHighestScore() {
        return new Promise((resolve, reject) => {
            if (!db) return reject('Database not open.');
            const transaction = db.transaction([HIGH_SCORES_STORE], 'readonly');
            const store = transaction.objectStore(HIGH_SCORES_STORE);
            const index = store.index('score');
            const request = index.openCursor(null, 'prev'); // 'prev' for descending order

            request.onsuccess = event => {
                const cursor = event.target.result;
                if (cursor) {
                    resolve(cursor.value.score); // Resolve with the first (highest) score
                } else {
                    resolve(0); // Resolve with 0 if no scores exist
                }
            };
            request.onerror = () => reject('Could not retrieve high score.');
        });
    }

    async function handleShare() {
        try {
            const highScore = await getHighestScore();
            const shareText = `I reached a high score of ${highScore} in Number Forge! Can you beat it?`;
            const shareData = {
                title: 'Number Forge High Score',
                text: shareText,
                url: window.location.href // Share the link to the game
            };

            if (navigator.share) {
                await navigator.share(shareData);
                console.log('Score shared successfully!');
            } else if (navigator.clipboard) {
                // Fallback for desktop browsers
                await navigator.clipboard.writeText(`${shareText} Play here: ${window.location.href}`);
                alert('High score copied to clipboard!');
            }
        } catch (error) {
            console.error('Error sharing score:', error);
            alert('Could not share score at this time.');
        }
    }

    // --- Audio Setup ---
    const SOUNDS = {
        click: './audio/click.mp3',
        success: './audio/success.mp3',
        levelUp: './audio/levelup.mp3',
        error: './audio/error.mp3',
        delete: './audio/delete.mp3'
    };

    /**
     * Plays a sound from the SOUNDS object.
     * @param {string} soundKey The key of the sound to play.
     */
    function playSound(soundKey) {
        if (SOUNDS[soundKey]) {
            const audio = new Audio(SOUNDS[soundKey]);
            audio.volume = volume;
            // We don't need to wait for the sound to finish, so we don't await the promise.
            audio.play().catch(error => console.error(`Could not play sound: ${soundKey}`, error));
        }
    }

    // --- Functions ---

    /**
     * Updates the expression display based on the current expression array.
     */
    function updateDisplay() {
        expressionDisplay.textContent = expression.map(item => item.value).join(' ');
    }

    /**
     * Updates the score and level display in the UI.
     */
    function updateStatsDisplay() {
        levelDisplay.textContent = level;
        scoreDisplay.textContent = score;
        updateVolumeUI();
        // You could also add a progress bar to the next level here
        // e.g., progressBar.style.width = `${(score / scoreToNextLevel) * 100}%`;
    }

    /**
     * Updates all volume-related UI elements (slider and mute button icon).
     */
    function updateVolumeUI() {
        volumeSlider.value = volume;
        muteBtn.textContent = volume > 0 ? '🔊' : '🔇';
    }

    /**
     * Toggles the sound between muted and the previous volume level.
     */
    function toggleMute() {
        if (volume > 0) {
            volumeBeforeMute = volume;
            volume = 0;
        } else {
            volume = volumeBeforeMute > 0 ? volumeBeforeMute : 1;
        }
        updateVolumeUI();
        saveGameState();
    }

    /**
     * Logs the user out, saving their score and clearing the session.
     */
    function handleLogout() {
        playSound('click');
        saveHighScore(score); // Save the score from the current run
        sessionStorage.removeItem('currentUserId');
        window.location.href = 'index.html';
    }


    // --- Tutorial Functions ---
    let currentTutorialStep = 1;

    function showTutorialStep(step) {
        tutorialOverlay.classList.add('active');
        tutorialPanels.forEach(panel => {
            panel.classList.toggle('active', parseInt(panel.dataset.step) === step);
        });
    }

    function startTutorial() {
        currentTutorialStep = 1;
        showTutorialStep(currentTutorialStep);
    }

    function endTutorial() {
        tutorialOverlay.classList.remove('active');
        if (!hasPlayedBefore) {
            hasPlayedBefore = true;
            saveGameState();
        }
    }

    /**
     * Handles clicks on the number cards.
     * A number can only be added if the previous input was an operator or if the expression is empty.
     */
    function handleNumberClick(event) {
        const cardElement = event.target;
        
        if (lastInputType === 'operator' || lastInputType === null) {
            playSound('click');
            const value = cardElement.dataset.value;
            expression.push({ type: 'number', value, element: cardElement });
            lastInputType = 'number';
            cardElement.classList.add('used'); // Mark the card as used
            updateDisplay();
        } else {
            triggerShake(expressionDisplay);
        }
    }

    /**
     * Handles clicks on the operator cards.
     * An operator can only be added if the previous input was a number.
     */
    function handleOperatorClick(event) {
        const value = event.target.dataset.value;

        if (value === '(') {
            // Allow open bracket if the expression is empty or after an operator
            if (lastInputType === null || lastInputType === 'operator') {
                playSound('click');
                expression.push({ type: 'operator', value });
                openBrackets++;
                lastInputType = 'operator'; // Treat '(' as an operator for validation
                updateDisplay();
            } else {
                triggerShake(expressionDisplay);
            }
        } else if (value === ')') {
            // Allow close bracket only if there's an open one and after a number
            if (openBrackets > 0 && lastInputType === 'number') {
                playSound('click');
                expression.push({ type: 'operator', value });
                openBrackets--;
                lastInputType = 'number'; // Treat ')' as a number for validation
                updateDisplay();
            } else {
                triggerShake(expressionDisplay);
            }
        } else {
            // Handle standard operators (+, -, *, /)
            if (lastInputType === 'number') {
            playSound('click');
            expression.push({ type: 'operator', value });
            lastInputType = 'operator';
            updateDisplay();
            } else {
                triggerShake(expressionDisplay);
            }
        }
    }

    /**
     * Provides a hint to the player based on the generated solution.
     */
    function handleHint() {
        if (!solutionForHint) {
            alert("No hint available for this puzzle.");
            return;
        }

        // Apply a score cost for using the hint
        score = Math.max(0, score - HINT_COST);
        updateStatsDisplay();
        saveGameState();
        playSound('click');

        hintClickCount++;
        const hintParts = solutionForHint.split(' ');
        let hintText = "Hint: ";

        if (hintClickCount === 1) {
            // First hint: Reveal the first element
            hintText += hintParts[0];
        } else {
            // Subsequent hints: Reveal more of the solution
            hintText += hintParts.slice(0, hintClickCount * 2 - 1).join(' ');
        }

        // Display the hint temporarily in the expression display
        const originalExpression = expressionDisplay.textContent;
        expressionDisplay.textContent = hintText;
        setTimeout(() => {
            expressionDisplay.textContent = originalExpression;
        }, 1500);
    }

    /**
     * Handles a click on the delete button, removing the last entry.
     */
    function handleDelete() {
        if (expression.length === 0) {
            return; // Nothing to delete
        }

        playSound('delete');

        const lastEntry = expression.pop();

        // Revert state based on what was removed
        if (lastEntry.type === 'number') {
            lastEntry.element.classList.remove('used');
        } else if (lastEntry.value === '(') {
            openBrackets--;
        } else if (lastEntry.value === ')') {
            openBrackets++;
        }

        // Update lastInputType based on the new last item in the expression
        if (expression.length === 0) {
            lastInputType = null;
        } else {
            const newLastEntry = expression[expression.length - 1];
            if (newLastEntry.type === 'number' || newLastEntry.value === ')') {
                lastInputType = 'number';
            } else {
                lastInputType = 'operator';
            }
        }

        updateDisplay();
    }

    /**
     * Applies a shake animation to a given element and removes it when done.
     * @param {HTMLElement} element The element to animate.
     */
    function triggerShake(element) {
        playSound('error');
        element.classList.add('shake');
        element.addEventListener('animationend', () => {
            element.classList.remove('shake');
        }, { once: true }); // The listener removes itself after running once
    }

    /**
     * Clears the expression and resets the game state.
     */
    function clearExpression() {
        playSound('click');
        expression = [];
        lastInputType = null;
        openBrackets = 0;
        hintClickCount = 0; // Reset hint counter for the new round
        // Reset all number cards to their default state
        Array.from(numberCards).forEach(card => {
            card.classList.remove('used');
        });
        updateDisplay();
    }

    /**
     * Triggers the "Level Up!" animation.
     */
    function triggerLevelUpAnimation() {
        playSound('levelUp');
        levelUpOverlay.classList.add('active');
        // The listener removes itself after running once to prevent memory leaks
        levelUpOverlay.addEventListener('animationend', () => {
            levelUpOverlay.classList.remove('active');
        }, { once: true });
    }


    /**
     * Resets all game progress back to the initial state.
     */
    function resetGame() {
        playSound('click');
        saveHighScore(score); // Save the score from the completed run
        const isConfirmed = confirm('Are you sure you want to start a new game? Your score and level will be permanently reset.');

        if (isConfirmed) {
            score = 0;
            level = 1;
            scoreToNextLevel = 100; // Reset to initial value

            saveGameState(); // Persist the reset state to IndexedDB
            updateStatsDisplay();
            startNewRound();
        }
    }

    /**
     * Evaluates the final expression and checks it against the target number.
     */
    function handleSubmit() {
        // Animate the button on click for tactile feedback
        triggerShake(submitBtn);

        // An expression must end with a number to be valid for evaluation.
        if (lastInputType !== 'number' || openBrackets > 0) {
            triggerShake(expressionDisplay);
            return;
        }

        const targetNumber = parseInt(targetNumberDisplay.textContent, 10);
        // Create a string that can be evaluated, replacing display symbols with JS operators.
        const expressionString = expression.map(item => item.value).join(' ').replace(/×/g, '*').replace(/÷/g, '/');

        try {
            // WARNING: eval() can be a security risk if used with untrusted user input.
            // In this controlled environment, where inputs are only from our buttons,
            // it's acceptable for this prototype. For a production app, a dedicated
            // math expression parser library would be a safer choice.
            const result = eval(expressionString);

            if (result === targetNumber) {
                stopTimer(); // Stop the timer on success
                playSound('success');
                // --- Success Logic ---
                const timeBonus = Math.max(0, timeLeft);
                score += POINTS_PER_SUCCESS + timeBonus;
                saveGameState(); // Save progress on success
                updateStatsDisplay();

                if (score >= scoreToNextLevel) {
                    level++;
                    scoreToNextLevel = Math.round(scoreToNextLevel * 1.5); // Increase difficulty for next level
                    triggerLevelUpAnimation();
                }

                // A small delay gives the player time to see the successful forge.
                setTimeout(startNewRound, 500);
            } else {
                // Shake the target number to indicate the player's result did not match
                triggerShake(targetNumberDisplay);
                clearExpression();
            }

        } catch (error) {
            alert('There was an error evaluating your expression. Please check it and try again.');
            console.error('Evaluation Error:', error);
        }
    }

    // --- Timer Functions ---
    function startTimer() {
        stopTimer(); // Ensure no previous timers are running
        timeLeft = 60 - Math.floor(level / 2); // Time decreases slightly at higher levels
        timeDisplay.textContent = timeLeft;

        timerInterval = setInterval(() => {
            timeLeft--;
            timeDisplay.textContent = timeLeft;
            if (timeLeft <= 0) {
                stopTimer();
                alert("Time's up! Try the next puzzle.");
                startNewRound();
            }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    // --- Event Listeners ---
    // Use event delegation for number cards since they will be replaced
    numberCardContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('number-card')) {
            handleNumberClick(event);
        }
    });
    operatorCards.forEach(card => card.addEventListener('click', handleOperatorClick));
    clearBtn.addEventListener('click', clearExpression);
    deleteBtn.addEventListener('click', handleDelete);
    newGameBtn.addEventListener('click', resetGame);
    submitBtn.addEventListener('click', handleSubmit);
    logoutBtn.addEventListener('click', handleLogout);
    leaderboardBtn.addEventListener('click', displayLeaderboard);
    shareScoreBtn.addEventListener('click', handleShare);
    closeLeaderboardBtn.addEventListener('click', () => leaderboardOverlay.classList.remove('active'));
    helpBtn.addEventListener('click', startTutorial);
    tutorialOverlay.querySelector('.tutorial-next').addEventListener('click', () => {
        currentTutorialStep++;
        showTutorialStep(currentTutorialStep);
    });
    tutorialOverlay.querySelector('.tutorial-finish').addEventListener('click', endTutorial);
    hintBtn.addEventListener('click', handleHint);
    muteBtn.addEventListener('click', toggleMute);
    settingsBtn.addEventListener('click', () => settingsOverlay.classList.add('active'));
    closeSettingsBtn.addEventListener('click', () => settingsOverlay.classList.remove('active'));
    volumeSlider.addEventListener('input', (e) => {
        volume = e.target.value;
        // If user is sliding volume up from 0, consider it an unmute action
        if (volume > 0) volumeBeforeMute = volume;
        updateVolumeUI();
        saveGameState();
    });

    /**
     * Generates a new puzzle by setting a random target and random number cards.
     * This function works backwards from a solution to guarantee solvability.
     */
    function startNewRound() {
        clearExpression();
        startTimer();

        // --- Difficulty Scaling Parameters ---
        const numbersToUse = level < 4 ? 3 : 4; // Use 3 numbers for levels 1-3, then all 4
        const maxCardValue = 7 + level; // Max value on cards increases with level
        const maxTargetValue = 200 + level * 20; // Max target value increases
        const bracketChance = 0.3 + level * 0.05; // Chance of brackets increases with level

        const operators = ['+', '-', '×'];
        const handSize = 4;
        let solutionHand = [];

        // 1. Generate a pool of numbers for the hand
        for (let i = 0; i < handSize; i++) {
            solutionHand.push(Math.floor(Math.random() * maxCardValue) + 1);
        }

        // 2. Build a solvable expression
        let shuffledHand = [...solutionHand].sort(() => Math.random() - 0.5);

        // Take the required number of cards for the solution
        const expressionParts = [];
        for (let i = 0; i < numbersToUse; i++) {
            expressionParts.push(shuffledHand.pop());
            if (i < numbersToUse - 1) {
                expressionParts.push(operators[Math.floor(Math.random() * operators.length)]);
            }
        }

        // Randomly decide whether to create a puzzle that needs brackets
        let expressionString;
        if (numbersToUse > 2 && Math.random() < bracketChance) {
            // Create a puzzle like (a + b) * c
            expressionString = `(${expressionParts[0]} ${expressionParts[1].replace('×', '*')} ${expressionParts[2]}) ${expressionParts[3].replace('×', '*')} ${expressionParts[4] || ''}`;
        } else {
            // Create a standard puzzle like a + b * c
            expressionString = expressionParts.map(p => String(p).replace('×', '*')).join(' ');
        }

        // Store the user-facing version of the solution for the hint system
        solutionForHint = expressionString.replace(/\*/g, '×').replace(/\//g, '÷');

        let result;
        try {
            result = eval(expressionString);
        } catch (error) {
            // If eval fails, create a safe, simple fallback.
            result = solutionHand.reduce((sum, val) => sum + val, 0);
        }

        // 3. The result of the expression is our new target number
        if (result <= 0 || !Number.isInteger(result) || result > maxTargetValue) {
            // If the result is invalid, generate a different puzzle as a fallback.
            let fallbackParts = solutionHand.slice(0, numbersToUse);
            result = fallbackParts.pop();
            while (fallbackParts.length > 0) {
                result += fallbackParts.pop() * (Math.random() > 0.5 ? 1 : -1);
            }
            if (result <= 0) {
                result = solutionHand.reduce((sum, val) => sum + val, 0);
            }
        }

        targetNumberDisplay.textContent = Math.round(result);

        // 4. Populate the UI with the hand we created
        solutionHand.forEach((value, index) => {
            const card = numberCards[index];
            // Reset animation before repopulating
            card.classList.remove('flip-in');
            void card.offsetWidth; // Force browser reflow to allow re-animation

            card.textContent = value;
            card.dataset.value = value;
        });

        // Re-trigger the animation for all cards
        Array.from(numberCards).forEach(card => card.classList.add('flip-in'));
    }

    // --- Initial Game Start ---
    await openDB();
    await loadGameState();
    if (!hasPlayedBefore) {
        startTutorial();
    }
    updateStatsDisplay();
    startNewRound();
});