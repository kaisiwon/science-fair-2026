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

    function generateEquation() {
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + a; // Ensure b is always greater than a for positive solutions
        currentSolution = b - a;
        equationDisplay.textContent = `x + ${a} = ${b}`;
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
