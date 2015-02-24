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

  function addClass(elz, cls) {
    elz.classList.add(cls);
  }

  function removeClass(elz, cls) {
    elz.classList.remove;
  }

  function hideModal() {
    addClass(el[1], 'invisible');
    setTimeout(function() {
      el[1][0].style.display = 'none';
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
    b.innerHTML = renderHTML(
      ['tictactoe true',
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
    ) + renderCSS();
  }

  function getElements() {
    // boardElement = 0, introElement = 1, overallWinnerElement = 2, gameElements = 3, squareElements = 4, playAgain = 5, player(1,2,3) = 6
    el = [b.childNodes[0], qsa('.intro'), qsa('.overallwinner'), qsa('.game'), qsa('.square'), qsa('.playagain'), qsa('.player')];
  }

  function renderCSS() {
    return "<style>.tictactoe{width:444px;height:444px;margin-left:auto;margin-right:auto;transform-origin:50% 0;border-width:3px;border-style:solid}.tictactoe.true{border-color:#8AFF7A}.tictactoe.false{border-color:#FF7A7A}.square{width:47px;height:47px;float:left;font-size:47px;text-align:center;border:1px solid #CCC;line-height:43px;z-index:10}.square.true{background-color:#8AFF7A}.square.false{background-color:#FF7A7A}.game.active:hover .square.true:hover{background-color:#BEFFB5}.game.active:hover .square.false:hover{background-color:#FFBFBF}.game.active{background-color:#91EDFF}.game.active:hover{background-color:#C7F4FC}.game.active:hover .square:hover{background-color:#E8FBFF}.game.won.false.active .winner,.game.won.true.active .winner{display:none}.game{width:148px;height:148px;float:left}.winner{width:147px;height:147px;text-align:center;position:absolute;font-size:200px;line-height:128px;display:none;opacity:.8;z-index:1;overflow:hidden;transition:opacity .25s ease-in-out}.game.won.false:hover .winner,.game.won.true:hover .winner{opacity:0}.game.won.false .winner,.game.won.true .winner{display:block}.game.won.true .winner{background-color:#8aff7a}.game.won.false .winner{background-color:#ff7a7a}.intro,.overallwinner{position:absolute;border-radius:10px;box-shadow:0 0 13px #000;background-color:#fff;z-index:20;text-align:center;transition:opacity .25s ease-in-out}.overallwinner{width:200px;height:44px;display:none;line-height:44px;margin-left:122px;margin-top:200px}.overallwinner.true{background-color:#BEFFB5}.overallwinner.false{background-color:#FFBFBF}.intro{width:200px;height:170px;margin-left:122px;margin-top:137px}.btn{width:165px;height:25px}</style>";
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
    bindClick(el[4], clickSquare);
    bindClick(el[5], start);
    bindClick(el[6], player);
  }

  function resize() {
    el[0].style = 'transform: scale(' + Math.min(b.offsetWidth / 450, b.offsetHeight / 450); + ')';
  }

  function clickSquare(e) {
    var i = siblingNumber(e.target.parentNode),
        j = siblingNumber(e.target);
    tictactoe(i, j);
  }

  function tictactoe(i, j) {
    if (mode >= 0 && !gamePaused && !board[i][j] && (i == activeGame || activeGame == u)) {
      square = el[4][i*9 + j];
      board[i][j] = side;
      addClass(square,side);
      square.innerHTML = character();
      movecount += 1;
      showWinners(side, i);
      if (!gamePaused) {
        activeGame = j;
        if (gameFull(board[j])) {
          activeGame = u;
        }
        showActiveGame();

        // Change side
        side = !side;
        addClass(el[0], side);
      }
      if (mode == 1 && !side) {
        return playRandomSquare();
      }
    }
  }

  function showActiveGame() {
    for(var i = 0; el[3][i]; i++)
      removeClass(el[3][i], 'active');
    addClass(el[3][activeGame], 'active');
  }

  function gameFull(board) {
    for(var i = 0; i < 9; i++)
      if (!board[i])
        return false;
    return true;
  }

  function finishGame(draw, winner) {
    debugger
   // el[3].className = 'game';
    gamePaused = true;
    showWinnerModal(true, side);
    if (gameInterval) {
      clearInterval(gameInterval);
    }
  }

  function character() {
    return (side ? '&#215' : '&#9675') + ';';
  }

  function showWinners(side, i) {
    winners = findWinners(board[i], side);
    for(var k = 0; k < winners.length; k++) {
      for(var j = 0; j < winners[k].length; j++) {
        addClass(el[4][i*9 + winners[k][j]], 'won');
        addClass(el[4][i*9 + winners[k][j]], side);
      }
    }
    debugger
    if (winners.length > 0 && !gameWinners[i]) {
      gameWinners[i] = side;
      el[3][i].className = 'game won ' + side;
      el[3][i].innerHTML += character();
    }

    overallWinners = findWinners(gameWinners, side);
    if (movecount >= 81 && overallWinners.length == 0) {
      finishGame(true)
    } else if (overallWinners.length > 0) {
      finishGame(false, side)
    }
  }

  function showWinnerModal(winner, side) {
    winner ? character() + ' won.' : 'A tie!';
    el[2].className = side;
    el[2].display.style = 'opacity: 0; display: block';
    el[2].display.style = 'opacity: 1; display: block';
    // winnerElement.css({
    //   opacity: 1
    // });
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

  function randInt() {
    return Math.floor(Math.random() * 9);
  }

  function playRandomSquare() {
    if(activeGame == u) activeGame = randInt();
    do {
      var j = randInt();
    } while(board[activeGame][j] != u);
    tictactoe(activeGame, j);
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