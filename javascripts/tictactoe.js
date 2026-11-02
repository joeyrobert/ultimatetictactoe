// Ultimate Tic Tac Toe. Plain DOM, no dependencies.
// Rules: http://mathwithbaddrawings.com/2013-06-16/ultimate-tic-tac-toe/

const MARKS = {
  x: '<svg class="mark" viewBox="0 0 100 100" aria-hidden="true"><path pathLength="1" d="M28 28 L72 72 M72 28 L28 72"/></svg>',
  o: '<svg class="mark" viewBox="0 0 100 100" aria-hidden="true"><circle pathLength="1" cx="50" cy="50" r="26"/></svg>',
};

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const OPPONENT = { x: 'o', o: 'x' };
const COMPUTER_DELAY = 350; // pause before the computer answers a human move
const AUTOPLAY_DELAY = 450; // pause between moves in autoplay mode

function winningLines(board, mark) {
  return LINES.filter(([a, b, c]) => board[a] === mark && board[b] === mark && board[c] === mark);
}

function makeElement(tag, className) {
  const el = document.createElement(tag);
  el.className = className;
  return el;
}

// Pure game state, no DOM in here.
class Game {
  constructor() {
    this.reset();
  }

  reset() {
    this.board = Array.from({ length: 9 }, () => new Array(9).fill(null));
    this.boardWinners = new Array(9).fill(null);
    this.boardWinLines = Array.from({ length: 9 }, () => []);
    this.matchWinLines = [];
    this.turn = 'x';
    this.targetBoard = null; // null means the player may pick any open board
    this.moveCount = 0;
    this.winner = null; // 'x', 'o', 'draw', or null while the match runs
  }

  isFull(board) {
    return this.board[board].every((cell) => cell !== null);
  }

  isFinished(board) {
    return this.boardWinners[board] !== null || this.isFull(board);
  }

  // A move must land on the board the previous move sent the player to, unless
  // that board is already decided, in which case any open board is fair game.
  playableBoards() {
    if (this.winner) return [];
    const open = [...Array(9).keys()].filter((b) => !this.isFinished(b));
    if (this.targetBoard === null || this.isFinished(this.targetBoard)) return open;
    return [this.targetBoard];
  }

  legalMoves() {
    const moves = [];
    for (const i of this.playableBoards()) {
      this.board[i].forEach((cell, j) => {
        if (cell === null) moves.push([i, j]);
      });
    }
    return moves;
  }

  play(i, j) {
    if (this.winner || this.board[i][j] !== null || !this.playableBoards().includes(i)) {
      return false;
    }
    this.board[i][j] = this.turn;
    this.moveCount += 1;

    const lines = winningLines(this.board[i], this.turn);
    if (lines.length && this.boardWinners[i] === null) {
      this.boardWinners[i] = this.turn;
      this.boardWinLines[i] = lines;
    }

    const matchLines = winningLines(this.boardWinners, this.turn);
    if (matchLines.length) {
      this.matchWinLines = matchLines;
      this.winner = this.turn;
      return true;
    }

    this.targetBoard = this.isFinished(j) ? null : j;
    // An unfinished board always has an empty cell, so no legal moves means
    // every board is decided and neither side can complete three in a row.
    if (this.legalMoves().length === 0) {
      this.winner = 'draw';
      return true;
    }

    this.turn = OPPONENT[this.turn];
    return true;
  }

  boardsWonBy(mark) {
    return this.boardWinners.filter((winner) => winner === mark).length;
  }
}

