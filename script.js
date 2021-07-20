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
        console.log(moves);
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

    let firstPlayer = false;
    const corners = [0, 2, 6, 8];
    const sides = [1, 3, 5, 7];
    const middle = 4;

    function checkIfFirst() {
        return playerController.whoseTurn().name === 'Computer';
    }
    
    function chooseCorner() {
        const choice = Math.floor(Math.random() * corners.length);
        selection = corners[choice];
        selectSpace(selection);
    }

    function gameStart() {
        firstPlayer = checkIfFirst();
        if (firstPlayer) {
            chooseCorner();
        }
    }

    function chooseMiddle() {
        selectSpace(middle);
    }

    function sideChosen(previousMove) {
        return sides.includes(parseInt(previousMove));
    }

    function adjCornerChosen(previousMove, activePlayer) {
        return corners.includes(parseInt(previousMove)) && parseInt(previousMove) != Math.abs(activePlayer.moves[0] - 8);
    }

    function oppCornerChosen(previousMove, activePlayer) {
        return parseInt(previousMove) === Math.abs(activePlayer.moves[0] - 8);
    }
    
    function middleChosen(previousMove) {
        return parseInt(previousMove) === middle;
    }

    function findAdjCorner(previousMove, activePlayer) {
        return corners.filter(corner => corner != parseInt(previousMove) 
        && corner != Math.abs(activePlayer.moves[0] - 8) && !activePlayer.moves.includes(corner));
    }

    function chooseAdjCorner(previousMove, activePlayer) {
        adjCorners = findAdjCorner(previousMove, activePlayer);
        console.log(adjCorners);
        const choice = Math.floor(Math.random() * adjCorners.length);
        return adjCorners[choice];
    }

    function chooseRandSpace(emptySpaces) {
        const choice = Math.floor(Math.random() * emptySpaces.length);
        return emptySpaces[choice];
    }

    function findOppCorner(activePlayer) {
        return corners.find(corner => corner === Math.abs(activePlayer.moves[0] - 8));
    }

    function chooseNextMove(activePlayer, otherPlayer, spaces) {
        spacesArr = Array.from(spaces);
        const emptySpaces = spacesArr.filter(space => space.textContent === '');
        const emptySpacesData = emptySpaces.map(space => parseInt(space.getAttribute('data')));

        const [isWinningSpace, winningSpace] = checkForWinSpaces(activePlayer.moves, emptySpacesData);
            
        if (isWinningSpace) {
            return winningSpace;
        }
            
        const [isSpaceToBlock, spaceToBlock] = checkForWinSpaces(otherPlayer.moves, emptySpacesData);
        if (isSpaceToBlock) {
            return spaceToBlock;
        }
        
        const [isSpace, spaceToChoose] = searchEmptySpaces(emptySpacesData, activePlayer.moves);
        if (isSpace) {
            return spaceToChoose;
        }

        else {
            return chooseRandSpace(emptySpacesData);
        }


    }

    function checkForWinSpaces(previousMoves, emptySpaces) {

        function checkForMatches(spaces, previousMoves) {
            return spaces.every(space => previousMoves.includes(space));
        }

        for (const space of emptySpaces) {
            const spacesToCheck = gameboard.spaces[`${space}`];
            if (spacesToCheck.some(spaces => checkForMatches(spaces, previousMoves))) {
                return [true, space];
            }
        }
        return [false, null];
    }

    function findEmptyAndMatch(spaces, previousMoves, emptySpaces) {
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

    `create array of functions with arguments bound, loop through searchEmptySpaces, apply different function each time`

    function findMultSetups(previousMoves, emptySpaces, spacesArr) {
        const setups = spacesArr.filter(spaces => findEmptyAndMatch(spaces, previousMoves, emptySpaces));
        if (setups.length >= 2) {
            return setups
        }
        return false;
    }

    function findOneSetup(previousMoves, emptySpaces, spacesArr) {
        const setups = spacesArr.filter(spaces => findEmptyAndMatch(spaces, previousMoves, emptySpaces));
        return setups;
    }

    function searchEmptySpaces(emptySpaces, previousMoves) {

        let multSetups = findMultSetups.bind(null, previousMoves, emptySpaces);
        let oneSetup = findOneSetup.bind(null, previousMoves, emptySpaces);

        evalFuncs = [multSetups, oneSetup];

        for (let i = 0; i < evalFuncs.length; i++) {
            for (const space of emptySpaces) {
                const spacesToCheck = gameboard.spaces[`${space}`];
                if (evalFuncs[i](spacesToCheck).length > 0) {
                    return [true, space];
                }
            }
        }
        return [false, null];
    }

    function analyzeBoard(movesMade, spaces, activePlayer) {
        const previousMove = findPreviousMove();
        const otherPlayer = playerController.inactivePlayer();

        if (movesMade === 1) {
            if (middleChosen(previousMove)) {
                chooseCorner();
            } else {
                chooseMiddle();
            }
        }
        if (movesMade === 2) {
            if (sideChosen(previousMove)) {
                selectSpace(middle);
            } else if (adjCornerChosen(previousMove, activePlayer)) {
                console.log(adjCornerChosen(previousMove, activePlayer));
                selectSpace(chooseAdjCorner(previousMove, activePlayer));
            } else if (oppCornerChosen(previousMove, activePlayer)) {
                selectSpace(chooseAdjCorner(previousMove, activePlayer));
            } else {
                selectSpace(findOppCorner(activePlayer));
            }
        }
        if (movesMade >= 3) {

            const space = chooseNextMove(activePlayer, otherPlayer, spaces);
            selectSpace(space);
        }
    }


    function selectSpace(selection) {
        space = document.querySelector(`[data="${selection}"]`);
        space.click();
    }

    function findPreviousMove() {
        const otherPlayer = playerController.inactivePlayer();
        return otherPlayer.moves[otherPlayer.moves.length - 1];
    }

    return {
        gameStart,
        checkIfFirst,
        analyzeBoard,
        chooseCorner,
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
            activePlayer.addToMoves(space);
            movesMade += 1;
            const win = _winCheck(spaces);
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
                    computer.analyzeBoard(movesMade, spaces, nextPlayer);
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
        resetMoveCounter
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



