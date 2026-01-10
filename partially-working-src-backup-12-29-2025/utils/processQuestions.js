import fs from 'fs';
import path from 'path';
import { addTopLevelCategory } from './categoryMapper.js';

const processQuestionFile = (filePath) => {
    try {
        // Read the file content
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Extract the season and part numbers from the filename
        const fileNameMatch = path.basename(filePath).match(/season(\d+).*?part(\d+)/i);
        if (!fileNameMatch) {
            console.error(`Could not extract season and part numbers from ${filePath}`);
            return;
        }
        const [_, season, part] = fileNameMatch;
        
        // Extract the questions array
        const match = content.match(/const questionSetSeason\d+Part\d+ = (\[[\s\S]*?\]);/);
        if (!match) {
            console.error(`Could not find questions array in ${filePath}`);
            return;
        }
        
        // Parse the questions
        const questions = JSON.parse(match[1]);
        
        // Add top-level categories
        const processedQuestions = questions.map(addTopLevelCategory);
        
        // Create the new content
        const newContent = `const questionSetSeason${season}Part${part} = ${JSON.stringify(processedQuestions, null, 2)};\n\nexport default questionSetSeason${season}Part${part};`;
        
        // Write back to file
        fs.writeFileSync(filePath, newContent);
        
        console.log(`Successfully processed ${filePath}`);
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
    }
};

// Process all question files in the cluebase-questions directory
const questionFilesDir = path.join(process.cwd(), 'src', 'cluebase-questions');
const files = fs.readdirSync(questionFilesDir);

files.forEach(file => {
    if (file.startsWith('jeopardy-questions-season')) {
        processQuestionFile(path.join(questionFilesDir, file));
    }
}); 