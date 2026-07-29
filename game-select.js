document.addEventListener('DOMContentLoaded', () => {
    const numberForgeBtn = document.getElementById('select-number-forge');
    const marketTycoonBtn = document.getElementById('select-market-tycoon');
    const lavaBalanceBtn = document.getElementById('select-lava-balance');
    const equationDungeonBtn = document.getElementById('select-equation-dungeon');
    const fractionFarmerBtn = document.getElementById('select-fraction-farmer');
    const vectorVoyageBtn = document.getElementById('select-vector-voyage');
    const cipherHeistBtn = document.getElementById('select-cipher-heist');

    numberForgeBtn.addEventListener('click', () => {
        window.location.href = 'number-forge.html';
    });

    marketTycoonBtn.addEventListener('click', () => {
        window.location.href = 'market-tycoon.html';
    });

    lavaBalanceBtn.addEventListener('click', () => {
        window.location.href = 'lava-balance.html';
    });

    equationDungeonBtn.addEventListener('click', () => {
        window.location.href = 'equation-dungeon.html';
    });

    fractionFarmerBtn.addEventListener('click', () => {
        window.location.href = 'fraction-farmer.html';
    });

    vectorVoyageBtn.addEventListener('click', () => {
        window.location.href = 'vector-voyage.html';
    });

    cipherHeistBtn.addEventListener('click', () => {
        window.location.href = 'cipher-heist.html';
    });
});