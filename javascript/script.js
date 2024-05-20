function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

// Start kaboom
const JUMP_FORCE = 1500;
const SPEED = 320;

// initialize context
kaboom({
  root: document.getElementById('game-container'),
});

// load assets
loadSprite('bean', './img/dog.png', {
  // The image contains 9 frames layed out horizontally, slice it into individual frames

  sliceX: 4,
  sliceY: 4,
  // Define animations
  anims: {
    idle: {
      // Starts from frame 0, ends at frame 3
      from: 0,
      to: 3,
      // Frame per second
      speed: 4,
      loop: true,
    },
    run: {
      from: 3,
      to: 11,
      speed: 12,
      loop: true,
    },
    jump: 12,
  },
});

let DEF_COUNT = 1;
let DEF_GRAVITY = 800;
let DEF_AIR_DRAG = 0.9;
let DEF_VELOCITY = [4000, 1000];
let DEF_ANGULAR_VELOCITY = [-200, 200];
let DEF_SPREAD = 60;
let DEF_SPIN = [2, 8];
let DEF_SATURATION = 0.7;
let DEF_LIGHTNESS = 0.6;

loadSprite('cat', './img/cat.png');
loadSprite('cat2', './img/cat2.png');
loadSprite('cat3', './img/cat3.png');
loadSprite('cat4', './img/cat4.png');
loadSprite('road', './img/road.png');
loadSprite('trees', './img/trees.png');
loadSprite('hills', './img/hills.png');
loadSprite('clouds', './img/clouds.png');
loadSprite('leaf', './img/heart_leaf.png');
loadSound('meow', './sounds/cat_crush.mp3');
loadSound('music', '../sounds/birb.mp3');

const music = play('music', { loop: true });
music.volume = 0.2;

const randomCats = ['cat', 'cat2', 'cat3', 'cat4'];

function addConfetti(opt = {}) {
  const sample = (s) => (typeof s === 'function' ? s() : s);
  for (let i = 0; i < (opt.count ?? DEF_COUNT); i++) {
    const p = add([
      pos(
        sample(
          opt.pos ??
            vec2(rand(0, width()), rand(height() - height() * 1.2, height()))
        )
      ),
      sprite('leaf'),
      opacity(1),
      lifespan(10),

      z(rand(-2, 3)),
      anchor('center'),
      rotate(rand(0, 360)),
    ]);
    const windVelocity = -500; // Adjust the wind velocity as needed

    const spin = rand(DEF_SPIN[0], DEF_SPIN[1]);
    const gravity = opt.gravity ?? DEF_GRAVITY;
    const airDrag = opt.airDrag ?? DEF_AIR_DRAG;
    const heading = sample(opt.heading ?? 0) - 90;
    const spread = opt.spread ?? DEF_SPREAD;
    const head = heading + rand(-spread / 2, spread / 2);
    const vel = sample(opt.velocity ?? rand(DEF_VELOCITY[0], DEF_VELOCITY[1]));
    let velX = 0;
    let velY = 0;
    const velA = sample(
      opt.angularVelocity ??
        rand(DEF_ANGULAR_VELOCITY[0], DEF_ANGULAR_VELOCITY[1])
    );
    p.scale = opt.scale ?? DEF_SCALE;
    p.onUpdate(() => {
      // Apply wind effect (moving to the left)
      velY += gravity * dt();
      p.pos.x += velX * dt();
      p.pos.y += velY * dt();
      p.angle += velA * dt();
      velX += windVelocity * dt() * rand(1, 10); // Increase velX by the wind velocity

      velX *= airDrag;
      velY *= airDrag;
      p.scale.x = wave(-width() * 0.0005, width() * 0.0005, time() * spin);
    });
  }
}

