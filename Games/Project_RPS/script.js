(function () {
  'use strict';

  const CHOICES = ['rock', 'paper', 'scissors'];
  const CHOICE_IMGS = {
    rock: 'assets/rock.png',
    paper: 'assets/paper.png',
    scissors: 'assets/scissors.png',
  };

  let userScore = 0;
  let computerScore = 0;
  let roundsToWin = 1; // best of 1 => 1, best of 3 => 2, best of 5 => 3
  let isAnimating = false;

  const landingPage = document.getElementById('landing-page');
  const gameScreen = document.getElementById('game-screen');
  const matchInfo = document.getElementById('match-info');
  const userScore_span = document.getElementById('user-score');
  const computerScore_span = document.getElementById('computer-score');
  const result_p = document.getElementById('result-message');
  const userBattleChoice = document.getElementById('user-battle-choice');
  const userChoiceImg = document.getElementById('user-choice-img');
  const compBattleChoice = document.getElementById('comp-battle-choice');
  const compPlaceholder = document.getElementById('comp-placeholder');
  const compChoiceImg = document.getElementById('comp-choice-img');
  const choice_rock = document.getElementById('rock');
  const choice_paper = document.getElementById('paper');
  const choice_scissors = document.getElementById('scissors');
  const gameOverArea = document.getElementById('game-over-area');
  const gameOverMessage = document.getElementById('game-over-message');
  const playAgainBtn = document.getElementById('play-again-btn');
  const pointSfx = document.getElementById('point-sfx');
  const gameoverSfx = document.getElementById('gameover-sfx');

  function convertToWord(choice) {
    if (!choice || typeof choice !== 'string') return '';
    return choice.charAt(0).toUpperCase() + choice.slice(1).toLowerCase();
  }

  function getComputerChoice() {
    return CHOICES[Math.floor(Math.random() * 3)];
  }

  function playPointSfx() {
    if (pointSfx) {
      pointSfx.currentTime = 0;
      pointSfx.play().catch(() => {});
    }
  }

  function playGameOverSfx() {
    if (gameoverSfx) {
      gameoverSfx.currentTime = 0;
      gameoverSfx.play().catch(() => {});
    }
  }

  function setChoicesDisabled(disabled) {
    [choice_rock, choice_paper, choice_scissors].forEach((el) => {
      el.classList.toggle('disabled', disabled);
    });
  }

  function showUserChoice(choice) {
    const placeholder = userBattleChoice.querySelector('.placeholder-text');
    if (placeholder) placeholder.classList.add('hidden');
    userChoiceImg.src = CHOICE_IMGS[choice];
    userChoiceImg.alt = convertToWord(choice);
    userChoiceImg.classList.remove('hidden');
    userChoiceImg.classList.add('reveal');
  }

  function showComputerPlaceholder() {
    compPlaceholder.classList.remove('hidden');
    compPlaceholder.textContent = '...';
    compChoiceImg.classList.add('hidden');
    compChoiceImg.src = '';
  }

  function showComputerChoice(choice) {
    compPlaceholder.classList.add('hidden');
    compChoiceImg.src = CHOICE_IMGS[choice];
    compChoiceImg.alt = convertToWord(choice);
    compChoiceImg.classList.remove('hidden');
    compChoiceImg.classList.add('reveal');
  }

  function resetBattleArea() {
    const userPlaceholder = userBattleChoice.querySelector('.placeholder-text');
    if (userPlaceholder) {
      userPlaceholder.classList.remove('hidden');
      userPlaceholder.textContent = 'Your choice';
    }
    userChoiceImg.classList.add('hidden');
    userChoiceImg.classList.remove('reveal');
    userChoiceImg.src = '';
    compPlaceholder.classList.remove('hidden');
    compPlaceholder.textContent = '?';
    compChoiceImg.classList.add('hidden');
    compChoiceImg.classList.remove('reveal');
    compChoiceImg.src = '';
    userBattleChoice.classList.remove('green-glow', 'red-glow', 'gray-glow');
    compBattleChoice.classList.remove('green-glow', 'red-glow', 'gray-glow');
  }

  function applyGlow(element, glowClass) {
    if (!element || !glowClass) return;
    element.classList.add(glowClass);
    setTimeout(() => element.classList.remove(glowClass), 400);
  }

  function setResultMessage(message, resultClass) {
    result_p.textContent = message;
    result_p.classList.remove('win', 'loss', 'draw');
    if (resultClass) result_p.classList.add(resultClass);
  }

  function checkMatchOver() {
    if (userScore >= roundsToWin || computerScore >= roundsToWin) {
      return true;
    }
    return false;
  }

  function endMatch() {
    setChoicesDisabled(true);
    gameOverArea.classList.remove('hidden');
    gameOverMessage.classList.remove('you-win', 'you-lose');
    if (userScore >= roundsToWin) {
      gameOverMessage.textContent = 'You won the match!';
      gameOverMessage.classList.add('you-win');
    } else {
      gameOverMessage.textContent = 'Computer won the match!';
      gameOverMessage.classList.add('you-lose');
    }
    playGameOverSfx();
  }

  function handleResult(userChoice, computerChoice, outcome) {
    const userWord = convertToWord(userChoice);
    const compWord = convertToWord(computerChoice);

    if (outcome === 'draw') {
      setResultMessage(`Draw! Both chose ${userWord}.`, 'draw');
      applyGlow(userBattleChoice, 'gray-glow');
      applyGlow(compBattleChoice, 'gray-glow');
      return;
    }

    if (outcome === 'win') {
      userScore += 1;
      userScore_span.textContent = userScore;
      setResultMessage(
        `You win! Your ${userWord} beats Computer's ${compWord}.`,
        'win'
      );
      applyGlow(userBattleChoice, 'green-glow');
      applyGlow(compBattleChoice, 'red-glow');
      playPointSfx();
    } else {
      computerScore += 1;
      computerScore_span.textContent = computerScore;
      setResultMessage(
        `You lose! Computer's ${compWord} beats your ${userWord}.`,
        'loss'
      );
      applyGlow(userBattleChoice, 'red-glow');
      applyGlow(compBattleChoice, 'green-glow');
      playPointSfx();
    }
  }

  function runRound(userChoice) {
    if (isAnimating) return;
    isAnimating = true;
    setChoicesDisabled(true);
    setResultMessage('Computer is choosing...', '');
    resetBattleArea();

    showUserChoice(userChoice);
    showComputerPlaceholder();
    compBattleChoice.classList.add('shake');

    const computerChoice = getComputerChoice();

    const revealDelay = 800;
    setTimeout(() => {
      compBattleChoice.classList.remove('shake');
      showComputerChoice(computerChoice);

      const userWins =
        (userChoice === 'rock' && computerChoice === 'scissors') ||
        (userChoice === 'paper' && computerChoice === 'rock') ||
        (userChoice === 'scissors' && computerChoice === 'paper');
      const outcome =
        userChoice === computerChoice ? 'draw' : userWins ? 'win' : 'loss';

      setTimeout(() => {
        handleResult(userChoice, computerChoice, outcome);

        if (checkMatchOver()) {
          setTimeout(() => endMatch(), 500);
          isAnimating = false;
          return;
        }

        setChoicesDisabled(false);
        isAnimating = false;
        setResultMessage('Make your move');
      }, 400);
    }, revealDelay);
  }

  function startGame(rounds) {
    if (rounds === 1) roundsToWin = 1;
    else if (rounds === 3) roundsToWin = 2;
    else roundsToWin = 3;

    userScore = 0;
    computerScore = 0;
    userScore_span.textContent = '0';
    computerScore_span.textContent = '0';
    gameOverArea.classList.add('hidden');
    resetBattleArea();
    setResultMessage('Make your move');
    setChoicesDisabled(false);

    const bestOf = rounds === 1 ? 1 : rounds === 3 ? 3 : 5;
    matchInfo.textContent = `Best of ${bestOf} — First to ${roundsToWin} wins`;

    landingPage.classList.add('hidden');
    gameScreen.classList.remove('hidden');
  }

  function backToLanding() {
    gameScreen.classList.add('hidden');
    landingPage.classList.remove('hidden');
  }

  function main() {
    document.querySelectorAll('.mode-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const rounds = parseInt(btn.getAttribute('data-rounds'), 10);
        startGame(rounds);
      });
    });

    choice_rock.addEventListener('click', () => runRound('rock'));
    choice_paper.addEventListener('click', () => runRound('paper'));
    choice_scissors.addEventListener('click', () => runRound('scissors'));

    playAgainBtn.addEventListener('click', () => backToLanding());
  }

  main();
})();
