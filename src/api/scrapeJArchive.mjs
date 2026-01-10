import fs from 'fs';
import path from 'path';
/**
 * J! Archive Scraper
 * 
 * This utility scrapes Jeopardy! questions from J! Archive (https://j-archive.com)
 * and saves them to a JavaScript file in the cluebase-questions directory.
 * 
 * SETUP INSTRUCTIONS:
 * -------------------
 * No special setup required - the npm script handles ES6 module support automatically.
 * 
 * CONFIGURE THE SCRAPER:
 * ----------------------
 * Update these settings below:
 *    - SEASON: Which Jeopardy season to scrape
 *    - START_DATE: Beginning date for scraping (YYYY-MM-DD)
 *    - END_DATE: Ending date for scraping (YYYY-MM-DD)
 *    - PART_NUMBER: Which part of the season (for splitting large datasets)
 * 
 * HOW TO RUN:
 * -----------
 * From the project root directory, run:
 *   npm run scrape
 * 
 * OUTPUT:
 * -------
 * Creates a file in src/cluebase-questions/ with the format:
 *   jeopardy-questions-seasonXX-YYYY-MM-DD-to-YYYY-MM-DD-partN.js
 * 
 * NOTES:
 * ------
 * - The scraper respects rate limits and adds delays between requests
 * - Questions are automatically mapped to top-level categories
 * - Duplicate questions are filtered out
 * - Progress is logged to the console
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Cleans text by removing escape characters and normalizing quotes
 * @param {string} text - The text to clean
 * @returns {string} - The cleaned text
 */
