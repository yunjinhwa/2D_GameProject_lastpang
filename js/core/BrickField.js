/**
 * BrickField.js
 * ------------------------------------------
 * - 전체 브릭(벽돌) 필드를 관리하는 클래스.
 * - 초기 랜덤 배치, 난이도에 따른 체력 배수, 줄 내려오기, 클리어 여부 판단을 담당.
 * - 브릭 렌더링 시 공들의 속성에 따른 glow 표현도 포함한다.
 */
import { Brick } from "./Brick.js";
import { randomInt } from "../utils/random.js";

export class BrickField {
  /**
   * @param {Object} layout     브릭 배치 레이아웃 설정
   * @param {Array} brickTypes  BRICK_TYPES 설정 배열
   * @param {ElementRules} elementRules 오행 규칙
   */
  constructor(layout, brickTypes, elementRules) {
    this.layout = layout;
    this.brickTypes = brickTypes;
    this.elementRules = elementRules;

    this.bricks = [];
    this.totalCount = layout.rows * layout.cols;
    this.aliveCount = this.totalCount;

    // 🔹 블럭 체력 배수 (난이도용)
    this.lifeMultiplier = 1;

    this.init();
  }

  // 🔹 Game에서 난이도 변경 시 호출
  setLifeMultiplier(multiplier) {
    this.lifeMultiplier = multiplier;
  }

  /** 필드를 랜덤 브릭으로 초기화한다. */
  init() {
    const { cols, rows, width, height, padding, offsetLeft, offsetTop } =
      this.layout;

    this.bricks = [];
    this.aliveCount = 0;

    for (let c = 0; c < cols; c++) {
      const col = [];
      for (let r = 0; r < rows; r++) {
        const baseConf =
          this.brickTypes[randomInt(0, this.brickTypes.length - 1)];

        // 🔹 난이도에 따른 체력 배수 적용
        const scaledLife = Math.max(
          1,
          Math.round(baseConf.life * this.lifeMultiplier)
        );
        const conf = {
          ...baseConf,
          life: scaledLife,
        };

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

  /**
   * (row, col) 위치의 벽돌에 오행에 따른 데미지를 적용한다.
   * @returns {{destroyed:boolean, scoreDelta:number}}
   */
  applyHit(row, col, ballElementType, elementRules) {
    const brick = this.bricks[col][row];
    if (!brick || brick.life <= 0) {
      return { destroyed: false, scoreDelta: 0 };
    }

    const damage = elementRules.getDamage(ballElementType, brick.type);

    // Brick 클래스의 hit()를 사용해서 life / status 둘 다 갱신
    const destroyed = brick.hit(damage);

    let scoreDelta = 0;
    if (destroyed) {
      this.aliveCount--;
      scoreDelta = 1;      // 점수 정책은 그대로
    }

    return { destroyed, scoreDelta };
  }

  /** 랜덤 초기화 */
  resetRandom() {
    this.init();
  }

  /** 모든 살아있는 벽돌이 제거됐는지 여부 */
  isCleared() {
    return this.aliveCount <= 0;
  }

  /**
   * 모든 브릭을 한 줄 아래로 내리고, 맨 위에 새 줄을 추가한다.
   * (난이도에 따라 주기적으로 호출됨)
   */
  shiftDownAndAddRow() {
    const { width, height, padding, offsetLeft, offsetTop, cols } = this.layout;
    const dy = height + padding;

    // 1) 살아있는 벽돌들을 한 칸 아래로 이동
    for (let c = 0; c < this.bricks.length; c++) {
      for (let r = 0; r < this.bricks[c].length; r++) {
        const b = this.bricks[c][r];
        if (b.status === 1) {
          b.y += dy;
        }
      }
    }

    // 2) 각 열마다 맨 위에 새 벽돌 하나씩 추가
    for (let c = 0; c < cols; c++) {
      const baseConf =
        this.brickTypes[randomInt(0, this.brickTypes.length - 1)];

      // 🔹 난이도 배수 적용
      const scaledLife = Math.max(
        1,
        Math.round(baseConf.life * this.lifeMultiplier)
      );
      const conf = {
        ...baseConf,
        life: scaledLife,
      };

      const x = c * (width + padding) + offsetLeft;
      const y = offsetTop;

      const newBrick = new Brick(conf, x, y);
      this.bricks[c].unshift(newBrick);
      this.aliveCount++;
    }
  }

  /**
   * 살아있는 벽돌 중, 주어진 y 라인까지 내려온 것이 있는지 검사
   * (예: 패들 위쪽 라인까지 내려왔는지 확인용)
   */
  hasBrickReachedLine(lineY) {
    const { height } = this.layout;

    for (let c = 0; c < this.bricks.length; c++) {
      for (let r = 0; r < this.bricks[c].length; r++) {
        const b = this.bricks[c][r];
        if (b.status !== 1) continue;

        const bottom = b.y + height;
        if (bottom >= lineY) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 모든 브릭을 그리되, 현재 존재하는 공들의 오행에 따라
   * glowFactor를 계산하여 밝기를 조절한다.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {Ball[]} balls  현재 화면에 떠 있는 공 배열
   */
  draw(ctx, balls) {
    const { width, height } = this.layout;

    // 공 배열에서 type만 뽑기 (null/undefined 제거)
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
          // 이 벽돌에 대해 “가장 유리한 공”의 데미지 찾기
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
              glowFactor = 2.0;    // 어떤 공이든 이 벽돌을 상극으로 이김 → 아주 밝게
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
}
