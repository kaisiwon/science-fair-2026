document.addEventListener('DOMContentLoaded', () => {
    const numberForgeBtn = document.getElementById('select-number-forge');
    const marketTycoonBtn = document.getElementById('select-market-tycoon');
    const lavaBalanceBtn = document.getElementById('select-lava-balance');

    numberForgeBtn.addEventListener('click', () => {
        window.location.href = 'number-forge.html';
    });

    marketTycoonBtn.addEventListener('click', () => {
        window.location.href = 'market-tycoon.html';
    });

    lavaBalanceBtn.addEventListener('click', () => {
        window.location.href = 'lava-balance.html';
    });
});