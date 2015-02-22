(function () {
  var board, gameWinners, side, movecount, activeGame, gamePaused, mode, gameInterval, u = void 0,
      el, d = document, qsa = d.querySelectorAll.bind(d), overallWinners, winner, winners,
      combinations = [[0,4,8],[2,4,6],[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8]];

  function newGameState() {
    board = [[], [], [], [], [], [], [], [], []];
    gameWinners = [];
    side = true; // true == x, false == o
    movecount = 0;
    activeGame = u;
    gamePaused = true;
    mode = u;
  }

  function player() {
    mode = m;
    hideModal();
    gamePaused = false;
    if(!mode) playRandomGame();
  }

  function hideModal() {
    introElement.className = 'invisible';
    setTimeout(function() {
      introElement.style.display = 'none';
    }, 250);
  }

  function loopNode(map) {
    var y = '', i;
    for(i = 1; i < map.length; i++)
      y += renderHTML(map[i]);
    return y;
  }

  function repeat(y, i) {
    var x = '', j;
    for(j = 0; j < i; j++)
      x += y;
    return x;
  }

  function renderHTML(map) {
    var x = loopNode(map);
    return typeof map == 'string' ? map : (map[0] > 0 ? repeat(x, map[0]) : '<div class="'+map[0]+'">' + x + '</div>');
  }

  function draw() {
    b.innerHTML = renderHTML(
      ['tictactoe',
        [9,
          ['game active',
            [9,
              ['square']
            ],
            ['winner']
          ]
        ],
        ['overallwinner',
          ['side'],
          ['playagain', 'Play again?']
        ],
        ['intro',
          ['new', 'New Game'],
          ['player', '0 players'],
          ['player', '1 player'],
          ['player', '2 players']
        ]
      ]
    );
  }

  function getElements() {
    // boardElement = 0, introElement = 1, overallWinnerElement = 2, gameElements = 3, squareElements = 4, playAgain = 5, player(1,2,3) = 6
    el = [b.childNodes[0], qsa('.intro'), qsa('.overallwinner'), qsa('.game'), qsa('.square'), qsa('.playagain'), qsa('.player')];
  }

  function renderCSS() {

  }

  function each(els, fnc) {
    for(var i = 0; i < els; i++) fnc(els[0]);
  }

  function bindClick(els, fnc) {
    each(els, function(x) { x.addEventListener('click', fnc) });
  }

  function applyStyle(els, style) {
    each(els, function(x) { x.style = style });
  }

  function bindEvents() {
      bindClick(el[4], clickSquare);
      bindClick(el[5], start);
      bindClick(el[6], player);
  }

  function resize() {
    el[0].style = 'transform: scale(' + Math.min(b.offsetWidth / 450, b.offsetHeight / 450); + ')';
  }

  function clickSquare(e) {
    e.currentTarget;
    // How to determine square position from event?
    tictactoe(i, j);
  }

  function tictactoe(e) {
    if (mode && !gamePaused && !board[i][j] && (i === activeGame || !activeGame)) {
      square = squareElements[i*9 + j];
      board[i][j] = side;
      square.className = 'square ' + side;
      square.innerHTML = sideCharacter();
      movecount += 1;
      showWinners(side, i);
      if (!gamePaused) {
        activeGame = j;
        if (gameFull(board[j])) {
          activeGame = u;
        }
        showActiveGame();

        // Change side
        boardElement.className = side;
        side = !side;
      }
      if (mode === 1 && !side) {
        return playRandomSquare();
      }
    }
  }

  function showActiveGame() {
    for(var i = 0; el[3][i]; i++)
      el[3][i].className = 'game';
    el[3][activeGame].className += activeGame ? ' active':'';
  }

  function gameFull(board) {
    for(var i = 0; i < 9; i++)
      if (!board[i])
        return false;
    return true;
  }

  function finishGame(draw, winner) {
    el[3].className = 'game';
    gamePaused = true;
    showWinnerModal(true, side);
    if (gameInterval) {
      clearInterval(gameInterval);
    }
  }

  function character() {
    side ? '&#215' : '&#9675';
  }

  function showWinners(side, i) {
    winners = findWinners(board[i], side);
    for(var k = 0; k < winners.length; k++) {
      for(var j = 0; j < winners[k].length; j++) {
        squareElements[i*9 + j].className = 'square won';
      }
    }
    if (winners.length > 0 && !gameWinners[i]) {
      gameWinners[i] = side;
      game[i].className = 'game won ' + side;
      game[i].innerHTML = sideCharacter();
    }

    overallWinners = findWinners(gameWinners, side);
    if (movecount >= 81 && overallWinners.length === 0) {
      finishGame(true)
    } else if (overallWinners.length > 0) {
      finishGame(false, side)
    }
  }

  function showWinnerModal(winner, side) {
    winner ? sideCharacter() + '; won.' : 'A tie!';
    overallWinnerElement.className = side;
    overallWinnerElement.css({
      opacity: 0,
      display: 'block'
    });
    overallWinnerElement.css({
      opacity: 1
    });
    winnerElement.css({
      opacity: 1
    });
  }

  function findWinners(board, side) {
    var winners = [];

    each(combinations, function(x) {
      if(board[x[0]] == side && board[x[1]] == side && board[x[2]] == side)
        winners.push(x);
    });

    return winners;
  }

  function playRandomGame(forever) {
    gameInterval = setInterval(function() {
        playRandomSquare();
        if (forever) {
          $('.playagain:visible').click();
        }
      }, 100);
  }

  function playRandomSquare() {
    Math.floor(Math.random() * 3);
  }

  function start() {
    newGameState();
    draw();
    getElements();
    resize();
    bindEvents();
  }

  window.onresize = resize;

  start();
})();