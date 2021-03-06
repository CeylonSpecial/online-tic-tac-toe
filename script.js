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
        computer.gameStart();
    })

    spaces.forEach(space => {
        space.addEventListener('click', () => {
            gameLogic.gameFlow(space, spaces);
        })
    })

    playAgainBtn.addEventListener('click', () => {
        playerController.playAgain();
        displayController.gameStart(spaces);
        gameLogic.resetMoveCounter();
        computer.gameStart();
    })

    changePlayersBtn.addEventListener('click', () => {
        playerController.removePlayers();
        displayController.resetGame(spaces);
        gameLogic.resetMoveCounter();
    })
})();

const gameboard = (() => {

    const spaces = [
        [[1, 2], [3, 6], [4, 8]],
        [[0, 2], [4, 7]],
        [[0, 1], [4, 6], [5, 8]],
        [[4, 5], [0, 6]],
        [[3, 5], [1, 7], [0, 8], [2, 6]],
        [[3, 4], [2, 8]],
        [[7, 8], [0, 3], [2, 4]],
        [[6, 8], [1, 4]],
        [[0, 4], [6, 7], [2, 5]]
    ]
    return {
        spaces
    }
})();

const Player = (name) => {
    let moves = [];
    let playerSymbol = '';
    let yourTurn = false;

    function addToMoves(space) {
        moves.push(parseInt(space.getAttribute('data')));
    }

    return { 
        name,
        yourTurn, 
        playerSymbol,
        moves,
        addToMoves
    }
}

const computer = (() => {

    const corners = [0, 2, 6, 8];
    const sides = [1, 3, 5, 7];
    const middle = 4;
    
    function _chooseCorner() {
        selection = _chooseRandSpace(corners)
        _selectSpace(selection);
    }

    function gameStart() {
        const firstPlayer = playerController.whoseTurn().name === 'Computer';
        if (firstPlayer) {
            _chooseCorner();
        }
    }

    function _chooseMiddle() {
        _selectSpace(middle);
    }

    function _sideChosen(previousMove) {
        return sides.includes(parseInt(previousMove));
    }

    function _cornerChosen(previousMove) {
        return corners.includes(parseInt(previousMove));
    }
    
    function _middleChosen(previousMove) {
        return parseInt(previousMove) === middle;
    }

    function _oppCornerChosen(previousMoves) {
        return Math.abs(parseInt(previousMoves[0]) - 8) === parseInt(previousMoves[1]);
    }

    function _findAdjCorner(previousMove, activePlayer) {
        return corners.filter(corner => corner != parseInt(previousMove) 
        && corner != Math.abs(activePlayer.moves[0] - 8) && !activePlayer.moves.includes(corner));
    }

    function _chooseAdjCorner(previousMove, activePlayer) {
        adjCorners = _findAdjCorner(previousMove, activePlayer);
        selection = _chooseRandSpace(adjCorners);
        return selection;
    }

    function _chooseRandSpace(emptySpaces) {
        const choice = Math.floor(Math.random() * emptySpaces.length);
        return emptySpaces[choice];
    }

    function _findOppCorner(activePlayer) {
        return corners.find(corner => corner === Math.abs(activePlayer.moves[0] - 8));
    }

    function _analyzeBoard(activePlayer, otherPlayer, spaces) {
        spacesArr = Array.from(spaces);
        const emptySpaces = spacesArr.filter(space => space.textContent === '');
        const emptySpacesData = emptySpaces.map(space => parseInt(space.getAttribute('data')));
        
        const spaceToChoose = _searchEmptySpaces(emptySpacesData, activePlayer.moves, otherPlayer.moves);
        if (typeof spaceToChoose === 'number') {
            return spaceToChoose;
        } else {
            return _chooseRandSpace(emptySpacesData);
        }
    }

    function _findEmptyAndMatch(spaces, previousMoves, emptySpaces) {
        let match = false;
        let empty = false;
        
        spaces.forEach(function(space) {
            if (previousMoves.includes(space)) {
                match = true;
            } else if (emptySpaces.includes(space)) {
                empty = true;
            }
        })
        return match && empty;
    }

    function _findMultSetups(previousMoves, emptySpaces, spacesArr) {
        return spacesArr.filter(spaces => _findEmptyAndMatch(spaces, previousMoves, emptySpaces)).length >= 2;
    }

    function _findOneSetup(previousMoves, emptySpaces, spacesArr) {
        return spacesArr.some(spaces => _findEmptyAndMatch(spaces, previousMoves, emptySpaces));
    }

    function _searchEmptySpaces(emptySpaces, myPastMoves, oppPastMoves) {

        let checkForMyWin = gameLogic.checkForWinSpaces.bind(null, myPastMoves);
        let checkForOppWin = gameLogic.checkForWinSpaces.bind(null, oppPastMoves);
        let multSetups = _findMultSetups.bind(null, myPastMoves, emptySpaces);
        let oneSetup = _findOneSetup.bind(null, myPastMoves, emptySpaces);

        evalFuncs = [checkForMyWin, checkForOppWin, multSetups, oneSetup];

        for (let i = 0; i < evalFuncs.length; i++) {
            for (const space of emptySpaces) {
                const spacesToCheck = gameboard.spaces[`${space}`];
                if (evalFuncs[i](spacesToCheck)) {
                    return space;
                }
            }
        } return false;
    }

    function chooseBestMove(movesMade, spaces, activePlayer) {
        const previousMove = _findPreviousMove();
        const otherPlayer = playerController.inactivePlayer();

        if (movesMade === 1) {
            if (_middleChosen(previousMove)) {
                _chooseCorner();
            } else {
                _chooseMiddle();
            }
        }
        if (movesMade === 2) {
            if (_sideChosen(previousMove)) {
                _selectSpace(middle);
            } else if (_cornerChosen(previousMove)) {
                _selectSpace(_chooseAdjCorner(previousMove, activePlayer));
            } else {
                _selectSpace(_findOppCorner(activePlayer));
            }
        }
        if (movesMade >= 3) {
            let space;
            if (activePlayer.moves.length === 1 && _oppCornerChosen(otherPlayer.moves)) {
                space = _chooseRandSpace(sides);
            }
            else {
                space = _analyzeBoard(activePlayer, otherPlayer, spaces);
            }
            _selectSpace(space);
        }
    }

    function _selectSpace(selection) {
        space = document.querySelector(`[data="${selection}"]`);
        space.click();
    }

    function _findPreviousMove() {
        const otherPlayer = playerController.inactivePlayer();
        return otherPlayer.moves[otherPlayer.moves.length - 1];
    }

    return {
        gameStart,
        chooseBestMove
    }

})();

