const eventController = (() => {
    const startBtn = document.querySelector('.start-btn');
    const spaces = document.querySelectorAll('.grid-item');

    startBtn.addEventListener('click', (e) => {
        const names = [displayController.playerOneInput.value, displayController.playerTwoInput.value];
        
        e.preventDefault();
        playerController.gameStart(names);
        displayController.gameStart();
    })

    spaces.forEach(space => {
        space.addEventListener('click', () => {
            const activePlayer = playerController.whoseTurn();
            
            displayController.addToBoard(space, activePlayer);
            if (gameLogic.winCheck(spaces)) {
                displayController.winMessage(activePlayer);
            } else if (gameLogic.tieCheck(spaces)) {
                displayController.tieMessage();
            } else {
                const nextPlayer = playerController.changeTurn();
                displayController.turnMessage(nextPlayer);
            }
        })
    })
})();

const Player = (name) => {
    let score = 0;
    let playerSymbol = '';
    let yourTurn = false;

    function clearScore() {
        score = 0;
    }

    return { 
        name,
        yourTurn, 
        playerSymbol, 
        clearScore, 
    }
}

const playerController = (() => {
    const players = [];

    function createPlayer(names) {
        names.forEach(function(name) {
            if (name != '') {
                const player = Player(`${name}`);
                addToPlayers(player);
            }
        })
        console.log(players);
    }

    function assignSymbol() {
        const symbols = ['X', 'O'];

        players.forEach(function(player) {
            const symbol = Math.floor(Math.random() * symbols.length);
            player.playerSymbol = symbols[symbol];
            symbols.splice(symbol, 1);
        })
    }

    function addToPlayers(player) {
        players.push(player);
    }

    function startingPlayer() {
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

    function gameStart(names) {
        createPlayer(names);
        assignSymbol();
        startingPlayer();
    }

    return {
        createPlayer,
        assignSymbol,
        startingPlayer,
        whoseTurn,
        changeTurn,
        gameStart,
    }
    
})();

const gameLogic = (() => {
    function winCheck(spaces) {
        if (rowWin(spaces) || colWin(spaces) || diagWin(spaces)) {
            return true;
        }
    }

    function rowWin(spacesArr) {
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

    function colWin(spacesArr) {
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

    function diagWin(spacesArr) {
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

    function tieCheck(spaces) {
        const spacesArr = Array.from(spaces);
        return spacesArr.every(space => space.textContent != '');
    }

    return {
        winCheck,
        tieCheck
    }
})();

const displayController = (() => {
    const gameboard = document.querySelector('.gameboard');
    const messageDiv = document.querySelector('.messages');
    const playerTwoSelect = document.querySelector('#player-two');
    const computerSelect = document.querySelector('#computer');
    const playerOneInput = document.querySelector('#player-one-input');
    const playerTwoInput = document.querySelector('#player-two-input');
    const welcomePopup = document.querySelector('.welcome-popup');

    function openPopup(popup) {
        popup.style.visibility = 'visible';
    }

    function closePopup(popup) {
        popup.style.visibility = 'hidden';
    }

    function gameStart() {
        welcomePopup.reset();
        closePopup(welcomePopup);
        turnMessage(playerController.whoseTurn());
    }

    function addToBoard(selection, player) {
        selection.textContent = player.playerSymbol;
    }

    function clearBoard(spaces) {
        spaces.forEach(space => {
            space.textContent = '';
        })
    }

    function turnMessage(player) {
        messageDiv.textContent = `${player.name}'s turn!`
    }

    function winMessage(player) {
        messageDiv.textContent = `${player.name} wins!`;
    }

    function tieMessage() {
        messageDiv.textContent = "Cat's Game!";
    }

    openPopup(welcomePopup);

    return { 
        playerOneInput,
        playerTwoInput,
        welcomePopup,
        openPopup,
        closePopup,
        gameStart,
        addToBoard, 
        clearBoard,
        turnMessage,
        winMessage,
        tieMessage
    };
})();



