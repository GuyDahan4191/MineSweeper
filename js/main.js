'use strict'

const MINE = '💣'
const FLAG = '🚩'
const EMPTY = ''

var gLives = 3
var gHints = 3
var gIsHint = false
var gIsMegaHint = false
var gMegaHintCount = 1
var gRowInxStart
var gColInxStart

var gInterval = null
var gTimer = 0
var sec = 0

var gFlagAndMine = 0
var gBoard
var gSize = 4
var gMines = 2
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    isOver: false,
    safeClick: 3,
    isDarkMode: false,
    allPlays: []
}

function onInit() {
    gBoard = buildBoard(gSize)
    // gBoard[0][0].isMine = gBoard[1][0].isMine = true  // for test
    renderBoard()
    renderFlags()
}

function buildBoard(size) {
    var board = []
    for (var i = 0; i < size; i++) {
        board[i] = []
        for (var j = 0; j < size; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
            }
            board[i][j] = cell
        }
    }
    return board
}

function renderBoard() {
    if (gGame.isOver) return

    var strHTML = ''
    for (var i = 0; i < gBoard.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < gBoard[0].length; j++) {
            const currCell = gBoard[i][j]
            var inCell = ''
            var className = ''
            if (currCell.isShown) {
                className += ' shown'
                if (currCell.isMine) {
                    className += ' mine'
                    inCell = MINE
                }
                else inCell = currCell.minesAroundCount
            } else if (currCell.isMarked) {
                className += ' flag'
                inCell = FLAG
            }
            strHTML += `<td class="cell ${className}
                        cell-${i}-${j}"
                        onclick="onCellClicked(this,${i},${j})"
                        oncontextmenu="onCellMarked(event,this,${i},${j})">${inCell}</td>`
        }
        strHTML += '</tr>'
    }
    const elTable = document.querySelector('table')
    elTable.innerHTML = strHTML
}

function setMines(rowInx, colInx) {
    const size = gBoard.length
    for (var i = 0; i < gMines; i++) {
        const randRowIndex = getRandomInt(0, size)
        const randColIndex = getRandomInt(0, size)

        // check if this cell with mind already
        // or if its the cell of the first click
        if ((gBoard[randRowIndex][randColIndex].isMine) ||
            (randRowIndex === rowInx && randColIndex === colInx)) {
            i--
            continue
        }
        gBoard[randRowIndex][randColIndex].isMine = true
    }
}

function onCellClicked(elCell, i, j) {

    if (gGame.isOver) return

    // first click
    if (!gGame.isOn) {
        startTimer()
        gGame.isOn = true
        setMines(i, j)
        countNegsMinesAllBoard()
    }

    // hint or Mega hint:
    if (gIsHint) {
        hint(i, j)
        return
    }
    if (gIsMegaHint) {
        isMegaHint(i, j)
        return
    }

    expandShown(i, j)

    var cell = gBoard[i][j]
    if (cell.isShown || cell.isMarked) return
    cell.isShown = true
    gGame.shownCount++
    if (cell.isMine) {
        gLives--
        renderLives()
        renderFlags()
        renderSmiley()
        gGame.shownCount--
    }

    // open all the cells if all the flags correct 
    checkOpenAll()
    renderBoard()
    checkGameOver()

    // gGame.allPlays.push(gBoard[i][j])
    // console.log('gGame.allPlays:', gGame.allPlays)
}

function onCellMarked(ev, elCell, i, j) {

    // prevent menu on right key 
    ev.preventDefault()

    if (gGame.isOver) return

    var curCell = gBoard[i][j]
    if (curCell.isShown) return

    // Unmark
    if (curCell.isMarked) {
        curCell.isMarked = false
        gGame.markedCount--
        if (curCell.isMine) gFlagAndMine--
        renderBoard()
        renderFlags()
        elCell.innerHTML = ''
        return
    }

    curCell.isMarked = true
    gGame.markedCount++
    renderFlags()
    elCell.innerHTML = FLAG
    checkGameOver()
    renderBoard

    if (curCell.isMine) gFlagAndMine++
    checkOpenAll()

    // gGame.allPlays.push(gBoard[i][j])
    // console.log('gGame.allPlays:', gGame.allPlays)
}