scene('game', () => {
  // define gravity
  removeMenu();
  setBackground(210, 235, 240);
  setGravity(1300);
  DEF_SCALE = width() * 0.00005;
  loop(0.1, () => {
    addConfetti();
  });
  // add a game object to screen
  const player = add([
    // list of components
    sprite('bean', { width: width() * 0.2 }),
    pos(0, height() * 0.9),
    area({ scale: 0.7 }),
    anchor('bot'),
    body(),
    doubleJump(),
    z(1),
  ]);
  player.pos.x = player.width;

  let road = add([
    pos(0, height()),
    anchor('botleft'),
    area(),
    body({ isStatic: true }),
    sprite('road', { width: width(), height: height() * 0.1 }),
    z(1),
  ]);

  const trees1 = add([
    sprite('trees', { width: width() }),
    area(),
    anchor('botleft'),
    pos(-100, height() - height() * 0.084),
    {
      isBackground: true, // Add a custom flag to identify background objects
    },
    z(0),
    scale(1.4),
    move(LEFT, SPEED),
  ]);

  const trees2 = add([
    sprite('trees', { width: width() }),
    area(),
    anchor('botleft'),
    pos(trees1.width - 100, height() - height() * 0.084),
    {
      isBackground: true, // Add a custom flag to identify background objects
    },
    z(0),
    scale(1.4),
    move(LEFT, SPEED),
  ]);

  loop(0.05, () => {
    respawnTrees();
  });

  function respawnTrees() {
    if (trees1.pos.x < 0 - trees1.width - 100) {
      console.log('Ты где');
      trees1.pos.x = -100;
      trees2.pos.x = trees1.width - 100;
    }
  }

  const hills = add([
    sprite('hills', { width: width() }),
    area(),
    pos(0, height() - height() * 0.085),

    {
      isBackground: true,
    },
    scale(1),
    anchor('botleft'),
    z(-1),
    move(LEFT, 120),
  ]);

  const hills2 = add([
    sprite('hills', { width: width() }),
    area(),
    pos(hills.width, height() - height() * 0.085),

    {
      isBackground: true,
    },
    scale(1),
    anchor('botleft'),
    z(-1),
    move(LEFT, 120),
  ]);

  function respawnHills() {
    if (hills.pos.x < 0 - hills.width) {
      console.log('Ты где');
      hills.pos.x = 0;
      hills2.pos.x = hills2.width;
    }
  }

  loop(0.05, () => {
    respawnHills();
  });

  const clouds = add([
    sprite('clouds', { width: width() }),
    pos(-50, height()),
    anchor('botleft'),
    scale(1.2),
    area(),
    z(-2),
    {
      isBackground: true, // Add a custom flag to identify background objects
    },
  ]);

  player.play('run');

  player.onGround(() => {
    player.play('run');
  });

  // jump when user press space
  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' || event.key === ' ') {
      event.preventDefault;
      player.doubleJump();
      player.play('jump');
      console.log('Jump key pressed');
    }
  });

  document.addEventListener('click', (event) => {
    event.preventDefault;
    player.doubleJump();
    player.play('jump');
    console.log('Jump key pressed');
  });

  document.addEventListener('touchstart', (event) => {
    player.doubleJump();
    player.play('jump');
    console.log('Jump key pressed');
  });
  function randomCat() {
    let catWidth = 1;
    const randomIndex = Math.floor(Math.random() * randomCats.length);
    const randomSprite = randomCats[randomIndex];
    if (randomSprite === 'cat2') {
      catWidth = '0.165';
    } else if (randomSprite === 'cat') {
      catWidth = '0.13';
    } else if (randomSprite === 'cat3') {
      catWidth = '0.1';
    } else if (randomSprite === 'cat4') {
      catWidth = '0.13';
    }
    // add cat
    let cat = add([
      sprite(randomSprite, { width: width() * catWidth }),
      area({ scale: 0.2 }),
      pos(width(), height() - road.height),
      anchor('bot'),
      move(LEFT, SPEED),
      offscreen({ destroy: true }),
      'cat',
      z(2),
    ]);
    wait(rand(3, 5), randomCat);
  }
  randomCat();

  player.onCollide('cat', () => {
    go('lose', score);
    play('meow');
  });

  let score = 0;

  onUpdate(() => {
    score++;
    let scoreIncrease = document.querySelector('.score-increase');
    scoreIncrease.style.display = 'block';
    scoreIncrease.innerHTML = score;
  });
});

scene('lose', (score) => {
  const music = play('music', { loop: true });
  music.volume = 0.1;
  let scoreIncrease = document.querySelector('.score-increase');
  scoreIncrease.style.display = 'none';
  // display score
  setBackground(210, 235, 240);
  popMenu();
  DEF_SCALE = width() * 0.0002;
  loop(0.5, () => {
    addConfetti();
  });
  // go back to game with space is pressed
  let button = document.querySelector('.button');
  button.addEventListener('click', () => {
    console.log('click');
    go('game');
  });

  let scoreNumber = document.querySelector('.score-number');

  if (typeof score === 'undefined') {
    scoreNumber.innerHTML = ' - ';
  } else {
    scoreNumber.innerHTML = ` ${score} `;
  }
});

go('lose');

function popMenu() {
  let section = document.querySelector('.menu');
  section.style.display = 'flex';
}

function removeMenu() {
  let section = document.querySelector('.menu');
  section.style.display = 'none';
  console.log('удалил');
}

document.addEventListener('DOMContentLoaded', () => {
  go('lose');
  let leaves = document.querySelectorAll('.leaf');
  leaves.forEach((leaf) => {
    const { width, height } = leaf.getBoundingClientRect();
    leaf.style.top = `${getRandomArbitrary(
      0 - height,
      window.height() - height * 3
    )}px`;

    leaf.style.left = `${getRandomArbitrary(
      window.width(),
      window.width() - width
    )}px`;
  });
});
