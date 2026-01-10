// Function to determine the top-level category based on the clue and response
export const getTopLevelCategory = (clue, response, originalCategory) => {
    const clueText = (clue + ' ' + response + ' ' + originalCategory).toLowerCase();
    
    // History
    if (clueText.match(/\b(war|battle|empire|kingdom|dynasty|century|ancient|medieval|revolution|president|prime minister|monarch|queen|king|emperor|historical|history)\b/)) {
        return "History";
    }
    
    // Geography
    if (clueText.match(/\b(country|city|state|river|mountain|ocean|continent|island|capital|border|landmark|geography|location|place|region)\b/)) {
        return "Geography";
    }
    
    // Science
    if (clueText.match(/\b(science|physics|chemistry|biology|astronomy|planet|star|galaxy|atom|molecule|element|experiment|scientist|discovery|invention|technology|engineering|mathematics|math|equation|formula)\b/)) {
        return "Science";
    }
    
    // Sports
    if (clueText.match(/\b(sport|athlete|team|player|coach|game|match|tournament|championship|olympics|score|win|league|baseball|football|basketball|soccer|hockey|golf|tennis)\b/)) {
        return "Sports";
    }
    
    // Entertainment
    if (clueText.match(/\b(movie|film|actor|actress|director|cinema|hollywood|oscar|emmy|grammy|award|celebrity|star|tv|television|show|series|episode|entertainment)\b/)) {
        return "Entertainment";
    }
    
    // Literature
    if (clueText.match(/\b(book|author|novel|poem|poetry|writer|literature|publish|library|fiction|non-fiction|classic|story|tale|narrative|writing|text|chapter|page)\b/)) {
        return "Literature";
    }
    
    // Pop Culture
    if (clueText.match(/\b(pop culture|trend|viral|social media|internet|meme|fashion|celebrity|influencer|youtube|tiktok|instagram|twitter|facebook|snapchat)\b/)) {
        return "Pop Culture";
    }
    
    // Food and Drink
    if (clueText.match(/\b(food|drink|cuisine|recipe|cooking|chef|restaurant|meal|dish|beverage|wine|beer|cocktail|ingredient|taste|flavor|culinary|gourmet|dining)\b/)) {
        return "Food and Drink";
    }
    
    // If none of the above match, return "Other"
    return "Other";
};

// Function to add top-level category to a question object
export const addTopLevelCategory = (question) => {
    return {
        ...question,
        topLevelCategory: getTopLevelCategory(question.clue, question.response, question.category)
    };
}; 