const playerController = (() => {
    const players = [];

    function _createPlayer(selection, names) {
        const computerSelected = _checkComputerSelection(selection);
        
        if (computerSelected) {
            names[1] = 'Computer';
        }
        names.forEach(function(name) {
            const player = Player(`${name}`);
            _addToPlayers(player);
        })
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

    function inactivePlayer() {
        const player = players.find(player => player.yourTurn === false);
        return player;
    }

    function changeTurn() {
        players.forEach(function(player) {
            player.yourTurn = !player.yourTurn;
        })
        return whoseTurn();
    }

    function _resetPlayer() {
        players.forEach(function(player) {
            player.moves.length = 0;
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
        _resetPlayer();
        _startingPlayer();
    }

    function _checkComputerSelection(selection) {
        return selection.checked;
    }

    return {
        whoseTurn,
        inactivePlayer,
        changeTurn,
        gameStart,
        removePlayers,
        playAgain
    }
    
})();

const gameLogic = (() => {

    let movesMade = 0;

    function _winCheck(space, activePlayer) {
        let spacesToCheck = gameboard.spaces[`${space.getAttribute('data')}`];

        return checkForWinSpaces(activePlayer.moves, spacesToCheck);
    }

    function _tieCheck(spaces) {
        const spacesArr = Array.from(spaces);
        return spacesArr.every(space => space.textContent != '');
    }

    function checkForWinSpaces(previousMoves, spacesToCheck) {
        return spacesToCheck.some(spaces => _checkForMatches(spaces, previousMoves));
    }

    function _checkForMatches(spaces, previousMoves) {
        return spaces.every(space => previousMoves.includes(space));
    }

    function gameFlow(space, spaces) {
        const activePlayer = playerController.whoseTurn();
        const spaceIsEmpty = _checkSpace(space);
        
        if (spaceIsEmpty) {
            displayController.addToBoard(space, activePlayer);
            activePlayer.addToMoves(space);
            movesMade += 1;
            const win = _winCheck(space, activePlayer);
            const tie = _tieCheck(spaces);
            
            if (win) {
                displayController.gameEndPopup(win, activePlayer);
            } else if (tie) {
                displayController.gameEndPopup(win);
            } else {
                const nextPlayer = playerController.changeTurn();
                displayController.turnMessage(nextPlayer);
                if (nextPlayer.name === 'Computer') {
                    console.log('My turn!');
                    computer.chooseBestMove(movesMade, spaces, nextPlayer);
                }
            }
        }
    }

    function _checkSpace(space) {
        return space.textContent === '';
    }

    function resetMoveCounter() {
        movesMade = 0;
    }

    return {
        gameFlow,
        resetMoveCounter,
        checkForWinSpaces
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