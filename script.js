const eventController = (() => {
    const spaces = document.querySelectorAll('.grid-item');
    const playAgainBtn = document.querySelector('#play-again');
    const changePlayersBtn = document.querySelector('#change-players');
    const selectPlayerTwo = document.querySelector('#player-two');
    const selectComputer = document.querySelector('#computer');
    const playerOneInput = document.querySelector('#player-one-input');
    const playerTwoInput = document.querySelector('#player-two-input');
    const welcomeForm = document.querySelector('.welcome-popup');

    window.addEventListener('load', () => {
        const playerTwoSelected = selectPlayerTwo.checked;
        
        if (playerTwoSelected) {
            displayController.showPlayerTwoInput();
        }
    })

    selectPlayerTwo.addEventListener('click', () => {
        displayController.showPlayerTwoInput();
    })

    selectComputer.addEventListener('click', () => {
        displayController.hidePlayerTwoInput();
    })

    welcomeForm.addEventListener('submit', (e) => {
        const names = displayController.sanitizeInput(playerOneInput.value, playerTwoInput.value);
        
        e.preventDefault();
        playerController.gameStart(selectComputer, names);
        displayController.gameStart(spaces);
    })

    spaces.forEach(space => {
        space.addEventListener('click', () => {
            gameLogic.gameFlow(space, spaces);
        })
    })

    playAgainBtn.addEventListener('click', () => {
        playerController.playAgain();
        displayController.gameStart(spaces);
    })

    changePlayersBtn.addEventListener('click', () => {
        playerController.removePlayers();
        displayController.resetGame(spaces);

    })
})();

const Player = (name) => {
    let playerSymbol = '';
    let yourTurn = false;

    return { 
        name,
        yourTurn, 
        playerSymbol,
    }
}

//const computer = (() => {

//})

const playerController = (() => {
    const players = [];

    function _createPlayer(selection, names) {
        if (_computerSelected(selection)) {
            names[1] = 'Computer';
        }
        names.forEach(function(name) {
            const player = Player(`${name}`);
            _addToPlayers(player);
        })
        console.log(players);
    }

    function _assignSymbol() {
        const symbols = ['X', 'O'];

        players.forEach(function(player) {
            const symbol = Math.floor(Math.random() * symbols.length);
            player.playerSymbol = symbols[symbol];
            symbols.splice(symbol, 1);
        })
    }

    function _addToPlayers(player) {
        players.push(player);
    }

    function _startingPlayer() {
        const firstPlayer = Math.floor(Math.random() * players.length);
        players[firstPlayer].yourTurn = true;
    }

    function whoseTurn() {
        const player = players.find(player => player.yourTurn === true);
        return player;
    }

    function changeTurn() {
        players.forEach(function(player) {
            player.yourTurn = !player.yourTurn;
        })
        return whoseTurn();
    }

    function _resetTurnStatus() {
        players.forEach(function(player) {
            player.yourTurn = false;
        })
    }

    function gameStart(selection, names) {
        _createPlayer(selection, names);
        _assignSymbol();
        _startingPlayer();
    }

    function removePlayers() {
        players.length = 0;
    }

    function playAgain() {
        _resetTurnStatus();
        _startingPlayer();
    }

    function _computerSelected(selection) {
        return selection.checked;
    }

    return {
        whoseTurn,
        changeTurn,
        gameStart,
        removePlayers,
        playAgain
    }
    
})();

