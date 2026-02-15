var buttonColours = ["red", "blue", "green", "yellow"];
var gamePattern = [];
var userClickedPattern = [];
var started = false;
var level = 0;
var gameSpeed = 1000; // Default speed for Easy

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
      setTimeout(function () {
        nextSequence();
      }, 1000);
    }
  } else {
    playSound("Game_Over_SFX"); // Play specifically requested sound
    $("body").addClass("game-over");
    $("#level-title").text("Game Over, Select Difficulty to Restart");

    setTimeout(function () {
      $("body").removeClass("game-over");
    }, 200);

    startOver();
  }
}

function nextSequence() {
  userClickedPattern = [];
  level++;
  $("#level-title").text("Level " + level);

  var randomNumber = Math.floor(Math.random() * 4);
  var randomChosenColour = buttonColours[randomNumber];
  gamePattern.push(randomChosenColour);

  // Use gameSpeed for the animation delay if we were chaining them, 
  // but for single flash helper, we just flash it.
  // The 'speed' difficulty implies how fast the next turn comes or how fast it flashes.
  // We can adjust the fade speed based on difficulty for better effect.

  setTimeout(function () {
    // Replaced fadeIn/Out with explicit visual activation to match user click
    $("#" + randomChosenColour).addClass("pressed");
    playSound(randomChosenColour);

    // Remove the class after a short delay to create the "flash" effect
    setTimeout(function () {
      $("#" + randomChosenColour).removeClass("pressed");
    }, gameSpeed / 2); // Visible for half the cycle time (e.g. 500ms for Easy)

  }, 500);
}

function animatePress(currentColor) {
  $("#" + currentColor).addClass("pressed");
  setTimeout(function () {
    $("#" + currentColor).removeClass("pressed");
  }, 100);
}

function playSound(name) {
  // Check if it's the specific Game Over sound which might be in a different format/name if not handled carefully
  // The user specified @[sounds/Game_Over_SFX.mp3]
  // The existing sounds are likely in sounds/name.mp3

  var soundPath = "sounds/" + name + ".mp3";
  // The user specifically mentioned @[sounds/Game_Over_SFX.mp3], so we ensure the name passed matches

  var audio = new Audio(soundPath);
  audio.play();
}

function startOver() {
  level = 0;
  gamePattern = [];
  started = false;
  $("#difficulty-selector").fadeIn(); // Show difficulty buttons again
}
