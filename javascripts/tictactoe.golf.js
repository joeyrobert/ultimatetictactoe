(function () {
  var board, gameWinners, side, movecount, activeGame, gamePaused, mode, gameInterval, danceInterval, u = void 0,
      d = document, qsa = d.querySelectorAll.bind(d), mySetInterval = setInterval, myClearInterval = clearInterval,
      combinations = [[0,4,8],[2,4,6],[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8]],
      ab0,ab1,ab2,ab3,ab4,ab6,ab7;

  function siblingNumber(node) {
    return [].indexOf.call(node.parentNode.children, node);
  }

  function addClass(elz, cls, cls2) {
    if(cls == u) return;
    elz.classList.add(cls);addClass(elz, cls2)
  }

  function removeClass(elz, cls) {
    elz.classList.remove(cls);
  }

  function switchToCurrentSide(elz) {
      removeClass(elz, !side);
      addClass(elz, side);
  }

  function renderHTML(map) {
    var x = '', i; for(i = 1; i < map.length; i++) x += renderHTML(map[i]);
    return typeof map == 'string' ? map : (map[0] > 0 ? Array(map[0]+1).join(x) : '<div class="'+map[0]+'">' + x + '</div>');
  }

  function each(els, fnc) {
    for(var i = 0; i < els.length; i++)
      fnc(els[i], i);
  }

  function bindClick(els, fnc) {
    each(els, function(x) {
      x.addEventListener('click', fnc, true);
    });
  }

  function tictactoe(i, j) {
    if (!gamePaused && !board[i][j] && (i == activeGame || activeGame == u)) {
      square = ab4[i*9 + j];
      board[i][j] = side;
      switchToCurrentSide(square)
      square.innerHTML = character();
      movecount += 1;
      showWinners(i);
      activeGame = gameFull(board[j]) ? u : j;

      each(ab3, function(x, i) {
        removeClass(x, 'active');
        if((activeGame == u || activeGame == i) && !gameFull(board[i]))
          addClass(x, 'active');
      });

      // Change side
      side = !side;
      switchToCurrentSide(ab0);
      if (mode == 1 && !side)
        return playRandomSquare();
    }
  }

  function gameFull(board) {
    for(var i = 0; i < 9; i++)
      if (board[i] == u)
        return false;
    return true;
  }

  function finishGame(winningSide) {
    gamePaused = true;
    ab2.innerHTML = (winningSide != u ? character() + ' won.' : 'A tie!') + ' Play again?';
    addClass(ab2, 'invisible', side);
    ab2.style.display = 'block';
    removeClass(ab2, 'invisible');
    myClearInterval(gameInterval);
  }

  function character() {
    return side ? '&#215;' : '&#9675;';
  }

  function showWinners(i) {
    var winners = findWinners(board[i]), k, j, overallWinners;
    for(k = 0; k < winners.length; k++)
      for(j = 0; j < winners[k].length; j++)
        addClass(ab4[i*9 + winners[k][j]], 'won', side);

    if (winners.length > 0 && gameWinners[i] == u) {
      gameWinners[i] = side;
      addClass(ab3[i], 'won', side);
      ab7[i].innerHTML += character();
    }

    overallWinners = findWinners(gameWinners);
    overallWinners.length > 0 ? finishGame(side) : movecount > 80 && finishGame()
  }

  function findWinners(board) {
    return combinations.reduce(function(prev, x) {
      if(board[x[0]] == side && board[x[1]] == side && board[x[2]] == side)
        prev.push(x);
      return prev;
    }, []);
  }

  function randInt(x) {
    return Math.floor(Math.random() * x);
  }

  function playRandomSquare() {
    // Safe implementation of random next
    var i = activeGame, j, availableInts = [], x;

    function determineActive() {
      for (j=0;j<9;j++)
        if(board[i][j] == u)
          availableInts.push([i,j])
    }

    if(activeGame == u)
      for (i=0;i<9;i++)
        determineActive();
    else
      determineActive();
        
    x = availableInts[randInt(availableInts.length)];
    tictactoe(x[0], x[1]);
  }

  function highlightSquares() {
    each(ab4, function(x, i) {
      if(randInt(2))
        addClass(x, 'active');
      else
        removeClass(x, 'active');
    });
  }

  function start() {
    // newGameState
    board = [[], [], [], [], [], [], [], [], []];
    gameWinners = [];
    side = true; // true == x, false == o
    movecount = 0;
    activeGame = u;
    gamePaused = true;

    // render HTML
    b.innerHTML = '<link rel="stylesheet" type="text/css" href="stylesheets/tictactoe.minimal.golf.css">' + renderHTML(
      ['tictactoe true',
        [9,
          ['game active',
            [9,
              ['square']
            ],
            ['winner']
          ]
        ],
        ['overallwinner'],
        ['intro',
          ['new', 'New Game'],
          ['player', '0 players'],
          ['player', '1 player'],
          ['player', '2 players']
        ]
      ]
    );

    // boardElement = 0, introElement = 1, overallWinnerElement = 2, gameElements = 3, squareElements = 4, player(1,2,3) = 6, winnerElements = 7
    ab0 = b.childNodes[1], ab1 = qsa('.intro')[0], ab2 = qsa('.overallwinner')[0], ab3 = qsa('.game'), ab4 = qsa('.square'), ab6 = qsa('.player'), ab7 = qsa('.winner');

    // bind events
    bindClick(ab4, function(e) {
      var i = siblingNumber(e.target.parentNode),
          j = siblingNumber(e.target);
      tictactoe(i, j);
    });
    bindClick([ab2], start);
    bindClick(ab6, function(e) {
      mode = siblingNumber(e.target)-1;
      addClass(ab1, 'invisible');
      setTimeout(function() {
        ab1.style.display = 'none';
      }, 250);
      myClearInterval(danceInterval);
      each(ab4, function(x, i) {
          removeClass(x, 'active');
      });
      gamePaused = false;
      if(!mode) {
        gameInterval = mySetInterval(function() {
          playRandomSquare();
        }, 100);
      }
    });
    highlightSquares()
    danceInterval = mySetInterval(highlightSquares, 100);
  }

  window.onresize = function () {
    ab0.style.transform = 'scale(' + Math.min(b.offsetWidth / 450, b.offsetHeight / 450); + ')';
  };

  setTimeout(onresize, 50);

  start();
})();