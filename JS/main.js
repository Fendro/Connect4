class UserInterface {
    constructor() {
        this.title = "Connect 4";
        this.nameInputs = [];
        this.colorPickers = [];
        this.defaultColors = ["#fefc00", "#ff0303", "#1be7ba", "#550081", "#fe890d", "#21bf00", "#e45caf", "#939596"];
        this.rowSlider = this.addSlider("Row", 4, 18, 6);
        this.columnSlider = this.addSlider("Column", 4, 21, 7);
        this.playerSlider = this.addSlider("Player", 2, 8, 2);
        this.playerSlider.onchange = this.manageNameInputs.bind(this);
        this.playerSlider.onchange = this.manageColorPickers.bind(this);
    }

    addSlider(name, min, max, defaultValue) {
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
        slider.input.value = defaultValue;

        return slider;
    }

    playerInput() {

    }

    manageNameInputs() {
        for (let i = 0; i < this.getPlayerCount(); i++) {
            if (!this.nameInputs[i]) {
                let input = document.createElement("input");
                input.id = "player" + (i + 1).toString() + "-nameInput";
                input.value = "Player " + (i + 1).toString();
                this.nameInputs.push(input);
            }
        }
    }

    manageColorPickers() {
        for (let i = 0; i < this.getPlayerCount(); i++) {
            if (!this.colorPickers[i]) {
                let picker = document.createElement("input");
                picker.id = "player" + (i + 1).toString() + "-colorPicker";
                picker.value = this.defaultColors[i];
                this.colorPickers.push(picker);
            }
        }
    }

    display(container) {
        this.manageNameInputs();
        this.manageColorPickers();
        const sliders = [this.rowSlider, this.columnSlider, this.playerSlider, this.nameInputs, this.colorPickers];
        const inputs = [this.nameInputs, this.colorPickers];

        container.append(this.title);

        for (let slider of sliders) {
            for (let key in slider) {
                console.log(key);
                if (key === "label" || key === "input") container.append(slider[key]);
            }
        }
    }

    hide() {

    }

    getRowCount() { return this.rowSlider.input.value; }
    getColumnCount() { return this.columnSlider.input.value; }
    getPlayerCount() { return this.playerSlider.input.value; }
}

class Player {
    constructor(name, color) {
        this.name = name;
        this.color = color;
        this.score = 0;
    }

    getName() { return this.name; }
    setName(name) { this.name = name; }
    getColor() { return this.color; }
    setColor(color) { this.color = color; }
    getScore() { return this.score; }
    setScore(int) { this.score = int; }
}

class GameGrid {
    constructor(rows = 6, columns = 7, winRequirement = 4, backgroundColor = "#0069FFFF", startingPlayer = 0) {
        this.players = [];
        this.tableCells = [];
        this.rowsAmount = rows;
        this.columnsAmount = columns;
        this.winRequirement = winRequirement;
        this.backgroundColor = backgroundColor;
        this.playerTurn = startingPlayer;
        this.turn = 0;
    }

    addPlayer(playerNames, playerColors) {
        for (let i = 0; i < 2; i++) {
            this.players.push(new Player(playerNames[i], playerColors[i]));
        }
    }

    drawGrid(container) {
        this.tableElement = document.createElement("table");
        this.tableElement.style.backgroundColor = this.backgroundColor;
        this.tableElement.style.border = "solid 4px black";
        this.tableElement.style.minWidth = "400px";
        this.tableElement.style.minHeight = "400px";
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

    placeToken(column) {
        this.turn++;
        let rowNumber = 0;

        while (rowNumber < this.rowsAmount - 1 && this.tableCells[rowNumber + 1][column].id === "") {
            rowNumber++;
        }

        const currentCell = this.tableCells[rowNumber][column];

        if (currentCell.id === "") {
            currentCell.setAttribute("id", this.turn.toString() + "_" + this.players[this.playerTurn].name);
            currentCell.style.backgroundColor = this.players[this.playerTurn].color;
            this.winCondition(this.streakCheck(rowNumber, column));
            (this.playerTurn === this.players.length - 1) ? this.playerTurn = 0 : this.playerTurn++;
        }
    }

    streakCheck(row, column) {
        const start = {
            x: column,
            y: row
        }
        const incrementX = [-1, 1, 0, 0, -1, 1, -1, 1];
        const incrementY = [0, 0, -1, 1, -1, 1, 1, -1];
        let streakCells = [this.tableCells[row][column]];
        let streak = 0;

        for (let i = 0; i < 8; i++) {
            for (let offset = 1, x = start.x + incrementX[i], y = start.y + incrementY[i]; offset < 4 && ((x >= 0) && (x < this.columnsAmount) && (y >= 0) && (y < this.rowsAmount)); offset++, x += incrementX[i], y += incrementY[i]){
                if (this.tableCells[y][x].id.split("_").pop() === this.players[this.playerTurn].name) streakCells.push(this.tableCells[y][x]);
            }

            if ((i + 1) % 2 === 0) {
                if (streakCells.length >= this.winRequirement) {
                    for (let cell of streakCells) {
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

const playerNames = ["Joueur 1", "Joueur 2", "Joueur 3", "Joueur 4"];
const playerColors = ["#EACD6D", "#FF3939", "#39FFDB", "#39FF49"];

window.onload = function() {
    const container = document.getElementById("container");
    const userInterface = new UserInterface();
    const gameGrid = new GameGrid(9, 9, 4);

    userInterface.display(container);

    //gameGrid.addPlayer(playerNames, playerColors);
    //gameGrid.drawGrid(container);
}