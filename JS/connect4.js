export { init };

class UserInterface {
    constructor(container) {
        this.container = container;
        this.container.style.maxWidth = "300px";
        this.container.style.marginInline = "auto";
        this.title = document.createElement("h2");
        this.title.textContent = "Connect 4";
        this.container.append(this.title);

        this.playersInputs = [];
        this.defaultPlayersColor = ["#fefc00", "#ff0303", "#1be7ba", "#550081", "#fe890d", "#21bf00", "#e45caf", "#939596"];
        this.gameBackgroundColor = this.addBackgroundColorPicker();
        this.rowSlider = this.addOptionSlider("Rows", 4, 18, 6);
        this.columnSlider = this.addOptionSlider("Columns", 4, 21, 7);
        this.streakSlider = this.addOptionSlider("Streak", 4, 12, 4);
        this.playerSlider = this.addOptionSlider("Players", 2, 8, 2);
        this.playerSlider.input.onchange = this.addPlayersInputs.bind(this);

        this.displayOptions();
        this.addPlayersInputs();
        this.createStartButton();
        this.createEndButton();
    }

    addBackgroundColorPicker() {
        const gameBackgroundColorInput = {
            label: document.createElement("label"),
            input: document.createElement("input")
        }

        gameBackgroundColorInput.label.textContent = "Background";
        gameBackgroundColorInput.label.for = "gameBackgroundColor-picker";

        gameBackgroundColorInput.input.id = "gameBackgroundColor-picker";
        gameBackgroundColorInput.input.type = "color";
        gameBackgroundColorInput.input.value = "#0069ff";
        gameBackgroundColorInput.input.style.marginRight = "24px";

        return gameBackgroundColorInput;
    }

    addOptionSlider(name, min, max, defaultValue) {
        const slider = {
            label : document.createElement("label"),
            input : document.createElement("input")
        }
        slider.label.textContent = name;
        slider.label.for = name.toLowerCase() + "-slider";

        slider.input.id = name.toLowerCase() + "-slider";
        slider.input.type = "range";
        slider.input.min = min;
        slider.input.max = max;
        slider.input.step = "1";
        slider.input.value = defaultValue;

        return slider;
    }

    displayOptions() {
        this.slidersOptionsDiv = document.createElement("div");
        this.slidersOptionsDiv.style.display = "flex";
        this.slidersOptionsDiv.style.flexDirection = "column";
        this.container.append(this.slidersOptionsDiv);

        const options = [this.rowSlider, this.columnSlider, this.playerSlider, this.streakSlider, this.gameBackgroundColor];

        for (const element of options) {
            const gameOptionsDiv = document.createElement("div");
            gameOptionsDiv.style.display = "flex";
            gameOptionsDiv.style.justifyContent = "space-between";
            this.slidersOptionsDiv.append(gameOptionsDiv);

            for (let key in element) {
                if ( key === "label" || key === "input") {
                    gameOptionsDiv.append(element[key]);
                }
            }
        }
    }

    addPlayersInputs() {
        for (let i = 0; i < this.playerSlider.input.value; i++) {
            if (!this.playersInputs[i]) {
                const playerInputs = {
                    nameInput: document.createElement("input"),
                    colorInput: document.createElement("input"),
                    botInput: document.createElement("input")
                }

                playerInputs.nameInput.value = "Player " + (i + 1).toString();
                playerInputs.colorInput.type = "color";
                playerInputs.colorInput.value = this.defaultPlayersColor[i];
                playerInputs.colorInput.onclick = function() {
                    this.tempValue = this.value;
                }
                playerInputs.colorInput.onchange = function() {
                    const inputs = document.querySelectorAll("input");
                    for (const input of inputs) {
                        if (input !== this && input.value === this.value) {
                            alert("This color is already taken, please select another one.");
                            this.value = this.tempValue;
                        }
                    }
                }
                playerInputs.botInput.type = "checkbox";

                this.playersInputs.push(playerInputs);
            }
        }

        this.displayPlayersInputs();
    }

