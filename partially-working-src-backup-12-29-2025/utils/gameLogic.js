import questionSetSeason38Part1 from '../cluebase-questions/jeopardy-questions-season38-2021-09-12-to-2022-02-23-part1';
import questionSetSeason38Part2 from '../cluebase-questions/jeopardy-questions-season38-2022-02-23-to-2022-07-28-part2';
import questionSetSeason39Part1 from '../cluebase-questions/jeopardy-questions-season39-2022-09-11-to-2023-02-23-part1';
import questionSetSeason39Part2 from '../cluebase-questions/jeopardy-questions-season39-2023-02-23-to-2023-07-27-part2';
import questionSetSeason40Part1 from '../cluebase-questions/jeopardy-questions-season40-2023-09-10-to-2024-02-22-part1';
import questionSetSeason40Part2 from '../cluebase-questions/jeopardy-questions-season40-2024-02-22-to-2024-07-25-part2';
import questionSetSeason41Part1 from '../cluebase-questions/jeopardy-questions-season41-2024-09-08-to-2024-12-29-part1';
import questionSetSeason41Part2 from '../cluebase-questions/jeopardy-questions-season41-2024-12-29-to-2025-04-09-part2';

export function randomIntFromInterval(limit) {
  const num = Math.floor(Math.random() * (limit - 1 + 1) + 1);
  return num;
}

export const getCategory = async function (jeopardyRound) {
  console.log('getCategory called for round:', jeopardyRound);
  const allQuestions = questionSetSeason38Part1.concat(
    questionSetSeason38Part2,
    questionSetSeason39Part1,
    questionSetSeason39Part2,
    questionSetSeason40Part1,
    questionSetSeason40Part2,
    questionSetSeason41Part1,
    questionSetSeason41Part2
  );
  console.log('all qs length', allQuestions.length);
  
  const currentQuestionSet = await allQuestions.filter((item) => {
    if (item.round === jeopardyRound) {
      return item;
    }
  });
  console.log('currentQuestionSet length:', currentQuestionSet?.length);
  
  const count = currentQuestionSet?.length;
  console.log('count:', count);
  
  const rndNum = randomIntFromInterval(count);
  console.log('rndNum:', rndNum);
  
  const cat = currentQuestionSet[rndNum - 1]?.category;
  console.log('category:', cat);
  
  const questionsFilteredByCategory = await currentQuestionSet.filter((item) => {
    if (item.category === cat) {
      return item;
    }
  });
  console.log('questionsFilteredByCategory length:', questionsFilteredByCategory?.length);
  
  const rndNumTwo = randomIntFromInterval(questionsFilteredByCategory?.length);
  console.log('rndNumTwo:', rndNumTwo);
  
  const game_id = questionsFilteredByCategory[rndNumTwo - 1]?.game_id;
  console.log('game_id:', game_id);
  
  const fullResult = await questionsFilteredByCategory.filter((item) => {
    if (item.game_id === game_id) {
      return item;
    }
  });
  console.log('fullResult length:', fullResult?.length);
  
  fullResult.sort(function(a, b) {
    var keyA = new Date(a.value),
      keyB = new Date(b.value);
    // Compare the 2 dates
    if (keyA < keyB) return -1;
    if (keyA > keyB) return 1;
    return 0;
  });
  
  const result = fullResult.splice(0, 5);
  console.log('final result length:', result?.length);
  
  return result;
}

export const getDailyDoubles = (jeopardyRound, setDailyDoubleCategory1, setDailyDoubleCategory2, setDailyDoubleValue1, setDailyDoubleValue2) => {
  const rndCatNum = randomIntFromInterval(6);
  const rndCatNum2 = randomIntFromInterval(6);
  if (rndCatNum === rndCatNum2) {
    getDailyDoubles(jeopardyRound, setDailyDoubleCategory1, setDailyDoubleCategory2, setDailyDoubleValue1, setDailyDoubleValue2);
  }
  else {
    setDailyDoubleCategory1(rndCatNum);
    if (jeopardyRound === 'DJ!') {
      setDailyDoubleCategory2(rndCatNum2);
    }
  }
  const rndNum3 = randomIntFromInterval(4);
  const rndNum4 = randomIntFromInterval(4);
  if (jeopardyRound === 'J!') {
    setDailyDoubleValue1((rndNum3 + 1) * 200);
    setDailyDoubleValue2((rndNum4 + 1) * 200);
  }
  if (jeopardyRound === 'DJ!') {
    setDailyDoubleValue1((rndNum3 + 1) * 400);
    setDailyDoubleValue2((rndNum4 + 1) * 400);
  }
}

export const getCategoryClues = async (
  getCategory, 
  setCategoryClues, 
  categoryName, 
  jeopardyRound, 
  retryCount = 0
) => {
  if (retryCount >= 10) {
    console.error(`Failed to get ${categoryName} after 10 attempts`);
    return;
  }
  let resultNew = await getCategory(jeopardyRound);
  if (resultNew.length >= 5) {
    setCategoryClues(resultNew);
    console.log(`${categoryName} results:`, resultNew);
  } else {
    console.log(`Retrying ${categoryName}, attempt ${retryCount + 1}`);
    getCategoryClues(getCategory, setCategoryClues, categoryName, jeopardyRound, retryCount + 1);
  }
} 