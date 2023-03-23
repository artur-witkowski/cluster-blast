import { KEYS } from '../constants/keyboard';
import { Vector2 } from '../types/shared';
import { Sprite } from './sprite';
import characterBase from '../assets/character_base.png';
import { DIAGONAL_FACTOR_SPEED } from '../constants/game';
import { Map } from './map';
import {
  PLAYER_CONSTANT_SPEED_LOSE,
  PLAYER_MAX_VELOCITY,
  PLAYER_SPEED,
  PLAYER_TIME_BETWEEN_FRAMES_IN_MILLISECONDS,
  PLAYER_VELOCITY_THRESHOLD,
} from '../constants/player';
import { Game } from './game';

export class Player extends Sprite {
  private velocity: Vector2 = { x: 0, y: 0 };
  private direction: Vector2 = { x: 0, y: 0 };
  private image: HTMLImageElement;
  private imageProgress: number = 0;
  private lastFrameUpdateInMilliseconds: number = 0;
  private map: Map;
  private game: Game;

  constructor(
    map: Map,
    game: Game,
    x: number,
    y: number,
    width: number,
    height: number,
    imageSrc: string = characterBase
  ) {
    super(x, y, width, height);
    this.map = map;
    this.game = game;
    this.image = new Image();
    this.image.src = imageSrc;
  }

  renderSprite(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(
      this.image,
      this.imageProgress * 16, // Start crop position
      this.getDirectionSprite() * 16,
      16, // Width and height of the crop
      16,
      this.position.x, // Place the result at x, y in the canvas,
      this.position.y,
      this.width, // Destination image width and height
      this.height
    );
  }

  update(lag: number) {
    this.updateDirections();
    this.updateSpriteProgress(lag);

    // We are constantly slowing down the player if not moving
    if (!this.direction.x) this.velocity.x *= PLAYER_CONSTANT_SPEED_LOSE;
    if (!this.direction.y) this.velocity.y *= PLAYER_CONSTANT_SPEED_LOSE;
    if (Math.abs(this.velocity.x) < PLAYER_VELOCITY_THRESHOLD) {
      this.velocity.x = 0;
    }
    if (Math.abs(this.velocity.y) < PLAYER_VELOCITY_THRESHOLD) {
      this.velocity.y = 0;
    }

    const isDiagonal = this.direction.x && this.direction.y;

    // We are adding the velocity to the position
    this.changePosition(
      this.velocity.x * (isDiagonal ? DIAGONAL_FACTOR_SPEED : 1),
      this.velocity.y * (isDiagonal ? DIAGONAL_FACTOR_SPEED : 1)
    );

    if (this.direction.x) {
      this.changeVelocity(this.direction.x * PLAYER_SPEED, 0);
    }
    if (this.direction.y) {
      this.changeVelocity(0, this.direction.y * PLAYER_SPEED);
    }
  }

  private changePosition(x: number, y: number) {
    if (
      (this.map.width - this.width > this.position.x + x &&
        this.position.x + x > 0) ||
      (this.map.width - this.width < this.position.x + x &&
        this.position.x + x < 0)
    ) {
      this.position.x += x;
    } else {
      this.velocity.x = 0;
    }

    if (
      (this.map.height - this.height > this.position.y + y &&
        this.position.y + y > 0) ||
      (this.map.height - this.height < this.position.y + y &&
        this.position.y + y < 0)
    ) {
      this.position.y += y;
    } else {
      this.velocity.y = 0;
    }
  }

  private getDirectionSprite() {
    if (this.direction.x === 1) {
      return 2;
    } else if (this.direction.x === -1) {
      return 3;
    } else if (this.direction.y === -1) {
      return 1;
    } else {
      return 0;
    }
  }

  private changeVelocity(x: number, y: number) {
    if (this.velocity.x + x > PLAYER_MAX_VELOCITY) {
      this.velocity.x = PLAYER_MAX_VELOCITY;
    } else if (this.velocity.x + x < -PLAYER_MAX_VELOCITY) {
      this.velocity.x = -PLAYER_MAX_VELOCITY;
    } else {
      this.velocity.x += x;
    }

    if (this.velocity.y + y > PLAYER_MAX_VELOCITY) {
      this.velocity.y = PLAYER_MAX_VELOCITY;
    } else if (this.velocity.y + y < -PLAYER_MAX_VELOCITY) {
      this.velocity.y = -PLAYER_MAX_VELOCITY;
    } else {
      this.velocity.y += y;
    }
  }

  private changeDirection(x: 1 | -1 | 0 | null, y: 1 | -1 | 0 | null) {
    if (x !== null) {
      this.direction.x = x;
    }
    if (y !== null) {
      this.direction.y = y;
    }
  }

  private updateDirections() {
    if (
      this.game.keyPressed.has(KEYS.LEFT) &&
      !this.game.keyPressed.has(KEYS.RIGHT)
    ) {
      this.changeDirection(-1, null);
    } else if (
      this.game.keyPressed.has(KEYS.RIGHT) &&
      !this.game.keyPressed.has(KEYS.LEFT)
    ) {
      this.changeDirection(1, null);
    } else {
      this.changeDirection(0, null);
    }

    if (
      this.game.keyPressed.has(KEYS.UP) &&
      !this.game.keyPressed.has(KEYS.DOWN)
    ) {
      this.changeDirection(null, -1);
    } else if (
      this.game.keyPressed.has(KEYS.DOWN) &&
      !this.game.keyPressed.has(KEYS.UP)
    ) {
      this.changeDirection(null, 1);
    } else {
      this.changeDirection(null, 0);
    }
  }

  private updateSpriteProgress(lag: number) {
    this.lastFrameUpdateInMilliseconds += lag;

    if (
      this.lastFrameUpdateInMilliseconds >
      PLAYER_TIME_BETWEEN_FRAMES_IN_MILLISECONDS
    ) {
      if ((this.direction.x || this.direction.y) && this.imageProgress < 3) {
        this.imageProgress++;
      } else {
        this.imageProgress = 0;
      }
      this.lastFrameUpdateInMilliseconds = 0;
    }
  }
}