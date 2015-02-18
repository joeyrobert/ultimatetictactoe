(function () {
  var board, gameWinners, turn, movecount, activeGame, gamePaused, mode, gameInterval;

  function newGameState() {
    board = [];
    gameWinners = [];
    for (i = 0; i < 9; i++) {
      gameWinners[i] = void 0;
      for (j = 0; j < 9; j++) {
        board[i][j] = void 0;
      }
    }
    turn = 'x';
    movecount = 0;
    activeGame = void 0;
    gamePaused = true;
    mode = void 0;
  }

  function bindEvents() {
    $(window).resize(resize);
    $('.square').click(clickSquare);
    $('#playagain').click(start);
    $('#zeroplayer').click(zeroPlayer);
    $('#oneplayer').click(onePlayer);
    $('#twoplayer').click(twoPlayer);
  }

  function zeroPlayer() {
    mode = 0;
    hideModal();
    gamePaused = false;
    playRandomGame();
  }

  function onePlayer() {
    mode = 1;
    hideModal();
    gamePaused = false;
  }

  function twoPlayer() {
    mode = 2;
    hideModal();
    gamePaused = false;
  }

  function hideModal() {
    $(".mymodal.intro").css({
      opacity: 0
    });
    return setTimeout(function() {
      $(".mymodal.intro").hide();
    }, 250);
  }

  function renderHTML(map) {
    var elements = ['div', 'span', 'h3', 'a'], i, j, x, y = [], output = '';

    for(i in elements) {
      x = elements[i];
      if(map[0] == [x[0]]) {
        y[0] = ['<' + x[0] + ' class="' + map[x[0]]+ '">'],
        for(j = 1; j < map.length; j++) {
          y.push(renderHTML(map[x])),
        }
        y['</' + x[0] + '>'];
      }
    };
    return output;
  }

  function draw() {
    b.innerHTML = renderHTML(
      [{div:'tictactoe'},
        [{for: i, l: 9},
          [{d: 'game'},
            [{for: j, l: 9},
              [{d: 'square'}],
            ],
            [{d: 'winner'}]
          ]
        ],
        [{d: 'overallwinner'},
          [{s: 'turn'}],
          [{a: 'playagain'},
            'Play again?'
          ]
        ],
        [{d: 'intro'},
          [{h: 'turn'}
            'New Game'
          ],
          [{a: 'player0'},
            '0 players'
          ],
          [{a: 'player1'},
            '1 player'
          ],
          [{a: 'player2'},
            '2 players'
          ]
        ]
      ]
    );
  }

  function resize() {
    var containerHeight, containerWidth, windowHeight, windowWidth;
    windowWidth = $(window).width();
    windowHeight = $(window).height();
    containerWidth = $container.width();
    containerHeight = $container.height();
    scale = Math.min(containerWidth / 450, containerHeight / 450);
    $('#tictactoe').css({
      transform: "scale(" + scale + ")"
    });
  }

  function changeTurn() {
    $('#tictactoe').removeClass(turn);
    if (turn === 'x') {
      turn = 'o';
    } else {
      turn = 'x';
    }
    $('#tictactoe').addClass(turn);
  }

  function clickSquare(e) {
    var $square, i, j;
    $square = $(e.currentTarget);
    i = $square.data('i');
    j = $square.data('j');
    tictactoe(i, j);
  }

  function tictactoe(i, j) {
    var $square;
    if (mode && !gamePaused && !board[i][j] && (i === activeGame || !activeGame)) {
      $square = $(".square[data-i=" + i + "][data-j=" + j + "]");
      board[i][j] = turn;
      $square.addClass(turn);
      if (turn === 'x') {
        $square.html('&#215;');
      } else {
        $square.html('&#9675;');
      }
      movecount += 1;
      showWinners(turn, i);
      if (!gamePaused) {
        activeGame = j;
        if (gameFull(board[j])) {
          activeGame = void 0;
        }
        showActiveGame();
        changeTurn();
      }
      if (mode === 1 && turn === 'o') {
        return playRandomSquare();
      }
    }
  }

  letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

  function showActiveGame() {
    if (activeGame) {
      $(".game").removeClass('active');
      $(".game." + letters[activeGame]).addClass('active');
    } else {
      $(".game").addClass('active');
    }
  }

  function gameFull(board) {
    for (i = 0; i < 9; i++) {
      if (!board[i]) {
        return false;
      }
    }
    return true;
  }

  function showWinners(turn, i) {
    var $game, j, overallWinners, winner, winners, _len, _len1;
    winners = findWinners(board[i], turn);
    for (k = 0; k < winners.length; k++) {
      var winner = winners[k];
      for (j = 0; j < winner.length; j++) {
        $(".game." + letters[i] + " .square." + letters[j]).addClass('won');
      }
    }
    if (winners.length > 0 && _.isUndefined(gameWinners[i])) {
      gameWinners[i] = turn;
      $game = $(".game." + letters[i]);
      $game.addClass("won").addClass(turn);
      if (turn === 'x') {
        $game.find('.winner').html('&#215;');
      } else {
        $game.find('.winner').html('&#9675;');
      }
    }
    overallWinners = findWinners(gameWinners, turn);
    if (movecount >= 9 * 9 && overallWinners.length === 0) {
      $(".game").removeClass('active');
      gamePaused = true;
      showWinnerModal();
      if (gameInterval) {
        clearInterval(gameInterval);
      }
    } else if (overallWinners.length > 0) {
      $(".game").removeClass('active');
      gamePaused = true;
      showWinnerModal(turn);
      if (gameInterval) {
        clearInterval(gameInterval);
      }
    }
  }

  function showWinnerModal(turn) {
    if (turn === 'x') {
      $('.overallwinner .turn').html('&#215; won.');
    } else if (turn === 'o') {
      $('.overallwinner .turn').html('&#9675; won.');
    } else {
      $('.overallwinner .turn').html('A tie!');
    }
    $('.overallwinner').removeClass('x');
    $('.overallwinner').removeClass('o');
    if (turn) {
      $('.overallwinner').addClass(turn);
    }
    $('.overallwinner').css({
      opacity: 0,
      display: 'block'
    });
    $('.overallwinner').css({
      opacity: 1
    });
    $('.winner').css({
      opacity: 1
    });
  }

  function findWinners(board, turn) {
    var column, row, winners;
    winners = [];
    if (board[0] === turn && board[4] === turn && board[8] === turn) {
      winners.push([0, 4, 8]);
    }
    if (board[2] === turn && board[4] === turn && board[6] === turn) {
      winners.push([0, 2, 4]);
    }
    for (row = 0; row < 3; row++) {
      if (board[row * 3] === turn && board[row * 3 + 1] === turn && board[row * 3 + 2] === turn) {
        winners.push([row * 3, row * 3 + 1, row * 3 + 2]);
      }
    }
    for (column = 0; column < 3; column++) {
      if (board[column] === turn && board[column + 3] === turn && board[column + 6] === turn) {
        winners.push([column, column + 3, column + 6]);
      }
    }
    return winners;
  }

  function playRandomGame(forever) {
    gameInterval = setInterval(function() {
        playRandomSquare();
        if (forever) {
          $('#playagain:visible').click();
        }
      }, 100);
  }

  function playRandomSquare() {
    var $squares, randInt;
    $squares = $('.game.active .square:not(.x):not(.o)');
    randInt = Math.floor(Math.random() * $squares.length);
    $squares.eq(randInt).click();
  }

  function start() {
    newGameState();
    draw();
    showActiveGame();
    resize();
    bindEvents();
  }

  start();
})();