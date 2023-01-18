import React, { useState } from "react";
import "./style.css";

export default function App() {
  const [active, setActive] = useState({})
  const [lines] = useState(initial)
  const [score, setScore] = useState(0)

  const handleCellClick = current => () => {
    const { row, col } = current;
    if (!active.row && active.row !== 0) return;
    if (lines[row][col] === 0) {
      let nextLines = moveActive(lines, active, row, col)

      // add score for moved ball
      const scores = addScore({nextLines, setScore, current})

      // if moved ball didn't add score, add new balls
      if (scores === 0) {
        const {items, nextFields} = generateNext3(nextLines);
        nextLines = nextFields;
  
        items.forEach(curr => {
          addScore({nextLines, setScore, current: curr})
        })
      }
    }
    setActive({})
  }

  return (
    <div class="app">
      {
        lines.map((columns, row) => (
          <div 
            class="line" key={row}
          >{columns.map((value, col) => {
            const current = {row, col};
            return (
              <Cell 
                current={current} 
                onClick={handleCellClick(current)}
              >
                <Ball 
                  lines={lines}
                  active={active} 
                  current={current} 
                  onClick={setActive} 
                  value={value} 
                />
              </Cell>
            )
          })}</div>
        ))
      }<div class="score">{score || ""}</div>
    </div>
  );
}

const Cell = ({ current, children, onClick }) => {
  const { col } = current;
  return (
    <div                 
      onClick={onClick}
      class="cell" 
      key={col}
    >
      {children}
    </div>
  )
}

const Ball = ({ active, onClick, current, value, lines }) => {
  if (!value) return null;
  const isActive = active.row === current.row && active.col === current.col;

  return  <div 
    class={isActive ? "bouncing ball" : "ball"}
    onClick={e => {
      // activate item
      e.stopPropagation();
      if (lines[current.row][current.col]) {
        onClick(current)
      }
    }}
    style={{
      color: colors[value],
    }} 
  />
}

const colors = [
  "wheat",
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "aqua",
  "magenta"
]

const maxX = 9;
const maxY = maxX;


const random = (max = maxX) => Math.floor(Math.random() * max);

const generateNext3 = (nextFields, items = []) => {
  // 3 balls generated, exit
  if (items.length === 3) {
    return {nextFields,items};
  }
  // check if every field is filled
  if (nextFields.every(l => l.every(i => i))) {
    // all filled => END GAME
    return {nextFields,items}
  }
  // generate new ball
  const x = random()
  const y = random()
  const v = random(7) + 1

  // if no ball in the field, add it
  if (!nextFields[x][y]) {
    nextFields[x][y] = v;
    items.push({row: x, col: y, value: v})
  }
  return generateNext3(nextFields, items)
}

const moveActive = (fields, active, row, col) => {
  const nextFields = fields;
  const curr = fields[active.row][active.col];
  nextFields[active.row][active.col] = 0;
  nextFields[row][col] = curr;
  return nextFields
}

const addScore = ({nextLines, setScore, current}) => {

  const findNextItem = line => {
    const { x, y } = line.getCurrent();
    const nextX = line.getNextX(x);
    const nextY = line.getNextY(y);
    // should be in bounds
    if (nextX < maxX && nextY < maxY && nextX >= 0 && nextY >= 0) {
      // value should match
      if (nextLines[nextX][nextY] === nextLines[x][y]) {
        return {
          x: nextX,
          y: nextY
        }
      }
    }
    return false
  }

  const brakeLine = config => {
    // incremental direction
    config.items = [{ x: current.row, y: current.col }]
    config.getCurrent = function() { return this.items[this.items.length - 1] };
    while (findNextItem(config)) {
      config.items.push(findNextItem(config))
    }
    
    // reverse direction
    config.getNextX = config.getPrevX;
    config.getNextY = config.getPrevY;
    config.getCurrent = function() { return this.items[0] };
    while (findNextItem(config)) {
      config.items.unshift(findNextItem(config))
    }

    return config.items;
  }

  const toRight = {
    getNextX: x => x,
    getNextY: y => y + 1,
    getPrevX: x => x,
    getPrevY: y => y - 1,
  }
  const toBottom = {
    getNextX: x => x + 1,
    getNextY: y => y,
    getPrevX: x => x - 1,
    getPrevY: y => y,
  }
  const toBottomRight = {
    getNextX: x => x + 1,
    getNextY: y => y + 1,
    getPrevX: x => x - 1,
    getPrevY: y => y - 1,
  }
  const toTopRight = {
    getNextX: x => x + 1,
    getNextY: y => y - 1,
    getPrevX: x => x - 1,
    getPrevY: y => y + 1,
  }

  const items = [
    brakeLine(toRight),
    brakeLine(toBottom),
    brakeLine(toBottomRight),
    brakeLine(toTopRight)
  ]

  let scores = 0;
  items.forEach(line => {
    if (line.length >= 5) {
      scores+=line.length;
      // clear field
      line.forEach(item => {
        nextLines[item.x][item.y] = 0;
      })
    }
  })

  setScore(score => score + scores)

  return scores;
}

let initialFields = []

for (let i = 0; i < maxX; i++) {
  let line = []
  for (let j = 0; j < maxY; j++) {
    line.push(0)
  }
  initialFields.push(line)
}

const initial = generateNext3(initialFields).nextFields


