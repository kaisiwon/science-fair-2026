const size = 4;
let board = [];
let score = 0;
let gameOver = false;

const boardEl = document.getElementById('board');
const scoreEl = document.getElementById('score');
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restart-btn');

function createTile(value, type = 'number') {
    return { type, value };
}

function createEmptyBoard() {
    return Array.from({ length: size }, () => Array(size).fill(null));
}

function getEmptyCells() {
    const empty = [];
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (!board[r][c]) empty.push([r, c]);
        }
    }
    return empty;
}

function addRandomTile() {
    const emptyCells = getEmptyCells();
    if (!emptyCells.length) return;

    const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    if (Math.random() < 0.18) {
        const operatorTile = createTile(Math.random() < 0.5 ? 1 : 2, 'operator');
        operatorTile.op = Math.random() < 0.5 ? '+' : 'x';
        board[row][col] = operatorTile;
    } else {
        board[row][col] = createTile(Math.random() < 0.85 ? 2 : 4, 'number');
    }
}

function renderBoard() {
    boardEl.innerHTML = '';
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const tile = board[r][c];
            const cell = document.createElement('div');
            cell.className = 'cell';

            if (tile) {
                cell.classList.add(tile.type === 'operator' ? 'tile-operator' : 'tile-number');
                if (tile.type === 'number') {
                    cell.classList.add(`value-${tile.value}`);
                    cell.textContent = tile.value;
                } else {
                    cell.textContent = tile.op === '+' ? '+1' : '×2';
                }
            }

            boardEl.appendChild(cell);
        }
    }

    scoreEl.textContent = score;
}

function cloneBoard() {
    return board.map(row => row.map(cell => (cell ? { ...cell } : null)));
}

function processLine(line, reverse = false) {
    const ordered = reverse ? [...line.filter(Boolean)].reverse() : line.filter(Boolean);
    const numbers = [];
    const operators = [];

    ordered.forEach((tile) => {
        if (tile.type === 'number') numbers.push(tile);
        else operators.push(tile);
    });

    const mergedNumbers = [];
    for (let i = 0; i < numbers.length; i++) {
        const current = numbers[i];
        const next = numbers[i + 1];
        if (current && next && current.value === next.value) {
            const combined = createTile(current.value * 2, 'number');
            mergedNumbers.push(combined);
            score += combined.value;
            i += 1;
        } else {
            mergedNumbers.push(current);
        }
    }

    if (operators.length) {
        operators.forEach((operator) => {
            mergedNumbers.forEach((numberTile) => {
                if (operator.op === '+') numberTile.value += 1;
                else numberTile.value *= 2;
            });
        });
    }

    const result = mergedNumbers.slice(0, size);
    while (result.length < size) result.push(null);

    if (reverse) result.reverse();
    return result;
}

function move(direction) {
    if (gameOver) return;

    const before = cloneBoard();
    const nextBoard = createEmptyBoard();

    if (direction === 'left') {
        for (let r = 0; r < size; r++) {
            const processed = processLine(board[r]);
            processed.forEach((tile, c) => {
                nextBoard[r][c] = tile;
            });
        }
    } else if (direction === 'right') {
        for (let r = 0; r < size; r++) {
            const processed = processLine(board[r], true);
            processed.forEach((tile, c) => {
                nextBoard[r][size - 1 - c] = tile;
            });
        }
    } else if (direction === 'up') {
        for (let c = 0; c < size; c++) {
            const column = [];
            for (let r = 0; r < size; r++) column.push(board[r][c]);
            const processed = processLine(column);
            processed.forEach((tile, r) => {
                nextBoard[r][c] = tile;
            });
        }
    } else {
        for (let c = 0; c < size; c++) {
            const column = [];
            for (let r = 0; r < size; r++) column.push(board[r][c]);
            const processed = processLine(column, true);
            processed.forEach((tile, r) => {
                nextBoard[size - 1 - r][c] = tile;
            });
        }
    }

    board = nextBoard;

    const changed = JSON.stringify(before) !== JSON.stringify(board);
    if (changed) {
        addRandomTile();
        renderBoard();
        updateStatus();
    }
}

function hasMoves() {
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const current = board[r][c];
            const right = board[r][c + 1];
            const down = board[r + 1] ? board[r + 1][c] : null;
            if (!current) return true;
            if (right && current.type === 'number' && right.type === 'number' && current.value === right.value) return true;
            if (down && current.type === 'number' && down.type === 'number' && current.value === down.value) return true;
        }
    }
    return false;
}

function updateStatus() {
    const emptyCells = getEmptyCells();
    if (!emptyCells.length && !hasMoves()) {
        gameOver = true;
        statusEl.textContent = 'No moves left — start a new game!';
    } else {
        statusEl.textContent = 'Slide the tiles and build bigger values.';
    }
}

function startGame() {
    score = 0;
    gameOver = false;
    board = createEmptyBoard();
    addRandomTile();
    addRandomTile();
    renderBoard();
    updateStatus();
}

window.addEventListener('keydown', (event) => {
    const key = event.key;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
        event.preventDefault();
        if (key === 'ArrowLeft') move('left');
        if (key === 'ArrowRight') move('right');
        if (key === 'ArrowUp') move('up');
        if (key === 'ArrowDown') move('down');
    }
});

let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (event) => {
    const touch = event.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}, { passive: true });

document.addEventListener('touchend', (event) => {
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 30) move('right');
        else if (dx < -30) move('left');
    } else {
        if (dy > 30) move('down');
        else if (dy < -30) move('up');
    }
}, { passive: true });

restartBtn.addEventListener('click', startGame);
startGame();
