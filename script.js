let main = document.querySelector('.main'),
    scoreElem = document.getElementById('score'),
    levelElem = document.getElementById('level'),
    nextTetroElem = document.getElementById('next-tetro'),
    startBtn =document.getElementById('start'),
    pauseBtn =document.getElementById('pause'),
    gameOver = document.getElementById('game-over'),
    score = 0,
    currentLevel = 1,
    possibleLevels = {
        1: {
            scorePerLine: 10,
            speed: 500,
            nextLevelScore: 1000
        },
        2: {
            scorePerLine: 12,
            speed: 400,
            nextLevelScore: 3000
        },
        3: {
            scorePerLine: 14,
            speed: 300,
            nextLevelScore: 9000
        },
        4: {
            scorePerLine: 16,
            speed: 200,
            nextLevelScore: 27000
        },
        5: {
            scorePerLine: 18,
            speed: 100,
            nextLevelScore: Infinity
        }
    },
    playField = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    figures = {
        O: [
            [1, 1],
            [1, 1]
        ],
        I: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        S: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        Z: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        L: [
            [1, 0, 0],
            [1, 0, 0],
            [1, 1, 0]
        ],
        J: [
            [0, 0, 1],
            [0, 0, 1],
            [0, 1, 1]
        ],
        T: [
            [1, 1, 1],
            [0, 1, 0],
            [0, 0, 0]
        ]
    },
    isPaused = true,
    gameTimerID,
    activeTetro = getNewTetro(),
    nextTetro = getNewTetro();

function hasCollision() {
    for (let y = 0; y < activeTetro.shape.length; y++) {
        for (let x = 0; x < activeTetro.shape[y].length; x++) {
            if (
                activeTetro.shape[y][x] &&
                (
                    playField[activeTetro.y + y] === undefined ||
                    playField[activeTetro.y + y][activeTetro.x + x] === undefined ||
                    playField[activeTetro.y + y][activeTetro.x + x] === 2
                )
            ) return true;
        };
    };
    return false;
}

function removePrevActiveTetro() {
    for (let y = 0; y < playField.length; y++) {
        for (let x = 0; x < playField[y].length; x++) {
            if (playField[y][x] === 1) playField[y][x]--;
        };
    };
}

function addActiveTetro() {
    removePrevActiveTetro();
    for (let y = 0; y < activeTetro.shape.length; y++) {
        for (let x = 0; x < activeTetro.shape[y].length; x++) {
            if (activeTetro.shape[y][x]) {
                playField[y + activeTetro.y][x + activeTetro.x] = activeTetro.shape[y][x];
            };
        };
    };
}

function draw() {
    let mainInnerHTML = '';
    for (let y = 0; y < playField.length; y++) {
        for (let x = 0; x < playField[y].length; x++) {
            switch(playField[y][x]) {
                case 1: mainInnerHTML += '<div class="cell movingCell"></div>'; break;
                case 2: mainInnerHTML += '<div class="cell fixedCell"></div>'; break;
                default: mainInnerHTML += '<div class="cell"></div>';
            }
        }
    }
    main.innerHTML = mainInnerHTML;
}

function drawNextTetro() {
    let nextTetroInnerHTML='';
    for (let y = 0; y < nextTetro.shape.length; y++) {
        for (let x = 0; x < nextTetro.shape[y].length; x++) {
            switch(nextTetro.shape[y][x]) {
                case 1: nextTetroInnerHTML += '<div class="cell movingCell"></div>'; break;
                default: nextTetroInnerHTML += '<div class="cell"></div>';
            }
        }
        nextTetroInnerHTML += '<br>'
    }
    nextTetroElem.innerHTML = nextTetroInnerHTML;
}

