document.addEventListener('DOMContentLoaded', () => {
    const scoreEl = document.getElementById('score');
    const moneyEl = document.getElementById('money'); // New element reference
    const taskContainerEl = document.getElementById('task-container');
    const fieldGridEl = document.getElementById('field-grid');
    const harvestBtn = document.getElementById('harvest-btn');
    const wateringCanContainerEl = document.getElementById('watering-can-container');
    const tradeOffersEl = document.getElementById('trade-offers'); // New element
    const availableUpgradesEl = document.getElementById('available-upgrades'); // New element

    let score = 0;
    let money = 0; // New currency for trading and upgrades
    let gridCells;
    let selectedCan = null;

    function updateMoneyDisplay() {
        moneyEl.textContent = money;
    }

    // Helper function to find Greatest Common Divisor (GCD)
    function findGCD(a, b) {
        if (b === 0) return a;
        return findGCD(b, a % b);
    }

    // Helper function to find Least Common Multiple (LCM)
    function findLCM(a, b) {
        return (a * b) / findGCD(a, b);
    }

    const wateringCans = [
        { name: '1/2', num: 1, den: 2 },
        { name: '1/3', num: 1, den: 3 },
        { name: '1/4', num: 1, den: 4 },
        { name: '1/5', num: 1, den: 5 },
        { name: '1/6', num: 1, den: 6 },
    ];

    // Placeholder for trade offers
    const tradeOffers = [
        {
            id: 'sell-watered',
            description: 'Sell 1 watered cell for $1',
            action: () => {
                const wateredCount = document.querySelectorAll('.grid-cell.watered').length;
                if (wateredCount > 0) {
                    money += 1; // Sell one cell for $1
                    updateMoneyDisplay(); // Update money display
                    updateTask("Sold 1 watered cell for $1!");
                    const oneWateredCell = document.querySelector('.grid-cell.watered');
                    if (oneWateredCell) {
                        oneWateredCell.classList.remove('watered', 'watered-blue');
                    }
                    displayTradeOffers(); // Re-display offers as state might change
                } else {
                    updateTask("No watered cells to sell!");
                }
            }
        },
        // Add more complex trade offers later
    ];

    function displayTradeOffers() {
        tradeOffersEl.innerHTML = '';
        if (tradeOffers.length === 0) {
            tradeOffersEl.innerHTML = '<p>No trade offers available yet.</p>';
            return;
        }

        tradeOffers.forEach(offer => {
            const offerEl = document.createElement('div');
            offerEl.classList.add('trade-offer');
            offerEl.innerHTML = `<p>${offer.description}</p><button data-id="${offer.id}">Trade</button>`;
            tradeOffersEl.appendChild(offerEl);
        });
    }

    function handleTrade(e) {
        const button = e.target.closest('button[data-id]');
        if (!button) return;

        const offerId = button.dataset.id;
        const offer = tradeOffers.find(o => o.id === offerId);

        if (offer && offer.action) {
            offer.action();
        }
        updateMoneyDisplay(); // Ensure money display is updated after any trade action
    }

    function generateLevel() {
        // Clear previous state
        fieldGridEl.innerHTML = '';
        wateringCanContainerEl.innerHTML = '';
        selectedCan = null;
        updateTask("Select a watering can to start.");

        // Dynamically determine gridCells based on LCM of watering can denominators
        let lcm = 1;
        wateringCans.forEach(can => {
            lcm = findLCM(lcm, can.den);
        });
        gridCells = lcm;

        // Create Grid
        fieldGridEl.style.gridTemplateColumns = `repeat(6, 1fr)`; // Use a fixed number of columns for better display
        fieldGridEl.style.gridAutoRows = `1fr`;
        for (let i = 0; i < gridCells; i++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.dataset.index = i;
            fieldGridEl.appendChild(cell);
        }
        }

        // Create Watering Cans
        wateringCans.forEach(can => {
            const canEl = document.createElement('div');
            canEl.classList.add('watering-can');
            canEl.textContent = can.name;
            canEl.dataset.num = can.num;
            canEl.dataset.den = can.den;
            wateringCanContainerEl.appendChild(canEl);
        });

        // Initialize displays
        updateMoneyDisplay();
        displayTradeOffers();
    }

    function updateTask(text) {
        taskContainerEl.innerHTML = `<p>${text}</p>`;
    }

    function selectCan(e) {
        const canEl = e.target.closest('.watering-can');
        if (!canEl) return;

        // Deselect others
        document.querySelectorAll('.watering-can').forEach(el => el.classList.remove('selected'));
        // Select clicked one
        canEl.classList.add('selected');

        selectedCan = {
            num: parseInt(canEl.dataset.num),
            den: parseInt(canEl.dataset.den)
        };
        updateTask(`Selected the ${selectedCan.num}/${selectedCan.den} can. Click a plot to water!`);
    }

    function waterPlot(e) {
        const cell = e.target.closest('.grid-cell');
        if (!cell || !selectedCan) {
            if (!selectedCan) {
                updateTask("Please select a watering can first!");
            }
            return;
        }

        const cellsToWater = (selectedCan.num / selectedCan.den) * gridCells;
        const allCells = Array.from(document.querySelectorAll('.grid-cell'));

        // Find a contiguous block of unwatered cells
        let startIndex = -1;
        for(let i = 0; i <= allCells.length - cellsToWater; i++) {
            const slice = allCells.slice(i, i + cellsToWater);
            if (slice.every(c => !c.classList.contains('watered'))) {
                startIndex = i;
                break;
            }
        }

        if (startIndex !== -1) {
             for(let i = startIndex; i < startIndex + cellsToWater; i++) {
                allCells[i].classList.add('watered', 'watered-blue');
            }
        } else {
            updateTask(`Not enough space to use the ${selectedCan.num}/${selectedCan.den} can. Try another can or harvest!`);
        }
    }

    function checkHarvest() {
        const wateredCells = document.querySelectorAll('.grid-cell.watered').length;
        scoreEl.textContent = score; // Ensure score is always updated

        if (wateredCells === gridCells) {
            score += 10;
            updateTask("Field fully watered! Great job! +10 points!");
            fieldGridEl.style.backgroundColor = '#d4edda'; // Success color
            setTimeout(() => {
                fieldGridEl.style.backgroundColor = ''; // Reset background color
                generateLevel();
            }, 1500);
        } else {
            updateTask(`Not fully watered. You've watered ${wateredCells}/${gridCells}. Try another can or combine fractions!`);
            fieldGridEl.style.backgroundColor = '#f8d7da'; // Failure color
            setTimeout(() => {
                fieldGridEl.style.backgroundColor = ''; // Reset background color
            }, 1000);
        }
    }

    wateringCanContainerEl.addEventListener('click', selectCan);
    fieldGridEl.addEventListener('click', waterPlot);
    harvestBtn.addEventListener('click', checkHarvest);
    tradeOffersEl.addEventListener('click', handleTrade); // Event listener for trade offers

    // Start the game
    generateLevel();
});
