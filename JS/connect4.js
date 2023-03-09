export { init };

class UserInterface {
    constructor(container) {
        this.container = container;
        this.title = document.createElement("h2");
        this.title.textContent = "Connect 4";
        this.container.append(this.title);

        this.playersInputs = [];
        this.defaultColors = ["#fefc00", "#ff0303", "#1be7ba", "#550081", "#fe890d", "#21bf00", "#e45caf", "#939596"];
        this.rowSlider = this.addOptionSlider("Rows", 4, 18, 6);
        this.columnSlider = this.addOptionSlider("Columns", 4, 21, 7);
        this.streakSlider = this.addOptionSlider("Streak", 4, 12, 4);
        this.playerSlider = this.addOptionSlider("Players", 2, 8, 2);
        this.playerSlider.input.onchange = this.addPlayersInputs.bind(this);

        this.displayOptionsSliders();
        this.addPlayersInputs();
        this.createStartButton();
        this.createEndButton();
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

    displayOptionsSliders() {
        this.slidersOptionsDiv = document.createElement("div");
        this.slidersOptionsDiv.style.display = "flex";
        this.slidersOptionsDiv.style.flexDirection = "column";
        this.container.append(this.slidersOptionsDiv);

        const sliders = [this.rowSlider, this.columnSlider, this.playerSlider, this.streakSlider];

        for (const element of sliders) {
            const sliderOptionDiv = document.createElement("div");
            this.slidersOptionsDiv.append(sliderOptionDiv);

            for (let key in element) {
                if ( key === "label" || key === "input") {
                    sliderOptionDiv.append(element[key]);
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
                playerInputs.colorInput.value = this.defaultColors[i];
                playerInputs.botInput.type = "checkbox";

                this.playersInputs.push(playerInputs);
            }
        }

        this.displayPlayersInputs();
    }

    displayPlayersInputs() {
        this.playersInputsDiv = document.getElementById("playersInputsDiv");
        if (!this.playersInputsDiv) {
            this.playersInputsDiv = document.createElement("div");
            this.playersInputsDiv.id = "playersInputsDiv";
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
        this.gameGrid = new GameGrid(this.players, this.rowSlider.input.value, this.columnSlider.input.value, this.streakSlider.input.value);
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
        this.gameGrid = null;
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
    isMistake(enabledStreaks, column) {
        for (const enabledStreak of enabledStreaks) {
            if (enabledStreak.player !== this && enabledStreak.winningColumn === column) {
                console.log(this.name + " randomized a move that would enable " + enabledStreak.player.name + " to form a streak, randomizing again.");

                return true;
            }
        }

        return false;
    }

    nextMove(gameGrid, lowestFreeRows, playersStreaks, enabledStreaks) {
        for (const playerStreak of playersStreaks) {
            if (playerStreak.player === this && playerStreak.winningColumn !== null) {
                console.log(playerStreak.player.name + " can win.");
                return playerStreak.winningColumn;
            }
            if (playerStreak.player !== this && playerStreak.winningColumn !== null) {
                console.log(this.name + " will prevent " + playerStreak.player.name + " from finishing a streak.");
                return playerStreak.winningColumn;
            }
        }

        for (const enabledStreak of enabledStreaks) {
            if (enabledStreak.player === this && enabledStreak.winningColumn !== null && !this.isMistake(enabledStreaks, enabledStreak.winningColumn)) {
                console.log(enabledStreak.player.name + " will enable a streak for himself.");
                return enabledStreak.winningColumn;
            }
        }

        let nextMove = Math.floor(Math.random() * (gameGrid.columnsAmount));

        while (lowestFreeRows[nextMove] === null) {
            nextMove = Math.floor(Math.random() * (gameGrid.columnsAmount));
            while (this.isMistake(enabledStreaks, nextMove)) {
                nextMove = Math.floor(Math.random() * (gameGrid.columnsAmount));
            }
        }

        return nextMove;
    }

    checkPlayersStreaks(gameGrid, lowestFreeRows) {
        let playersStreaks = [];
        let streakLines, playerInfos;

        for (let column = 0; column < gameGrid.columnsAmount; column++) {
            if (lowestFreeRows[column] !== null) {
                for (let player = 0; player < gameGrid.players.length; player++) {
                    streakLines = gameGrid.streakCheck(lowestFreeRows[column], column, gameGrid.players[player].name);

                    if (streakLines.length > 0) {
                        playerInfos = {
                            player: gameGrid.players[player],
                            winningColumn: column
                        }

                        playersStreaks.push(playerInfos);
                    }
                }
            }
        }

        return playersStreaks;
    }

    play(gameGrid) {
        let lowestFreeRows = [];
        let secondLowestFreeRows = [];
        let lowestFreeRow = null;

        for (let column = 0; column < gameGrid.columnsAmount; column++) {
            lowestFreeRow = gameGrid.getLowestFreeRow(column);
            (lowestFreeRow >= 0) ? lowestFreeRows.push(lowestFreeRow) : lowestFreeRows.push(null);
            (lowestFreeRow >= 1) ? secondLowestFreeRows.push(lowestFreeRow - 1) : secondLowestFreeRows.push(null);
        }

        const playersStreaks = this.checkPlayersStreaks(gameGrid, lowestFreeRows);
        const enabledStreaks = this.checkPlayersStreaks(gameGrid, secondLowestFreeRows);
        console.log(this.name + " is playing.");
        /*if (playersStreaks.length > 0) {
            console.log("playerStreaks");
            console.log(playersStreaks);
        }
        if (enabledStreaks.length > 0) {
            console.log("enabledStreaks");
            console.log(enabledStreaks);
        }*/
        const nextMove = this.nextMove(gameGrid, lowestFreeRows, playersStreaks, enabledStreaks);

        gameGrid.placeToken(nextMove);
    }
}

class GameGrid {
    constructor(players, rows = 6, columns = 7, winRequirement = 4, backgroundColor = "#0069ff") {
        this.players = players;
        this.tableCells = [];
        this.movesHistory = [];
        this.rowsAmount = rows;
        this.columnsAmount = columns;
        this.winRequirement = winRequirement;
        this.backgroundColor = backgroundColor;
        this.playerTurn = 0;
        this.turnCount = 1;
    }

    drawGrid(container) {
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
                columnElement.style.backgroundColor = "white";
                columnElement.style.border = "solid 3px black";
                columnElement.style.borderRadius = "360px";
                columnElement.onclick = this.placeToken.bind(this, column);

                this.tableCells[row].push(columnElement);
                rowElement.appendChild(columnElement);
            }
        }

        if (this.players[this.playerTurn].bot) this.players[this.playerTurn].play(this);
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

            if (currentCell.id === "") {
                currentCell.setAttribute("id", this.turnCount.toString() + "_" + this.players[this.playerTurn].name);
                currentCell.style.backgroundColor = this.players[this.playerTurn].color;
                this.winCondition(this.streakCheck(row, column, this.players[this.playerTurn].name));
                (this.playerTurn === this.players.length - 1) ? this.playerTurn = 0 : this.playerTurn++;
            }

            this.turnCount++;
            this.movesHistory.push(currentCell);
            this.turnDiv.innerHTML = "Turn " + this.turnCount + " - <span style=\"color:" + this.players[this.playerTurn].color + "\">" + this.players[this.playerTurn].name + "</span>";
            if (this.players[this.playerTurn].bot && (this.turnCount <= this.columnsAmount * this.rowsAmount)) {
                const gameGrid = this;
                setTimeout(function() {
                    gameGrid.players[gameGrid.playerTurn].play(gameGrid);
                }, 100);
            }
        }
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

    winCondition(streakLines) {
        const streaks = streakLines.length;

        if (streaks > 0) {
            for (const streakCells of streakLines) {
                for (const cell of streakCells) {
                    cell.style.borderColor = "green";
                }
            }

            console.log(this.players[this.playerTurn].name + " won and earned " + streaks + ((streaks === 1) ? " point!" : " points!"));
            this.players[this.playerTurn].score += streaks;
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