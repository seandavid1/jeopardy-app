# Study Flashcard Decks

This directory contains flashcard decks for rote memorization practice.

## Adding New Flashcard Decks

### 1. Create a New Deck File

Create a new JavaScript file in this directory (e.g., `my-deck.js`):

```javascript
export const myDeck = {
  id: 'my-deck-id', // Unique identifier (kebab-case)
  name: 'My Deck Name', // Display name
  description: 'Short description of what this deck covers',
  category: 'Category Name', // e.g., 'Geography', 'History', 'Science'
  cards: [
    { id: 1, question: 'Question text', answer: 'Answer text' },
    { id: 2, question: 'Question text', answer: 'Answer text' },
    // ... more cards
  ]
};

export default myDeck;
```

### 2. Register the Deck

Add your deck to `index.js`:

```javascript
import myDeck from './my-deck';

export const allFlashcardDecks = [
  worldCapitals,
  usPresidents,
  chemicalElements,
  usStatesCapitals,
  myDeck, // Add your deck here
];
```

## Current Decks

1. **World Capitals** (50 cards) - Major world capitals
2. **US Presidents** (46 cards) - All US presidents with terms
3. **Chemical Elements** (40 cards) - Common chemical elements
4. **US States & Capitals** (50 cards) - All 50 US state capitals

## Suggested Deck Ideas

### Geography
- World Countries & Continents
- Major World Rivers
- Mountain Ranges & Peaks
- US State Abbreviations
- World Currencies
- Oceans & Seas

### History
- Declaration Signers
- Supreme Court Justices
- Major Battles & Dates
- Ancient Civilizations
- World War II Timeline
- Renaissance Artists

### Science
- Planets & Solar System
- Human Anatomy
- Scientific Units & Symbols
- Inventors & Inventions
- Classification System (Taxonomy)
- Physics Constants

### Language & Literature
- Shakespeare Plays
- Greek & Latin Roots
- Foreign Language Vocabulary
- Literary Terms
- Famous Authors & Works
- Poetry Forms

### Arts & Culture
- Famous Paintings & Artists
- Musical Terms (Italian)
- Composers & Works
- Art Movements
- Film Directors
- Architecture Styles

### Mathematics
- Mathematical Symbols
- Common Formulas
- Geometric Shapes
- Number Systems
- Famous Mathematicians

### General Knowledge
- Morse Code
- NATO Phonetic Alphabet
- Roman Numerals
- Zodiac Signs
- Metric Conversions
- Time Zones

## Data Sources

### Free/Public Domain Sources:
- **Wikipedia** - Structured data lists
- **Project Gutenberg** - Historical texts
- **OpenStreetMap** - Geographic data
- **Wikidata** - Structured knowledge base
- **USA.gov** - Government data
- **Educational websites** - Many offer CC-licensed content

### Tools for Creating Decks:
1. **Excel/Google Sheets** - Create tables, then convert to JSON
2. **JSON Editor Online** - jsoneditoronline.org
3. **VS Code** - Built-in JSON validation

### Converting from CSV:
If you have data in CSV format, you can convert it to the flashcard format:

```javascript
// Example CSV: question,answer
// France,Paris
// Germany,Berlin

const csvData = `France,Paris
Germany,Berlin`;

const cards = csvData.split('\n').map((line, index) => {
  const [question, answer] = line.split(',');
  return { id: index + 1, question, answer };
});
```

## Best Practices

1. **Keep cards focused** - One fact per card
2. **Use consistent formatting** - Especially for similar decks
3. **Include context** - For dates, presidents, etc. include relevant details
4. **Verify accuracy** - Double-check facts against reliable sources
5. **Order matters** - For sequential learning (presidents, elements), maintain order
6. **Card count** - Aim for 30-100 cards per deck (too few = not useful, too many = overwhelming)

## License & Attribution

When adding decks based on external sources:
- Ensure data is public domain or CC-licensed
- Add attribution in deck description if required
- Check license compatibility

## Examples of Good vs. Bad Cards

### ✅ Good Cards

```javascript
// Geography - Clear and specific
{ question: 'France', answer: 'Paris' }

// History - Includes context
{ question: '16th President (1861-1865)', answer: 'Abraham Lincoln' }

// Science - Symbol and number
{ question: 'H (Atomic #1)', answer: 'Hydrogen' }
```

### ❌ Bad Cards

```javascript
// Too vague
{ question: 'Capital?', answer: 'Paris' }

// Multiple facts (split into 2 cards)
{ question: 'Abraham Lincoln', answer: '16th President, 1861-1865, Republican' }

// Ambiguous
{ question: 'First', answer: 'George Washington' }
```

## File Naming Convention

- Use kebab-case: `world-capitals.js`
- Be descriptive: `chemical-elements.js` not `science.js`
- Group related decks: `us-states-capitals.js`, `us-states-abbreviations.js`





