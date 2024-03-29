import React from "react";
import PropTypes from "prop-types";
import Cell from "./Cell";

import "./Board.css";
class Board extends React.Component {
  state = this.getInitialState();

  getInitialState() {
    const initialState = {
      grid: this.createNewBoard(),
      minesCount: this.props.mines,
      gameStatus: this.props.gameStatus,
      revealedCells: 0
    };
    return initialState;
  }

  // Board utilities
  createNewBoard(click = null) {
    const grid = [];
    const rows = this.props.width;
    const columns = this.props.height;
    const minesCount = this.props.mines;
    const minesArray = this.getRandomMines(minesCount, columns, rows, click);

    for (let i = 0; i < columns; ++i) {
      grid.push([]);
      for (let j = 0; j < rows; ++j) {
        const gridCell = new GridCell(i, j, minesArray.includes(i * rows + j));
        this.addGridCell(grid, gridCell);
      }
    }

    return grid;
  }

  getRandomMines(amount, columns, rows, starter = null) {
    const minesArray = [];
    const limit = columns * rows;
    const minesPool = [...Array(limit).keys()];

    if (starter > 0 && starter < limit) {
      minesPool.splice(starter, 1);
    }

    for (let i = 0; i < amount; ++i) {
      const n = Math.floor(Math.random() * minesPool.length);
      minesArray.push(...minesPool.splice(n, 1));
    }

    return minesArray;
  }


  //y represents the row and x represents the column
  addGridCell(grid, gridCell) {
    const y = grid.length - 1;
    const x = grid[y].length;
    const lastGridCell = gridCell;
    const neighbours = this.getNeighbours(grid, y, x);

    for (let neighbourGridCell of neighbours) {
      if (lastGridCell.isMine) {
        neighbourGridCell.n += 1;
      } else if (neighbourGridCell.isMine) {
        lastGridCell.n += 1;
      }
    }

    grid[y].push(gridCell);
  }

  revealBoard() {
    const grid = this.state.grid;

    for (const row of grid) {
      for (const gridCell of row) {
        gridCell.isRevealed = true;
      }
    }

    this.setState({});
  }

  restartBoard() {
    this.setState(this.getInitialState());
  }

  /* Helpers */
  getNeighbours(grid, y, x) {
    const neighbours = [];
    const currentRow = grid[y];
    const prevRow = grid[y - 1];
    const nextRow = grid[y + 1];

    if (currentRow[x - 1]) neighbours.push(currentRow[x - 1]);
    if (currentRow[x + 1]) neighbours.push(currentRow[x + 1]);
    if (prevRow) {
      if (prevRow[x - 1]) neighbours.push(prevRow[x - 1]);
      if (prevRow[x]) neighbours.push(prevRow[x]);
      if (prevRow[x + 1]) neighbours.push(prevRow[x + 1]);
    }
    if (nextRow) {
      if (nextRow[x - 1]) neighbours.push(nextRow[x - 1]);
      if (nextRow[x]) neighbours.push(nextRow[x]);
      if (nextRow[x + 1]) neighbours.push(nextRow[x + 1]);
    }

    return neighbours;
  }

  revealEmptyNeigbhours(grid, y, x) {
    const neighbours = [...this.getNeighbours(grid, y, x)];
    grid[y][x].isFlagged = false;
    grid[y][x].isRevealed = true;

    while (neighbours.length) {
      const neighbourGridCell = neighbours.shift();

      if (neighbourGridCell.isRevealed) {
        continue;
      }
      if (neighbourGridCell.isEmpty) {
        neighbours.push(
          ...this.getNeighbours(grid, neighbourGridCell.y, neighbourGridCell.x)
        );
      }

      neighbourGridCell.isFlagegd = false;
      neighbourGridCell.isRevealed = true;
    }
  }

  checkVictory() {
    const { height, width, mines } = this.props;
    const revealed = this.getRevealed();

    if (revealed >= height * width - mines) {
      this.killBoard("win");
    }
  }

