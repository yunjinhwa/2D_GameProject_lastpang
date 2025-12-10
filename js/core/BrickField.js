// js/core/BrickField.js
import { Brick } from "./Brick.js";
import { randomInt } from "../utils/random.js";

export class BrickField {
  constructor(layout, brickTypes, elementRules) {
    this.layout = layout;
    this.brickTypes = brickTypes;
    this.elementRules = elementRules;

    this.bricks = [];
    this.totalCount = layout.rows * layout.cols;
    this.aliveCount = this.totalCount;

    this.init();
  }

  init() {
    const { cols, rows, width, height, padding, offsetLeft, offsetTop } =
      this.layout;

    this.bricks = [];
    this.aliveCount = 0;

    for (let c = 0; c < cols; c++) {
      const col = [];
      for (let r = 0; r < rows; r++) {
        const conf =
          this.brickTypes[randomInt(0, this.brickTypes.length - 1)];
        const x = c * (width + padding) + offsetLeft;
        const y = r * (height + padding) + offsetTop;

        const brick = new Brick(conf, x, y);
        col.push(brick);
        this.aliveCount++;
      }
      this.bricks.push(col);
    }
    this.totalCount = this.aliveCount;
  }

  resetRandom() {
    this.init();
  }

  isCleared() {
    return this.aliveCount <= 0;
  }

  draw(ctx, balls) {
    const { width, height } = this.layout;

    // 🔹 공 배열에서 type만 뽑기 (null/undefined 제거)
    const ballTypes = Array.isArray(balls)
      ? balls
          .map((b) => b && b.type)
          .filter((t) => !!t)
      : [];

    for (let c = 0; c < this.bricks.length; c++) {
      for (let r = 0; r < this.bricks[c].length; r++) {
        const b = this.bricks[c][r];

        if (b.status !== 1) continue;

        let glowFactor = 1;

        if (ballTypes.length > 0) {
          // 🔥 이 벽돌에 대해 “가장 유리한 공”의 데미지 찾기
          let bestDamage = -Infinity;

          for (const ballType of ballTypes) {
            const damage = this.elementRules.getDamage(ballType, b.type);
            if (damage > bestDamage) {
              bestDamage = damage;
            }
          }

          // bestDamage 기준으로 유/불리 판단
          switch (bestDamage) {
            case 6:
              glowFactor = 2.0;    // 어떤 공이든 이 벽돌을 상극으로 이김 → 엄청 밝게
              break;
            case 4:
              glowFactor = 1.5;    // 벽돌이 어떤 공에게서 상생 도움 → 꽤 밝게
              break;
            case 3:
              glowFactor = 1.0;    // 기본
              break;
            case 2:
              glowFactor = 0.6;    // 공이 벽돌을 상생 → 조금 어둡게
              break;
            case 0:
              glowFactor = 0.25;   // 모든 공이 이 벽돌에게 상극으로 불리 → 어둡게
              break;
            default:
              glowFactor = 1.0;
          }
        }

        b.draw(ctx, width, height, glowFactor);
      }
    }
  }

  /**
   * 공과 벽돌의 충돌을 처리하고, 결과만 반환한다.
   * 상위 정책(점수, 클리어 처리)은 Game 쪽에서 결정.
   */
  handleCollisionWithBall(ball) {
    const { width, height } = this.layout;

    for (let c = 0; c < this.bricks.length; c++) {
      for (let r = 0; r < this.bricks[c].length; r++) {
        const b = this.bricks[c][r];
        if (b.status !== 1) continue;

        const inX =
          ball.x + ball.radius > b.x &&
          ball.x - ball.radius < b.x + width;
        const inY =
          ball.y + ball.radius > b.y &&
          ball.y - ball.radius < b.y + height;

        if (inX && inY) {
          const wasMovingDown = ball.dy > 0;
          const wasMovingUp = ball.dy < 0;

          if (wasMovingDown) {
            ball.y = b.y - ball.radius - 0.1;
          } else if (wasMovingUp) {
            ball.y = b.y + height + ball.radius + 0.1;
          }

          ball.dy = -ball.dy;

          let destroyed = false;

          const damage = this.elementRules.getDamage(ball.type, b.type);

          if (damage > 0) {
            destroyed = b.hit(damage);
            if (destroyed) {
              this.aliveCount--;
            }
          }

          // 🔥 여기서 벽돌 위치/크기까지 같이 넘겨준다
          return {
            collided: true,
            destroyed,
            allCleared: this.isCleared(),
            brickX: b.x,
            brickY: b.y,
            brickWidth: width,
            brickHeight: height,
          };
        }
      }
    }

    // 충돌 없음
    return {
      collided: false,
      destroyed: false,
      allCleared: this.isCleared(),
    };
  }
}
