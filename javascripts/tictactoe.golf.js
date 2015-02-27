(function () {
  var board, gameWinners, side, movecount, activeGame, gamePaused, mode, gameInterval, u = void 0,
      d = document, qsa = d.querySelectorAll.bind(d), overallWinners, winners,
      combinations = [[0,4,8],[2,4,6],[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8]],
      ab0,ab1,ab2,ab3,ab4,ab5,ab6,ab7;

  function newGameState() {
    board = [[], [], [], [], [], [], [], [], []];
    gameWinners = [];
    side = true; // true == x, false == o
    movecount = 0;
    activeGame = u;
    gamePaused = true;
  }

  function player(e) {
    mode = siblingNumber(e.target)-1;
    hideModal();
    gamePaused = false;
    if(!mode) playRandomGame();
  }

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

  function hideModal() {
    addClass(ab1, 'invisible');
    setTimeout(function() {
      ab1.style.display = 'none';
    }, 250);
  }

  function loopNode(map) {
    // return map.slice(1).reduce(function(x, y) {
    //   console.log('x:', x, 'y:', y);
    //   return x + renderHTML(y);
    // }, '');
    var y = '', i; for(i = 1; i < map.length; i++) y += renderHTML(map[i]); return y;
  }

  function repeat(y, i) {
    return Array(i+1).join(y);
  }

  function renderHTML(map) {
    var x = loopNode(map);
    return typeof map == 'string' ? map : (map[0] > 0 ? repeat(x, map[0]) : '<div class="'+map[0]+'">' + x + '</div>');
  }

  function draw() {
    b.innerHTML = renderCSS() + renderHTML(
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
  }

  function getElements() {
    // boardElement = 0, introElement = 1, overallWinnerElement = 2, gameElements = 3, squareElements = 4, playAgain = 5, player(1,2,3) = 6
    ab0 = b.childNodes[1], ab1 = qsa('.intro')[0], ab2 = qsa('.overallwinner')[0], ab3 = qsa('.game'), ab4 = qsa('.square'), ab6 = qsa('.player'), ab7 = qsa('.winner');
  }

  function renderCSS() {
    return '<link rel="stylesheet" type="text/css" href="stylesheets/tictactoe.minimal.golf.css">';
  }

  function each(els, fnc) {
    for(var i = 0; i < els.length; i++) {
      fnc(els[i], i);
    }
  }

  function bindClick(els, fnc) {
    each(els, function(x) {
      x.addEventListener('click', fnc, true);
    });
  }

  function applyStyle(els, style) {
    each(els, function(x) { x.style = style });
  }

  function bindEvents() {
    bindClick(ab4, clickSquare);
    bindClick([ab2], start);
    bindClick(ab6, player);
  }

  function resize() {
    ab0.style.transform = 'scale(' + Math.min(b.offsetWidth / 450, b.offsetHeight / 450); + ')';
  }

  function clickSquare(e) {
    var i = siblingNumber(e.target.parentNode),
        j = siblingNumber(e.target);
    tictactoe(i, j);
  }

  function tictactoe(i, j) {
    if (!gamePaused && !board[i][j] && (i == activeGame || activeGame == u)) {
      square = ab4[i*9 + j];
      board[i][j] = side;
      switchToCurrentSide(square)
      square.innerHTML = character();
      movecount += 1;
      showWinners(side, i);
      activeGame = gameFull(board[j]) ? u : j;
      showActiveGame();

      // Change side
      side = !side;
      switchToCurrentSide(ab0);
      if (mode == 1 && !side)
        return playRandomSquare();
    }
  }

  function showActiveGame() {
    each(ab3, function(x, i) {
      removeClass(x, 'active');
      if((activeGame == u || activeGame == i) && !gameFull(board[activeGame]))
        addClass(x, 'active');
    });
    
  }

  function gameFull(board) {
    for(var i = 0; i < 9; i++)
      if (board[i] == u)
        return false;
    return true;
  }

  function finishGame(draw, winner) {
    gamePaused = true;
    showWinnerModal(true, side);
    if (gameInterval)
      clearInterval(gameInterval);
  }

  function character() {
    return side ? '&#215;' : '&#9675;';
  }

  function showWinners(side, i) {
    var winners = findWinners(board[i], side);
    for(var k = 0; k < winners.length; k++)
      for(var j = 0; j < winners[k].length; j++)
        addClass(ab4[i*9 + winners[k][j]], 'won', side);

    if (winners.length > 0 && gameWinners[i] == u) {
      gameWinners[i] = side;
      addClass(ab3[i], 'won', side);
      ab7[i].innerHTML += character();
    }

    overallWinners = findWinners(gameWinners, side);
    overallWinners.length > 0 ? finishGame(false, side) : movecount >= 81 && finishGame(true)
    // if (overallWinners.length > 0) finishGame(false, side) else if (movecount >= 81) finishGame(true)
  }

  function showWinnerModal(winner, side) {
    ab2.innerHTML = (winner ? character() + ' won.' : 'A tie!') + ' Play again?';
    addClass(ab2, 'invisible', side);
    ab2.style.display = 'block';
    removeClass(ab2, 'invisible');
  }

  function findWinners(board, side) {
    var winners = [];

    each(combinations, function(x) {
      if(board[x[0]] == side && board[x[1]] == side && board[x[2]] == side)
        winners.push(x);
    });

    return winners;
  }

  function playRandomGame() {
    gameInterval = setInterval(function() {
        playRandomSquare();
      }, 100);
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

  function makeEmDance() {

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