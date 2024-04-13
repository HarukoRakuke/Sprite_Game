// Responding to gravity & jumping

// Start kaboom
const JUMP_FORCE = 1500;
const SPEED = 320;

// initialize context
kaboom();

setBackground(210, 235, 240);

// load assets
loadSprite('bean', '../img/dog.png', {
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

const DEF_COUNT = 1;
const DEF_GRAVITY = 800;
const DEF_AIR_DRAG = 0.9;
const DEF_VELOCITY = [4000, 1000];
const DEF_ANGULAR_VELOCITY = [-200, 200];
const DEF_SPREAD = 60;
const DEF_SPIN = [2, 8];
const DEF_SATURATION = 0.7;
const DEF_LIGHTNESS = 0.6;

loadSprite('cat', '../img/cat.png');
loadSprite('cat2', '../img/cat2.png');
loadSprite('cat3', '../img/cat3.png');
loadSprite('road', '../img/road.png');
loadSprite('trees', '../img/trees.png');
loadSprite('hills', '../img/hills.png');
loadSprite('clouds', '../img/clouds.png');
loadSprite('leaf', '../img/heart_leaf.png');
loadSound('meow', '../sounds/cat_crush.mp3');

const randomCats = ['cat', 'cat2', 'cat3'];

scene('game', () => {
  // define gravity
  removeText();
  setGravity(1300);

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
        scale(width() * 0.0005),
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
      const vel = sample(
        opt.velocity ?? rand(DEF_VELOCITY[0], DEF_VELOCITY[1])
      );
      let velX = 0;
      let velY = 0;
      const velA = sample(
        opt.angularVelocity ??
          rand(DEF_ANGULAR_VELOCITY[0], DEF_ANGULAR_VELOCITY[1])
      );
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

  loop(0.1, () => {
    addConfetti();
  });
  // add a game object to screen
  const player = add([
    // list of components
    sprite('bean', { width: width() * 0.2 }),
    pos(100, height() * 0.9),
    area({ scale: 0.7 }),
    anchor('bot'),
    body(),
    doubleJump(),
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

  player.play('idle');

  add([
    pos(0, height()),
    anchor('botleft'),
    area(),
    body({ isStatic: true }),
    sprite('road', { width: width(), height: height() * 0.1 }),
    z(1),
  ]);

  onKeyDown('left', () => {
    player.move(-SPEED, 0);
    player.flipX = true;
    // .play() will reset to the first frame of the anim, so we want to make sure it only runs when the current animation is not "run"
    if (player.isGrounded() && player.curAnim() !== 'run') {
      player.play('run');
    }
  });

  onKeyDown('right', () => {
    player.move(SPEED, 0);
    player.flipX = false;
    if (player.isGrounded() && player.curAnim() !== 'run') {
      player.play('run');
    }
  });

  ['left', 'right'].forEach((key) => {
    onKeyRelease(key, () => {
      if (player.isGrounded() && !isKeyDown('left') && !isKeyDown('right')) {
        player.play('idle');
      }
    });
  });

  player.onGround(() => {
    player.play('idle');
  });

  // jump when user press space
  onKeyPress('up', () => {
    player.doubleJump();
    player.play('jump');
  });

  onKeyPress('space', () => {
    player.doubleJump();
    player.play('jump');
  });
  onTouchStart(() => {
    player.doubleJump();
    player.play('jump');
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
    }
    // add cat
    add([
      sprite(randomSprite, { width: width() * catWidth }),
      area({ scale: 0.3 }),
      pos(width(), height() - height() * 0.09),
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

  const scoreLabel = add([text(score), pos(24, 24)]);

  onUpdate(() => {
    score++;
    scoreLabel.text = score;
  });
});

scene('lose', (score) => {
  const menuDog = add([
    sprite('bean', { width: width() * 0.7 }),
    pos(0 + width() / 8, height() / 2),
    anchor('center'),
  ]);

  menuDog.frame = 12;

  // display score
  addText();
  // go back to game with space is pressed
  onKeyPress('space', () => go('game'));
  onClick(() => go('game'));
});

go('lose');

function addText() {
  let title = document.querySelector('.p');
  title.style.display = 'block';
}

function removeText() {
  let title = document.querySelector('.p');
  title.style.display = 'none';
}