function isMegaHint(i, j) {
    if (gMegaHintCount === 1) {
        gRowInxStart = i
        gColInxStart = j
        gMegaHintCount--
    } else {
        var rowInxEnd = i
        var colInxEnd = j
        hint(gRowInxStart, gColInxStart, rowInxEnd, colInxEnd)
    }
    return
}

function countNegsMinesAllBoard() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var count = countNegsMinesAroundCell(i, j)
            gBoard[i][j].minesAroundCount = (count === 0) ? '' : count
            // console.log('gBoard[i][j].minesAroundCount:', gBoard[i][j].minesAroundCount)
        }
    }
}

function countNegsMinesAroundCell(rowIdx, colIdx) {
    var count = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= gBoard[0].length) continue
            var currCell = gBoard[i][j]
            if (currCell.isMine) count++
        }
    }
    return count
}

//choose your bord size:
function size(elSize) {

    if (elSize === 4) {
        gSize = 4
        gMines = 2
    }
    if (elSize === 8) {
        gSize = 8
        gMines = 14
    }
    if (elSize === 12) {
        gSize = 12
        gMines = 32
    }
    reset()
    return gSize
}

//count dwon the lives
function renderLives() {
    var elLives = document.querySelector('.lives span')
    var hearts
    switch (gLives) {
        case 3: {
            hearts = '🤎🤎🤎'
            break
        }
        case 2: {
            hearts = '🤎🤎💔'
            break
        }
        case 1: {
            hearts = '🤎💔💔'
            break
        }
        case 0: {
            hearts = '💔💔💔'
            break
        }
    }
    elLives.innerText = hearts
}

//show how many flags used
function renderFlags() {
    var elFlags = document.querySelector('.flags')
    elFlags.innerText = `${FLAG} ${gGame.markedCount} / ${gMines - (3 - gLives)} ${MINE}`
}

function renderSmiley() {
    var elSmiley = document.querySelector('.smiley')
    switch (gLives) {
        case 3:
            elSmiley.innerText = '😁'
            break
        case 2:
            elSmiley.innerText = '😅'
            break
        case 1:
            elSmiley.innerText = '😱'
            break
        case 0:
            elSmiley.innerText = '🤬'
            break
    }
}

function checkGameOver() {
    // check WIN
    if (gLives !== 0) {
        if (((gSize ** 2 - gGame.shownCount) ===
            (3 - gLives + gGame.markedCount)) && (gGame.markedCount <= gMines)) {
            var newTime = gTimer.toFixed(2)
            sec = 0


            // localStorage.setItem('time', newTime)
            // localStorage.getItem('time')
            // console.log('localStorage.getItem', localStorage.getItem('time'))
            renderBoard()
            console.log(`YOU WON! your time is: ${newTime}`)
            gGame.isOn = false
            gGame.isOver = true
            var elSmiley = document.querySelector('.smiley')
            elSmiley.innerText = '😎'
        }

        // check LOSS
    } else {
        var newTime = gTimer.toFixed(2)
        sec = 0
        console.log('Game Over')
        // clearInterval(gTimer)
        gGame.isOn = false
        gGame.isOver = true
    }
}

function onHint(elHint) {
    // if no more hints or hint clicked
    if ((gHints === 0) || (gIsHint)) return

    elHint.style.backgroundColor = 'yellow'
    setTimeout(() => {
        elHint.style.display = 'none'
        renderBoard()
    }, 2000)
    gIsHint = true
}

function onMegaHint(elCell) {
    // if Mega hint clicked
    setTimeout(() => {
        elCell.style.backgroundColor = 'darkslategray'
    }, 3000)
    if ((gIsMegaHint) || gMegaHintCount === 0) return
    console.log('MEGA HINT')
    gIsMegaHint = true
}

