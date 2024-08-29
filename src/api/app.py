from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import numpy
import string
import random
from collections import deque

app = Flask(__name__)
CORS(app)

@app.route('/api/process', methods=['POST', 'GET'])
@cross_origin()
def generate_word_search_api():
    data = request.get_json()

    # Extracting the parameters from the request
    dimensions = data.get('dimensions')
    language = data.get('language')
    words = data.get('words')

    if not dimensions or not language or not words:
        return jsonify({"error": "Invalid input, please provide dimensions, language, and words."}), 400

    try:
        key, board = generate_word_search(words, language, tuple(dimensions))
        response = {
            "key": key.tolist(),  # Convert numpy array to list
            "board": board.tolist(),  # Convert numpy array to list
            "dimensions": {
                "width": dimensions[0],
                "height": dimensions[1]
            }
        }
        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def generate_word_search(words: list, lang: str, dimensions: tuple) -> tuple:
    """Generate the word search"""
    if not isinstance(words, list):
        raise ValueError("words must provide a list of words")
    for word in words:
        if not isinstance(word, str):
            raise ValueError("Each word in words must be a string")
    if not isinstance(lang, str):
        raise ValueError("lang must provide a valid language string")
    if not isinstance(dimensions, (tuple, list)):
        raise ValueError(
            "dimensions must provide a tuple of integers. ex: (width, height)"
        )
    for dimension in dimensions:
        if not isinstance(dimension, int):
            raise ValueError("dimension in dimensions must be an integer")
    _validate_word_length(words, dimensions)
    character_set = _get_lang_characters(lang)
    words = _conform_characters(words)
    key, board = _run_simulation(words, character_set, dimensions)
    return key, board

def _validate_word_length(words: list, dimensions: tuple) -> None:
    """Validate character counts against dimensions"""
    max_characters = dimensions[0] * dimensions[1]
    for word in words:
        if len(word) > dimensions[0] and len(word) > dimensions[1]:
            raise ValueError(
                "Length of word is greater than the dimensions provided: "
                + f"{word} - {dimensions}"
            )

def _conform_characters(words: list) -> list:
    """Uppercase all letters"""
    return [word.upper() for word in words]

def _get_lang_characters(lang: str) -> list:
    """Get the language specific character set"""
    if lang == "en":
        return string.ascii_uppercase
    elif lang == "de":
        return string.ascii_uppercase + "ẞÄÖÜ"

def _run_simulation(words: list, character_set: str, dimensions: tuple,) -> numpy.array:
    """Simulate the word search board"""
    board, repeat_counter = _wipe_board(words, dimensions)
    queue = deque(words)
    while queue:
        word = queue.pop()
        if not _added_word(word, dimensions, board):
            repeat_counter[word] += 1
            if repeat_counter[word] > 5:
                board, repeat_counter = _wipe_board(words, dimensions)
                queue = deque(words)
            else:
                queue.appendleft(word)
    key = _render_whitespace(board.copy())
    board = _render_noise(character_set, board, dimensions)
    return key, board

def _wipe_board(words: list, dimensions: tuple) -> tuple:
    """Get Fresh numpy array and repeat counter"""
    board = _get_empty_board(dimensions)
    repeat_counter = {word: 0 for word in words}
    return board, repeat_counter

def _get_empty_board(dimensions: tuple) -> numpy.array:
    """Instantiate the board"""
    width = dimensions[0]
    height = dimensions[1]  # Corrected to use height from dimensions
    arr = numpy.full((height, width), fill_value=None)
    return arr

def _added_word(word: str, dimensions: tuple, board: numpy.array) -> bool:
    """Simulate adding word to board. True if added"""
    start_point = _choose_start_point(dimensions)
    direction = _choose_direction()
    end_point = _get_end_point(word, direction, start_point)
    if _detected_edge_collision(dimensions, end_point):
        return False
    if _detected_word_collision(word, direction, board, start_point):
        return False

    _save_word(word, direction, start_point, board)
    return True

def _choose_start_point(dimensions: tuple) -> tuple:
    """Picks a random point to start the word"""
    x = random.randrange(0, dimensions[0])
    y = random.randrange(0, dimensions[1])
    return x, y

def _choose_direction() -> str:
    """Pick a direction for the word"""
    return random.choice(["down", "right"])

def _get_end_point(word: str, direction: str, start_point: tuple) -> tuple:
    """Get the endpoint for word, direction and start point"""
    x, y = start_point
    length = len(word)
    if direction == "right":
        return x + length - 1, y
    elif direction == "down":
        return x, y + length - 1

def _detected_edge_collision(dimensions: tuple, end_point: tuple,) -> bool:
    """Detects if word collides with edge of board"""
    x2, y2 = end_point
    width, height = dimensions
    return not (0 <= x2 < width and 0 <= y2 < height)

def _detected_word_collision(word: str, direction: str, board: numpy.array, start_point: tuple) -> bool:
    """Detects if word collides with another word"""
    x, y = start_point
    for increment, character in enumerate(word):
        if direction == "right":
            cell = board[y][x + increment]
        elif direction == "down":
            cell = board[y + increment][x]
        else:
            raise ValueError(f"direction not supported: {direction}")
        if cell is not None and cell != character:
            return True
    return False

def _save_word(word: str, direction: str, start_point: tuple, board: numpy.array) -> None:
    """Saves the word's position"""
    x, y = start_point
    for increment, character in enumerate(word):
        if direction == "right":
            board[y][x + increment] = character
        elif direction == "down":
            board[y + increment][x] = character

def _render_whitespace(board: numpy.array) -> numpy.array:
    """Substitute None for whitespace"""
    return numpy.where(board == None, " ", board)

def _render_noise(character_set: str, board: numpy.array, dimensions: tuple) -> numpy.array:
    """Substitute whitespace for random letters"""
    for row in range(dimensions[1]):
        for column in range(dimensions[0]):
            if board[row][column] is None:
                board[row][column] = random.choice(character_set)
    return board

if __name__ == '__main__':
    app.run(debug=True)