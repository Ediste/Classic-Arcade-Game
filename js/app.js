// All objects in the game that are able to move
class MoveableObject {
  constructor(sprite, startX = 0, startY = 0) {
    // The image/sprite for our moveable objects, this uses
    // a helper we've provided to easily load images
    this.sprite = sprite;
    this.x = startX;
    this.y = startY;
    this.width = 101;
    this.height = 83;
  }

  // Draw the object on the screen
  render() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  }
}


// Enemies our player must avoid
class Enemy extends MoveableObject {
  constructor({
    name = 'Bug',
    image = 'images/enemy-bug.png',
    startY = 0
  } = {}) {
    super(image, (Math.random() * 500), startY);
    this.name = name;
    this.speed = 50 + (Math.random() * 100);
  }

  // Update the enemy's position, required method for game
  // Parameter: dt, a time delta between ticks
  update(dt) {
    // Multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.

    if (this.x > 500) {
      this.x = 0 - (Math.random() * 500);
      this.speed = 50 + (Math.random() * 100);
    }
    this.x += (this.speed * dt);
  }
};

// Main Player
class Player extends MoveableObject {
  constructor({
    image = 'images/char-boy.png',
    startX = 202,
    startY = 404
  } = {}) {
    super(image, startX, startY);
    this.startX = startX;
    this.startY = startY;
    this.width = 67;
    this.height = 76;
  }

  resetPosition() {
    this.x = this.startX;
    this.y = this.startY;
  }

  update(dt) {
    // Check if collisions occur
    let failed = false;

    var collidedElem = doCollide(this, allEnemies, 30, 30);
    // Check collision with enemy
    if (collidedElem != null) {
      failed = true;
      killerNames.push(collidedElem.name)

      document.querySelector('.killtext').innerText = `You were killed by ${collidedElem.name}`;
      killInformation.classList.remove('hide', 'show');
      killInformation.classList.add('hide');
      killInformation.classList.remove('hide', 'show');
      killInformation.classList.add('show');

      this.resetPosition();
    }

    // Check collision with Water -> Only check if not failed already
    if (!failed && this.y < 0) {
      const reachedBridge = doCollide(this, [bridge]);

      if (reachedBridge) {
        // Success -> We have a winner
        stopTimer();
        showSuccessPanel();
        return;
      } else {
        document.querySelector('.killtext').innerText = `You were killed by the water`;
        killerNames.push('the water')

        killInformation.classList.remove('hide', 'show');
        killInformation.classList.add('show');

        this.resetPosition();
        failed = true;
      }
    }

    if (failed) {
      remainingLives -= 1;
      updateRemainingLives();

      if (remainingLives <= 0) {
        // Game Over
        stopTimer();
        showGameoverPanel();
      }
    }
  }

  handleInput(key) {

    let newX = this.x;
    let newY = this.y;

    switch (key) {
      case 'left':
        newX = this.x - 101;
        break;
      case 'right':
        newX = this.x + 101;
        break;
      case 'up':
        newY = this.y - 83;
        break;
      case 'down':
        newY = this.y + 83;
        break;
      default:
        newX = this.x;
        newY = this.y;
    }

    // Check if the new position is outside the visible area
    if (newX < -2 || newX > 500 || newY < -15 || newY > 404) {
      // new position would be outside -> do not change position
    } else {
      this.x = newX;
      this.y = newY;
    }
  }
}

// Bridge to walk over the water
class Bridge extends MoveableObject {
  constructor({
    image = 'images/Rock.png',
    startX = 0,
    startY = -20
  } = {}) {
    super(image, startX, startY);
    this.speed = 50;
  }
  update(dt) {

    if (this.x < -100) {
      this.x = 550;
    }

    this.x -= (this.speed * dt);
  }
}

let availablePlayers = ['images/char-boy.png',
  'images/char-cat-girl.png',
  'images/char-horn-girl.png',
  'images/char-pink-girl.png',
  'images/char-princess-girl.png'
];

