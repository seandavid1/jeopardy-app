import { Box, styled } from '@mui/material';

export const BoardWrapper = styled(Box)(
  ({ theme }) => `
    .clear-icon {
      cursor: pointer;
    }
    .ssh-link {
      color: ${theme.palette.primary.main}
    }
    .recommended {
      font-size: 14px; 
      color: #666;
    }
    .username {
      width: 90%;
    }
    .MuiTypography-h6 {
      font-weight: 700;
    }
  `
);

export const CategoryTitleWrapper = styled(Box)(
  () => `
      text-align: center;
      text-transform: uppercase;
      height: 100px;
      border: 3px solid black; 
      color: white;
      background-color: #0f258f; 
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px;
      h6 {
        line-height: 1; 
        font-wieght: 900;
      }
  `
);

export const ScoreWrapper = styled(Box)(
  () => `
      height: 30px;
      .score {
        color: #fff !important;
        position: absolute;
        top: 30px;
        width: 300px;
        text-align: center;
      }
      .score.player1 {
        left: 20px; 
      }
      .score.player2 {
        right: 20px;
      }
  `
); 