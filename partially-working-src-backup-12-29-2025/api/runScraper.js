import { scrapeJeopardyGames } from './scrapeJArchive.js';

// Run the scraper
async function main() {
  console.log('Starting Jeopardy scraper...');
  try {
    const questions = await scrapeJeopardyGames();
    console.log(`Scraping completed. Total questions scraped: ${questions.length}`);
  } catch (error) {
    console.error('Error running scraper:', error);
    process.exit(1);
  }
}

main(); 