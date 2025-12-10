/**
 * Game.js
 * ------------------------------------------
 * - 게임의 핵심 도메인 로직을 담당하는 클래스.
 * - 상태 관리(점수, 목숨, 시간, 난이도, 게임 상태),
 *   Paddle/BallSystem/BrickField/Item 등 하위 객체를 조합하고 업데이트한다.
 * - 렌더링, 충돌 처리, 아이템 처리, 난이도 적용 등을 한 곳에서 조율한다.
 */
import { GAME_STATE, BALL_CONFIG, PADDLE_CONFIG, BRICK_LAYOUT } from "../config/constants.js";
import { BrickField } from "./BrickField.js";
import { Ball } from "./Ball.js";
import { Paddle } from "./Paddle.js";
import { BallSystem } from "./BallSystem.js";
import { CollisionSystem } from "./CollisionSystem.js";
import { ItemFactory } from "../items/ItemFactory.js";

// 🔹 난이도 프리셋 (블럭 하강 속도 + 블럭 체력 배수)
const DIFFICULTY_PRESETS = {
  easy: {
    rowFallInterval: 30,     // 줄 내려오는 주기(초) → 느리게
    brickLifeMultiplier: 0.8 // 블럭 체력 80%
  },
  normal: {
    rowFallInterval: 26,     // 기존 기본값
    brickLifeMultiplier: 1.0 // 기본 체력
  },
  hard: {
    rowFallInterval: 22,      // 더 자주 내려옴
    brickLifeMultiplier: 1.4 // 체력 1.4배
  },
  extrim: {
    rowFallInterval: 18,      // 엄청 자주 내려옴
    brickLifeMultiplier: 1.8 // 체력 1.8배 (거의 2배 느낌)
  },
};

export class Game {
  /**
   * @param {Object} params
   * @param {HTMLCanvasElement} params.canvas
   * @param {CanvasRenderingContext2D} params.ctx
   * @param {Array} params.platformTypes  PLATFORM_TYPES
   * @param {Array} params.brickTypes     BRICK_TYPES
   * @param {ElementRules} params.elementRules
   * @param {GameUI} params.ui
   * @param {ScreenManager} params.screenManager
   * @param {(result:Object) => void} params.onGameEnd  // 기록 저장용 콜백
   */
  constructor({ canvas, ctx, platformTypes, brickTypes, elementRules, ui, screenManager, onGameEnd, }) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.ui = ui;
    this.screenManager = screenManager;
    this.elementRules = elementRules;

    this.onGameEnd = onGameEnd || null; // 콜백 저장

    this.platformTypes = platformTypes;
    this.brickTypes = brickTypes;
    this.currentPlatformIndex = 0;

    // 아이템 생성 팩토리
    this.itemFactory = new ItemFactory({ dropRate: 0.3 });

    this.state = GAME_STATE.MENU;
    this.score = 0;
    this.lives = 3;        // 난이도와 무관, 기본 3
    this.elapsedTime = 0;  // 플레이 시간(초)
    this.lastTimestamp = 0;

    // 🔹 난이도 기본값
    this.difficulty = "normal";
    this.brickLifeMultiplier = 1;

    // 🔹 난이도에 맞는 rowFallInterval 세팅
    this.applyDifficultySettings();
    this.rowFallTimer = 0;

    const startX = canvas.width / 2;
    const startY = canvas.height - 30;

    // 첫 공 생성 (각도 랜덤)
    const initialBall = this.createRandomBall(startX, startY);

    this.ballSystem = new BallSystem(initialBall);
    this.items = [];

    this.paddle = new Paddle(
      canvas.width,
      PADDLE_CONFIG.width,
      PADDLE_CONFIG.height,
      PADDLE_CONFIG.speed,
      PADDLE_CONFIG.bottomMargin
    );