//function for hint or Mega hint
function hint(rowIdxStart, colIdxStart, rowIdxEnd = rowIdxStart + 1, colIdxEnd = colIdxStart + 1) {
    if (gIsHint) {
        rowIdxStart -= 1
        colIdxStart -= 1
    }
    for (var i = rowIdxStart; i <= rowIdxEnd; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdxStart; j <= colIdxEnd; j++) {
            if (j < 0 || j >= gBoard[0].length) continue
            const currCell = gBoard[i][j]
            if (currCell.isShown) continue
            currCell.isShown = true
            renderBoard()
            setTimeout(() => {
                currCell.isShown = false
                renderBoard()
            }, 1000)
        }
    }
    if (gIsHint) {
        gIsHint = false
        gHints--
    } else gIsMegaHint = false
}

function reset() {
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        isOver: false,
        safeClick: 3
    }
    gLives = 3
    gHints = 3
    gMegaHintCount = 1
    gFlagAndMine = 0

    sec = 0
    gInterval = 0
    gTimer = 0
    renderSmiley()

    // closeModal()
    onInit()
    renderLives()
}

function onDarkMode() {
    var elBox = document.querySelector('.box')
    var elH1 = document.querySelector('h1')
    var elH3 = document.querySelector('h3')
    var elCell = document.querySelector('td')
    var elFlag = document.querySelector('.flags')

    if (gGame.isDarkMode) {
        elBox.style.backgroundColor = 'rgba(242, 245, 246, 0.75)'
        elH1.style.color = 'rgb(0, 0, 0)'
        elH3.style.color = 'rgb(0, 0, 0)'
        elCell.style.color = 'rgb(0, 0, 0)'
        elFlag.style.color = 'rgb(0, 0, 0)'
    } else {
        elBox.style.backgroundColor = 'rgba(1, 1, 1, 0.75)'
        elH1.style.color = 'rgb(255, 255, 255)'
        elH3.style.color = 'rgb(255, 255, 255)'
        elCell.style.color = 'rgb(0, 0, 0)'
        elFlag.style.color = 'rgb(255, 255, 255)'
    }
    gGame.isDarkMode = !gGame.isDarkMode
}

// check if all flags are correct and open all the cells --->
// ---> dont know why its not working 
function checkOpenAll() {
    if (gFlagAndMine !== (gMines - (3 - gLives))) return
    console.log('inside checkOpenAll:')
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            if (gBoard[i][j].isShown) continue
            if (gBoard[i][j].isMarked) continue
            if (!gBoard[i][j].isShown) {
                gBoard[i][j].isShown = true
                gGame.shownCount++
            }
        }
    }
    renderBoard()
    renderSmiley()
}

// dont know why... but it works only when game is over
function onSafeClick() {
    if (gGame.safeClick <= 0) return
    var safe = true
    while (safe) {
        const randRowIndex = getRandomInt(0, gSize)
        const randColIndex = getRandomInt(0, gSize)
        var randCell = gBoard[randRowIndex][randColIndex]

        // check if this cell with mind or shown or marked
        if ((randCell.isMine) || (randCell.isShown) || (randCell.isMarked)) safe
        else {
            var elClass = posToSelect({ i: randRowIndex, j: randColIndex })
            // console.log('elClass:', elClass)
            var elRandCell = document.querySelector(elClass)
            console.log('elRandCell:', elRandCell)
            elRandCell.classList.add('highlight')
            renderBoard()
            setTimeout(() => {
                elRandCell.classList.remove('highlight')
                renderBoard()
            }, 2500)
            safe = false
            return
        }
    }
}

// another function that i dont know why its not working
function expandShown(rowIdx, colIdx) {
    var cell = gBoard[rowIdx][colIdx]
    if ((cell.minesAroundCount) || (cell.isMine) || (cell.isShown)) return

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= gBoard[0].length) continue
            var currCell = gBoard[i][j]
            if (currCell.isShown) continue
            currCell.isShown = true
            gGame.shownCount++
            if (currCell.minesAroundCount === '') {
                expandShown(i, j)
            }
        }
    }
}

// started but didn't finished...
function onUndo(elUndo) {

    // if (gGame.allPlays.length <= 0) return
    // var lestMove = gGame.allPlays.pop(0)
    console.log(`i'm not working for the moment... or for good`)
}

// function Exterminator() {

// }

// function bestScore() {
//     // local Storage
// }



