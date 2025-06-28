const gameBoard = ( () => {
    let board = ['', '', '', '', '', '', '', '', ''];

    const getBoard = () => board;

    const placeMark = (index,mark) => {
        if (board[index] === '') {
            board[index] = mark;
            return true;
        }
        else { return false };
    };

    const resetBoard = () => {
        board = ['', '', '', '', '', '', '', '', ''];
    }

    const isPositionAvaiable = (index) => {
        return board[index] ==='';
    };

    const isBoardFull = () => {
        return board.every(cell => cell !== '');
    };

    return {
        getBoard,
        placeMark,
        resetBoard,
        isPositionAvaiable,
        isBoardFull
    };
})();

const Player = (name,mark) => {
    const getName =() => name;
    const getMark = () => mark;

    return {
        getName,
        getMark
    };
};

const GameController = (() => {
    let players = [];
    let currentPlayerIndex = 0;
    let gameActive = false;
    let gameOver = false;

    const winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    const initializeGame = (player1Name , player2Name) => {
        players = [
            Player(player1Name, 'X'),
            Player(player2Name, 'O')
        ];

        currentPlayerIndex = 0;
        gameActive = true;
        gameOver = false;
        gameBoard.resetBoard();
    };

    const getCurrentPlayer = () => {
        return players[currentPlayerIndex];
    };

    const switchPlayer = () => {
        currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
    };

    const checkWinner = () => {
        const board = gameBoard.getBoard();

        for (let combination of winningCombinations) {
            const [a, b, c] = combination;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return null;
    };

    const checkTie = () => {
        return gameBoard.isBoardFull() && !checkWinner();
    };

    const playRound = (position) => {
        if (!gameActive || gameOver) return false;

        const currentPlayer = getCurrentPlayer();

        if (gameBoard.placeMark(position,currentPlayer.getMark())){
            const winner = checkWinner();
            if (winner) {
                gameOver = true;
                gameActive = false;
                return { type: 'win', player: currentPlayer };
            }

            if (checkTie()) {
                gameOver = true;
                gameActive = false;
                return { type: 'tie' };
            }

            switchPlayer();
            return { type: 'continue' };
        }

        return false;
    };

    const resetGame = () => {
        gameBoard.resetBoard();
        currentPlayerIndex = 0;
        gameActive = true;
        gameOver = false;
    };

    const isGameActive = () => gameActive;

    return {
        initializeGame,
        getCurrentPlayer,
        playRound,
        resetGame,
        isGameActive,
        checkWinner,
        checkTie
    };
})();

const displayController = (() => {
    const setupScreen = document.getElementById('setupScreen');
    const gameScreen = document.getElementById('gameScreen');
    const startGameBtn = document.getElementById('startGameBtn');
    const resetBtn = document.getElementById('resetBtn');
    const player1Input = document.getElementById('player1Name');
    const player2Input = document.getElementById('player2Name');
    const currentPlayerDisplay = document.getElementById('currentPlayer');
    const gameBoardElement = document.getElementById('gameBoard');
    const gameResult = document.getElementById('gameResult');
    const cells = document.querySelectorAll('.cell');

    const initializeEventListeners = () => {
        startGameBtn.addEventListener('click', startGame);
        resetBtn.addEventListener('click', resetGame);

        cells.forEach(cell => {
            cell.addEventListener('click', handleCellClick);
        });

        player1Input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') startGame();
        });
        player2Input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') startGame();
        });
    };

    const startGame = () => {
        const player1Name = player1Input.value.trim() || 'Player 1';
        const player2Name = player2Input.value.trim() || 'Player 2';

        GameController.initializeGame(player1Name, player2Name);

        setupScreen.style.display = 'none';
        gameScreen.style.display = 'block';

        updateCurrentPlayerDisplay();
        updateBoard();
        hideGameResult();
    };

    const handleCellClick = (e) => {
        const cellIndex = parseInt(e.target.dataset.index);

        if (!GameController.isGameActive()) return;
        if (!gameBoard.isPositionAvaiable(cellIndex)) return;

        const result = GameController.playRound(cellIndex);

        if (result) {
            updateBoard();
            if (result.type === 'win') {
                showGameResult(`${result.player.getName()} Wins!`, 'winner');
            }
            else if (result.type === 'tie') {
                showGameResult("It's a Tie!", 'tie');
            }
            else {
                updateCurrentPlayerDisplay();
            }
        }
    };

    const updateCurrentPlayerDisplay = () => {
        if (GameController.isGameActive()) {
            const currentPlayer = GameController.getCurrentPlayer();
            currentPlayerDisplay.textContent =
                `${currentPlayer.getName()}'s Turn (${currentPlayer.getMark()})`;
        }
    };

    const updateBoard = () => {
        const board = gameBoard.getBoard();

        cells.forEach((cell, index) => {
            const mark = board[index];
            cell.textContent = mark;
            cell.className = 'cell';
            if (mark) {
                cell.classList.add('taken');
                cell.classList.add(mark.toLowerCase());
            }
        });
    };

    const showGameResult = (message, type) => {
        gameResult.textContent = message;
        gameResult.className = `game-result ${type}`;
        gameResult.style.display = 'block';
    };

    const hideGameResult = () => {
        gameResult.style.display = 'none';
    };

    const resetGame = () => {
        GameController.resetGame();
        updateBoard();
        hideGameResult();

        setupScreen.style.display = 'block';
        gameScreen.style.display = 'none';
    };

    return {
        initializeEventListeners
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    displayController.initializeEventListeners();
});