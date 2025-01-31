// Card class to represent UNO cards
class Card {
    constructor(color, value) {
        this.color = color;
        this.value = value;
    }

    // Check if this card can be played on top of another card
    canPlayOn(otherCard) {
        return this.color === otherCard.color || 
               this.value === otherCard.value ||
               this.color === 'black';
    }

    // Create HTML element for the card
    createCardElement(faceDown = false) {
        const card = document.createElement('div');
        card.className = 'card';
        if (faceDown) {
            card.style.background = '#333';
            return card;
        }

        card.style.background = this.color === 'black' ? '#333' : this.color;
        card.style.color = ['red', 'blue'].includes(this.color) ? 'white' : 'black';
        card.textContent = this.value;
        return card;
    }
}

// Game class to manage the UNO game state and logic
class UnoGame {
    constructor() {
        this.resetGame();
    }

    // Reset game state
    resetGame() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.deck = [];
        this.discardPile = [];
        this.direction = 1; // 1 for clockwise, -1 for counter-clockwise
        // Hide all dialogs
        const gameMessage = document.getElementById('gameMessage');
        const colorPicker = document.getElementById('colorPicker');
        if (gameMessage) gameMessage.style.display = 'none';
        if (colorPicker) colorPicker.style.display = 'none';
        // Reset message button text
        const messageButton = document.getElementById('messageButton');
        if (messageButton) messageButton.textContent = 'Play Again';
        this.setupGame();
    }

    // Initialize the game
    setupGame() {
        this.createDeck();
        this.shuffleDeck();
        this.dealCards();
        this.discardPile = [this.deck.pop()];
        this.updateUI();
    }

    // Create a standard UNO deck
    createDeck() {
        const colors = ['red', 'blue', 'green', 'yellow'];
        const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        const specials = ['Skip', 'Reverse', '+2'];

        // Number cards
        for (let color of colors) {
            for (let number of numbers) {
                this.deck.push(new Card(color, number));
                if (number !== '0') { // Each number except 0 appears twice
                    this.deck.push(new Card(color, number));
                }
            }
        }

        // Special cards
        for (let color of colors) {
            for (let special of specials) {
                this.deck.push(new Card(color, special));
                this.deck.push(new Card(color, special));
            }
        }

        // Wild cards
        for (let i = 0; i < 4; i++) {
            this.deck.push(new Card('black', 'Wild'));
            this.deck.push(new Card('black', '+4'));
        }
    }

    // Shuffle the deck
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    // Deal initial cards to players
    dealCards() {
        this.players = [
            { name: 'You', hand: [], isHuman: true },
            { name: 'AI 1', hand: [], isHuman: false },
            { name: 'AI 2', hand: [], isHuman: false },
            { name: 'AI 3', hand: [], isHuman: false }
        ];

        for (let player of this.players) {
            for (let i = 0; i < 7; i++) {
                player.hand.push(this.deck.pop());
            }
        }
    }

    // Update the game UI
    updateUI() {
        // Update player areas
        const areas = ['bottom', 'top', 'left', 'right'];
        areas.forEach((area, index) => {
            const playerArea = document.getElementById(`player${index === 0 ? '' : (index + 1)}Area`);
            playerArea.innerHTML = '';
            
            const player = this.players[index];
            if (player) {
                // Add turn indicator for AI players
                if (!player.isHuman && this.currentPlayerIndex === index) {
                    const turnIndicator = document.createElement('div');
                    turnIndicator.className = 'turn-indicator';
                    turnIndicator.textContent = '🎮 Thinking...';
                    playerArea.appendChild(turnIndicator);
                }

                player.hand.forEach(card => {
                    const cardElement = card.createCardElement(!player.isHuman);
                    if (player.isHuman && this.currentPlayerIndex === index) {
                        if (card.canPlayOn(this.discardPile[this.discardPile.length - 1])) {
                            cardElement.classList.add('playable');
                            cardElement.onclick = () => this.playCard(index, card);
                        }
                    }
                    playerArea.appendChild(cardElement);
                });
            }
        });

        // Update discard pile
        const discardPile = document.getElementById('discardPile');
        discardPile.innerHTML = '';
        if (this.discardPile.length > 0) {
            const discardTop = document.createElement('div');
            discardTop.className = 'discard-top';
            
            // Add turn indicator on the deck
            if (this.players[this.currentPlayerIndex].isHuman) {
                const turnIndicator = document.createElement('div');
                turnIndicator.className = 'turn-indicator';
                turnIndicator.textContent = '🎮 Your Turn';
                turnIndicator.style.position = 'absolute';
                turnIndicator.style.top = '-30px';
                turnIndicator.style.left = '50%';
                turnIndicator.style.transform = 'translateX(-50%)';
                discardTop.appendChild(turnIndicator);
            }
            
            discardTop.appendChild(
                this.discardPile[this.discardPile.length - 1].createCardElement()
            );
            discardPile.appendChild(discardTop);
        }

        // Update player info
        document.getElementById('currentPlayer').textContent = 
            `${this.players[this.currentPlayerIndex].name}'s turn`;
        document.getElementById('cardCount').textContent = 
            `Cards: ${this.players[0].hand.length}`;

        // If it's AI's turn, make them play after a short delay
        if (!this.players[this.currentPlayerIndex].isHuman) {
            setTimeout(() => this.playAI(), 1000);
        }
    }

    // Handle card playing
    playCard(playerIndex, card) {
        if (this.currentPlayerIndex !== playerIndex) return;

        const topCard = this.discardPile[this.discardPile.length - 1];
        if (!card.canPlayOn(topCard)) return;

        // Remove card from player's hand
        const player = this.players[playerIndex];
        const cardIndex = player.hand.indexOf(card);
        player.hand.splice(cardIndex, 1);

        // Add card to discard pile
        this.discardPile.push(card);

        // Handle special cards
        this.handleSpecialCard(card);

        // Check for winner
        if (player.hand.length === 0) {
            this.showGameOver(player.name);
            return;
        }

        // Move to next player
        this.nextTurn();
        this.updateUI();
    }

    // Handle special card effects
    handleSpecialCard(card) {
        switch (card.value) {
            case 'Reverse':
                this.direction *= -1;
                break;
            case 'Skip':
                this.nextTurn();
                break;
            case '+2':
                this.drawCards(this.getNextPlayerIndex(), 2);
                break;
            case '+4':
                this.drawCards(this.getNextPlayerIndex(), 4);
                // Show color picker for human player
                if (this.players[this.currentPlayerIndex].isHuman) {
                    this.showColorPicker();
                } else {
                    card.color = this.chooseColorAI();
                }
                break;
            case 'Wild':
                if (this.players[this.currentPlayerIndex].isHuman) {
                    this.showColorPicker();
                } else {
                    card.color = this.chooseColorAI();
                }
                break;
        }
    }

    // AI player logic
    playAI() {
        const player = this.players[this.currentPlayerIndex];
        const topCard = this.discardPile[this.discardPile.length - 1];

        // Find playable cards
        const playableCards = player.hand.filter(card => card.canPlayOn(topCard));

        if (playableCards.length > 0) {
            // Play the first playable card
            this.playCard(this.currentPlayerIndex, playableCards[0]);
        } else {
            // Draw a card
            this.drawCard(this.currentPlayerIndex);
            this.nextTurn();
            this.updateUI();
        }
    }

    // Draw cards for a player
    drawCards(playerIndex, count) {
        for (let i = 0; i < count; i++) {
            this.drawCard(playerIndex);
        }
    }

    // Draw a single card
    drawCard(playerIndex) {
        if (this.deck.length === 0) {
            // Reshuffle discard pile if deck is empty
            const topCard = this.discardPile.pop();
            this.deck = this.discardPile;
            this.discardPile = [topCard];
            this.shuffleDeck();
        }
        if (this.deck.length > 0) {
            this.players[playerIndex].hand.push(this.deck.pop());
        }
    }

    // Get the index of the next player
    getNextPlayerIndex() {
        let nextIndex = this.currentPlayerIndex + this.direction;
        if (nextIndex >= this.players.length) nextIndex = 0;
        if (nextIndex < 0) nextIndex = this.players.length - 1;
        return nextIndex;
    }

    // Move to the next player's turn
    nextTurn() {
        this.currentPlayerIndex = this.getNextPlayerIndex();
    }

    // Show game over message
    showGameOver(winner) {
        const messageElement = document.getElementById('gameMessage');
        document.getElementById('messageTitle').textContent = 'Game Over';
        document.getElementById('messageContent').textContent = `${winner} wins!`;
        messageElement.style.display = 'block';
    }

    // Show color picker for wild cards
    showColorPicker() {
        const colorPicker = document.getElementById('colorPicker');
        colorPicker.style.display = 'block';

        const buttons = colorPicker.getElementsByClassName('color-button');
        for (let button of buttons) {
            button.onclick = () => {
                const color = button.dataset.color;
                this.discardPile[this.discardPile.length - 1].color = color;
                colorPicker.style.display = 'none';
                this.nextTurn();
                this.updateUI();
            };
        }
    }

    // AI color choice logic
    chooseColorAI() {
        const colors = ['red', 'blue', 'green', 'yellow'];
        const colorCounts = colors.map(color => 
            this.players[this.currentPlayerIndex].hand.filter(card => 
                card.color === color
            ).length
        );
        return colors[colorCounts.indexOf(Math.max(...colorCounts))];
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    let game = new UnoGame();

    // New game button
    document.getElementById('newGameBtn').onclick = () => {
        game.resetGame();
    };

    // Draw card button (add to HTML)
    const drawButton = document.createElement('button');
    drawButton.className = 'action-button';
    drawButton.textContent = 'Draw Card';
    drawButton.onclick = () => {
        if (game.currentPlayerIndex === 0) {
            game.drawCard(0);
            game.nextTurn();
            game.updateUI();
        }
    };
    document.querySelector('.action-buttons').appendChild(drawButton);

    // Help button
    document.getElementById('helpBtn').onclick = () => {
        const messageElement = document.getElementById('gameMessage');
        document.getElementById('messageTitle').textContent = 'How to Play';
        document.getElementById('messageContent').textContent = 
            'Match cards by color or number. Special cards: Skip - skip next player, ' +
            'Reverse - change direction, +2 - next player draws 2 cards, ' +
            'Wild - change color, +4 - next player draws 4 cards and change color. ' +
            'First player to use all cards wins!';
        messageElement.style.display = 'block';
        document.getElementById('messageButton').textContent = 'Got it!';
        document.getElementById('messageButton').onclick = () => {
            messageElement.style.display = 'none';
        };
    };
});