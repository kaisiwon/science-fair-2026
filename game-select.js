document.addEventListener('DOMContentLoaded', () => {
    const numberForgeBtn = document.getElementById('select-number-forge');
    const vectorVectorBtn = document.getElementById('select-vector-vector');
    const marketTycoonBtn = document.getElementById('select-market-tycoon');

    numberForgeBtn.addEventListener('click', () => {
        window.location.href = 'number-forge.html';
    });

    vectorVectorBtn.addEventListener('click', () => {
        window.location.href = 'vector-vector.html';
    });

    marketTycoonBtn.addEventListener('click', () => {
        window.location.href = 'market-tycoon.html';
    });
});