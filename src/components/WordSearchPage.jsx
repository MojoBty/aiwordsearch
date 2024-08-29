import { useState } from "react";
import classNames from "classnames";
import PropTypes from 'prop-types';
export default function WordSearchPage({ wordsearch, words }) {

  const [solvedWords, setSolvedWords] = useState(new Map())

  let wordSearch = wordsearch
  // let newWordSearch = wordSearch.wordSearch

  const [selectedLetters, setSelectedLetters] = useState("")
  const [selectedCells, setSelectedCells] = useState([])
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [lastCell, setLastCell] = useState(null);

  const isValidMove = (prevCell, newCell) => {
    if (!prevCell) return true;
    

    const rowDiff = Math.abs(selectedCells[0][0] - newCell[0]);
    const colDiff = Math.abs(selectedCells[0][1] - newCell[1]);

    
    return (
        (rowDiff ===  0) || // Vertical
        (colDiff === 0) || // Horizontal
        (rowDiff === colDiff)    // Diagonal
    );
  }

  const handleMouseDown = (e, row, col) => {
    setIsMouseDown(true)
    setSelectedCells([[ row, col ]]);
    setLastCell([ [row, col] ]);
    setSelectedLetters(e.target.textContent)
  }

  const handleMouseUp = () => {
    setIsMouseDown(false)

    console.log(selectedLetters)
    console.log(words)
    console.log(selectedLetters.toLowerCase())
    if (words.includes(selectedLetters.toLowerCase()) ) {
      const newSolvedWords = new Map(solvedWords);
        newSolvedWords.set(selectedLetters.toUpperCase(), selectedCells); // Add the new solved word
        setSolvedWords(newSolvedWords);
        console.log(newSolvedWords);
    }

    setSelectedLetters('')
    setSelectedCells([])
  }

  const handleMouseEnter = (e, row, col) => {
    if (isMouseDown) {
      const newCell = [ row, col ]
      if (isValidMove(lastCell, newCell)) {
        setSelectedCells((prevCells) => [...prevCells, newCell]);
        setLastCell([ [row, col] ])
        setSelectedLetters((prevLetter) => prevLetter + e.target.textContent)
      } else {
        setSelectedCells([])
      }
    } 
  }

  const isCellPartOfSolvedWord = (rowIndex, colIndex) => {
    for (const key of solvedWords.keys()) {
      console.log(key)
      const cells = solvedWords.get(key)
      if (cells.some(([r, c]) => r === rowIndex && c === colIndex)) {
        return true
      }
    }
    return false
  }

  return (
    <div className="flex flex-col items-center py-10" onMouseUp={handleMouseUp}>
      <div className="inline-block">
        
        {wordSearch.board.map((row, rowIndex) => (
          <div className="flex" key={rowIndex}>
            {row.map((letter, colIndex) => {
              const isSelected = selectedCells.some(
                ([r, c]) => r === rowIndex && c === colIndex
              );

            const isPartOfSolvedWord = isCellPartOfSolvedWord(rowIndex, colIndex);

            return (
              <div 
                className={classNames("flex text-[1.3rem] font-medium text-center items-center justify-center align-middle cursor-pointer m-[8px] w-[35px] h-[35px]", 
                  {'bg-gray-300': isSelected, 'rounded-[50%]': isSelected, 'text-gray-400' : isPartOfSolvedWord})} 
                key={colIndex}
                onMouseDown={(e) => handleMouseDown(e, rowIndex, colIndex)}
                onMouseEnter={(e) => handleMouseEnter(e, rowIndex, colIndex)}
                onMouseUp={handleMouseUp}
              >
                {letter}
              </div>
            )})}
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-8 w-[40rem] flex-wrap items-center align-middle justify-center">
        {words.map((item, index) => (
          <h2 className={solvedWords.has(item.toUpperCase()) ? "text-gray-400 line-through" : "font-medium"} key={index}>{item.toUpperCase()}</h2>
        ))}
      </div>
      
    </div>
  )
}

WordSearchPage.propTypes = {
  wordsearch: PropTypes.shape({
    wordsearch: PropTypes.string.isRequired,
  }).isRequired,
  words: PropTypes.arrayOf(PropTypes.string).isRequired
};