function removeFullLines() {
    let lines = 0;
    for (let y = 0; y <= playField.length - 1; y++) {
        if (playField[y].filter(item => item === 2).length === playField[y].length) {
            playField.splice(y, 1);
            playField.unshift([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
            lines++;
        };
    };
    switch (lines) {
        case 1: score += lines * possibleLevels[currentLevel].scorePerLine; break;
        case 2: score += lines * possibleLevels[currentLevel].scorePerLine * 3; break;
        case 3: score += lines * possibleLevels[currentLevel].scorePerLine * 6; break;
        case 4: score += lines * possibleLevels[currentLevel].scorePerLine * 12; break;
        default: break;
    };
    scoreElem.innerHTML = score;
    if (score >= possibleLevels[currentLevel].nextLevelScore) {
        currentLevel++;
        levelElem.innerHTML = currentLevel;
    };
}

function getNewTetro() {
    const possibleFigures = 'OISZLJT',
          rand = Math.floor(Math.random() * 7),
          newTetro = figures[possibleFigures[rand]];
    return {
        x: Math.floor((playField[0].length / 2) - newTetro.length / 2),
        y: 0,
        shape: newTetro
    }
}

function fixTetro() {
    for (let y = 0; y < playField.length; y++) {
        for (let x = 0; x < playField[y].length; x++) {
            if (playField[y][x] === 1) playField[y][x]++;
        };
    };
    removeFullLines();
    draw();
    drawNextTetro();
}

function rotateTetro() {
    
    if (!hasCollision()) {
        const prevTetroState = activeTetro.shape;
        activeTetro.shape = activeTetro.shape[0].map(
            (val, index) =>
            activeTetro.shape.map((row) =>
            row[index]).reverse()
        );
        if (hasCollision()) activeTetro.shape = prevTetroState;
    };
}

document.onkeydown = function(e) {
    if (!isPaused) {
        switch(e.keyCode) {
            case 37: activeTetro.x--; if (hasCollision()) {activeTetro.x++; break;}; break; // left
            case 38: rotateTetro(); break;                                                  // rotete
            case 39: activeTetro.x++; if (hasCollision()) {activeTetro.x--; break;}; break; // right
            case 40: moveTetroDown(); break;                                                // down
            case 32: dropTetro();                                                           // space
        };
        updateGameState();
    }
}

function dropTetro() {
    for (let y = activeTetro.y; y < playField.length; y++){
        activeTetro.y++;
        if (hasCollision()) {
            activeTetro.y--;
            break;
        }
    }
}

function moveTetroDown() {
    if (!isPaused) {
        activeTetro.y++;
        if (hasCollision()) {
            activeTetro.y--;
            fixTetro();
            activeTetro = nextTetro;
            if (hasCollision()) {
                reset();
            }
            nextTetro = getNewTetro();
            activeTetro.x = Math.floor((playField[0].length / 2) - activeTetro.shape[0].length / 2);
            activeTetro.y = 0;
        }
    }
}

function reset() {
    isPaused = true;
    clearTimeout(gameTimerID);
    playField = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];
    draw();
    gameOver.style.display = 'block';
}

function updateGameState() {
    if (!isPaused) {
        addActiveTetro();
        draw();
        drawNextTetro();
    }
}

pauseBtn.addEventListener('click', (e) => {
    if (e.target.innerHTML === 'Pause') {
        e.target.innerHTML = 'Keep Playing...';
        clearTimeout(gameTimerID);
    } else {
        e.target.innerHTML = 'Pause'
        gameTimerID = setTimeout(startGame, possibleLevels[currentLevel].speed);
    }
    isPaused = !isPaused;
})

startBtn.addEventListener('click', (e) => {
    e.target.innerHTML = 'Start again';
    gameOver.style.display = 'none';
    isPaused = false;
    gameTimerID = setTimeout(startGame, possibleLevels[currentLevel].speed);
})

scoreElem.innerHTML = score;
levelElem.innerHTML = currentLevel;

draw();

function startGame() {
    moveTetroDown();
    if (!isPaused) {
        updateGameState();
        gameTimerID = setTimeout(startGame, possibleLevels[currentLevel].speed);
    }
}