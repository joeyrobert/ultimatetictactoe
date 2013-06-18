# Ultimate tic tac toe
# http://mathwithbaddrawings.com/2013/06/16/ultimate-tic-tac-toe/
class UltimateTicTacToe
  constructor: ->
    @newGameState()

  newGameState: ->
    # contains 'x' or 'o'
    @board = []
    @gameWinners = []
    for i in [0...9]
      @board[i] ||= []
      @gameWinners[i] = undefined
      for j in [0...9]
        @board[i][j] = undefined

    @turn = 'x'
    @activeGame = undefined # 0 - 8 or undefined is all
    @gameComplete = false

  bindEvents: =>
    $(window).resize(@resize)
    $('.square').click(@clickSquare)
    $('#playagain').click(@playAgain)

  unbindEvents: =>
    $(window).off('resize', @resize)
    $('.square').off('click', @clickSquare)
    $('#playagain').off('click', @playAgain)

  draw: =>
    html = """
      <% for(var i = 0; i < 9; i++) { %>
        <div class="game <%-['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'][i] %>">
          <% for(var j = 0; j < 9; j++) { %>
            <div data-i="<%-i %>" data-j="<%-j %>" class="square <%-['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'][j] %><% if(board[i][j]) { %> <%-board[i][j] %><% } %>"></div>
          <% } %>
          <div class="winner"></div>
        </div>
      <% } %>
      <div class="overallwinner">
        <span class="turn"></span>
        <a href="#" id="playagain">Play again?</a>
      </div>
    """

    template = _.template(html)
    $('#tictactoe').html(template({board: @board}))

  resize: =>
    windowWidth = $(window).width()
    windowHeight = $(window).height()
    @scale = Math.min(windowWidth / 444, windowHeight / 444)
    $('#tictactoe').css
      transform: "scale(#{@scale})"

  changeTurn: =>
    if @turn is 'x'
      @turn = 'o'
    else
      @turn = 'x'

  clickSquare: (e) =>
    $square = $(e.currentTarget)
    i = $square.data('i')
    j = $square.data('j')
    if !@gameComplete and _.isUndefined(@board[i][j]) and (i is @activeGame or _.isUndefined(@activeGame))
      @board[i][j] = @turn
      $square.addClass(@turn)
      if @turn is 'x'
        $square.html('&#215;')
      else
        $square.html('&#9675;')

      @showWinners(@turn, i)

      unless @gameComplete
        @activeGame = j
        if @gameFull(@board[j])
          @activeGame = undefined
        @showActiveGame()

        @changeTurn()

  letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']

  showActiveGame: =>
    if @activeGame?
      $(".game").removeClass('active')
      $(".game.#{@letters[@activeGame]}").addClass('active')
    else
      $(".game").addClass('active')

  gameFull: (board) ->
    for j in [0...9]
      if _.isUndefined(board[j])
        return false
    return true

  showWinners: (turn, i) ->
    winners = @findWinners(@board[i], turn)
    for winner in winners
      for j in winner
        $(".game.#{@letters[i]} .square.#{@letters[j]}").addClass('won')

    if winners.length > 0 and _.isUndefined(@gameWinners[i])
      @gameWinners[i] = turn
      $game = $(".game.#{@letters[i]}")
      $game.addClass("won").addClass(turn)
      if turn is 'x'
        $game.find('.winner').html('&#215;')
      else
        $game.find('.winner').html('&#9675;')

    # Game over state
    overallWinners = @findWinners(@gameWinners, turn)
    if @gameFull(@gameWinners) and overallWinners.length is 0
      # Tie
      $(".game").removeClass('active')
      @gameComplete = true
      @showWinnerModal()

    else if overallWinners.length > 0
      # x or o wins
      $(".game").removeClass('active')
      @gameComplete = true
      @showWinnerModal(turn)

  showWinnerModal: (turn) =>
    if turn is 'x'
      $('.overallwinner .turn').html('&#215; won.')
    else if turn is 'o'
      $('.overallwinner .turn').html('&#9675; won.')
    else
      $('.overallwinner .turn').html('A tie!')
    $('.overallwinner').removeClass('x')
    $('.overallwinner').removeClass('o')
    $('.overallwinner').addClass(turn) if turn?

    $('.overallwinner').css
      opacity: 0
      display: 'block'
    $('.overallwinner').css
      opacity: 1
    $('.winner').css
      opacity: 1

  # Finds array of winning combinations for a tic-tac-toe board
  # board: [] length 9
  findWinners: (board, turn) ->
    winners = []

    # Diagonal
    if board[0] is turn and board[4] is turn and board[8] is turn
      winners.push [0,4,8]
    if board[2] is turn and board[4] is turn and board[6] is turn
      winners.push [0,2,4]

    # Horizontal 
    for row in [0...3]
      if board[row*3] is turn and board[row*3+1] is turn and board[row*3+2] is turn
        winners.push [row*3, row*3+1, row*3+2]

    # Vertical
    for column in [0...3]
      if board[column] is turn and board[column+3] is turn and board[column+6] is turn
        winners.push [column, column+3, column+6]

    winners

  playAgain: =>
    @newGameState()
    @draw()
    @showActiveGame()
    @bindEvents()
    false

  playRandom: =>
    setInterval =>
      $squares = $('.game.active .square:not(.x):not(.o)')
      randInt = Math.floor(Math.random()*$squares.length)
      $squares.eq(randInt).click()
    , 100

#
# Touch event handler
#
touchHandler = (event) ->
  touch = event.changedTouches[0]
  simulatedEvent = document.createEvent("MouseEvent")
  simulatedEvent.initMouseEvent {touchstart: "click", touchmove: "mousemove", touchend: "mouseup"}[event.type], true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null
  touch.target.dispatchEvent simulatedEvent
  event.preventDefault()

init = ->
  document.addEventListener "touchstart", touchHandler, true
 # document.addEventListener "touchmove", touchHandler, true
 # document.addEventListener "touchend", touchHandler, true
 # document.addEventListener "touchcancel", touchHandler, true

$(document).ready ->
  tictactoe = new UltimateTicTacToe()
  init()
  tictactoe.draw()
  tictactoe.showActiveGame()
  tictactoe.resize()
  tictactoe.bindEvents()

  tictactoe.playRandom()
