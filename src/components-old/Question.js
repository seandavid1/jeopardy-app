import React, { useEffect } from 'react';

function Question({
  clue,
  index,
  updatePlayerOneScore,
  updatePlayerTwoScore,
  updateAnswered,
  answered,
  jeopardyRound,
  setHasControlOfBoard,
  playerOneName,
  playerTwoName,
  updateMissedQuestions,
  clueCountdown,
  throatCleared,
  setThroatCleared,
  isDailyDouble,
  playerOneScore,
  playerTwoScore,
  hasControlOfBoard,
  onQuestionDisplayed
}) {
  // ... existing state variables ...

  useEffect(() => {
    if (showQuestion) {
      onQuestionDisplayed?.(true);
    } else {
      onQuestionDisplayed?.(false);
    }
  }, [showQuestion, onQuestionDisplayed]);

  // ... rest of the component code ...
}

export default Question; 