    displayPlayersInputs() {
        if (!this.playersInputsDiv) {
            this.playersInputsDiv = document.createElement("div");
            this.container.append(this.playersInputsDiv);
        }

        const removables = this.playersInputsDiv.querySelectorAll("div");
        for (const removable of removables) {
            removable.remove();
        }

        for (let i = 0; i < this.playerSlider.input.value; i++) {
            const playerInputsDiv = document.createElement("div");
            this.playersInputsDiv.append(playerInputsDiv);

            for (const key in this.playersInputs[i]) {
                playerInputsDiv.append(this.playersInputs[i][key]);
            }
        }
    }

    hide() {
        this.slidersOptionsDiv.remove();
        this.playersInputsDiv.remove();
        this.startButton.remove();
        this.container.append(this.endButton);
    }

    startGame() {
        this.players = [];
        for (let i = 0; i < this.playerSlider.input.value; i++) {
            if (!this.playersInputs[i].botInput.checked) {
                this.players.push(new Player(this.playersInputs[i].nameInput.value, this.playersInputs[i].colorInput.value, this.playersInputs[i].botInput.checked));
            } else {
                this.players.push(new Bot(this.playersInputs[i].nameInput.value, this.playersInputs[i].colorInput.value, this.playersInputs[i].botInput.checked));
            }
        }
        this.gameGrid = new GameGrid(this.players, this.rowSlider.input.value, this.columnSlider.input.value, this.streakSlider.input.value, this.gameBackgroundColor.input.value);
        this.gameGrid.drawGrid(this.container);
        this.hide();
    }

    createStartButton() {
        this.startButton = document.createElement("button");
        this.startButton.style.borderRadius = "7.5px";
        this.startButton.textContent = "Start game";
        this.startButton.style.margin = "7.5px";
        this.startButton.onclick = this.startGame.bind(this);

        this.container.appendChild(this.startButton);
    }

    show() {
        this.endButton.remove();
        this.container.append(this.slidersOptionsDiv);
        this.container.append(this.playersInputsDiv);
        this.container.append(this.startButton);
    }

    endGame() {
        this.gameGrid.turnDiv.remove();
        this.gameGrid.tableElement.remove();
        this.gameGrid.cancelLastPlayButton.remove();
        this.gameGrid = null;
        this.container.style.maxWidth = "300px";
        this.show();
    }

    createEndButton() {
        this.endButton = document.createElement("button");
        this.endButton.style.borderRadius = "7.5px";
        this.endButton.textContent = "End game";
        this.endButton.style.margin = "7.5px";
        this.endButton.onclick = this.endGame.bind(this);
    }
}

class Player {
    constructor(name, color, bot) {
        this.name = name;
        this.color = color;
        this.bot = bot;
        this.score = 0;
    }
}

class Bot extends Player {
    checkPlayableCells(gameGrid, playableCells) {
        for (const cell of playableCells) {
            let i = 0;
            let playerNumber = gameGrid.playerTurn;

            do {
                let streakLines = gameGrid.streakCheck(cell.row, cell.column, gameGrid.players[playerNumber].name);
                if (streakLines.length > 0) {
                    if (gameGrid.players[playerNumber] === this) {
                        console.log(this.name + " identified a streak and will complete it.");
                    } else {
                        console.log(this.name + " will prevent " + gameGrid.players[playerNumber].name + " from completing a streak.");
                    }

                    return cell.column;
                }

                playerNumber = gameGrid.getNextPlayerTurn(playerNumber);
                i++;
            } while (i < gameGrid.players.length);
        }

        return false;
    }

    checkAhead(gameGrid, playableCells) {
        for (const cell of playableCells) {
            if (cell.row >= 1) {
                for (const player of gameGrid.players) {
                    if (player !== this && !cell.isBad) {
                        const streakLines = gameGrid.streakCheck((cell.row - 1), cell.column, player.name);

                        if (streakLines.length > 0) {
                            console.log(this.name + " identified a move which would benefit an opponent and will remove it from its moves set");
                            cell.isBad = true;
                        }
                    }
                }
            }
        }
    }

