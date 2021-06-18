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
    let symbol = '';
    
    function changeSymbol(choice) {
        symbol = choice;
    }

    function clearScore() {
        score = 0;
    }

    return { 
        name, 
        changeSymbol, 
        clearScore, 
    }
}

const gameLogic = (() => {

})();

const displayController = (() => {
    const gameboard = document.querySelector('.gameboard');
    const messageDiv = document.querySelector('.messsages');

    function createBoard() {
        for (i = 1;i <= 9; i++) {
            const box = document.createElement('div');
            box.classList.add('grid-item');
            gameboard.appendChild(box);
        }
    }

    function addToBoard(selection, player) {
        selection.textContent = player.symbol;
    }

    function clearBoard() {
        const boxes = document.querySelectorAll('.grid-item');

        boxes.forEach(box => {
            box.textContent = '';
        })
    }

    function turnMessage(player) {
        messageDiv.textContent = `${player.name}'s turn!`
    }

    function welcomeMessage() {
        messageDiv.textContent = "Welcome to Online Tic-Tac-Toe!"
    }

    function winMessage(player) {
        messageDiv.textContent = `${player.name} wins!`;
    }

    function tieMessage() {
        messageDiv.textContent = "It's a tie!";
    }

    return { 
        createBoard, 
        addToBoard, 
        clearBoard,
        turnMessage,
        welcomeMessage,
        winMessage,
        tieMessage
    };
})();

displayController.createBoard();



