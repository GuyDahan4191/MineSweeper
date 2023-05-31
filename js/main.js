'use strict'

const MINE = '💣'
const FLAG = '🚩'
const EMPTY = ''

var gLives = 3
var gHint = 3

var gFlagAndMine = 0
var gBoard
var gSize = 4
var gMines = 2
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    isOver: false
}

function onInit() {
    gBoard = buildBoard(gSize)
    // gBoard[0][0].isMine = gBoard[1][0].isMine = true  // for test
    // console.log(gBoard)
    renderBoard()
    renderflags()
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
    // console.log('board:', board)
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
                } else inCell = currCell.minesAroundCount
            } else if (currCell.isMarked) {
                className += ' flag'
                inCell = FLAG
            }
            strHTML += `<td class="cell ${className}" 
                        data-i="${i}" data-j="${j}"
                        onclick="onCellClicked(this,${i},${j})"
                        oncontextmenu="onCellMarked(event,this,${i},${j})">${inCell}</td>`
        }
        strHTML += '</tr>'
    }
    const elTable = document.querySelector('table')
    elTable.innerHTML = strHTML
}

//count dwon the lives
function renderLives() {
    var elLives = document.querySelector('.lives span')
    elLives.innerText = gLives
}

//show how mant flags used
function renderflags() {
    console.log('hi:')
    var elflags = document.querySelector('.flags span')
    elflags.innerText = `${FLAG}: ${gGame.markedCount}/${gMines}`
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
    console.log('mines', gBoard)
}

function onCellClicked(elCell, i, j) {
    if (gGame.isOver) return

    // first click
    if (!gGame.isOn) {
        gGame.isOn = true
        setMines(i, j)
        countNegsMinesAllBoard()

        // onTimer
    }
    expandShown(gBoard, elCell, i, j)
    var cell = gBoard[i][j]
    if (cell.isShown || cell.isMarked) return

    cell.isShown = true
    gGame.shownCount++
    // console.log('gGame.shownCount:', gGame.shownCount)
    // console.log('gLives:', gLives)
    if (cell.isMine) {
        gLives--
        renderSmiley()
        gGame.shownCount--
        renderBoard()
        renderLives()
    }
    checkGameOver()

    // open all the cells if all the flags correct 
    console.log('gFlagAndMine:', gFlagAndMine)
    console.log('gMines:', gMines)
    console.log('gLives:', gLives)
    if (gFlagAndMine === (gMines - (3 - gLives))) {
        for (var i = 0; i < size; i++) {
            for (var j = 0; j < size; j++) {
                gBoard[i][j].isShown = true
            }
        }
    }
    renderBoard()
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
        renderBoard()
        elCell.innerHTML = ''
        return
    }
    curCell.isMarked = true
    gGame.markedCount++
    renderflags()
    elCell.innerHTML = FLAG
    checkGameOver()
    renderBoard

    if ((curCell.isMarked) && (curCell.isMine)) gFlagAndMine++
}


function countNegsMinesAllBoard() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            gBoard[i][j].minesAroundCount = countNegsMinesAroundCell(i, j)
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
    // console.log('elSize:', elSize)
    console.log('elSize:', elSize)
    if (elSize === 4) {
        gSize = 4
        gMines = 2
    }
    if (elSize === 8) {
        gSize = 8
        gMines = 2
    }
    if (elSize === 12) {
        gSize = 12
        gMines = 32
    }
    reset()
    return gSize
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
            (3 - gLives + gGame.markedCount))
            && (gGame.markedCount <= gMines)) {
            renderBoard()
            console.log('YOU WON')
            gGame.isOn = false
            gGame.isOver = true
            var elSmiley = document.querySelector('.smiley')
            elSmiley.innerText = '😎'
        }

        // check LOSS
    } else {
        console.log('Game Over')
        // clearInterval(gTimer)
        gGame.isOn = false
        gGame.isOver = true
    }
}

// function onHint(board, elCell, rowIdx, colIdx) {
//     if (gHint === 0) return
//     for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
//         if (i < 0 || i >= board.length) continue
//         for (var j = colIdx - 1; j <= colIdx + 1; j++) {
//             if (i === rowIdx && j === colIdx) continue
//             if (j < 0 || j >= board[0].length) continue
//             var currCell = board[i][j]
//             if (!currCell.isShown) {
//                 const elcellToHint = document.querySelector(`.cell[data-i="${i}"][data-j="${j}"]`)
//                 elcellToHint.classList.add('highlight')
//             }
//         }
//     }
//     gHint--
// }

function reset() {
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    gLives = 3
    gFlagAndMine = 0
    renderSmiley()
    // gHints = 3
    // closeModal()
    onInit()
    renderLives()
}

function expandShown(board, elCell, rowIdx, colIdx) {
    var cell = board[rowIdx][colIdx]
    if ((cell.minesAroundCount !== 0) || (cell.isMine) || (cell.isShown)) return

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
            if (currCell.isShown) continue
            currCell.isShown = true
            gGame.shownCount++
            if (currCell.minesAroundCount === 0) expandShown(gBoard, elCell, i, j)
            // const elCellToOpen = document.querySelector(`.cell [data-i="${i}"][data-j="${j}"]`)
            // console.log('elCellToOpen:', elCellToOpen)

            // elCellToOpen.isShown = true
        }
    }
}


// function Hint() {

// }

// function bestScore() {
//     // local Storage
// }

// function fullExpend() {

// }

// function safeClick(){

// }