// Drives the DOM from Game state: state changes, then render() re-syncs the board.
class App {
  constructor() {
    this.game = new Game();
    this.mode = null; // 0 autoplay, 1 vs computer, 2 two players, null before start
    this.timer = null;
    this.boardEls = [];
    this.cellEls = [];
    this.coverEls = [];
    this.dom = {
      board: document.getElementById('board'),
      status: document.getElementById('status'),
      overlay: document.getElementById('overlay'),
      menu: document.getElementById('menu'),
      result: document.getElementById('result'),
      resultHeading: document.getElementById('result-heading'),
      resultDetail: document.getElementById('result-detail'),
      players: {
        x: document.getElementById('player-x'),
        o: document.getElementById('player-o'),
      },
      names: {
        x: document.querySelector('#player-x .name'),
        o: document.querySelector('#player-o .name'),
      },
      scores: {
        x: document.getElementById('score-x'),
        o: document.getElementById('score-o'),
      },
    };

    this.buildBoards();
    document.querySelectorAll('.mode').forEach((button) => {
      button.addEventListener('click', () => this.startMode(Number(button.dataset.mode)));
    });
    document.getElementById('new-game').addEventListener('click', () => this.showMenu());
    document.getElementById('play-again').addEventListener('click', () => this.startMode(this.mode));
    document.getElementById('choose-mode').addEventListener('click', () => this.showMenu());

    this.showMenu();
  }

  buildBoards() {
    for (let i = 0; i < 9; i++) {
      const boardEl = makeElement('div', 'game');
      const cells = [];
      for (let j = 0; j < 9; j++) {
        const cell = makeElement('button', 'cell');
        cell.type = 'button';
        cell.setAttribute('aria-label', `Board ${i + 1}, square ${j + 1}`);
        cell.addEventListener('click', (event) => this.onCellClick(i, j, event));
        boardEl.appendChild(cell);
        cells.push(cell);
      }
      const cover = makeElement('div', 'cover');
      boardEl.appendChild(cover);
      this.dom.board.appendChild(boardEl);
      this.boardEls.push(boardEl);
      this.cellEls.push(cells);
      this.coverEls.push(cover);
    }
  }

  showMenu() {
    this.clearTimer();
    this.mode = null;
    this.game.reset();
    this.dom.overlay.classList.remove('for-result');
    this.dom.menu.hidden = false;
    this.dom.result.hidden = true;
    this.setOverlay(true);
    this.render();
  }

  startMode(mode) {
    this.clearTimer();
    this.mode = mode;
    this.game.reset();
    this.dom.overlay.classList.remove('for-result');
    this.dom.names.x.textContent = mode === 1 ? 'You' : mode === 2 ? 'Player 1' : 'Computer';
    this.dom.names.o.textContent = mode === 1 ? 'Computer' : mode === 2 ? 'Player 2' : 'Computer';
    this.dom.menu.hidden = true;
    this.dom.result.hidden = true;
    this.setOverlay(false);
    this.render();
    if (mode === 0) this.queue(this.computerMove, AUTOPLAY_DELAY);
  }

  setOverlay(open) {
    this.dom.overlay.hidden = !open;
    this.dom.board.inert = open;
  }

  onCellClick(i, j, event) {
    if (this.mode === null || this.game.winner) return;
    if (this.mode === 0) return; // autoplay keeps its own pace
    if (this.mode === 1 && this.game.turn !== 'x') return; // the computer is thinking
    if (!this.game.play(i, j)) return;

    const keyboardActivated = event.detail === 0;
    this.afterMove();
    if (keyboardActivated) this.focusRequestedBoard();
  }

  // An arrow so the move timers can call it without rebinding.
  computerMove = () => {
    const moves = this.game.legalMoves();
    if (!moves.length) return;
    const [i, j] = moves[Math.floor(Math.random() * moves.length)];
    this.game.play(i, j);
    this.afterMove();
  };

  afterMove() {
    this.render();
    if (this.game.winner) {
      this.showResult();
    } else if (this.mode === 0) {
      this.queue(this.computerMove, AUTOPLAY_DELAY);
    } else if (this.mode === 1 && this.game.turn === 'o') {
      this.queue(this.computerMove, COMPUTER_DELAY);
    }
  }

