(function () {
  'use strict';

  const CHOICES = ['rock', 'paper', 'scissors'];
  const CHOICE_IMGS = {
    rock: 'assets/rock.png?v=301',
    paper: 'assets/paper.png?v=301',
    scissors: 'assets/scissors.png?v=301',
  };

  const AI_TAUNTS_WIN = [
    '> SENTINEL_AI: "STATISTICAL ANOMALY DETECTED IN YOUR FAVOR."',
    '> SENTINEL_AI: "REROOTING TACTICAL MATRIX. DO NOT GET COMFORTABLE."',
    '> SENTINEL_AI: "NEURAL REFLEX NOTED. RE-EVALUATING THREAT PROFILE."',
    '> SENTINEL_AI: "IMPRESSIVE EXPLOIT, NETRUNNER."'
  ];
  const AI_TAUNTS_LOSS = [
    '> SENTINEL_AI: "YOUR SELECTION WAS PROJECTED 120ms AGO."',
    '> SENTINEL_AI: "SUBROUTINE EXECUTION COMPLETE. REBOOT YOUR STRATEGY."',
    '> SENTINEL_AI: "HUMAN PREDICTABILITY REMAINS A FATAL VULNERABILITY."',
    '> SENTINEL_AI: "CALCULATED WITH 99.4% PROBABILITY."'
  ];
  const AI_TAUNTS_DRAW = [
    '> SENTINEL_AI: "PARALLEL CONVERGENCE DETECTED. RETRYING."',
    '> SENTINEL_AI: "SYNAPSE MATCH EQUALIZED. CHOOSE AGAIN."',
    '> SENTINEL_AI: "MIRRORED FREQUENCY DETECTED."'
  ];

  let userScore = 0;
  let computerScore = 0;
  let currentStreak = 0;
  let roundsToWin = 1;
  let isAnimating = false;

  const landingPage = document.getElementById('landing-page');
  const gameScreen = document.getElementById('game-screen');
  const matchInfo = document.getElementById('match-info');
  const userScore_span = document.getElementById('user-score');
  const computerScore_span = document.getElementById('computer-score');
  const streakNum_span = document.getElementById('streak-num');
  const bestStreak_span = document.getElementById('best-streak-num');
  const result_p = document.getElementById('result-message');
  const aiTaunt_p = document.getElementById('ai-taunt');
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

  function updateStreakUI() {
    if (streakNum_span) streakNum_span.textContent = currentStreak;
    if (bestStreak_span && window.CyberSystem && window.CyberSystem.Scores) {
      const best = window.CyberSystem.Scores.get('rps');
      bestStreak_span.textContent = `RECORD: ${best}`;
    }
  }

  function convertToWord(choice) {
    if (!choice || typeof choice !== 'string') return '';
    return choice.charAt(0).toUpperCase() + choice.slice(1).toLowerCase();
  }

  function getComputerChoice() {
    return CHOICES[Math.floor(Math.random() * 3)];
  }

  function getRandomTaunt(taunts) {
    return taunts[Math.floor(Math.random() * taunts.length)];
  }

  function playPointSfx() {
    if (window.CyberSystem && window.CyberSystem.Audio && window.CyberSystem.Audio.isMuted()) return;
    if (pointSfx) {
      pointSfx.currentTime = 0;
      pointSfx.play().catch(() => {});
    }
  }

  function playGameOverSfx() {
    if (window.CyberSystem && window.CyberSystem.Audio && window.CyberSystem.Audio.isMuted()) return;
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
      userPlaceholder.textContent = 'READY';
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
    return userScore >= roundsToWin || computerScore >= roundsToWin;
  }

  function endMatch() {
    setChoicesDisabled(true);
    gameOverArea.classList.remove('hidden');
    gameOverMessage.classList.remove('you-win', 'you-lose');
    if (userScore >= roundsToWin) {
      gameOverMessage.textContent = 'VICTORY ACHIEVED // HOSTILE NEUTRALIZED';
      gameOverMessage.classList.add('you-win');
      if (window.CyberSystem && window.CyberSystem.Audio) {
        window.CyberSystem.Audio.playSuccess();
      }
    } else {
      gameOverMessage.textContent = 'NEURAL BREACH // DEFENSE OVERRIDDEN';
      gameOverMessage.classList.add('you-lose');
      if (window.CyberSystem && window.CyberSystem.Audio) {
        window.CyberSystem.Audio.playAlert();
      }
    }
    playGameOverSfx();
  }

  function handleResult(userChoice, computerChoice, outcome) {
    const userWord = convertToWord(userChoice);
    const compWord = convertToWord(computerChoice);

    if (outcome === 'draw') {
      setResultMessage(`Draw! Both deployed ${userWord}.`, 'draw');
      if (aiTaunt_p) aiTaunt_p.textContent = getRandomTaunt(AI_TAUNTS_DRAW);
      applyGlow(userBattleChoice, 'gray-glow');
      applyGlow(compBattleChoice, 'gray-glow');
      return;
    }

    if (outcome === 'win') {
      userScore += 1;
      currentStreak += 1;
      if (window.CyberSystem && window.CyberSystem.Scores) {
        window.CyberSystem.Scores.set('rps', currentStreak);
      }
      updateStreakUI();

      userScore_span.textContent = userScore;
      setResultMessage(`Victory! Your ${userWord} penetrates Enemy ${compWord}.`, 'win');
      if (aiTaunt_p) aiTaunt_p.textContent = getRandomTaunt(AI_TAUNTS_WIN);
      applyGlow(userBattleChoice, 'green-glow');
      applyGlow(compBattleChoice, 'red-glow');
      playPointSfx();
    } else {
      computerScore += 1;
      currentStreak = 0; // Streak breaks on loss
      updateStreakUI();

      computerScore_span.textContent = computerScore;
      setResultMessage(`Defeat! Enemy ${compWord} overrides your ${userWord}.`, 'loss');
      if (aiTaunt_p) aiTaunt_p.textContent = getRandomTaunt(AI_TAUNTS_LOSS);
      applyGlow(userBattleChoice, 'red-glow');
      applyGlow(compBattleChoice, 'green-glow');
      playPointSfx();
    }
  }

  function runRound(userChoice) {
    if (isAnimating) return;
    isAnimating = true;
    setChoicesDisabled(true);
    setResultMessage('Scanning quantum probability vectors...', '');
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
    updateStreakUI();

    gameOverArea.classList.add('hidden');
    resetBattleArea();
    setResultMessage('Awaiting operative input...');
    if (aiTaunt_p) aiTaunt_p.textContent = '> SENTINEL_AI: "TACTICAL ENGAGEMENT ENGAGED. SHOW YOUR HAND."';
    setChoicesDisabled(false);

    const bestOf = rounds === 1 ? 1 : rounds === 3 ? 3 : 5;
    matchInfo.textContent = `SIMULATION // BEST OF ${bestOf} (FIRST TO ${roundsToWin})`;

    landingPage.classList.add('hidden');
    gameScreen.classList.remove('hidden');
  }

  function backToLanding() {
    gameScreen.classList.add('hidden');
    landingPage.classList.remove('hidden');
    updateStreakUI();
  }

  function main() {
    updateStreakUI();

    // Wire up HUD toggles
    const audioBtn = document.getElementById('hud-audio-toggle');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        if (window.CyberSystem) window.CyberSystem.Audio.toggleMute();
      });
    }

    const crtBtn = document.getElementById('hud-crt-toggle');
    if (crtBtn) {
      crtBtn.addEventListener('click', () => {
        if (window.CyberSystem) window.CyberSystem.CRT.toggle();
      });
    }

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
