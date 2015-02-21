(function () {
  var board, gameWinners, side, movecount, activeGame, gamePaused, mode, gameInterval, u = void 0,
      boardElement, introElement, overallWinnerElement, squareElements,
      d = document, setTimeout, overallWinners, winner, winners, column, row,
      combinations = [[0,4,8],[2,4,6],[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8]];

  function newGameState() {
    board = [];
    gameWinners = [];
    for (var i = 0; i < 9; i++) {
      board[i] = [];
    }
    side = true; // true == x, false == o
    movecount = 0;
    activeGame = u;
    gamePaused = true;
    mode = u;
  }

  function player(m) {
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
    var y = '', j;
    for(j = 1; j < map.length; j++)
      y += renderHTML(map[j]);
    return y;
  }

  function renderHTML(map) {
    var y = '', i;
    if(typeof map == 'string')
      y = map;
    else if(map[0] > 0)
      for(i = 0; i < map[0]; i++)
        y += loopNode(map);
    else
      y = '<div class="'+map[0]+'">' + loopNode(map) + '</div>';

    return y;
  }

  function draw() {
    b.innerHTML = renderHTML(
      ['tictactoe',
        [9,
          ['game',
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
          ['player0', '0 players'],
          ['player1', '1 player'],
          ['player2', '2 players']
        ]
      ]
    );
  }

  function getElements() {
    boardElement = b.childNodes[0];
    introElement = d.querySelector('.intro');
    overallWinnerElement = d.querySelector('.overallwinner');
    gameElements = d.querySelectorAll('.game');
    squareElements = d.querySelectorAll('.square');
  }

  function resize() {
    boardElement.style = 'transform: scale(' + Math.min(b.offsetWidth / 450, b.offsetHeight / 450); + ')';
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
    for(var i = 0; gameElements[i]; i++)
      gameElements[i].className = 'game';
     gameElements[activeGame].className += activeGame ? ' active':'';
  }

  function gameFull(board) {
    for (var i = 0; i < 9; i++) {
      if (!board[i]) {
        return false;
      }
    }
    return true;
  }

  function finishGame(draw, winner) {
    gameElements.className = 'game';
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
    for (var k = 0; k < winners.length; k++) {
      for (var j = 0; j < winners[k].length; j++) {
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
    var winners = [], i, x;

    for(i = 0; i < combinations.length; i++) {
      x = combinations[i]
      if(board[x[0]] == side && board[x[1]] == side && board[x[2]] == side)
        winners.push(x);
    }

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
    showActiveGame();
    resize();
  }

  window.onresize = resize;

  start();
})();