// Flash Card Decks Index
import worldCapitals from './world-capitals';
import europeCapitals from './europe-capitals';
import africaCapitals from './africa-capitals';
import southAmericaCapitals from './south-america-capitals';
import asiaCapitals from './asia-capitals';
import usPresidents from './us-presidents';
import chemicalElements from './chemical-elements';
import usStatesCapitals from './us-states-capitals';
import famousOperas from './famous-operas';
import famousNovels from './famous-novels';
import historicEvents from './historic-events';
import booksBlackAuthors from './books-black-authors';
import booksWomenAuthors from './books-women-authors';
import nobelPrizeLiterature from './nobel-prize-literature';
import nobelPrizeWinners from './nobel-prize-winners';
import shakespeare from './shakespeare';
import bible from './bible';
import worldMonarchs from './world-monarchs';
import mythology from './mythology';
import riversBodiesWater from './rivers-bodies-water';
import oscarWinners from './oscar-winners';
import musicAwards from './music-awards';
import worldReligions from './world-religions';
import artArtists from './art-artists';
import sportsOlympics from './sports-olympics';
import famousExplorers from './famous-explorers';
import languagesEtymology from './languages-etymology';
import astronomy from './astronomy';
import architecture from './architecture';
import foodCuisine from './food-cuisine';
import animalsBiology from './animals-biology';
import usStatesFacts from './us-states-facts';
import countriesFlags from './countries-flags';
import poetsPoetry from './poets-poetry';
import classicalComposers from './classical-composers';
import usAmendments from './us-amendments';
import supremeCourtCases from './supreme-court-cases';
import scientificDiscoveries from './scientific-discoveries';
import solarSystem from './solar-system';
import humanAnatomy from './human-anatomy';
import latinGreekRoots from './latin-greek-roots';

export const allFlashcardDecks = [
  // Geography
  europeCapitals,
  asiaCapitals,
  africaCapitals,
  southAmericaCapitals,
  worldCapitals,
  usStatesCapitals,
  usStatesFacts,
  countriesFlags,
  riversBodiesWater,
  // History
  usPresidents,
  historicEvents,
  usAmendments,
  supremeCourtCases,
  nobelPrizeWinners,
  worldMonarchs,
  sportsOlympics,
  famousExplorers,
  // Science
  chemicalElements,
  astronomy,
  solarSystem,
  animalsBiology,
  humanAnatomy,
  scientificDiscoveries,
  // Arts & Culture
  famousOperas,
  classicalComposers,
  famousNovels,
  booksBlackAuthors,
  booksWomenAuthors,
  nobelPrizeLiterature,
  poetsPoetry,
  shakespeare,
  bible,
  mythology,
  worldReligions,
  artArtists,
  oscarWinners,
  musicAwards,
  latinGreekRoots,
  languagesEtymology,
  architecture,
  foodCuisine,
];

export const getFlashcardDecksByCategory = () => {
  const categories = {};
  allFlashcardDecks.forEach(deck => {
    if (!categories[deck.category]) {
      categories[deck.category] = [];
    }
    categories[deck.category].push(deck);
  });
  return categories;
};

export const getFlashcardDeckById = (id) => {
  return allFlashcardDecks.find(deck => deck.id === id);
};

export default allFlashcardDecks;

