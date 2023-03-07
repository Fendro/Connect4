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

    show() {
        this.endButton.remove();
        this.container.append(this.slidersOptionsDiv);
        this.container.append(this.playersInputsDiv);
        this.container.append(this.startButton);
    }

    hide() {
        this.slidersOptionsDiv.remove();
        this.playersInputsDiv.remove();
        this.startButton.remove();
        this.container.append(this.endButton);
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
        slider.input.tooltip = "hello";

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
                    colorInput: document.createElement("input")
                }

                playerInputs.nameInput.id = "player" + (i + 1).toString() + "-nameInput";
                playerInputs.nameInput.value = "Player " + (i + 1).toString();

                playerInputs.colorInput.id = "player" + (i + 1).toString() + "-colorPicker";
                playerInputs.colorInput.type = "color";
                playerInputs.colorInput.value = this.defaultColors[i];

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

    createStartButton() {
        this.startButton = document.createElement("button");
        this.startButton.style.borderRadius = "7.5px";
        this.startButton.textContent = "Start game";
        this.startButton.style.margin = "7.5px";
        this.startButton.onclick = this.startGame.bind(this);

        this.container.appendChild(this.startButton);
    }

    startGame() {
        this.players = [];
        for (let i = 0; i < this.playerSlider.input.value; i++) {
            this.players.push(new Player(this.playersInputs[i].nameInput.value, this.playersInputs[i].colorInput.value));
        }
        this.gameGrid = new GameGrid(this.players, this.rowSlider.input.value, this.columnSlider.input.value, this.streakSlider.input.value);
        this.gameGrid.drawGrid(this.container);
        this.hide();
    }

    createEndButton() {
        this.endButton = document.createElement("button");
        this.endButton.style.borderRadius = "7.5px";
        this.endButton.textContent = "End game";
        this.endButton.style.margin = "7.5px";
        this.endButton.onclick = this.endGame.bind(this);
    }

    endGame() {
        this.gameGrid.turnDiv.remove();
        this.gameGrid.tableElement.remove();
        this.gameGrid = null;
        this.show();
    }
}

class Player {
    constructor(name, color) {
        this.name = name;
        this.color = color;
        this.score = 0;
    }
}

class Bot extends Player {
    nextMove(tableCells, rowsAmount, columnsAmount) {
        this.checkPlayersStreaks(tableCells, rowsAmount, columnsAmount);
    }

    checkPlayersStreaks(tableCells, rowsAmount, columnsAmount) {
        let row;
        let aboutToWin = []

        for (let row = 0; row < rowsAmount - 1; row++) {
            for (let column = 0; column < columnsAmount - 1; column++) {
                row = this.getLowestFreeRow(tableCells[row][column]);
                for (let player = 0; player < players.length; player++) {
                    if (this.checkPlayersStreaks(row, column, player)) aboutToWin += players[player];
                }
            }
        }
    }
}

class GameGrid {
    constructor(players, rows = 6, columns = 7, winRequirement = 4, backgroundColor = "#0069ff") {
        this.players = players;
        this.tableCells = [];
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
        this.tableElement.style.minWidth = "400px";
        this.tableElement.style.minHeight = "400px";
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
            this.turnDiv.innerHTML = "Turn " + this.turnCount + " - <span style=\"color:" + this.players[this.playerTurn].color + "\">" + this.players[this.playerTurn].name + "</span>";
        }
    }

    streakCheck(row, column, playerName) {
        const start = {
            x: column,
            y: row
        }
        const incrementX = [-1, 1, 0, 0, -1, 1, -1, 1];
        const incrementY = [0, 0, -1, 1, -1, 1, 1, -1];
        let streakCells = [this.tableCells[row][column]];
        let streak = 0;

        for (let i = 0; i < 8; i++) {
            for (let offset = 1, x = start.x + incrementX[i], y = start.y + incrementY[i]; offset < this.winRequirement && ((x >= 0) && (x < this.columnsAmount) && (y >= 0) && (y < this.rowsAmount)); offset++, x += incrementX[i], y += incrementY[i]){
                if (this.tableCells[y][x].id.split("_").pop() === playerName) streakCells.push(this.tableCells[y][x]);
            }

            if ((i + 1) % 2 === 0) {
                if (streakCells.length >= this.winRequirement) {
                    for (const cell of streakCells) {
                        cell.style.borderColor = "green";
                    }
                    streak++;
                }

                streakCells = [this.tableCells[row][column]];
            }
        }

        return streak;
    }

    winCondition(streak) {
        if (streak > 0) {
            alert(this.players[this.playerTurn].name + " won and earned " + streak + ((streak === 1) ? " point!" : " points!"));
            this.players[this.playerTurn].score += streak;
        }
    }
}

window.onload = function() {
    const container = document.getElementById("container");
    container.style.border = "solid 2px black";
    container.style.textAlign = "center";
    new UserInterface(container);
}