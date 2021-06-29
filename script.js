const eventController = (() => {
    const startBtn = document.querySelector('.start-btn');
    const spaces = document.querySelectorAll('.grid-item');

    startBtn.addEventListener('click', () => {
        const names = [displayController.playerOneInput.value, displayController.playerTwoInput.value];
        
        playerController.createPlayer(names, displayController.playerTwoSelect, displayController.computerSelect);
        playerController.assignSymbol();
        playerController.startingPlayer();
        displayController.turnMessage(playerController.whoseTurn());
    })

    spaces.forEach(space => {
        space.addEventListener('click', () => {
            const activePlayer = playerController.whoseTurn();
            
            displayController.addToBoard(space, activePlayer);
            playerController.changeTurn();
            displayController.turnMessage(playerController.whoseTurn());
        })
    })
})();

const gameBoard = (() => {
    let moves = [];
    
    function addMove(choice) {
        moves.push(choice);
    }

    function clearMoves() {
        moves = [];
    }

    return {
        addMove,
        clearMoves,
    }
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

    function createPlayer(names, soloPlay, partnerPlay) {
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
            console.log(symbols);
        })
        console.log(players);
    }

    function addToPlayers(player) {
        players.push(player);
    }

    function startingPlayer() {
        const firstPlayer = Math.floor(Math.random() * players.length);
        players[firstPlayer].yourTurn = true;
        console.log(players[firstPlayer].yourTurn);
    }

    function whoseTurn() {
        const player = players.filter(player => player.yourTurn === true);
        return player[0];
    }

    function changeTurn() {
        players.forEach(function(player) {
            player.yourTurn = !player.yourTurn;
        })
    }

    return {
        createPlayer,
        assignSymbol,
        startingPlayer,
        whoseTurn,
        changeTurn,
    }
    
})();

const gameLogic = (() => {
    function winCheck(spaces) {

    }
})();

const displayController = (() => {
    const gameboard = document.querySelector('.gameboard');
    const messageDiv = document.querySelector('.messages');
    const playerTwoSelect = document.querySelector('#player-two');
    const computerSelect = document.querySelector('#computer');
    const playerOneInput = document.querySelector('#player-one-input');
    const playerTwoInput = document.querySelector('#player-two-input');

    //function welcomePopup() {
    //}

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
        messageDiv.textContent = "It's a tie!";
    }

    return { 
        playerOneInput,
        playerTwoInput,
        addToBoard, 
        clearBoard,
        turnMessage,
        winMessage,
        tieMessage
    };
})();