let allEnemies = [new Enemy({
    name: 'Erwin',
    startY: 60
  }),
  new Enemy({
    name: 'Kevin',
    startY: 143
  }),
  new Enemy({
    name: 'Alfons',
    startY: 226
  }),
  new Enemy({
    name: 'Dieter',
    startY: 60
  }),
  new Enemy({
    name: 'Agnes',
    startY: 226
  })
];

let bridge = new Bridge();


// at the start -> select random player
let selectedPlayerImage = shuffle(availablePlayers)[0];

// set the player later -> randomly or via the avatar selection window
let player;

let timerTotalSeconds = 0;
let timerInterval;
let remainingLives = 3;
let killerNames = [];

const gameContainer = document.querySelector('.game-container');
const resultContainer = document.querySelector('.result-container');

const avatarSelectionContainer = document.querySelector(".avatar-selection-container");

const successContainer = document.querySelector('.success-container');
const gameoverContainer = document.querySelector('.gameover-container');
const killInformation = document.querySelector('.kill-information');


// Check if objects collide -> Inspiration by:  https://stackoverflow.com/questions/13916966/adding-collision-detection-to-images-drawn-on-canvas
function doCollide(object1, objects, toleranceX = 0, toleranceY = 0) {
  // Add a tolerance to make it a bit more realistic
  for (const object2 of objects) {
    var collide = (object1.x + toleranceX < object2.x + object2.width &&
      object1.x + object1.width > object2.x + toleranceX &&
      object1.y + toleranceY < object2.y + object2.height &&
      object1.y + object1.height > object2.y + toleranceY);

    if (collide) {
      return object2;
    }
  }

  return null;
}

// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
  let currentIndex = array.length,
    temporaryValue, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function updateRemainingLives() {
  const lives = document.querySelectorAll('.lives .fa-heart');

  if (remainingLives === 3) {
    lives[0].className = 'fas fa-heart';
    lives[1].className = 'fas fa-heart';
    lives[2].className = 'fas fa-heart';
  } else if (remainingLives === 2) {
    lives[0].className = 'fas fa-heart';
    lives[1].className = 'fas fa-heart';
    lives[2].className = 'far fa-heart';
  } else if (remainingLives === 1) {
    lives[0].className = 'fas fa-heart';
    lives[1].className = 'far fa-heart';
    lives[2].className = 'far fa-heart';
  } else {
    lives[0].className = 'far fa-heart';
    lives[1].className = 'far fa-heart';
    lives[2].className = 'far fa-heart';
  }
}


function getFormatedTime(totalSeconds) {
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;

  if (minutes < 10) {
    minutes = '0' + minutes;
  }

  if (seconds < 10) {
    seconds = '0' + seconds;
  }

  return `${minutes}:${seconds}`;
}

function getFormatedKillerNames() {

  const killers = new Map();

  // Count the amount of different killers (group by)
  for (const killer of killerNames) {
    if (!killers.has(killer)) {
      killers.set(killer, 0);
    }

    let cnt = killers.get(killer);
    cnt += 1;

    killers.set(killer, cnt);
  }

  let killersFormated = [];

  // format the killer names properly
  for (const killer of killers) {
    const [key, value] = killer;
    if (value > 1) {
      killersFormated.push(`${key} (${value} times)`);
    } else {
      killersFormated.push(`${key}`);
    }
  }

  // join the names
  let killerText = '';
  let cnt = 0;
  let killersCnt = killersFormated.length;
  for (const killer of killersFormated) {

    killerText += `${killer}`;
    if (killersCnt === 1 || cnt === (killersCnt - 1)) {
      // only one item in der list or at the last item, do not add an seperator
    } else if (cnt === (killersCnt - 2)) {
      killerText += ` and `;
    } else {
      killerText += `, `;
    }
    cnt++;
  }

  return killerText;
}

