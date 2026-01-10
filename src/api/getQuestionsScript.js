const cats = document.getElementsByClassName("category_name");
const qs = document.getElementsByClassName("clue");
const ans =  document.getElementsByClassName("correct_response");
const gameTitle = document.getElementById('game_title').innerText;
const airDate = gameTitle?.split(' - ')[1];
const show_number = gameTitle?.split(' - ')[0];
const game_id = show_number.split('Show #')[1];
let categories = [];
let questions = [];
let answers = [];
const finalJeopardyQuestion = document.getElementById('clue_FJ').innerText;
Object.keys(cats).forEach(function(key, index) {
    categories.push(cats[key].innerHTML);
});
Object.keys(qs).forEach(function(key, index) {
    let questionHtml = qs[key].innerText;
    let categoryIndex;
    let round;
    let value;
    value = 200 * (Math.floor(index/6) + 1);
    if (index < 30) {
      categoryIndex = (index - ((Math.floor(index/6)) * 6));
      round = 'J!';
      value = 200 * (Math.floor(index/6) + 1);
    }
    if (index >= 30 && index < 60) {
      categoryIndex = ((index - ((Math.floor(index/6)) * 6)) + 6);
      round = 'DJ!';
      value = 400 * (Math.floor((index - 30)/6) + 1);
    }

    if (index === 60) {
      round = 'Final Jeopardy!';
      value = 'N/A';
    }

    
  
    // 50 - (floor of 50/6 * 6)
    if (questionHtml && index < 60) {
      questions.push(
        {
          "id" : game_id + '-' + index,
          "question" : questionHtml.split('\n\n')[1],
          "category" : categories[categoryIndex],
          "game_id" : game_id,
          "round" : round,
          "value" : value,
          "air_date" : airDate
        }
      )
    } 

    if (questionHtml && index === 60) {
      questions.push(
        {
          "id" : game_id + '-' + index,
          "question" : finalJeopardyQuestion,
          "category" : categories[12],
          "game_id" : game_id,
          "round" : round,
          "value" : value,
          "air_date" : airDate
        }
      )
    } 
});
Object.keys(ans).forEach(function(key, index) {
    questions[index].answer = ans[key].innerHTML;
});

console.log(questions);






// "game_id": 1 = 8045
// "game_id": 2 = 8044


// 8045 - (game_id - 1);

// "game_id": 100 = 7946

