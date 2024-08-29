
import {  } from 'react'

import './App.css'
import ThemeInputForm from './components/ThemeInputForm'
import WordSearchPage from './components/WordSearchPage'

import { useState } from 'react';

function App() { 
  const [ wordsearch, setWordsearch ] = useState({})
  const [words, setWords] = useState([])
  const [ isFormVisible, setFormVisible ] = useState(true)

  const handleWordsearchInput = (wordsearch, words) => {
    setWordsearch(wordsearch)
    setWords(words)

    setFormVisible(false)
  }

  return (
    <div>
      { isFormVisible ? (
        <ThemeInputForm onDataChange={handleWordsearchInput}/>
        ) : (
        <WordSearchPage wordsearch={wordsearch} words={words}/>
        )}
    </div>
  )
}

export default App
