var buttonColours = ["red", "blue", "green", "yellow"];
var gamePattern = [];
var userClickedPattern = [];
var started = false;
var level = 0;
var gameSpeed = 1000; // Default speed for Easy

function updateBestRecordDisplay() {
  if (window.CyberSystem && window.CyberSystem.Scores) {
    var best = window.CyberSystem.Scores.get("memory");
    $("#memory-best-badge").text("BEST RECORD: LVL " + best);
  }
}

// Initial record display
$(document).ready(function () {
  updateBestRecordDisplay();

  // Wire up HUD toggles
  $("#hud-audio-toggle").click(function () {
    if (window.CyberSystem) window.CyberSystem.Audio.toggleMute();
  });
  $("#hud-crt-toggle").click(function () {
    if (window.CyberSystem) window.CyberSystem.CRT.toggle();
  });
});

// Difficulty Selection
$(".diff-btn").click(function () {
  if (!started) {
    var difficulty = $(this).attr("id");
    setDifficulty(difficulty);

    $("#difficulty-selector").hide();
    $("#level-title").text("Level " + level);
    nextSequence();
    started = true;
  }
});

function setDifficulty(diff) {
  switch (diff) {
    case "easy":
      gameSpeed = 1000;
      break;
    case "medium":
      gameSpeed = 600;
      break;
    case "hard":
      gameSpeed = 300;
      break;
    default:
      gameSpeed = 1000;
  }
}

$(".btn").click(function () {
  if (!started) return;

  var userChosenColour = $(this).attr("id");
  userClickedPattern.push(userChosenColour);

  playSound(userChosenColour);
  animatePress(userChosenColour);

  checkAnswer(userClickedPattern.length - 1);
});

function checkAnswer(currentLevel) {
  if (gamePattern[currentLevel] === userClickedPattern[currentLevel]) {
    if (userClickedPattern.length === gamePattern.length) {
      // Save high score progress
      if (window.CyberSystem && window.CyberSystem.Scores) {
        window.CyberSystem.Scores.set("memory", level);
        updateBestRecordDisplay();
      }

      setTimeout(function () {
        nextSequence();
      }, 1000);
    }
  } else {
    playSound("Game_Over_SFX");
    if (window.CyberSystem && window.CyberSystem.Audio) {
      window.CyberSystem.Audio.playAlert();
    }
    $("body").addClass("game-over");
    $("#level-title").text("CONNECTION LOST // RE-ENGAGE");

    setTimeout(function () {
      $("body").removeClass("game-over");
    }, 250);

    startOver();
  }
}

function nextSequence() {
  userClickedPattern = [];
  level++;
  $("#level-title").text("LEVEL " + (level < 10 ? "0" + level : level));

  var randomNumber = Math.floor(Math.random() * 4);
  var randomChosenColour = buttonColours[randomNumber];
  gamePattern.push(randomChosenColour);

  setTimeout(function () {
    $("#" + randomChosenColour).addClass("pressed");
    playSound(randomChosenColour);

    setTimeout(function () {
      $("#" + randomChosenColour).removeClass("pressed");
    }, gameSpeed / 2);
  }, 500);
}

function animatePress(currentColor) {
  $("#" + currentColor).addClass("pressed");
  setTimeout(function () {
    $("#" + currentColor).removeClass("pressed");
  }, 100);
}

function playSound(name) {
  if (window.CyberSystem && window.CyberSystem.Audio && window.CyberSystem.Audio.isMuted()) {
    return;
  }
  var soundPath = "sounds/" + name + ".mp3";
  var audio = new Audio(soundPath);
  audio.play().catch(function () {});
}

function startOver() {
  level = 0;
  gamePattern = [];
  started = false;
  $("#difficulty-selector").fadeIn();
}