// Inspiration from https://www.w3schools.com/howto/howto_js_countdown.asp
function startTimer() {
  function setTime() {
    timerTotalSeconds += 1;
    document.querySelector('.timerVal').textContent = getFormatedTime(timerTotalSeconds);
  }

  // Reset and start it directly -> otherwise we would have an delay of 1 second
  timerTotalSeconds = 0;
  clearInterval(timerInterval);
  setTime();

  timerInterval = setInterval(setTime, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function showSuccessPanel() {
  gameContainer.classList.remove('hide', 'show');
  gameContainer.classList.add('hide');

  successContainer.classList.remove('hide', 'show');
  successContainer.classList.add('show');

  gameoverContainer.classList.remove('hide', 'show');
  gameoverContainer.classList.add('hide');

  successContainer.querySelector('.total-play-time').textContent = getFormatedTime(timerTotalSeconds);
  successContainer.querySelector('.total-lives').textContent = remainingLives;
}

function showGameoverPanel() {
  gameContainer.classList.remove('hide', 'show');
  gameContainer.classList.add('hide');

  gameoverContainer.classList.remove('hide', 'show');
  gameoverContainer.classList.add('show');

  successContainer.classList.remove('hide', 'show');
  successContainer.classList.add('hide');

  gameoverContainer.querySelector('.gameover-killer-names').textContent = getFormatedKillerNames();
  gameoverContainer.querySelector('.total-play-time').textContent = getFormatedTime(timerTotalSeconds);

}

// Handles game reset states
function reset() {

  // Reset Avatar Image and Player Position
  gameContainer.querySelector('.avatar-image').setAttribute('src', selectedPlayerImage);

  player = new Player({
    image: selectedPlayerImage
  });
  player.resetPosition();

  // Reset States
  remainingLives = 3;
  killerNames = [];
  updateRemainingLives();

  // Show GameContainer
  gameContainer.classList.remove('hide', 'show');
  gameContainer.classList.add('show');

  // Hide SuccessContainer
  successContainer.classList.remove('hide', 'show');
  successContainer.classList.add('hide');

  // Hide GameoverContainer
  gameoverContainer.classList.remove('hide', 'show');
  gameoverContainer.classList.add('hide');

  // Hide KillInformationText
  killInformation.classList.remove('hide', 'show');
  killInformation.classList.add('hide');

  startTimer();
}


// This listens for key presses and sends the keys to the Player.handleInput() method.
document.addEventListener('keyup', function(e) {
  var allowedKeys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  };

  if (avatarSelectionContainer.classList.contains('show')) {
    // Do not move when the avatar selection window is opend
    return;
  }

  player.handleInput(allowedKeys[e.keyCode]);
});

// Listen after RestartButton or PlayAgain Button is clicked -> restart the game
gameContainer.querySelector('.restart-button').addEventListener('click', reset);

document.querySelectorAll('.play-again-button').forEach(function(elem) {
  elem.addEventListener('click', reset);
});

// Listen after Avatar Button in the score Pannel is clicked
gameContainer.querySelector('.score-panel .avatar-button').addEventListener('click', function() {

  // Show AvatarSelection Popup
  avatarSelectionContainer.classList.remove('hide', 'show');
  avatarSelectionContainer.classList.add('show');
});

// Listen after X in the Avatare Selection Popup is clicked
document.querySelector('.avatar-selection-close-button').addEventListener('click', function() {
  // Hide AvatarSelection Popup
  avatarSelectionContainer.classList.remove('hide', 'show');
  avatarSelectionContainer.classList.add('hide');
});

// Listen after Avatar in Avatar Selection Popup is clicked
document.querySelectorAll('.avatar-selection-container .avatar-button').forEach(function(elem) {
  elem.addEventListener('click', function() {

    // Avatar clicked
    let newAvatarImageUrl = this.querySelector('.avatar-image').getAttribute('src');
    selectedPlayerImage = newAvatarImageUrl;

    // Hide Avatar Selection Popup
    avatarSelectionContainer.classList.remove('hide', 'show');
    avatarSelectionContainer.classList.add('hide');

    // Restart the game with new avatar
    reset();
  });
});