    randomizeColumn(playableCells) {
        let half = Math.floor(playableCells.length / 2);
        let direction = (Math.random() >= 0.5) ? 1 : -1;

        for (let i = 0; i < 2; i++) {
            for (let offset = half; offset >= 0 && offset < playableCells.length; offset += direction) {
                if (!playableCells[offset].column.isBad && Math.random() >= 0.9) return playableCells[offset].column;
            }
            direction *= -1;
        }

        return false;
    }

    nextMove(gameGrid) {
        const playableCells = gameGrid.getPlayableCells();

        const immediateWinCell = this.checkPlayableCells(gameGrid, playableCells);
        if (immediateWinCell) return immediateWinCell;

        this.checkAhead(gameGrid, playableCells);

        const preferredCell = this.randomizeColumn(playableCells);
        if (preferredCell) return preferredCell;

        console.log("Defaulting to purely random cell.");

        return playableCells[Math.floor(Math.random() * (playableCells.length))].column;
    }

    play(gameGrid) {
        console.log("Bot named '" + this.name + "' is playing.");

        const nextMoveColumn = this.nextMove(gameGrid);

        gameGrid.placeToken(nextMoveColumn);
    }
}

class GameGrid {
    constructor(players, rows, columns, winRequirement, backgroundColor) {
        this.players = players;
        this.tableCells = [];
        this.movesHistory = [];
        this.rowsAmount = rows;
        this.columnsAmount = columns;
        this.winRequirement = winRequirement;
        this.backgroundColor = backgroundColor;
        this.playerTurn = 0;
        this.turnCount = 1;
        this.gameOver = false;
    }

    drawGrid(container) {
        container.style.maxWidth = "600px";
        this.turnDiv = document.createElement("div");
        this.turnDiv.style.margin = "7.5px";
        this.turnDiv.innerHTML = "Turn " + this.turnCount + " - <span style=\"color:" + this.players[this.playerTurn].color + "\">" + this.players[this.playerTurn].name + "</span>";
        this.tableElement = document.createElement("table");
        this.tableElement.style.backgroundColor = this.backgroundColor;
        this.tableElement.style.border = "solid 4px black";
        this.tableElement.style.minWidth = "600px";
        this.tableElement.style.minHeight = "600px";
        this.tableElement.style.marginInline = "auto";
        container.append(this.turnDiv);
        container.appendChild(this.tableElement);

        for (let row = 0; row < this.rowsAmount; row++) {
            let rowElement = document.createElement("tr");
            this.tableCells.push([]);
            this.tableElement.appendChild(rowElement);

            for (let column = 0; column < this.columnsAmount; column++) {
                let columnElement = document.createElement("td");
                columnElement.style.backgroundColor = "#FFFFFF";
                columnElement.style.border = "solid 3px black";
                columnElement.style.borderRadius = "360px";
                columnElement.onclick = this.placeToken.bind(this, column);

                this.tableCells[row].push(columnElement);
                rowElement.appendChild(columnElement);
            }
        }

        this.cancelLastPlayButton = document.createElement("button");
        this.cancelLastPlayButton.textContent = "Cancel play";
        this.cancelLastPlayButton.onclick = this.cancelLastPlay.bind(this);
        container.append(this.cancelLastPlayButton);

        if (this.players[this.playerTurn].bot) this.players[this.playerTurn].play(this);
    }

    getNextPlayerTurn(playerTurn) {
        return (playerTurn < this.players.length - 1) ? (playerTurn + 1) : 0;
    }

    getLowestFreeRow(column) {
        let row = -1;

        while (row < this.rowsAmount - 1 && this.tableCells[row + 1][column].id === "") {
            row++;
        }

        return row;
    }

