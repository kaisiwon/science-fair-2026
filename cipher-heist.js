document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const equationDisplay = document.getElementById('equation-display');
    const answerInput = document.getElementById('answer-input');
    const submitBtn = document.getElementById('submit-btn');
    const scoreDisplay = document.getElementById('score-display');
    const timeDisplay = document.getElementById('time-display');

    // Game State
    let score = 0;
    let timeLeft = 60;
    let currentSolution = 0;
    let timerInterval;

    function generateRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function generateEquation() {
        let equation = '';
        let solution = 0;
        const type = generateRandomNumber(0, 5); // 6 types of equations for now

        switch (type) {
            case 0: // x + a = b
                const a0 = generateRandomNumber(1, 15);
                solution = generateRandomNumber(1, 20);
                const b0 = solution + a0;
                equation = `x + ${a0} = ${b0}`;
                break;
            case 1: // x - a = b
                const a1 = generateRandomNumber(1, 15);
                solution = generateRandomNumber(5, 25);
                const b1 = solution - a1;
                equation = `x - ${a1} = ${b1}`;
                break;
            case 2: // a - x = b
                const a2 = generateRandomNumber(10, 30);
                solution = generateRandomNumber(1, 15);
                const b2 = a2 - solution;
                equation = `${a2} - x = ${b2}`;
                break;
            case 3: // x * a = b
                const a3 = generateRandomNumber(2, 10);
                solution = generateRandomNumber(1, 12);
                const b3 = solution * a3;
                equation = `x * ${a3} = ${b3}`;
                break;
            case 4: // x / a = b
                const a4 = generateRandomNumber(2, 10);
                solution = generateRandomNumber(1, 12);
                const b4 = solution / a4;
                equation = `x / ${a4} = ${b4}`;
                break;
            case 5: // a * x + b = c (multi-step)
                const a5 = generateRandomNumber(2, 5);
                const b5 = generateRandomNumber(1, 10);
                solution = generateRandomNumber(2, 8);
                const c5 = (a5 * solution) + b5;
                equation = `${a5} * x + ${b5} = ${c5}`;
                break;
        }
        currentSolution = solution;
        equationDisplay.textContent = equation;
    }

    function checkAnswer() {
        const userAnswer = parseInt(answerInput.value, 10);
        if (userAnswer === currentSolution) {
            score += 10;
            scoreDisplay.textContent = score;
            answerInput.value = '';
            generateEquation();
        } else {
            // Optional: Add some feedback for wrong answers
        }
    }

    function startGame() {
        score = 0;
        timeLeft = 60;
        scoreDisplay.textContent = score;
        timeDisplay.textContent = timeLeft;
        generateEquation();

        timerInterval = setInterval(() => {
            timeLeft--;
            timeDisplay.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                // Optional: Add game over logic
                alert('Game Over! Your score is ' + score);
            }
        }, 1000);
    }

    submitBtn.addEventListener('click', checkAnswer);
    answerInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            checkAnswer();
        }
    });

    startGame();
});
