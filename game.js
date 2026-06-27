const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

const MAP_WIDTH = 20;
const MAP_HEIGHT = 20;

const TILE_SIZE = 64;
const TILE_IMAGE_SIZE = 16;
const PLAYER_IMAGE_SIZE = 20;

const pressedKeys = {};

const Direction = Object.freeze({
    Down: 0,
    Left: 1,
    Right: 2,
    Up: 3,
});

const TileType = Object.freeze({
    Neutral: 0,
    Ally: 1,
    Enemy: 2,
});

const EnemyType = Object.freeze({
    Slime: {
        speed: 2,
        baseHp: 10,
    },
});

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
        this.data[y][x] = TileType.Neutral;
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
    // console.log("draw map");

    const ts = TILE_SIZE;
    const tis = TILE_IMAGE_SIZE;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {

        const tileId = this.data[y][x];
        // console.log(tileId);

        ctx.drawImage(
          this.tileset,
          tileId * tis,
          0,
          tis,
          tis,
          x * ts,
          y * ts,
          ts,
          ts
        );
      }
    }
  }
}

class Entity {
  constructor(x, y, img, speed = 4) {
    this.x = x;
    this.y = y;
    this.targetX = this.x;
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
    const pis = PLAYER_IMAGE_SIZE;
    const ts = TILE_SIZE;

    const sx = this.frame * pis;
    const sy = this.direction * pis;

    ctx.drawImage(this.img, sx, sy, pis, pis, this.x, this.y, ts, ts);
  }
}

class Player extends Entity {
  update(pressedKeys) {

    const arrived =
          this.x === this.targetX &&
          this.y === this.targetY;
    if(arrived){
        if (pressedKeys["ArrowUp"] || pressedKeys["w"]) {
          this.targetY -= TILE_SIZE;
          this.direction = Direction.Up;
        }

        else if (pressedKeys["ArrowLeft"] || pressedKeys["a"]) {
          this.targetX -= TILE_SIZE;
          this.direction = Direction.Left;
        }

        else if (pressedKeys["ArrowRight"] || pressedKeys["d"]) {
          this.targetX += TILE_SIZE;
          this.direction = Direction.Right;
        }

        else if (pressedKeys["ArrowDown"] || pressedKeys["s"]) {
          this.targetY += TILE_SIZE;
          this.direction = Direction.Down;
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
  player = new Player(128, 128, Assets.player);
  gameMap = new GameMap(MAP_WIDTH, MAP_HEIGHT, Assets.tileset);
  loop();
});