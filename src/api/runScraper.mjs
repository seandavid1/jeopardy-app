/**
 * J! Archive Scraper Runner
 * 
 * Simple runner script for the J! Archive scraper.
 * 
 * PREREQUISITES:
 * --------------
 * 1. Configure scraper settings in scrapeJArchive.mjs (season, dates, part number)
 * 
 * TO RUN:
 * -------
 * From project root: npm run scrape
 * 
 * The scraper will output progress to the console and save the results
 * to src/cluebase-questions/
 * 
 * NOTE: Files use .mjs extension to support ES6 imports without affecting
 * the main React app configuration.
 */

import { scrapeJeopardyGames } from './scrapeJArchive.mjs';

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