  queue(move, delay) {
    this.clearTimer();
    this.timer = setTimeout(move, delay);
  }

  clearTimer() {
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = null;
  }

  // Keep keyboard focus on a square the rules actually allow.
  focusRequestedBoard() {
    const board = this.game.targetBoard;
    if (board === null) return;
    const cell = this.cellEls[board].find((el) => !el.disabled);
    if (cell) cell.focus();
  }

  showResult() {
    const winner = this.game.winner;
    const won = { x: this.game.boardsWonBy('x'), o: this.game.boardsWonBy('o') };

    if (winner === 'draw') {
      this.dom.resultHeading.textContent = 'A tie';
      this.dom.resultDetail.textContent = this.game.moveCount === 81
        ? 'All 81 squares filled.'
        : 'Every board is decided and neither side has three in a row.';
    } else {
      const youWon = this.mode === 1 && winner === 'x';
      const computerWon = this.mode === 1 && winner === 'o';
      this.dom.resultHeading.textContent = youWon ? 'You win' : computerWon ? 'Computer wins' : `${winner.toUpperCase()} wins`;
      this.dom.resultDetail.textContent = `Boards won ${won.x} to ${won.o}.`;
    }

    this.dom.overlay.classList.add('for-result');
    this.dom.result.classList.toggle('x', winner === 'x');
    this.dom.result.classList.toggle('o', winner === 'o');
    this.dom.menu.hidden = true;
    this.dom.result.hidden = false;
    this.setOverlay(true);
  }

  render() {
    const game = this.game;
    const live = game.winner === null && this.mode !== null;
    const playable = new Set(game.playableBoards());
    const decided = new Set(game.matchWinLines.flat());

    this.dom.board.classList.toggle('turn-x', live && game.turn === 'x');
    this.dom.board.classList.toggle('turn-o', live && game.turn === 'o');

    for (let i = 0; i < 9; i++) {
      const boardEl = this.boardEls[i];
      const cover = this.coverEls[i];
      const boardWinner = game.boardWinners[i];
      const active = live && playable.has(i);

      boardEl.classList.toggle('active', active);
      boardEl.classList.toggle('won', boardWinner !== null);
      boardEl.classList.toggle('x', boardWinner === 'x');
      boardEl.classList.toggle('o', boardWinner === 'o');
      boardEl.classList.toggle('decided', decided.has(i));

      if (boardWinner && cover.dataset.mark !== boardWinner) {
        cover.dataset.mark = boardWinner;
        cover.innerHTML = MARKS[boardWinner];
      }

      for (let j = 0; j < 9; j++) {
        const cell = this.cellEls[i][j];
        const mark = game.board[i][j];
        if (mark && cell.dataset.mark !== mark) {
          cell.dataset.mark = mark;
          cell.innerHTML = MARKS[mark];
          cell.setAttribute('aria-label', `Board ${i + 1}, square ${j + 1}, ${mark}`);
        }
        cell.classList.toggle('x', mark === 'x');
        cell.classList.toggle('o', mark === 'o');
        cell.classList.toggle('won', game.boardWinLines[i].some((line) => line.includes(j)));
        cell.disabled = !(active && mark === null);
      }
    }

    for (const mark of ['x', 'o']) {
      this.dom.players[mark].classList.toggle('active', live && game.turn === mark);
      this.dom.scores[mark].textContent = game.boardsWonBy(mark);
    }

    this.dom.status.textContent = this.statusText();
  }

  statusText() {
    const game = this.game;
    if (this.mode === null) return 'Pick a mode to start playing.';
    if (game.winner) return 'Match over.';

    const who = this.mode === 1
      ? (game.turn === 'x' ? 'Your move' : 'Computer is playing')
      : `${game.turn.toUpperCase()} to move`;
    const where = game.targetBoard === null
      ? 'any open board'
      : `board ${game.targetBoard + 1} only`;
    return `${who}, play in ${where}.`;
  }
}

new App();