  getRevealed = () => {
    return this.state.grid
      .reduce((r, v) => {
        r.push(...v);
        return r;
      }, [])
      .map(v => v.isRevealed)
      .filter(v => !!v).length;
  };

  killBoard(type) {
    const message = type === "lost" ? "You lost." : "You won.";

    this.setState({ gameStatus: message }, () => {
      this.revealBoard();
    });
  }

  // Cell click handlers
  handleLeftClick(y, x) {
    const grid = this.state.grid;
    const gridCell = grid[y][x];

    gridCell.isClicked = true;

    // Might want to add an "isUnknown" state later
    if (gridCell.isRevealed || gridCell.isFlagged) {
      return false;
    }

    // End game if mine
    if (gridCell.isMine) {
      this.killBoard("lost");
      return false;
    }

    if (gridCell.isEmpty) {
      this.revealEmptyNeigbhours(grid, y, x);
    }

    gridCell.isFlagged = false;
    gridCell.isRevealed = true;

    this.setState({}, () => {
      this.checkVictory();
    });
  }

  // Cell right-click handler
  handleRightClick(e, y, x) {
    e.preventDefault();
    const {grid} = this.state;
    let minesLeft = this.state.minesCount;
    let check = false;
     
    // Check if already revealed
    if (grid[y][x].isRevealed){

      if(this.getFlagCount(y,x) === this.getMineCount( y, x))
      {
        if(x === (this.props.height-1)){
          if(!grid[y][x-1].isFlagged && !grid[y][x-1].isMine ) grid[y][x-1].isRevealed = true;
          if(!grid[y+1][x].isFlagged && !grid[y+1][x].isMine) grid[y+1][x].isRevealed = true;
          if(!grid[y-1][x].isFlagged && !grid[y-1][x].isMine) grid[y-1][x].isRevealed = true;
          if(!grid[y+1][x-1].isFlagged && !grid[y+1][x-1].isMine) grid[y+1][x-1].isRevealed = true;
          if(!grid[y-1][x-1].isFlagged && !grid[y-1][x-1].isMine) grid[y-1][x-1].isRevealed = true;
        }
        else if(x === 0){
          if(!grid[y][x+1].isFlagged && !grid[y][x+1].isMine) grid[y][x+1].isRevealed = true;
          if(!grid[y+1][x].isFlagged && !grid[y+1][x].isMine) grid[y+1][x].isRevealed = true;
          if(!grid[y-1][x].isFlagged && !grid[y-1][x].isMine) grid[y-1][x].isRevealed = true;
          if(!grid[y+1][x+1].isFlagged && !grid[y+1][x+1].isMine) grid[y+1][x+1].isRevealed = true;
          if(!grid[y-1][x+1].isFlagged && !grid[y-1][x+1].isMine) grid[y-1][x+1].isRevealed = true;
        }
        else if(y === (this.props.width-1)){
          if(!grid[y][x-1].isFlagged && !grid[y][x-1].isMine) grid[y][x-1].isRevealed = true;
          if(!grid[y][x+1].isFlagged && !grid[y][x+1].isMine) grid[y][x+1].isRevealed = true;
          if(!grid[y-1][x].isFlagged && !grid[y-1][x].isMine) grid[y-1][x].isRevealed = true;
          if(!grid[y-1][x-1].isFlagged && !grid[y-1][x-1].isMine) grid[y-1][x-1].isRevealed = true;
          if(!grid[y-1][x+1].isFlagged && !grid[y-1][x+1].isMine) grid[y-1][x+1].isRevealed = true;
        }
        else if(y === 0){
          if(!grid[y][x-1].isFlagged && !grid[y][x-1].isMine) grid[y][x-1].isRevealed = true;
          if(!grid[y][x+1].isFlagged && !grid[y][x+1].isMine) grid[y][x+1].isRevealed = true;
          if(!grid[y+1][x].isFlagged && !grid[y+1][x].isMine) grid[y+1][x].isRevealed = true;
          if(!grid[y+1][x-1].isFlagged && !grid[y+1][x-1].isMine) grid[y+1][x-1].isRevealed = true;
          if(!grid[y+1][x+1].isFlagged && !grid[y+1][x+1].isMine) grid[y+1][x+1].isRevealed = true;
        }
        else if(x !== (this.props.height-1) && x !== 0 && y !== (this.props.width-1) && y !== 0){
          if(!grid[y][x+1].isFlagged && !grid[y][x+1].isMine) grid[y][x+1].isRevealed = true;
          if(!grid[y][x-1].isFlagged && !grid[y][x-1].isMine) grid[y][x-1].isRevealed = true;
          if(!grid[y+1][x].isFlagged && !grid[y+1][x].isMine) grid[y+1][x].isRevealed = true;
          if(!grid[y-1][x].isFlagged && !grid[y-1][x].isMine) grid[y-1][x].isRevealed = true;
          if(!grid[y+1][x+1].isFlagged && !grid[y+1][x+1].isMine) grid[y+1][x+1].isRevealed = true;
          if(!grid[y+1][x-1].isFlagged && !grid[y+1][x-1].isMine) grid[y+1][x-1].isRevealed = true;
          if(!grid[y-1][x+1].isFlagged && !grid[y-1][x+1].isMine) grid[y-1][x+1].isRevealed = true;
          if(!grid[y-1][x-1].isFlagged && !grid[y-1][x-1].isMine) grid[y-1][x-1].isRevealed = true;
        }
        check = true;
      }
      else {
        return false;
      }
    }

    if (grid[y][x].isFlagged) {
      grid[y][x].isFlagged = false;
      minesLeft++;
    } else if(check === false){
      grid[y][x].isFlagged = true;
      minesLeft--;
    }

    this.setState({
      minesCount: minesLeft
    });
  }
 //this function returns the number of mines around a cell when given the coordinates of the cell
  getMineCount( y, x){
    let MineCount = 0;
    const {grid} = this.state;
    if(x === (this.props.height-1)){
      if(grid[y][x-1].isMine) MineCount++;
      if(grid[y+1][x].isMine) MineCount++;
      if(grid[y-1][x].isMine) MineCount++;
      if(grid[y+1][x-1].isMine) MineCount++;
      if(grid[y-1][x-1].isMine) MineCount++;
      return MineCount;
    }
    if(x === 0){
      if(grid[y][x+1].isMine) MineCount++;
      if(grid[y+1][x].isMine) MineCount++;
      if(grid[y-1][x].isMine) MineCount++;
      if(grid[y+1][x+1].isMine) MineCount++;
      if(grid[y-1][x+1].isMine) MineCount++;
      return MineCount;
    }
    if(y === (this.props.width-1)){
      if(grid[y][x+1].isMine) MineCount++;
      if(grid[y][x-1].isMine) MineCount++;
      if(grid[y-1][x].isMine) MineCount++;
      if(grid[y-1][x+1].isMine) MineCount++;
      if(grid[y-1][x-1].isMine) MineCount++;
      return MineCount;
    }
    if(y === 0){
      if(grid[y][x+1].isMine) MineCount++;
      if(grid[y][x-1].isMine) MineCount++;
      if(grid[y+1][x].isMine) MineCount++;
      if(grid[y+1][x+1].isMine) MineCount++;
      if(grid[y+1][x-1].isMine) MineCount++;
      return MineCount;
    }
    if(x !== (this.props.height-1) && x !== 0 && y !== (this.props.width-1) && y !== 0){
      if(grid[y][x+1].isMine) MineCount++;
      if(grid[y][x-1].isMine) MineCount++;
      if(grid[y+1][x].isMine) MineCount++;
      if(grid[y-1][x].isMine) MineCount++;
      if(grid[y+1][x+1].isMine) MineCount++;
      if(grid[y+1][x-1].isMine) MineCount++;
      if(grid[y-1][x+1].isMine) MineCount++;
      if(grid[y-1][x-1].isMine) MineCount++;
      return MineCount;
    }
  }
  
