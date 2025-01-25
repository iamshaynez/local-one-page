document.addEventListener('DOMContentLoaded', () => {
    const scoreTable = document.getElementById('scoreTable');
    const addPlayerBtn = document.getElementById('addPlayerBtn');
    const addRoundBtn = document.getElementById('addRoundBtn');
    const resetBtn = document.getElementById('resetBtn');

    let players = [];
    let scores = [];

    // Load data from cookies
    function loadData() {
        const savedPlayers = getCookie('players');
        const savedScores = getCookie('scores');

        if (savedPlayers && savedScores) {
            players = JSON.parse(savedPlayers);
            scores = JSON.parse(savedScores);
        }
    }

    // Save data to cookies
    function saveData() {
        setCookie('players', JSON.stringify(players), 365);
        setCookie('scores', JSON.stringify(scores), 365);
    }

    // Cookie utilities
    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value};${expires};path=/`;
    }

    function getCookie(name) {
        const nameEQ = `${name}=`;
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
        }
        return null;
    }

    // Add new player
    function addPlayer() {
        const playerName = prompt('Enter player name:', `Player ${players.length + 1}`);
        if (playerName) {
            players.push(playerName);
            updateTable();
            saveData();
        }
    }

    // Remove player
    function removePlayer(index) {
        if (confirm(`Remove player ${players[index]}?`)) {
            players.splice(index, 1);
            scores.forEach(round => round.splice(index, 1));
            updateTable();
            saveData();
        }
    }

    // Add new round
    function addRound() {
        if (players.length === 0) {
            alert('Please add at least one player first.');
            return;
        }
        scores.push(new Array(players.length).fill(0));
        updateTable();
        saveData();
    }

    // Reset all data
    function resetAll() {
        if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
            players = [];
            scores = [];
            updateTable();
            saveData();
        }
    }

    // Update score
    function updateScore(roundIndex, playerIndex, value) {
        const score = parseInt(value) || 0;
        scores[roundIndex][playerIndex] = score;
        updateTotals();
        saveData();
    }

    // Update table totals
    function updateTotals() {
        const totals = players.map((_, playerIndex) => {
            return scores.reduce((sum, round) => sum + (round[playerIndex] || 0), 0);
        });

        const totalCells = scoreTable.querySelectorAll('.total-row td');
        totals.forEach((total, index) => {
            totalCells[index + 1].textContent = total;
        });
    }

    // Update entire table
    function updateTable() {
        // Update header
        const headerRow = scoreTable.querySelector('thead tr');
        headerRow.innerHTML = '<th>Round</th>';
        players.forEach((player, index) => {
            headerRow.innerHTML += `
                <th class="player-header">
                    <input type="text" class="player-name" value="${player}" 
                           onchange="this.dataset.playerIndex=${index};this.dispatchEvent(new Event('playerNameChange'))"/>
                    <button class="remove-player" data-index="${index}">&times;</button>
                </th>`;
        });

        // Update body
        const tbody = scoreTable.querySelector('tbody');
        tbody.innerHTML = '';

        // Add score rows
        scores.forEach((round, roundIndex) => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>Round ${roundIndex + 1}</td>`;
            round.forEach((score, playerIndex) => {
                row.innerHTML += `
                    <td>
                        <input type="number" class="score-input" value="${score}" 
                               data-round="${roundIndex}" data-player="${playerIndex}"/>
                    </td>`;
            });
            tbody.appendChild(row);
        });

        // Add total row
        const totalRow = document.createElement('tr');
        totalRow.className = 'total-row';
        totalRow.innerHTML = '<td>Total</td>' + players.map(() => '<td>0</td>').join('');
        tbody.appendChild(totalRow);

        // Update totals
        updateTotals();

        // Add event listeners
        document.querySelectorAll('.score-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const roundIndex = parseInt(e.target.dataset.round);
                const playerIndex = parseInt(e.target.dataset.player);
                updateScore(roundIndex, playerIndex, e.target.value);
            });
        });

        document.querySelectorAll('.remove-player').forEach(btn => {
            btn.addEventListener('click', (e) => {
                removePlayer(parseInt(e.target.dataset.index));
            });
        });

        document.querySelectorAll('.player-name').forEach(input => {
            input.addEventListener('playerNameChange', (e) => {
                const index = parseInt(e.target.dataset.playerIndex);
                players[index] = e.target.value;
                saveData();
            });
        });
    }

    // Initialize
    addPlayerBtn.addEventListener('click', addPlayer);
    addRoundBtn.addEventListener('click', addRound);
    resetBtn.addEventListener('click', resetAll);

    loadData();
    updateTable();
});