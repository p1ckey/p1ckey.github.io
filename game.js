const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

const MAP_WIDTH = 4;
const MAP_HEIGHT = 4;

const TILE_SIZE = 64;
const TILE_IMAGE_SIZE = 16;
const PLAYER_IMAGE_SIZE = 20;

const pressedKeys = {};

let player;
let gameMap;


document.addEventListener("keydown", (e) => {
  pressedKeys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
  pressedKeys[e.key] = false;
});


class GameMap {
  constructor(width, height, tileset) {
    this.width = width;
    this.height = height;
    this.tileset = tileset;

    this.data = [];

    for (let y = 0; y < height; y++) {
      this.data[y] = [];

      for (let x = 0; x < width; x++) {
        this.data[y][x] = TileType.neutral;
      }
    }
  }

  getTile(x, y) {
    return this.data[y][x];
  }

  setTile(x, y, value) {
    this.data[y][x] = value;
  }

  draw(ctx) {
    const tis = TILE_IMAGE_SIZE;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {

        const tileId = this.data[y][x];

        ctx.drawImage(
          this.tileset,
          tileId * tis,
          0,
          tis,
          tis,
          x * TILE_SIZE,
          y * TILE_SIZE,
          TILE_SIZE,
          TILE_SIZE
        );
      }
    }
  }
}

class Entity {
  constructor(x, y, img, speed = 4) {
    this.x = x;
    this.y = y;
    this.targetX = this.    x;
    this.targetY = this.y;
    this.speed = speed;
    this.img = img;
    this.frame = 0;
    this.anim=0;
    this.direction = 0;
    this.moving = false;
  }

moveTowardTarget() {
    this.moving = this.x !== this.targetX || this.y !== this.targetY;
    if (!this.moving) {
      this.frame = 0;
      return;
    }
    this.anim += 0.05;
    this.frame = Math.floor(this.anim) % 2;

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    this.x += Math.abs(dx) <= this.speed ? dx : Math.sign(dx) * this.speed;
    this.y += Math.abs(dy) <= this.speed ? dy : Math.sign(dy) * this.speed;
  }

  update() {}

  draw(ctx) {
    const fw = PLAYER_IMAGE_SIZE;
    const fh = PLAYER_IMAGE_SIZE;

    const sx = this.frame * fw;
    const sy = this.direction * fh;

    ctx.drawImage(this.img, sx, sy, fw, fh, this.x, this.y, fw*4, fh*4);
  }
}

const Directions = {
  Down: 0,
  Left: 1,
  Right: 2,
  Up: 3,
};

class Player extends Entity {
  update(pressedKeys) {

    const arrived =
          this.x === this.targetX &&
          this.y === this.targetY;
    if(arrived){
        if (pressedKeys["ArrowUp"] || pressedKeys["w"]) {
          this.targetY -= 80;
          this.direction = Directions.Up;
        }

        else if (pressedKeys["ArrowLeft"] || pressedKeys["a"]) {
          this.targetX -= 80;
          this.direction = Directions.Left;
        }

        else if (pressedKeys["ArrowRight"] || pressedKeys["d"]) {
          this.targetX += 80;
          this.direction = Directions.Right;
        }

        else if (pressedKeys["ArrowDown"] || pressedKeys["s"]) {
          this.targetY += 80;
          this.direction = Directions.Down;
        }
    }
    
    this.moveTowardTarget();
  }
}
const Assets = {
    player: new Image(),
    enemy: new Image(),
    tileset: new Image(),
};

const TileType = {
    Neutral: 0,
    Ally: 1,
    Enemy: 2,
};

// const mapData = [
//     [ 0, 1, 1, 2],
//     [ 0, 1, 4, 2],
//     [ 0, 1, 5, 2],
//     [ 0, 1, 1, 2],
// ];

// function drawMap() {
//     let ts = 16;
//     for(let y = 0; y < MAP_HEIGHT; y++)
//         for(let x = 0; x < MAP_WIDTH; x++)
//             ctx.drawImage(Assets.tileset, mapData[y][x]*ts, 0, ts, ts,x*80,y*80,80,80);
// }

const EnemyTypes = {
    Slime: { speed: 2, baseHp: 10 },
};

function loadAssets(onReady) {
  let loaded = 0;
  const total = 3;

  function check() {
    loaded++;
    if (loaded === total) onReady();
  }

  Assets.player.onload = check;
  Assets.enemy.onload = check;
  Assets.tileset.onload = check;

  Assets.player.src = "assets/player.png";
  Assets.enemy.src = "assets/monster1.png";
  Assets.tileset.src = "assets/tile.png";
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  gameMap.draw(ctx);
    
  player.update(pressedKeys);
  player.draw(ctx);

  requestAnimationFrame(loop);
}

loadAssets(() => {
  player = new Player(100, 100, Assets.player);
  gameMap = new GameMap(30,30,Assets.tileset);
  loop();
});