 //this function returns the number of flags around a cell when given the coordinates of the cell
  getFlagCount( y, x){
    let flagCount = 0;
    const {grid} = this.state;
    if(x === (this.props.height-1)){
      if(grid[y][x-1].isFlagged) flagCount++;
      if(grid[y+1][x].isFlagged) flagCount++;
      if(grid[y-1][x].isFlagged) flagCount++;
      if(grid[y+1][x-1].isFlagged) flagCount++;
      if(grid[y-1][x-1].isFlagged) flagCount++;
      return flagCount;
    }
    if(x === 0){
      if(grid[y][x+1].isFlagged) flagCount++;
      if(grid[y+1][x].isFlagged) flagCount++;
      if(grid[y-1][x].isFlagged) flagCount++;
      if(grid[y+1][x+1].isFlagged) flagCount++;
      if(grid[y-1][x+1].isFlagged) flagCount++;
      return flagCount;
    }
    if(y === (this.props.width-1)){
      if(grid[y][x+1].isFlagged) flagCount++;
      if(grid[y][x-1].isFlagged) flagCount++;
      if(grid[y-1][x].isFlagged) flagCount++;
      if(grid[y-1][x+1].isFlagged) flagCount++;
      if(grid[y-1][x-1].isFlagged) flagCount++;
      return flagCount;
    }
    if(y === 0){
      if(grid[y][x+1].isFlagged) flagCount++;
      if(grid[y][x-1].isFlagged) flagCount++;
      if(grid[y+1][x].isFlagged) flagCount++;
      if(grid[y+1][x+1].isFlagged) flagCount++;
      if(grid[y+1][x-1].isFlagged) flagCount++;
      return flagCount;
    }
    if(x !== (this.props.height-1) && x !== 0 && y !== (this.props.width-1) && y !== 0){
      if(grid[y][x+1].isFlagged) flagCount++;
      if(grid[y][x-1].isFlagged) flagCount++;
      if(grid[y+1][x].isFlagged) flagCount++;
      if(grid[y-1][x].isFlagged) flagCount++;
      if(grid[y+1][x+1].isFlagged) flagCount++;
      if(grid[y+1][x-1].isFlagged) flagCount++;
      if(grid[y-1][x+1].isFlagged) flagCount++;
      if(grid[y-1][x-1].isFlagged) flagCount++;
      return flagCount;
    }
  }



  // Rendering functions
  renderBoard() {
    const grid = this.state.grid;

    return grid.map(row => {
      const rowCells = row.map(gridCell => (
        <Cell
          key={gridCell.y * row.length + gridCell.x}
          onClick={() => this.handleLeftClick(gridCell.y, gridCell.x)}
          cMenu={e => this.handleRightClick(e, gridCell.y, gridCell.x)}
          value={gridCell}
        />
      ));

      return <div className="row">{rowCells}</div>;
    });
  }

  render() {
    return (
      <div className="board">
        <div className="mines-count">
          <span>Mines: {this.state.minesCount}</span>
        </div>
        <div className="grid">{this.renderBoard()}</div>
      </div>
    );
  }
}

class GridCell {
  constructor(y, x, isMine) {
    this.x = x;
    this.y = y;
    this.n = 0;
    this.isMine = isMine;
    this.isRevealed = false;
    this.isFlagged = false;
    this.isUnknown = false;
    this.isClicked = false;
  }
  get isEmpty() {
    return this.n === 0 && !this.isMine;
  }
}

Board.propTypes = {
  height: PropTypes.number,
  width: PropTypes.number,
  mines: PropTypes.number
};

export default Board;
