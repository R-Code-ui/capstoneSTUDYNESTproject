const ART_BY_GAME = {
    'Word Builder': { icon: '\u{1F524}', label: 'Letter lab', theme: 'from-violet-500 to-fuchsia-500' },
    'Sentence Scramble': { icon: '\u{1F9E9}', label: 'Word puzzle', theme: 'from-sky-500 to-indigo-500' },
    'Rhyme Match': { icon: '\u{1F3B5}', label: 'Rhyme time', theme: 'from-pink-500 to-rose-500' },
    'Letter Hunt': { icon: '\u{1F50E}', label: 'Letter quest', theme: 'from-emerald-500 to-teal-500' },
    'Balloon Pop Math': { icon: '\u{1F388}', label: 'Balloon party', theme: 'from-cyan-500 to-blue-500' },
    'Sorting Baskets': { icon: '\u{1F9FA}', label: 'Sort it out', theme: 'from-amber-500 to-orange-500' },
    'Coin Counter': { icon: '\u{1FA99}', label: 'Coin challenge', theme: 'from-yellow-500 to-amber-500' },
    'Skip Counting Path': { icon: '\u{1FAA8}', label: 'Number trail', theme: 'from-lime-500 to-green-500' },
    'Match the Meaning': { icon: '\u{1F4DA}', label: 'Word match', theme: 'from-indigo-500 to-violet-500' },
    'Story Fill-In': { icon: '\u{1F4DD}', label: 'Story studio', theme: 'from-purple-500 to-pink-500' },
    'Fraction Pizza': { icon: '\u{1F355}', label: 'Pizza fractions', theme: 'from-orange-500 to-red-500' },
    'Number Line Runner': { icon: '\u{1F3C3}', label: 'Number race', theme: 'from-sky-500 to-cyan-500' },
    'Compound Word Combiner': { icon: '\u{1F9E9}', label: 'Word mixer', theme: 'from-fuchsia-500 to-purple-500' },
    'Analogy Solver': { icon: '\u{1F9E0}', label: 'Brain boost', theme: 'from-pink-500 to-rose-500' },
    'Area Blocks': { icon: '\u{1F7E9}', label: 'Shape builder', theme: 'from-green-500 to-emerald-500' },
    'Decimal Number Line': { icon: '\u{1F4CF}', label: 'Decimal dash', theme: 'from-blue-500 to-indigo-500' },
    'Clue Detective': { icon: '\u{1F575}\uFE0F', label: 'Clue case', theme: 'from-slate-600 to-indigo-600' },
    'Word Web Builder': { icon: '\u{1F578}\uFE0F', label: 'Word web', theme: 'from-teal-500 to-cyan-500' },
    'Balance Scale': { icon: '\u{2696}\uFE0F', label: 'Balance lab', theme: 'from-amber-500 to-yellow-500' },
    'Graph Builder': { icon: '\u{1F4CA}', label: 'Graph garage', theme: 'from-indigo-500 to-blue-500' },
    'Sequence the Story': { icon: '\u{1F4D6}', label: 'Story order', theme: 'from-rose-500 to-pink-500' },
    'Idiom Match': { icon: '\u{1F4AC}', label: 'Idiom explorer', theme: 'from-orange-500 to-amber-500' },
    'Coordinate Plane Treasure Hunt': { icon: '\u{1F5FA}\uFE0F', label: 'Treasure map', theme: 'from-emerald-500 to-cyan-500' },
    'Percent Bar Builder': { icon: '\u{1F4C8}', label: 'Percent power', theme: 'from-violet-500 to-indigo-500' },
};

export function getGameArt(title, type) {
    return ART_BY_GAME[title] || (type === 'literacy'
        ? { icon: '\u{1F4D8}', label: 'Reading quest', theme: 'from-indigo-500 to-violet-500' }
        : { icon: '\u{1F3AF}', label: 'Math mission', theme: 'from-cyan-500 to-blue-500' });
}
