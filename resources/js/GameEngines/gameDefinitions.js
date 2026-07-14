// Static content for every interactive game.
// KEYS MUST MATCH the game_title strings used in
// app/Http/Controllers/Teacher/GameController.php EXACTLY.

const gameDefinitions = {
    // ===== GRADE 4 =====
    'Word Builder': {
        grade: 'Grade 4',
        type: 'literacy',
        description: 'Drag the letters into the blanks to spell the word shown by the picture.',
        content: {
            rounds: [
                { image: '🐱', word: 'CAT', letters: ['C', 'A', 'T', 'X', 'B'] },
                { image: '🐶', word: 'DOG', letters: ['D', 'O', 'G', 'P', 'N'] },
                { image: '🐟', word: 'FISH', letters: ['F', 'I', 'S', 'H', 'K'] },
                { image: '🐝', word: 'BEE', letters: ['B', 'E', 'E', 'R', 'L'] },
                { image: '🌞', word: 'SUN', letters: ['S', 'U', 'N', 'M', 'Y'] },
            ],
        },
    },

    'Sentence Scramble': {
        grade: 'Grade 4',
        type: 'literacy',
        description: 'Drag the words into the correct order to form a proper sentence.',
        content: {
            rounds: [
                { correct: ['The', 'cat', 'is', 'sleeping'], scrambled: ['sleeping', 'The', 'cat', 'is'] },
                { correct: ['I', 'like', 'to', 'read', 'books'], scrambled: ['read', 'I', 'books', 'to', 'like'] },
                { correct: ['We', 'play', 'in', 'the', 'park'], scrambled: ['park', 'We', 'the', 'in', 'play'] },
                { correct: ['She', 'sings', 'a', 'happy', 'song'], scrambled: ['a', 'song', 'She', 'happy', 'sings'] },
            ],
        },
    },

    'Balloon Pop Math': {
        grade: 'Grade 4',
        type: 'numeracy',
        description: 'Tap only the balloons that equal the target number before time runs out.',
        content: {
            rounds: [
                { target: 8, numbers: [8, 3, 8, 5, 6, 8, 2, 7] },
                { target: 12, numbers: [5, 12, 9, 12, 4, 10, 12, 6] },
                { target: 6, numbers: [6, 9, 3, 6, 7, 6, 1, 8] },
            ],
        },
    },

    'Sorting Baskets': {
        grade: 'Grade 4',
        type: 'numeracy',
        description: 'Drag each number into the correct basket: Even or Odd.',
        content: {
            rounds: [
                {
                    basketA: 'Even',
                    basketB: 'Odd',
                    items: [
                        { value: 4, type: 'Even' },
                        { value: 7, type: 'Odd' },
                        { value: 10, type: 'Even' },
                        { value: 3, type: 'Odd' },
                        { value: 8, type: 'Even' },
                        { value: 5, type: 'Odd' },
                        { value: 12, type: 'Even' },
                        { value: 9, type: 'Odd' },
                    ],
                },
            ],
        },
    },

    // ===== GRADE 5 =====
    'Match the Meaning': {
        grade: 'Grade 5',
        type: 'literacy',
        description: 'Drag each word on the left to its matching synonym on the right.',
        content: {
            pairs: [
                { word: 'Happy', match: 'Joyful' },
                { word: 'Big', match: 'Large' },
                { word: 'Fast', match: 'Quick' },
                { word: 'Sad', match: 'Unhappy' },
                { word: 'Smart', match: 'Clever' },
            ],
        },
    },

    'Story Fill-In': {
        grade: 'Grade 5',
        type: 'literacy',
        description: 'Drag the correct words from the word bank into the blanks in the story.',
        content: {
            paragraph: 'The {0} jumped over the {1}. It was a {2} day, and everyone felt {3}.',
            blanks: ['dog', 'fence', 'sunny', 'happy'],
            wordBank: ['dog', 'fence', 'sunny', 'happy', 'rainy', 'angry'],
        },
    },

    'Fraction Pizza': {
        grade: 'Grade 5',
        type: 'numeracy',
        description: 'Tap pizza slices to shade the fraction shown.',
        content: {
            rounds: [
                { totalSlices: 4, target: 3, targetLabel: '3/4' },
                { totalSlices: 8, target: 5, targetLabel: '5/8' },
                { totalSlices: 6, target: 2, targetLabel: '2/6' },
                { totalSlices: 4, target: 1, targetLabel: '1/4' },
            ],
        },
    },

    'Number Line Runner': {
        grade: 'Grade 5',
        type: 'numeracy',
        description: 'Click the number line to jump the correct number of spaces.',
        content: {
            rounds: [
                { start: 2, steps: 4, operation: '+', answer: 6, min: 0, max: 10 },
                { start: 9, steps: 3, operation: '-', answer: 6, min: 0, max: 10 },
                { start: 5, steps: 5, operation: '+', answer: 10, min: 0, max: 12 },
                { start: 8, steps: 6, operation: '-', answer: 2, min: 0, max: 10 },
            ],
        },
    },

    // ===== GRADE 6 =====
    'Clue Detective': {
        grade: 'Grade 6',
        type: 'literacy',
        description: 'Click the words that reveal the meaning of the highlighted vocabulary word.',
        content: {
            rounds: [
                {
                    words: ['The', 'artifact', 'was', 'invaluable', '—', 'extremely', 'valuable', 'and', 'impossible', 'to', 'replace', '.'],
                    targetIndex: 3,
                    clueRange: [5, 10],
                },
                {
                    words: ['She', 'was', 'meticulous', ',', 'always', 'checking', 'every', 'detail', 'carefully', 'before', 'submitting', 'her', 'work', '.'],
                    targetIndex: 2,
                    clueRange: [4, 8],
                },
                {
                    words: ['The', 'weather', 'was', 'turbulent', ',', 'with', 'strong', 'winds', 'and', 'heavy', 'rain', 'battering', 'the', 'coast', '.'],
                    targetIndex: 3,
                    clueRange: [5, 10],
                },
            ],
        },
    },

    'Word Web Builder': {
        grade: 'Grade 6',
        type: 'literacy',
        description: 'Drag the words that relate to the central concept into the web.',
        content: {
            centralWord: 'OCEAN',
            correctWords: ['Wave', 'Coral', 'Tide', 'Current', 'Reef'],
            distractorWords: ['Mountain', 'Desert', 'Cactus', 'Volcano'],
        },
    },

    'Balance Scale': {
        grade: 'Grade 6',
        type: 'numeracy',
        description: 'Drag weights onto the right side until the scale balances.',
        content: {
            rounds: [
                { leftValue: 10, weights: [3, 7, 2, 5, 4] },
                { leftValue: 15, weights: [8, 7, 3, 5, 2] },
                { leftValue: 12, weights: [5, 7, 4, 3, 6] },
            ],
        },
    },

    'Graph Builder': {
        grade: 'Grade 6',
        type: 'numeracy',
        description: 'Click each bar to build it up to match the data, then answer a quick question about your graph.',
        content: {
            rounds: [
                {
                    title: 'Favorite Fruits Survey',
                    maxValue: 10,
                    categories: [
                        { label: 'Apple', target: 4 },
                        { label: 'Banana', target: 7 },
                        { label: 'Grape', target: 3 },
                    ],
                    question: 'Which fruit got the most votes?',
                    answer: 'Banana',
                },
                {
                    title: 'Pets Owned by Classmates',
                    maxValue: 8,
                    categories: [
                        { label: 'Dog', target: 6 },
                        { label: 'Cat', target: 5 },
                        { label: 'Fish', target: 2 },
                    ],
                    question: 'Which pet is the least common?',
                    answer: 'Fish',
                },
            ],
        },
    },
};

export default gameDefinitions;