const gameLogic = (() => {
    function _winCheck(spaces) {
        if (_rowWin(spaces) || _colWin(spaces) || _diagWin(spaces)) {
            return true;
        }
    }

    function _rowWin(spacesArr) {
        const rowStart = [0, 3, 6];

        for (const space of rowStart) {
            if (spacesArr[space].textContent != '') {
                if (spacesArr[space].textContent === spacesArr[space + 1].textContent && 
                    spacesArr[space].textContent === spacesArr[space + 2].textContent) {
                    return true;
                }
            }
        }
    }

    function _colWin(spacesArr) {
        const colStart = [0, 1, 2];

        for (const space of colStart) {
            if (spacesArr[space].textContent != '') {
                if (spacesArr[space].textContent === spacesArr[space + 3].textContent && 
                    spacesArr[space].textContent === spacesArr[space + 6].textContent) {
                    return true;
                }
            }
        }
    }

    function _diagWin(spacesArr) {
        const diagMid = 4;

        if (spacesArr[diagMid].textContent != '') {
            if (spacesArr[diagMid].textContent === spacesArr[diagMid - 4].textContent && 
                spacesArr[diagMid].textContent === spacesArr[diagMid + 4].textContent) {
                return true;
            } else if (spacesArr[diagMid].textContent === spacesArr[diagMid - 2].textContent && 
                spacesArr[diagMid].textContent === spacesArr[diagMid + 2].textContent) {
                return true;
            }
        }
    }

    function _tieCheck(spaces) {
        const spacesArr = Array.from(spaces);
        return spacesArr.every(space => space.textContent != '');
    }

    function gameFlow(space, spaces) {
        const activePlayer = playerController.whoseTurn();
        const spaceIsEmpty = _checkSpace(space);
        
        if (spaceIsEmpty) {
            displayController.addToBoard(space, activePlayer);
            const win = _winCheck(spaces);
            const tie = _tieCheck(spaces);
            
            if (win) {
                displayController.gameEndPopup(win, activePlayer);
            } else if (tie) {
                displayController.gameEndPopup(win);
            } else {
                const nextPlayer = playerController.changeTurn();
                displayController.turnMessage(nextPlayer);
            }
        }
    }

    function _checkSpace(space) {
        return space.textContent === '';
    }

    return {
        gameFlow
    }
})();

const displayController = (() => {
    const gameboard = document.querySelector('.gameboard');
    const titleDiv = document.querySelector('h1');
    const messageDiv = document.querySelector('.messages');
    const playerTwoDiv = document.querySelector('.player-two-input');
    const playerTwoInput = document.querySelector('#player-two-input');
    const welcomeDiv = document.querySelector('.welcome-popup');
    const gameEndDiv = document.querySelector('.game-end-popup');

    function _openPopup(popup) {
        popup.style.visibility = 'visible';
        _makeUnclickable();
    }

    function _closePopup(popup) {
        popup.style.visibility = 'hidden';
        _makeClickable();
    }

    function _findOpenPopup() {
        const popupArr = [welcomeDiv, gameEndDiv];
        const popup = popupArr.find(popup => popup.style.visibility === 'visible');
        return popup;
    }

    function gameStart(spaces) {
        const popup = _findOpenPopup();
        
        _closePopup(popup);
        _clearBoard(spaces);
        turnMessage(playerController.whoseTurn());
        welcomeDiv.reset();
        hidePlayerTwoInput();
    }

    function addToBoard(selection, player) {
        selection.textContent = player.playerSymbol;
    }

    function _clearBoard(spaces) {
        spaces.forEach(space => {
            space.textContent = '';
        })
    }

    function turnMessage(player) {
        messageDiv.textContent = `${player.name}'s turn!`
    }

    function _clearMessage() {
        messageDiv.textContent = '';
    }

    function gameEndPopup(win, player) {
        const message = document.querySelector('.win-or-tie')

        _clearMessage();
        
        if (win) {
            message.textContent = `${player.name} wins!`;
        } else {
            message.textContent = "Cat's Game!"
        }
        _openPopup(gameEndDiv);
    }

    function resetGame(spaces) {
        _clearBoard(spaces);
        _clearMessage();
        _closePopup(_findOpenPopup());
        _openPopup(welcomeDiv);
    }

    function _makeUnclickable() {
        titleDiv.classList.add('popup-open');
        gameboard.classList.add('popup-open');
    }

    function _makeClickable() {
        titleDiv.classList.remove('popup-open');
        gameboard.classList.remove('popup-open');
    }

    function showPlayerTwoInput() {
        playerTwoDiv.style.display = 'block';
        _requirePlayerTwo();
    }

    function hidePlayerTwoInput() {
        playerTwoDiv.style.display = 'none';
        _undoRequirePlayerTwo();
    }

    function _requirePlayerTwo() {
        playerTwoInput.required = true;
    }

    function _undoRequirePlayerTwo() {
        playerTwoInput.required = false;
    }

    function sanitizeInput(...input) {
        const sanitized = [];
        
        input.forEach(function(item) {
            item = item.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            sanitized.push(item);
        })
        return sanitized;
    }

    _openPopup(welcomeDiv);

    return {
        gameStart,
        addToBoard,
        turnMessage,
        gameEndPopup,
        resetGame,
        showPlayerTwoInput,
        hidePlayerTwoInput,
        sanitizeInput
    };
})();