    this.brickField = new BrickField(BRICK_LAYOUT, this.brickTypes, elementRules);
    this.CollisionSystem = new CollisionSystem(elementRules);
    // 🔹 생성 직후 현재 난이도의 체력 배수 적용
    this.brickField.setLifeMultiplier(this.brickLifeMultiplier);
  }

  /**
   * 초기 속도 크기를 유지하면서 방향만 랜덤인 Ball 생성.
   * @param {number} startX
   * @param {number} startY
   */
  createRandomBall(startX, startY) {
    // 기존 설정으로부터 "속도 크기"만 유지
    const baseVx = BALL_CONFIG.startSpeedX;
    const baseVy = BALL_CONFIG.startSpeedY;
    const speed = Math.sqrt(baseVx * baseVx + baseVy * baseVy);

    // 각도 범위: 30도 ~ 150도 (너무 옆으로 가는 것 방지)
    const minDeg = 30;
    const maxDeg = 150;
    const angleDeg = minDeg + Math.random() * (maxDeg - minDeg);
    const angleRad = (angleDeg * Math.PI) / 180;

    // cos: 좌우, sin: 위쪽, y는 위가 - 이므로 부호 주의
    const dx = speed * Math.cos(angleRad);
    const dy = -speed * Math.sin(angleRad);

    const cur = this.currentPlatform;
    return new Ball(
      BALL_CONFIG.radius,
      startX,
      startY,
      dx,
      dy,
      cur.type,
      cur.color
    );
  }

  /**
   * 게임 종료 시 콜백에 결과를 전달한다.
   * @param {"clear"|"gameover"} resultType
   */
  notifyGameEnd(resultType) {
    if (!this.onGameEnd) return;

    const result = {
      type: resultType,       // "clear" | "gameover"
      difficulty: this.difficulty,
      score: this.score,
      time: this.elapsedTime,
      timestamp: Date.now(),
    };

    this.onGameEnd(result);
  }

  /** 현재 난이도 설정 가져오기 */
  get difficultyConfig() {
    return DIFFICULTY_PRESETS[this.difficulty] || DIFFICULTY_PRESETS.normal;
  }

  /** 난이도에 따른 값 적용 (rowFallInterval + brickLifeMultiplier) */
  applyDifficultySettings() {
    const cfg = this.difficultyConfig;
    this.rowFallInterval = cfg.rowFallInterval;
    this.brickLifeMultiplier = cfg.brickLifeMultiplier;
  }

  /** 난이도 문자열 변경 (실제 적용은 applyDifficultySettings에서) */
  setDifficulty(level) {
    this.difficulty = level;
  }

  /** 난이도 선택 후 실제 게임 시작 */
  startWithDifficulty(level) {
    this.setDifficulty(level);
    this.applyDifficultySettings();

    // 브릭 체력 배수를 브릭필드에 전달
    this.brickField.setLifeMultiplier(this.brickLifeMultiplier);

    this.startGame();
  }

  /**
   * 게임 화면으로 넘어가되 플레이는 시작하지 않고
   * 난이도 선택 오버레이만 보여줄 때 호출.
   */
  showGameForDifficultySelect() {
    this.state = GAME_STATE.MENU;
    this.screenManager.showGame();
  }

  /** 현재 선택된 플랫폼 타입 */
  get currentPlatform() {
    return this.platformTypes[this.currentPlatformIndex];
  }

  /** 게임이 플레이 또는 일시정지 상태인지 여부 */
  isPlayingOrPaused() {
    return this.state === GAME_STATE.PLAYING || this.state === GAME_STATE.PAUSED;
  }

  // ===== 상태 전환 =====

  /** 완전 리셋 후 플레이 상태로 진입 */
  startGame() {
    this.resetGame();
    this.state = GAME_STATE.PLAYING;
    this.screenManager.showGame();
  }

  /** 메인 메뉴로 이동 */
  showMenu() {
    this.state = GAME_STATE.MENU;
    this.screenManager.showMenu();
  }

  /** 게임 설명 화면으로 이동 */
  showHowTo() {
    this.state = GAME_STATE.MENU;
    this.screenManager.showHowTo();
  }

  /** 현재 난이도 그대로 재시작 */
  restartInPlace() {
    this.startGame();
  }

  /** 일시정지 토글 */
  togglePause() {
    if (this.state === GAME_STATE.PLAYING) {
      this.state = GAME_STATE.PAUSED;
      this.lastTimestamp = 0;
    } else if (this.state === GAME_STATE.PAUSED) {
      this.state = GAME_STATE.PLAYING;
      this.lastTimestamp = 0;
    }
  }

  /** 플랫폼(패들)의 오행 속성을 다음 것으로 변경 */
  nextPlatformElement() {
    // 1) 플랫폼 인덱스 변경
    this.currentPlatformIndex =
      (this.currentPlatformIndex + 1) % this.platformTypes.length;

    const cur = this.currentPlatform;

    // 2) UI 갱신
    this.ui.updateElement(cur.type);
  }

  // ===== 입력 래핑 =====
  setMoveLeft(isDown) {
    this.paddle.setMoveLeft(isDown);
  }
  setMoveRight(isDown) {
    this.paddle.setMoveRight(isDown);
  }

  // ===== 리셋 =====

  /** 스코어/목숨/시간/브릭/공 등을 모두 초기화 */
  resetGame() {
    this.score = 0;
    this.lives = 3;
    this.elapsedTime = 0;
    this.currentPlatformIndex = 0;

    // 난이도 적용
    this.applyDifficultySettings();
    this.brickField.setLifeMultiplier(this.brickLifeMultiplier);

    this.ui.updateScore(this.score);
    this.ui.updateLives(this.lives);
    this.ui.updateElement(this.currentPlatform.type);

    // 상단 타이머 0으로
    this.ui.updateTimer(0);

    this.paddle.reset();

    this.rowFallTimer = 0;

    const startX = this.canvas.width / 2;
    const startY = this.canvas.height - 30;

    const initialBall = this.createRandomBall(startX, startY);

    // 공 시스템 / 아이템 초기화
    this.ballSystem = new BallSystem(initialBall);
    this.items = [];

    this.brickField.resetRandom();

    this.lastTimestamp = 0;
  }

  /** 라이프 0 또는 브릭이 라인에 닿았을 때 등 게임 오버 처리 */
  handleGameOver() {
    this.state = GAME_STATE.OVER;
    this.ui.updateScore(this.score);
    this.ui.updateGameOverTime(this.elapsedTime);
    this.screenManager.showGameOver();
    this.notifyGameEnd("gameover");
  }

  /**
   * 벽돌 하나가 파괴되었을 때 호출.
   * 점수 갱신 및 아이템 드랍 처리.
   */
  onBrickDestroyed(collisionResult) {
    // 1) 점수 갱신
    this.score += 1;
    this.ui.updateScore(this.score);

    // 2) 아이템 생성은 Factory에 위임
    const item = this.itemFactory.createRandomItem(collisionResult);
    if (item) {
      this.items.push(item);
    }
  }

  // ===== 메인 루프 =====

  /** requestAnimationFrame 기반 메인 루프 시작 */
  startLoop() {
    const step = (timestamp) => {
      if (!this.lastTimestamp) this.lastTimestamp = timestamp;
      const delta = (timestamp - this.lastTimestamp) / 1000;
      this.lastTimestamp = timestamp;

      const frameScale = delta * 60;

      if (this.state === GAME_STATE.PLAYING) {
        // 시간 누적 및 UI 타이머 갱신
        this.elapsedTime += delta;
        this.ui.updateTimer(this.elapsedTime);
        this.update(frameScale);
      }

      this.render();

      requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }

  /**
   * 한 프레임의 게임 상태 업데이트.
   * - 브릭 줄 내려오기
   * - 공/벽/패들/바닥 충돌 처리
   * - 라이프/공 리스폰 처리
   * - 아이템 업데이트
   */
  update(frameScale) {
    const balls = this.ballSystem.balls;

    const deltaSeconds = frameScale / 60;

    // 1) 벽돌 줄 이동 타이머
    this.rowFallTimer += deltaSeconds;
    if (this.rowFallTimer >= this.rowFallInterval) {
      this.rowFallTimer -= this.rowFallInterval;

      // 브릭 한 줄 내리고 새 줄 추가
      this.brickField.shiftDownAndAddRow();

      // 패들 위까지 내려왔는지 체크 → 게임 오버
      const paddleBoundsForLine = this.paddle.getBounds(this.canvas.height);
      const paddleTop = paddleBoundsForLine.top;

      if (this.brickField.hasBrickReachedLine(paddleTop)) {
        this.handleGameOver();
        return;
      }
    }

    // 공이 전혀 없으면 새로운 공 하나 생성
    if (balls.length === 0) {
      const startX = this.canvas.width / 2;
      const startY = this.canvas.height - 30;
      const initialBall = this.createRandomBall(startX, startY);
      this.ballSystem = new BallSystem(initialBall);
    }

    const paddleBounds = this.paddle.getBounds(this.canvas.height);
    const deadBallIndexes = [];

    // 각 공에 대해 충돌 및 이동 처리
    this.ballSystem.forEach((ball, index) => {
      const collisionResult = this.CollisionSystem.handleBallCollision(
        ball,
        this.brickField
      );

      // 브릭과 충돌
      if (collisionResult.collided) {
        const brickLeft   = collisionResult.brickX;
        const brickRight  = collisionResult.brickX + collisionResult.brickWidth;
        const brickTop    = collisionResult.brickY;
        const brickBottom = collisionResult.brickY + collisionResult.brickHeight;

        // 어느 방향으로 더 가까운지 계산 → 반사 축 결정
        const distLeft   = Math.abs((ball.x + ball.radius) - brickLeft);
        const distRight  = Math.abs((ball.x - ball.radius) - brickRight);
        const distTop    = Math.abs((ball.y + ball.radius) - brickTop);
        const distBottom = Math.abs((ball.y - ball.radius) - brickBottom);

        const minDist = Math.min(distLeft, distRight, distTop, distBottom);

        const EPS = 0.5; // 벽돌에서 약간 떨어뜨려서 '달라붙는' 현상 방지

        // 어느 면에 부딪혔는지에 따라 속도와 위치를 동시에 보정한다.
        if (minDist === distLeft) {
          // 벽돌의 왼쪽 면에 가까움 → 공의 오른쪽이 brickLeft에 닿은 것
          ball.dx = -Math.abs(ball.dx);                // 왼쪽으로 튕기기
          ball.x  = brickLeft - ball.radius - EPS;     // 벽돌 밖으로 살짝 이동
        } else if (minDist === distRight) {
          // 벽돌의 오른쪽 면에 가까움
          ball.dx = Math.abs(ball.dx);                 // 오른쪽으로 튕기기
          ball.x  = brickRight + ball.radius + EPS;
        } else if (minDist === distTop) {
          // 벽돌의 윗면에 가까움 → 공의 아래가 brickTop에 닿은 것
          ball.dy = -Math.abs(ball.dy);                // 위로 튕기기 (y는 위가 -)
          ball.y  = brickTop - ball.radius - EPS;
        } else {
          // 벽돌의 아랫면에 가까움
          ball.dy = Math.abs(ball.dy);                 // 아래로 튕기기
          ball.y  = brickBottom + ball.radius + EPS;
        }


        if (collisionResult.destroyed) {
          this.onBrickDestroyed(collisionResult);
        }
        // allCleared는 기록만; 현재는 처리하지 않음
      }

      const nextX = ball.x + ball.dx * frameScale;
      const nextY = ball.y + ball.dy * frameScale;

      // 좌우 벽 충돌
      if (nextX > this.canvas.width - ball.radius || nextX < ball.radius) {
        ball.dx = -ball.dx;
      }

      // 천장 / 패들 충돌
      if (nextY < ball.radius) {
        // 천장에 부딪힘
        ball.dy = -ball.dy;
      } else {
        // 패들과의 AABB 기반 충돌 체크
        if (
          nextX > paddleBounds.left &&
          nextX < paddleBounds.right &&
          nextY > paddleBounds.top &&
          nextY < paddleBounds.bottom
        ) {
          // 패들 중앙 기준으로 맞은 위치에 따라 x속도 재계산
          const center = paddleBounds.left + PADDLE_CONFIG.width / 2;
          const hitPos = (ball.x - center) / (PADDLE_CONFIG.width / 2);
          ball.dx = hitPos * 5;
          ball.dy = -Math.abs(ball.dy);

          // 패들 속성에 맞게 공의 오행/색상 변경
          const cur = this.currentPlatform;
          ball.setElement(cur.type, cur.color);

          // 리더 공이면 분신들의 속성도 동기화
          if (ball.isCloneLeader) {
            this.ballSystem.balls.forEach((other) => {
              if (other.isClone) {
                other.setElement(cur.type, cur.color);
              }
            });
          }
        }
      }

      // 바닥으로 떨어진 공 처리
      if (nextY - ball.radius > this.canvas.height) {
        deadBallIndexes.push(index);
      }
    });

    // 떨어진 공 정리 + 라이프 처리
    if (deadBallIndexes.length > 0) {
      // 뒤에서부터 삭제
      deadBallIndexes
        .sort((a, b) => b - a)
        .forEach((i) => {
          this.ballSystem.balls.splice(i, 1);
        });

      // 모든 공이 사라졌다면 라이프 감소
      if (this.ballSystem.balls.length === 0) {
        this.lives--;
        this.ui.updateLives(this.lives);

        if (this.lives <= 0) {
          this.handleGameOver();
          return;
        } else {
          // 남은 라이프가 있다면 패들 위치 기준으로 새 공 생성
          const startX = this.paddle.x + PADDLE_CONFIG.width / 2;
          const startY = this.canvas.height - 30;
          const newBall = this.createRandomBall(startX, startY);
          this.ballSystem = new BallSystem(newBall);
        }
      }
    }

    this.paddle.update(frameScale);
    // Behavior가 있다면 Behavior.update가 호출됨
    this.ballSystem.update(frameScale, { game: this });
    this.updateItems(frameScale);
  }

  /**
   * 아이템 위치 업데이트 및 패들과의 충돌 처리
   */
  updateItems(frameScale) {
    const paddleBounds = this.paddle.getBounds(this.canvas.height);

    this.items.forEach((item) => {
      item.update(frameScale);

      if (item.collidesWithRect(paddleBounds)) {
        const effectContext = { ballSystem: this.ballSystem };
        item.onPickup(effectContext);
      }
    });

    // 먹었거나 화면 아래로 떨어진 것 제거
    this.items = this.items.filter(
      (i) => i.isActive && i.y < this.canvas.height + 50
    );
  }

  /**
   * 모든 게임 오브젝트를 캔버스에 그린다.
   */
  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (!this.isPlayingOrPaused()) {
      return;
    }

    // 🔹 현재 떠 있는 모든 공을 기준으로 벽돌 광량 계산
    const balls = this.ballSystem ? this.ballSystem.balls : [];
    this.brickField.draw(ctx, balls);

    // 공 여러 개
    this.ballSystem.draw(ctx);

    // 아이템
    this.items.forEach((item) => item.draw(ctx));

    // 패들 (플랫폼 색은 잘 적용 중)
    this.paddle.draw(ctx, this.currentPlatform.color, this.canvas.height);

    // 일시정지 오버레이
    if (this.state === GAME_STATE.PAUSED) {
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.font = "28px system-ui, sans-serif";
      ctx.fillText(
        "일시 정지",
        this.canvas.width / 2,
        this.canvas.height / 2 - 16
      );

      ctx.font = "14px system-ui, sans-serif";
      ctx.fillText(
        "ESC / P : 계속   ·   R : 재시작   ·   Q : 메인으로",
        this.canvas.width / 2,
        this.canvas.height / 2 + 14
      );
      ctx.restore();
    }
  }
}
