import { useState } from "react";


import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

import OpenAI from "openai";
import axios from "axios";
import PropTypes from 'prop-types'

export default function ThemeInputForm({ onDataChange }) {

  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false)

  const getWordsearch = async() => {
    setLoading(true)
    const openai = new OpenAI( {apiKey: import.meta.env.VITE_OPENAI_API_KEY, dangerouslyAllowBrowser: true});


    const prompt = `Generate 8 words that relate to the following theme: ${inputValue}. Make sure none of the words are over 11 letters. Include only the JSON response, do not include \`\`\`json or \`\`\`.  Use the following JSON schema:
      {
        "type": "object",
        "properties": {
          "words": {
            "type": "array",
            "description": "A list of words that are related to the given theme.",
            "items": {
              "type": "string"
            },
            "minItems": 8
            "maxItems": 8
          },
        "required": ["words"]
      }
    `;
    

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o",
    });

    
    let response = JSON.parse(completion.choices[0].message.content)
    let words = response.words

    const data = {
      dimensions: [14, 14],
      language: 'en',
      words: words
    }
    

    axios.post('http://aiwordsearch/api/process', data)
      .then(response => {
        console.log('Response data:', response.data);
        onDataChange(response.data, words)
      })
      .catch(error => {
        console.error('Error making the request:', error);
    });

    
  }

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      getWordsearch()
    } catch (error) {
      console.error("Error fetching data: ", error)
    }
  }

  return (
    <div className="flex flex-col gap-10 items-center justify-center align-middle h-screen text-center">
      <h1 className="text-[1.6rem] sm:text-[2rem] font-medium">
        What theme would you like your wordsearch to be?
      </h1>
      <form onSubmit={handleFormSubmit}>
        <Input
          className="min-w-[20rem]"
          type="text" 
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Enter your theme"
        />
        <Button className="mt-6">{ loading ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (<></>)}Submit</Button>
      </form>
    </div>
  )
}

ThemeInputForm.propTypes = {
  onDataChange: PropTypes.func.isRequired, 
}