    placeToken(column) {
        let row = this.getLowestFreeRow(column);

        if (row >= 0) {
            const currentCell = this.tableCells[row][column];
            currentCell.setAttribute("id", this.turnCount.toString() + "_" + this.players[this.playerTurn].name);
            currentCell.style.backgroundColor = this.players[this.playerTurn].color;

            this.winCondition(this.streakCheck(row, column, this.players[this.playerTurn].name));
            if (this.gameOver) return null;
            this.movesHistory.push(currentCell);
            this.playerTurn = this.getNextPlayerTurn(this.playerTurn);
            this.turnCount++;
            this.turnDiv.innerHTML = "Turn " + this.turnCount + " - <span style=\"color:" + this.players[this.playerTurn].color + "\">" + this.players[this.playerTurn].name + "</span>";
            this.cancelLastPlayButton.hidden = false;

            if (this.players[this.playerTurn].bot && (this.turnCount <= this.columnsAmount * this.rowsAmount)) {
                const gameGrid = this;
                setTimeout(function() {
                    gameGrid.players[gameGrid.playerTurn].play(gameGrid);
                }, 100);
            }
        }
    }

    cancelLastPlay() {
        this.cancelLastPlayButton.hidden = true;
        (this.playerTurn === 0) ? this.playerTurn = (this.players.length - 1) : this.playerTurn--;
        this.turnCount--;
        this.turnDiv.innerHTML = "Turn " + this.turnCount + " - <span style=\"color:" + this.players[this.playerTurn].color + "\">" + this.players[this.playerTurn].name + "</span>";

        const lastCell = this.movesHistory.pop();
        lastCell.id = "";
        lastCell.style.backgroundColor = "#FFFFFF";
    }

    boundariesCheck(row, column) {
        return ((row >= 0 && row < this.rowsAmount) && (column >= 0 && column < this.columnsAmount) );
    }

    streakCheck(row, column, playerName) {
        const start = {
            x: column,
            y: row
        }
        const direction = {
            x: [-1, 1, 0, 0, -1, 1, -1, 1],
            y: [0, 0, -1, 1, -1, 1, 1, -1]
        }
        let streakCells = [this.tableCells[row][column]];
        let streakLines = [];
        let offset, columnOffset, rowOffset;

        for (let i = 0; i < 8; i++) {
            offset = 1;
            columnOffset = start.x + direction.x[i];
            rowOffset = start.y + direction.y[i];

            while (offset < this.winRequirement && this.boundariesCheck(rowOffset, columnOffset)) {
                if (this.tableCells[rowOffset][columnOffset].id.split("_").pop() === playerName) {
                    streakCells.push(this.tableCells[rowOffset][columnOffset]);
                    offset++;
                    columnOffset += direction.x[i];
                    rowOffset += direction.y[i];
                } else {
                    offset = this.winRequirement;
                }
            }

            if ((i + 1) % 2 === 0) {
                if (streakCells.length >= this.winRequirement) {
                    streakLines.push(streakCells);
                }

                streakCells = [this.tableCells[row][column]];
            }
        }

        return streakLines;
    }

    getPlayableCells() {
        let playableCells = [];

        for (let column = 0; column < this.columnsAmount; column++) {
            const row = this.getLowestFreeRow(column);

            if (row >= 0) {
                const cell = {
                    row: row,
                    column: column
                }

                playableCells.push(cell);
            }
        }

        return playableCells;
    }

    winCondition(streakLines) {
        const streaks = streakLines.length;

        if (streaks > 0) {
            for (const streakCells of streakLines) {
                for (const cell of streakCells) {
                    cell.style.borderColor = "green";
                }
            }

            alert(this.players[this.playerTurn].name + " won and earned " + streaks + ((streaks === 1) ? " point!" : " points!"));
            this.players[this.playerTurn].score += streaks;
            this.cancelLastPlayButton.hidden = true;
            this.gameOver = "true";
        }
    }
}

function init() {
    window.onload = function() {
        const container = document.getElementById("container");
        container.style.border = "solid 2px black";
        container.style.textAlign = "center";
        new UserInterface(container);
    }
}