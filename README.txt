Ultimate Tic-Tac-Toe
====================

Open index.html in a browser. There is no build step and no dependencies.

To serve it instead:

python3 -m http.server

Modes
-----

- Play the computer: you play X against a random computer opponent
- Play a friend: two players, one device
- Autoplay: two computers demo the rules

Rules
-----

Every move sends your opponent to the matching board. If that board is already
decided (won or full) you may play anywhere. Win three boards in a row to win
the match.

http://mathwithbaddrawings.com/2013-06-16/ultimate-tic-tac-toe/

Layout
------

index.html               markup plus the mode picker
javascripts/tictactoe.js game state (Game) and DOM rendering (App)
stylesheets/tictactoe.css styling, responsive layout, dark and light palettes
dev-check.html           check harness, described below

Checks
------

dev-check.html loads index.html in an iframe, plays all three modes through the
app's own buttons, and prints PASS or FAIL into #report. Headless:

  chrome --headless=new --virtual-time-budget=400000 \
    --dump-dom "http://localhost:8000/dev-check.html"

--virtual-time-budget lets the computer opponent's timers run. Append
?layout=1&width=390&height=844 to check a narrow viewport for overflow, or
?mode=2&moves=26 to reach a state worth screenshotting.
