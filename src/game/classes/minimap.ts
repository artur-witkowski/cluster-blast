import { COLORS } from '../../utils/colors';
import { DOOR_POSITION } from '../constants/doors';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  DESTINATION_TILE_SIZE,
} from '../constants/game';
import { CollisionBox, Vector2 } from '../types/shared';
import { Player } from './player';
import { Renderable } from './renderable';
import { Stage } from './stage';

const DEFAULT_OPACITY = 0.5;
const FADED_OPACITY = 0.2;
const BORDER_RADIUS = 10;

export class Minimap extends Renderable {
  private opacity: number = DEFAULT_OPACITY;
  private width: number = CANVAS_WIDTH / 5;
  private height: number = CANVAS_HEIGHT / 5;
  private position: Vector2 = {
    x: DESTINATION_TILE_SIZE * 1.5,
    y: DESTINATION_TILE_SIZE * 1.5,
  } as Vector2;
  private player;
  private stage;

  constructor(player: Player, stage: Stage) {
    super();
    this.player = player;
    this.stage = stage;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const MINIMAP_ROOM_WIDTH = this.width / 6;
    const MINIMAP_ROOM_HEIGHT = this.height / 6;
    const MINIMAP_CURRENT_ROOM_POSITION_X =
      this.position.x + this.width / 2 - MINIMAP_ROOM_WIDTH / 2;
    const MINIMAP_CURRENT_ROOM_POSITION_Y =
      this.position.y + this.height / 2 - MINIMAP_ROOM_HEIGHT / 2;
    const MINIMAP_ROOM_DISTANCE = MINIMAP_ROOM_WIDTH / 10;

    ctx.save();
    ctx.globalAlpha = this.opacity;

    // Background
    ctx.strokeStyle = COLORS.backgroundColorDark;
    ctx.fillStyle = COLORS.backgroundColorDark;
    ctx.beginPath();
    ctx.roundRect(this.position.x, this.position.y, this.width, this.height, [
      BORDER_RADIUS,
    ]);
    ctx.stroke();
    ctx.fill();

    // Current map
    const currentRoom = this.stage.rooms.find(
      (room) => room.id === this.stage.currentRoomId
    );
    if (currentRoom) {
      ctx.strokeStyle = 'orange';
      ctx.fillStyle = 'orange';
      ctx.beginPath();
      ctx.rect(
        MINIMAP_CURRENT_ROOM_POSITION_X,
        MINIMAP_CURRENT_ROOM_POSITION_Y,
        MINIMAP_ROOM_WIDTH,
        MINIMAP_ROOM_HEIGHT
      );
      ctx.stroke();
      ctx.fill();

      // Nearby rooms
      ctx.strokeStyle = '#FFFFFF';
      ctx.fillStyle = '#FFFFFF';
      currentRoom.map.doors.forEach((door) => {
        ctx.beginPath();
        let X_POSITION = 0;
        let Y_POSITION = 0;
        if (door.doorPosition === DOOR_POSITION.RIGHT) {
          X_POSITION =
            MINIMAP_CURRENT_ROOM_POSITION_X +
            MINIMAP_ROOM_DISTANCE +
            MINIMAP_ROOM_WIDTH;
          Y_POSITION = MINIMAP_CURRENT_ROOM_POSITION_Y;
        } else if (door.doorPosition === DOOR_POSITION.LEFT) {
          X_POSITION =
            MINIMAP_CURRENT_ROOM_POSITION_X -
            MINIMAP_ROOM_DISTANCE -
            MINIMAP_ROOM_WIDTH;
          Y_POSITION = MINIMAP_CURRENT_ROOM_POSITION_Y;
        } else if (door.doorPosition === DOOR_POSITION.UP) {
          X_POSITION = MINIMAP_CURRENT_ROOM_POSITION_X;
          Y_POSITION =
            MINIMAP_CURRENT_ROOM_POSITION_Y -
            MINIMAP_ROOM_DISTANCE -
            MINIMAP_ROOM_HEIGHT;
        } else if (door.doorPosition === DOOR_POSITION.DOWN) {
          X_POSITION = MINIMAP_CURRENT_ROOM_POSITION_X;
          Y_POSITION =
            MINIMAP_CURRENT_ROOM_POSITION_Y +
            MINIMAP_ROOM_DISTANCE +
            MINIMAP_ROOM_HEIGHT;
        } else {
          return;
        }

        ctx.rect(
          X_POSITION,
          Y_POSITION,
          MINIMAP_ROOM_WIDTH,
          MINIMAP_ROOM_HEIGHT
        );
        ctx.stroke();
        ctx.fill();
      });
    }

    ctx.restore();
  }

  update(lagOffset: number): void {
    const collisionBox = {
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
    } as CollisionBox;

    const isPlayerOnMinimap = this.player.isNearPosition(
      this.position,
      collisionBox,
      DESTINATION_TILE_SIZE / 2
    );
    if (isPlayerOnMinimap && this.opacity > FADED_OPACITY) {
      this.opacity -= lagOffset / 1000;
    } else if (!isPlayerOnMinimap && this.opacity < DEFAULT_OPACITY) {
      this.opacity += lagOffset / 1000;
    }
  }
}