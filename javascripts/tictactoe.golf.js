(function () {
  var board, gameWinners, side, movecount, activeGame, gamePaused, mode, gameInterval, u = void 0, boardElement, squares;

  function newGameState() {
    board = [];
    gameWinners = [];
    for (i = 0; i < 9; i++) {
      board[i] = [];
      gameWinners[i] = u;
      for (j = 0; j < 9; j++) {
        board[i][j] = u;
      }
    }
    side = true; // true == x, false == o
    movecount = 0;
    activeGame = u;
    gamePaused = true;
    mode = u;
  }

  function bindEvents() {
    window.onresize = resize;
    $('.square').click(clickSquare);
    $('.playagain').click(start);
    $('.player0').click(player0);
    $('.player1').click(player1);
    $('.player2').click(player2);
  }

  function player0() {
    mode = 0;
    hideModal();
    gamePaused = false;
    playRandomGame();
  }

  function player1() {
    mode = 1;
    hideModal();
    gamePaused = false;
  }

  function player2() {
    mode = 2;
    hideModal();
    gamePaused = false;
  }

  function hideModal() {
    $('.intro').css({
      opacity: 0
    });
    return setTimeout(function() {
      $('.intro').hide();
    }, 250);
  }

  function renderHTML(map) {
    var elements = ['div', 'span', 'h3', 'a'], i, j, x, y = [], output = '';
    if(typeof map == 'string') {
      return map;
    }

    // For loop
    if(map[0]['f']) {
      for(i = 0; i < map[0]['f']; i++) {
        for(j = 1; j < map.length; j++) {
          y.push(renderHTML(map[j]));
        }
      }
      return y.join('');
    }

    var d = {d: 'div', s: 'span', h3: 'h3', a: 'a'}

    // elements
    for(i in elements) {
      x = elements[i];
      if(map[0][x[0]]) {
        y[0] = '<' + x + ' class="' + map[0][x[0]]+ '">';
        for(j = 1; j < map.length; j++) {
          y.push(renderHTML(map[j]));
        }
        y.push('</' + x + '>');
        output = y.join('');
      }
    };
    return output;
  }

  function draw() {
    b.innerHTML = renderHTML(
      [ {d:'tictactoe'},
        [{f: 9},
          [{d: 'game'},
            [{f: 9},
              [{d: 'square'}],
            ],
            [{d: 'winner'}]
          ]
        ],
        [{d: 'overallwinner'},
          [{s: 'side'}],
          [{a: 'playagain'},
            'Play again?'
          ]
        ],
        [{d: 'intro'},
          [{h: 'side'},
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

  function grabSelectors() {

  }

  function resize() {
    boardElement.style = 'transform: scale(' + Math.min(b.offsetWidth / 450, b.offsetHeight / 450); + ')';
  }

  function changeSide() {
    boardElement.className = side;
    side = !side;
  }

  function clickSquare(e) {
    e.currentTarget
    // How to determine square position from event?
    tictactoe(i, j);
  }

  function tictactoe(e) {
    var $square;
    if (mode && !gamePaused && !board[i][j] && (i === activeGame || !activeGame)) {
      e.currentTarget
      $square = $('.square[data-i=' + i + '][data-j=' + j + ']');
      board[i][j] = side;
      $square.addClass(side);
      if (side === 'x') {
        $square.html('&#215;');
      } else {
        $square.html('&#9675;');
      }
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
      if (mode === 1 && side === 'o') {
        return playRandomSquare();
      }
    }
  }

  letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

  function showActiveGame() {
    if (activeGame) {
      $('.game').removeClass('active');
      $('.game.' + letters[activeGame]).addClass('active');
    } else {
      $('.game').addClass('active');
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

  function showWinners(side, i) {
    var $game, j, overallWinners, winner, winners, _len, _len1;
    winners = findWinners(board[i], side);
    for (k = 0; k < winners.length; k++) {
      var winner = winners[k];
      for (j = 0; j < winner.length; j++) {
        $('.game.' + letters[i] + ' .square.' + letters[j]).addClass('won');
      }
    }
    if (winners.length > 0 && !gameWinners[i]) {
      gameWinners[i] = side;
      $game = $('.game.' + letters[i]);
      $game.addClass('won').addClass(side);
      if (side === 'x') {
        $game.find('.winner').html('&#215;');
      } else {
        $game.find('.winner').html('&#9675;');
      }
    }
    overallWinners = findWinners(gameWinners, side);
    if (movecount >= 9 * 9 && overallWinners.length === 0) {
      $('.game').removeClass('active');
      gamePaused = true;
      showWinnerModal();
      if (gameInterval) {
        clearInterval(gameInterval);
      }
    } else if (overallWinners.length > 0) {
      $('.game').removeClass('active');
      gamePaused = true;
      showWinnerModal(side);
      if (gameInterval) {
        clearInterval(gameInterval);
      }
    }
  }

  function showWinnerModal(side) {
    if (side) {
      $('.overallwinner .side').html('&#215; won.');
    } else if (side === 'o') {
      $('.overallwinner .side').html('&#9675; won.');
    } else {
      $('.overallwinner .side').html('A tie!');
    }
    $('.overallwinner').removeClass('x');
    $('.overallwinner').removeClass('o');
    if (side) {
      $('.overallwinner').addClass(side);
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
    var $squares, randInt;
    $squares = $('.game.active .square:not(.x):not(.o)');
    for(i in squares) {

    }
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