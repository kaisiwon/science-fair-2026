document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('pizza-canvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('score-display');
    const levelDisplay = document.getElementById('level-display');
    const customerOrderDisplay = document.getElementById('customer-order');
    const sliceBtn = document.getElementById('slice-btn');
    const resetBtn = document.getElementById('reset-btn');
    const serveBtn = document.getElementById('serve-btn');

    let score = 0;
    let level = 1;
    let slices = 1;
    let requiredSlices = 0;

    function drawPizza() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 140;

        // Draw crust
        ctx.fillStyle = '#f0d79e';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill();

        // Draw sauce
        ctx.fillStyle = '#d9534f';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 10, 0, 2 * Math.PI);
        ctx.fill();

        // Draw cheese
        ctx.fillStyle = '#f9d71c';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 15, 0, 2 * Math.PI);
        ctx.fill();

        // Draw slices
        if (slices > 1) {
            ctx.strokeStyle = '#f0d79e';
            ctx.lineWidth = 5;
            for (let i = 0; i < slices; i++) {
                const angle = (i / slices) * 2 * Math.PI;
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
                ctx.stroke();
            }
        }
    }

    function generateOrder() {
        const denominators = [2, 3, 4, 6, 8];
        const denominator = denominators[Math.floor(Math.random() * Math.min(level, denominators.length))];
        const numerator = Math.floor(Math.random() * (denominator - 1)) + 1;
        requiredSlices = { num: numerator, den: denominator };
        customerOrderDisplay.textContent = `Gimme ${numerator}/${denominator} of a pizza!`;
    }

    function updateScore(points) {
        score += points;
        scoreDisplay.textContent = `Score: ${score}`;
    }
    
    function nextLevel() {
        level++;
        levelDisplay.textContent = `Level: ${level}`;
        slices = 1;
        generateOrder();
        drawPizza();
    }

    function newGame() {
        score = 0;
        level = 1;
        slices = 1;
        scoreDisplay.textContent = `Score: ${score}`;
        levelDisplay.textContent = `Level: ${level}`;
        generateOrder();
        drawPizza();
    }

    sliceBtn.addEventListener('click', () => {
        slices++;
        if (slices > 12) slices = 1; // Max 12 slices
        drawPizza();
    });

    resetBtn.addEventListener('click', () => {
        slices = 1;
        drawPizza();
    });

    serveBtn.addEventListener('click', () => {
        // This is a simplified check.
        // A proper check would compare the fraction, not just the number of slices.
        if (slices === requiredSlices.den) {
            alert('Correct! Customer is happy.');
            updateScore(10);
            nextLevel();
        } else {
            alert(`Wrong! The customer wanted ${requiredSlices.num}/${requiredSlices.den}.`);
            updateScore(-5);
        }
    });

    newGame();
});
