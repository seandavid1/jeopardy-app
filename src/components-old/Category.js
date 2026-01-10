import React from 'react';
import { Typography } from '@mui/material';
import Question from '../Question';
import { CategoryTitleWrapper } from '../styles/BoardStyles';

function Category({ 
  clues, 
  hasDailyDouble1, 
  hasDailyDouble2, 
  jeopardyRound,
  dailyDoubleValue1,
  dailyDoubleValue2,
  updatePlayerOneScore,
  updatePlayerTwoScore,
  updateAnswered,
  answered,
  setHasControlOfBoard,
  playerOneName,
  playerTwoName,
  updateMissedQuestions,
  clueCountdown,
  throatCleared,
  setThroatCleared,
  playerOneScore,
  playerTwoScore,
  hasControlOfBoard,
  onQuestionDisplayChange,
  cpuSelectedClueId,
  gameOptions,
  trackPlayerResponseTime,
  trackPlayerCategoryPerformance,
  onCpuClueOpened
}) {
  return (
    <>
      {clues?.map((clue, index) => {
        let isDailyDouble = false;
        let multiplier = 200;
        if (jeopardyRound === 'Double Jeopardy') {
          multiplier = 400;
        }
        if (hasDailyDouble1 && (dailyDoubleValue1 === ((index + 1) * multiplier))) {
          isDailyDouble = true;
        }
        if (hasDailyDouble2 && (dailyDoubleValue2 === ((index + 1) * multiplier))) {
          isDailyDouble = true;
        }

        return (
          <div key={index}>
            {index === 0 && (
              <CategoryTitleWrapper>
                <Typography variant="h6">{clues[0].category}</Typography>
              </CategoryTitleWrapper>
            )}
            <Question
              clue={clue}
              index={index}
              updatePlayerOneScore={updatePlayerOneScore}
              updatePlayerTwoScore={updatePlayerTwoScore}
              updateAnswered={updateAnswered}
              answered={answered}
              jeopardyRound={jeopardyRound === 'Jeopardy' ? 200 : 400}
              setHasControlOfBoard={setHasControlOfBoard}
              playerOneName={playerOneName}
              playerTwoName={playerTwoName}
              updateMissedQuestions={updateMissedQuestions}
              clueCountdown={clueCountdown}
              throatCleared={throatCleared}
              setThroatCleared={setThroatCleared}
              isDailyDouble={isDailyDouble}
              playerOneScore={playerOneScore}
              playerTwoScore={playerTwoScore}
              hasControlOfBoard={hasControlOfBoard}
              onQuestionDisplayChange={onQuestionDisplayChange}
              cpuSelectedClueId={cpuSelectedClueId}
              onCpuClueOpened={onCpuClueOpened}
              gameOptions={gameOptions}
              trackPlayerResponseTime={trackPlayerResponseTime}
              trackPlayerCategoryPerformance={trackPlayerCategoryPerformance}
            />
          </div>
        );
      })}
    </>
  );
}

export default Category; 