(function () {
  var board, gameWinners, side, movecount, activeGame, gamePaused, mode, gameInterval, u = void 0, squares;
  var boardElement, introElement, overallWinnerElement, squareElements;

  function newGameState() {
    board = [];
    gameWinners = [];
    for (i = 0; i < 9; i++) {
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
      introElement.hide();
    }, 250);
  }

  function renderHTML(map) {
    var i, j, x, y = [];
    // Raw string
    if(typeof map == 'string') {
      return map;
    }

    // For loop
    if(map[0] > 0) {
      for(i = 0; i < map[0]; i++) {
        for(j = 1; j < map.length; j++) {
          y.push(renderHTML(map[j]));
        }
      }
      return y.join('');
    }

    // elements
    y = ['<div class="'+map[0]+'">'];
    for(j = 1; j < map.length; j++) {
      y.push(renderHTML(map[j]));
    }
    y.push('</div>');
    return y.join('');
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
    introElement = document.querySelector('.intro');
    overallWinnerElement = document.querySelector('.overallwinner');
    gameElements = document.querySelectorAll('.game');
    squareElements = document.querySelectorAll('.square');
  }

  function resize() {
    boardElement.style = 'transform: scale(' + Math.min(b.offsetWidth / 450, b.offsetHeight / 450); + ')';
  }

  function changeSide() {
    boardElement.className = side;
    side = !side;
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
      square.addClass(side);
      square.innerHTML = side ? '&#215;' : '&#9675;';
      movecount += 1;
      showWinners(side, i);
      if (!gamePaused) {
        activeGame = j;
        if (gameFull(board[j])) {
          activeGame = u;
        }
        showActiveGame();
        changeSide();
      }
      if (mode === 1 && !side) {
        return playRandomSquare();
      }
    }
  }

  function showActiveGame() {
    for(i = 0; gameElements[i]; i++)
      gameElements[i].className = '';
    activeGame ? gameElements[activeGame].className = 'active':'';
  }

  function gameFull(board) {
    for (i = 0; i < 9; i++) {
      if (!board[i]) {
        return false;
      }
    }
    return true;
  }

  function showWinners(side, i) {
    var $game, j, overallWinners, winner, winners, _len, _len1;
    winners = findWinners(board[i], side);
    for (k = 0; k < winners.length; k++) {
      for (j = 0; j < winners[k].length; j++) {
        squareElements[i*9 + j].className = 'square won';
      }
    }
    if (winners.length > 0 && !gameWinners[i]) {
      gameWinners[i] = side;
      $game = $('.game.' + letters[i]);
      $game.addClass('won').addClass(side);
      side ? '&#215;' : '&#9675;';
    }

    overallWinners = findWinners(gameWinners, side);
    if (movecount >= 9 * 9 && overallWinners.length === 0) {
      gameElements.removeClass('active');
      gamePaused = true;
      showWinnerModal(false);
      if (gameInterval) {
        clearInterval(gameInterval);
      }
    } else if (overallWinners.length > 0) {
      gameElements.removeClass('active');
      gamePaused = true;
      showWinnerModal(true, side);
      if (gameInterval) {
        clearInterval(gameInterval);
      }
    }
  }

  function showWinnerModal(winner, side) {
    winner ? (side ? '&#215' : '&#9675') +  '; won.' : 'A tie!';
    overallWinnerElement.className = side;
    overallWinnerElement.css({
      opacity: 0,
      display: 'block'
    });
    overallWinnerElement.css({
      opacity: 1
    });
    $('.winner').css({
      opacity: 1
    });
  }

  function findWinners(board, side) {
    var column, row, winners;
    winners = [];
    if (board[0] === side && board[4] === side && board[8] === side) {
      winners.push([0, 4, 8]);
    }
    if (board[2] === side && board[4] === side && board[6] === side) {
      winners.push([0, 2, 4]);
    }
    for (row = 0; row < 3; row++) {
      if (board[row * 3] === side && board[row * 3 + 1] === side && board[row * 3 + 2] === side) {
        winners.push([row * 3, row * 3 + 1, row * 3 + 2]);
      }
    }
    for (column = 0; column < 3; column++) {
      if (board[column] === side && board[column + 3] === side && board[column + 6] === side) {
        winners.push([column, column + 3, column + 6]);
      }
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