function cleanText(text) {
  if (!text) return '';
  
  return text
    // Remove backslashes before quotes and apostrophes
    .replace(/\\['"]/g, '"')
    .replace(/\\'/g, "'")
    // Replace HTML entities
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    // Remove any remaining backslashes
    .replace(/\\/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

// Function to clean escape characters from text
function cleanEscapeCharacters(text) {
  if (!text) return '';
  
  // Replace escaped quotes and apostrophes
  return text
    .replace(/\\"/g, '"')  // Replace escaped double quotes with regular double quotes
    .replace(/\\'/g, "'")  // Replace escaped single quotes with regular single quotes
    .replace(/\\n/g, ' ')  // Replace newlines with spaces
    .replace(/\\t/g, ' ')  // Replace tabs with spaces
    .replace(/\\r/g, ' ')  // Replace carriage returns with spaces
    .replace(/\\\\/g, '\\')  // Replace double backslashes with single backslashes
    .replace(/\s+/g, ' ')  // Replace multiple spaces with a single space
    .trim();  // Trim whitespace from the beginning and end
}

/**
 * Scrapes Jeopardy games from j-archive.com for the last 10 seasons
 * and saves the questions and answers to JSON files organized by date ranges
 */
async function scrapeJeopardyGames() {
  try {
    // ========================================
    // CONFIGURATION
    // ========================================
    
    // TEST MODE: Set this to a specific game ID to test a single game
    // Example: '8064' for Show #8064
    // Set to null to scrape the entire season
    const TEST_GAME_ID = null; // Change to '8064' or any game ID for testing
    
    // SEASON: Which season to scrape (only used when TEST_GAME_ID is null)
    const season = 36;
    
    // ========================================
    
    // If in test mode, scrape just one game
    if (TEST_GAME_ID) {
      console.log(`\n🧪 TEST MODE: Scraping single game #${TEST_GAME_ID}\n`);
      const testGameUrl = `https://j-archive.com/showgame.php?game_id=${TEST_GAME_ID}`;
      
      try {
        const response = await axios.get(testGameUrl);
        const $ = cheerio.load(response.data);
        
        // Extract game date and ID
        const title = $('h1').text();
        const rawDate = title.match(/aired (\d{4}-\d{2}-\d{2})/)?.[1] || 
                        title.match(/([A-Za-z]+ \d{1,2}, \d{4})/)?.[1];
        
        const showNumber = title.match(/Show #(\d+)/)?.[1];
        const gameId = showNumber;
        
        if (!rawDate) {
          console.log('❌ No date found in title:', title);
          return [];
        }

        // Convert date to YYYY-MM-DD format if needed
        const gameDate = rawDate.includes('-') ? rawDate : 
          new Date(rawDate).toISOString().split('T')[0];

        console.log(`📅 Game Date: ${gameDate}`);
        console.log(`🎮 Game ID: ${gameId}`);
        
        // Extract categories
        const categories = [];
        $('.category_name').each((_, element) => {
          categories.push($(element).text().trim());
        });
        
        console.log(`📂 Categories: ${categories.length} found`);
        categories.forEach((cat, i) => console.log(`   ${i + 1}. ${cat}`));
        
        // Extract questions
        const questions = [];
        let clueIndex = 0;
        
        // Process ALL clue cells (including empty ones)
        $('.clue').each((index, element) => {
          const $clue = $(element);
          const $clueText = $clue.find('.clue_text');
          const $response = $clue.find('.correct_response');
          
          // Check if this is an empty clue (no clue_text or correct_response)
          const isEmpty = !$clueText.length || !$response.length;
          
          // Determine round and value
          let round = 'Jeopardy';
          let value = 0;
          
          if (index < 30) {
            round = 'Jeopardy';
            value = 200 * (Math.floor(index / 5) + 1);
          } else if (index < 60) {
            round = 'Double Jeopardy';
            value = 400 * (Math.floor((index - 30) / 5) + 1);
          } else {
            round = 'Final Jeopardy';
            value = 0;
          }
          
          // Determine category index
          let categoryIndex;
          if (index < 30) {
            categoryIndex = index % 6;
          } else if (index < 60) {
            categoryIndex = (index - 30) % 6 + 6;
          } else {
            categoryIndex = 12;
          }
          
          const category = categories[categoryIndex] || 'Unknown';
          
          if (isEmpty) {
            clueIndex++;
            console.log(`   [${index}] ⚠️  EMPTY CLUE - Round: ${round}, Value: $${value}, Category: ${category}`);
            
            questions.push({
              id: `${gameId}-${index}`,
              index: clueIndex,
              clue: "",
              response: "",
              category: category,
              value: value,
              round: round,
              date: gameDate,
              season: season,
              game_id: gameId,
              isEmpty: true
            });
          } else {
            const questionText = $clueText.clone().children().remove().end().text().trim();
            const answerText = $response.text().trim();
            
            // Clean the texts
            const cleanedQuestionText = cleanText(questionText);
            const cleanedAnswerText = cleanText(answerText);
            
            clueIndex++;
            console.log(`   [${index}] ✓ ${round} $${value} - ${category}`);
            console.log(`       Q: ${cleanedQuestionText.substring(0, 60)}${cleanedQuestionText.length > 60 ? '...' : ''}`);
            console.log(`       A: ${cleanedAnswerText}`);
            
            questions.push({
              id: `${gameId}-${index}`,
              index: clueIndex,
              clue: cleanEscapeCharacters(cleanedQuestionText),
              response: cleanEscapeCharacters(cleanedAnswerText),
              category: category,
              value: value,
              round: round,
              date: gameDate,
              season: season,
              game_id: gameId
            });
          }
        });
        
        console.log(`\n✅ TEST COMPLETE: Scraped ${questions.length} clues from game ${TEST_GAME_ID}`);
        console.log(`   Empty clues: ${questions.filter(q => q.isEmpty).length}`);
        console.log(`   Regular clues: ${questions.filter(q => !q.isEmpty).length}`);
        
        return questions;
      } catch (error) {
        console.error(`❌ Error scraping test game ${TEST_GAME_ID}:`, error.message);
        return [];
      }
    }
    
    // Otherwise, scrape the entire season
    console.log(`\n📺 SEASON MODE: Scraping entire season ${season}\n`);
    
    // Get the current season number
    const currentYear = new Date().getFullYear();
    const currentSeason = currentYear - 1984; // Jeopardy started in 1984

    // Initialize the array to store all questions from all seasons
    const allQuestionsFromAllSeasons = [];

    // Get game links from season 41
    const allGameLinks = [];
    
    const seasonUrl = `https://j-archive.com/showseason.php?season=${season}`;
    const seasonResponse = await axios.get(seasonUrl);
    const $season = cheerio.load(seasonResponse.data);
    
    // Extract game links from the season page
    const seasonLinks = [];
    $season('table td a').each((_, element) => {
      const href = $season(element).attr('href');
      if (href && href.includes('showgame.php?game_id=')) {
        seasonLinks.push(`https://j-archive.com/${href}`);
      }
    });
    
    allGameLinks.push({
      season,
      links: seasonLinks
    });
    
    console.log(`Found ${seasonLinks.length} games in season ${season}`);
    
    console.log(`\nTotal games to process: ${allGameLinks.reduce((sum, {links}) => sum + links.length, 0)}`);

    // Process the season
    for (const { season, links: gameLinks } of allGameLinks) {
      console.log(`\nProcessing season ${season}...`);
      
      // Initialize variables for this season
      const allQuestions = [];
      const seenQuestions = new Set();
      let gamesProcessed = 0;
      let questionsProcessed = 0;
      
      // Calculate questions per file (approximately half the season)
      const questionsPerFile = Math.ceil((gameLinks.length * 61) / 2); // 61 questions per game
      console.log(`Targeting ${questionsPerFile} questions per file`);

      // First, collect all questions from all games
      for (const gameUrl of gameLinks) {
        try {
          gamesProcessed++;
          console.log(`Processing game ${gamesProcessed}/${gameLinks.length} (${Math.round(gamesProcessed/gameLinks.length*100)}%)`);
          const response = await axios.get(gameUrl);
          const $ = cheerio.load(response.data);
          
          // Extract game date and ID
          const title = $('h1').text();
          const rawDate = title.match(/aired (\d{4}-\d{2}-\d{2})/)?.[1] || 
                          title.match(/([A-Za-z]+ \d{1,2}, \d{4})/)?.[1];
          
          const showNumber = title.match(/Show #(\d+)/)?.[1];
          const gameId = showNumber;
                          
          if (!rawDate) {
            console.log('No date found in title:', title);
            continue;
          }

          // Convert date to YYYY-MM-DD format if needed
          const gameDate = rawDate.includes('-') ? rawDate : 
            new Date(rawDate).toISOString().split('T')[0];

          console.log(`Processing game from ${gameDate}`);
          
          // Extract categories
          const categories = [];
          $('.category_name').each((_, element) => {
            categories.push($(element).text().trim());
          });
          
          // Extract questions using the approach from getQuestionsScript.js
          const questions = [];
          let clueIndex = 0;
          
          // Process ALL clue cells (including empty ones)
          $('.clue').each((index, element) => {
            const $clue = $(element);
            const $clueText = $clue.find('.clue_text');
            const $response = $clue.find('.correct_response');
            
            // Check if this is an empty clue (no clue_text or correct_response elements exist)
            const isEmpty = $clueText.length === 0 || $response.length === 0;
            
            // Determine round and value
            let round = 'Jeopardy';
            let value = 0;
            
            if (index < 30) {
              round = 'Jeopardy';
              value = 200 * (Math.floor(index / 5) + 1);
            } else if (index < 60) {
              round = 'Double Jeopardy';
              value = 400 * (Math.floor((index - 30) / 5) + 1);
            } else {
              round = 'Final Jeopardy';
              value = 0; // Final Jeopardy doesn't have a dollar value
            }
            
            // Determine category index
            let categoryIndex;
            if (index < 30) {
              categoryIndex = index % 6;
            } else if (index < 60) {
              categoryIndex = (index - 30) % 6 + 6;
            } else {
              categoryIndex = 12; // Final Jeopardy category
            }
            
            const category = categories[categoryIndex] || 'Unknown';
            
            if (isEmpty) {
              // Create a placeholder for the empty clue
              clueIndex++;
              const question = {
                id: `${gameId}-${index}`,
                index: clueIndex,
                clue: "",
                response: "",
                category: category,
                value: value,
                round: round,
                date: gameDate,
                season: season,
                game_id: gameId,
                isEmpty: true  // Flag to identify placeholders
              };
              
              questions.push(question);
              questionsProcessed++;
            } else {
              // Process normal clues
              const questionText = $clueText.clone().children().remove().end().text().trim();
              const answerText = $response.text().trim();
              
              // Clean the texts
              const cleanedQuestionText = cleanText(questionText);
              const cleanedAnswerText = cleanText(answerText);
              
              // Skip empty text (even if elements exist)
              if (!cleanedQuestionText || !cleanedAnswerText) {
                return; // Skip this iteration
              }
              
              // Skip questions that are too short or likely invalid
              if (cleanedQuestionText.length < 10) {
                return; // Skip this iteration
              }
              
              // Skip questions that contain contestant names (usually from game commentary)
              // Note: This is aggressive - consider removing if it filters too much
              if (cleanedQuestionText.includes(":") && cleanedQuestionText.split(":")[0].length < 20) {
                return; // Skip this iteration
              }
              
              // Skip questions that contain the answer (likely concatenated)
              if (cleanedAnswerText && cleanedQuestionText.includes(cleanedAnswerText)) {
                return; // Skip this iteration
              }
              
              // Create a unique key for this question
              const questionKey = `${cleanedQuestionText}|${cleanedAnswerText}|${category}|${value}|${round}`;
              
              // Only add if we haven't seen this exact question before
              if (!seenQuestions.has(questionKey)) {
                seenQuestions.add(questionKey);
                clueIndex++;
                
                const question = {
                  id: `${gameId}-${index}`,
                  index: clueIndex,
                  clue: cleanEscapeCharacters(cleanedQuestionText),
                  response: cleanEscapeCharacters(cleanedAnswerText),
                  category: category,
                  value: value,
                  round: round,
                  date: gameDate,
                  season: season,
                  game_id: gameId
                };
                
                questions.push(question);
                questionsProcessed++;
              }
            }
          });
          
          // Add all questions from this game to the season collection
          allQuestions.push(...questions);
          
          // Add a small delay between requests
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Error scraping game ${gameUrl}:`, error.message);
        }
      }

      // After collecting all questions, process them in batches
      console.log(`\nProcessing ${allQuestions.length} questions for season ${season}...`);
      let fileCounter = 1;
      
      // Sort questions by date to ensure proper batch date ranges
      allQuestions.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      for (let i = 0; i < allQuestions.length; i += questionsPerFile) {
        const batch = allQuestions.slice(i, Math.min(i + questionsPerFile, allQuestions.length));
        const batchStartDate = batch[0].date;
        const batchEndDate = batch[batch.length - 1].date;
        
        await saveQuestionsToFile(batch, batchStartDate, batchEndDate, fileCounter, season);
        console.log(`Saved batch ${fileCounter} with ${batch.length} questions (${batchStartDate} to ${batchEndDate})`);
        fileCounter++;
      }
      
      // Add all questions from this season to the overall collection
      allQuestionsFromAllSeasons.push(...allQuestions);
    }

    return allQuestionsFromAllSeasons;
  } catch (error) {
    console.error('Error scraping Jeopardy games:', error);
    throw error;
  }
}

/**
 * Saves questions to a JSON file with date range and season in the filename
 * @param {Array} questions - Array of questions to save
 * @param {string} startDate - Start date of the batch
 * @param {string} endDate - End date of the batch
 * @param {number} fileCounter - Counter for the file number
 * @param {number} season - Season number
 * @returns {Promise<void>}
 */
async function saveQuestionsToFile(questions, startDate, endDate, fileCounter, season) {
  // Create the output directory if it doesn't exist
  const outputDir = path.join(__dirname, '..', 'cluebase-questions');
  try {
    await fs.promises.access(outputDir);
  } catch {
    await fs.promises.mkdir(outputDir, { recursive: true });
  }

  // Format dates for filename
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const startDateFormatted = formatDate(startDate);
  const endDateFormatted = formatDate(endDate);

  // Save to JSON file with season number
  const outputPath = path.join(outputDir, `jeopardy-questions-season${season}-${startDateFormatted}-to-${endDateFormatted}-part${fileCounter}.js`);
  
  // Check if the file would exceed 360,000 lines
  const jsonString = JSON.stringify(questions, null, 2);
  const lineCount = jsonString.split('\n').length;
  
  if (lineCount > 360000) {
    console.log(`Warning: File would exceed 360,000 lines (${lineCount} lines). Splitting into smaller batches.`);
    
    // Split the questions into smaller batches
    const maxQuestionsPerFile = Math.floor(questions.length * (360000 / lineCount));
    let currentBatch = [];
    let currentLineCount = 0;
    let batchCounter = fileCounter;
    
    for (const question of questions) {
      const questionJson = JSON.stringify(question, null, 2);
      const questionLineCount = questionJson.split('\n').length;
      
      if (currentLineCount + questionLineCount > 360000) {
        // Save the current batch
        const batchOutputPath = path.join(outputDir, `jeopardy-questions-season${season}-${startDateFormatted}-to-${endDateFormatted}-part${batchCounter}.js`);
        
        // Create exportable format and replace escaped quotes
        let exportContent = `const questionSetSeason${season}Part${batchCounter} = ${JSON.stringify(currentBatch, null, 2)};\n\nexport default questionSetSeason${season}Part${batchCounter};`;
        exportContent = exportContent.replace(/\\"/g, "'");
        
        await fs.promises.writeFile(batchOutputPath, exportContent);
        console.log(`Saved batch ${batchCounter} with ${currentBatch.length} questions (${currentBatch[0].date} to ${currentBatch[currentBatch.length - 1].date})`);
        
        // Start a new batch
        currentBatch = [question];
        currentLineCount = questionLineCount;
        batchCounter++;
      } else {
        currentBatch.push(question);
        currentLineCount += questionLineCount;
      }
    }
    
    // Save the last batch if it's not empty
    if (currentBatch.length > 0) {
      const batchOutputPath = path.join(outputDir, `jeopardy-questions-season${season}-${startDateFormatted}-to-${endDateFormatted}-part${batchCounter}.js`);
      
      // Create exportable format and replace escaped quotes
      let exportContent = `const questionSetSeason${season}Part${batchCounter} = ${JSON.stringify(currentBatch, null, 2)};\n\nexport default questionSetSeason${season}Part${batchCounter};`;
      exportContent = exportContent.replace(/\\"/g, "'");
      
      await fs.promises.writeFile(batchOutputPath, exportContent);
      console.log(`Saved batch ${batchCounter} with ${currentBatch.length} questions (${currentBatch[0].date} to ${currentBatch[currentBatch.length - 1].date})`);
    }
  } else {
    // Save the file as is
    // Create exportable format and replace escaped quotes
    let exportContent = `const questionSetSeason${season}Part${fileCounter} = ${JSON.stringify(questions, null, 2)};\n\nexport default questionSetSeason${season}Part${fileCounter};`;
    exportContent = exportContent.replace(/\\"/g, "'");
    
    await fs.promises.writeFile(outputPath, exportContent);
    console.log(`Saved ${questions.length} questions to ${outputPath}`);
  }
}

export {
  scrapeJeopardyGames
};

// Run the scraper if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeJeopardyGames()
    .then(() => console.log('Scraping completed successfully'))
    .catch(error => console.error('Error during scraping:', error));
} 