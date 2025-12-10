// js/core/Game.js
import { GAME_STATE, BALL_CONFIG, PADDLE_CONFIG, BRICK_LAYOUT } from "../config/constants.js";
import { BrickField } from "./BrickField.js";
import { Ball } from "./Ball.js";
import { Paddle } from "./Paddle.js";
import { BallSystem } from "./BallSystem.js";
import { Item } from "../items/Item.js";
import { MultiBallEffect } from "../items/effects/MultiBallEffect.js";
import { CloneBallEffect } from "../items/effects/CloneBallEffect.js";
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
  constructor({ canvas, ctx, platformTypes, brickTypes, elementRules, ui, screenManager }) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.ui = ui;
    this.screenManager = screenManager;
    this.elementRules = elementRules;

    this.platformTypes = platformTypes;
    this.brickTypes = brickTypes;
    this.currentPlatformIndex = 0;
    this.itemFactory = new ItemFactory({ dropRate: 0.3 });

    this.state = GAME_STATE.MENU;
    this.score = 0;
    this.lives = 3;        // 난이도와 무관, 그대로 3
    this.elapsedTime = 0;
    this.lastTimestamp = 0;

    // 🔹 난이도 기본값
    this.difficulty = "normal";
    this.brickLifeMultiplier = 1;

    // 🔹 난이도에 맞는 rowFallInterval 세팅
    this.applyDifficultySettings();
    this.rowFallTimer = 0;

    const startX = canvas.width / 2;
    const startY = canvas.height - 30;

    const initialBall = new Ball(
      BALL_CONFIG.radius,
      startX,
      startY,
      BALL_CONFIG.startSpeedX,
      BALL_CONFIG.startSpeedY,
      this.currentPlatform.type,
      this.currentPlatform.color
    );

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

  // 🔹 현재 난이도 설정 가져오기
  get difficultyConfig() {
    return DIFFICULTY_PRESETS[this.difficulty] || DIFFICULTY_PRESETS.normal;
  }

  // 🔹 난이도에 따른 값 적용 (rowFallInterval + brickLifeMultiplier)
  applyDifficultySettings() {
    const cfg = this.difficultyConfig;
    this.rowFallInterval = cfg.rowFallInterval;
    this.brickLifeMultiplier = cfg.brickLifeMultiplier;
  }

  // 🔹 난이도 변경 (문자열: "easy" | "normal" | "hard" | "extrim")
  setDifficulty(level) {
    this.difficulty = level;
  }

  // 🔹 난이도 선택 후 실제 게임 시작
  startWithDifficulty(level) {
    this.setDifficulty(level);
    this.applyDifficultySettings();

    // 브릭 체력 배수를 브릭필드에 전달
    this.brickField.setLifeMultiplier(this.brickLifeMultiplier);

    this.startGame();
  }

  // 🔹 게임 화면으로 넘어가되 플레이는 시작하지 않고 난이도 선택만 보여줄 때
  showGameForDifficultySelect() {
    this.state = GAME_STATE.MENU;
    this.screenManager.showGame();
  }

  get currentPlatform() {
    return this.platformTypes[this.currentPlatformIndex];
  }

  isPlayingOrPaused() {
    return this.state === GAME_STATE.PLAYING || this.state === GAME_STATE.PAUSED;
  }

  // 상태 전환
  startGame() {
    this.resetGame();
    this.state = GAME_STATE.PLAYING;
    this.screenManager.showGame();
  }

  showMenu() {
    this.state = GAME_STATE.MENU;
    this.screenManager.showMenu();
  }

  showHowTo() {
    this.state = GAME_STATE.MENU;
    this.screenManager.showHowTo();
  }

  restartInPlace() {
    this.startGame();
  }

  togglePause() {
    if (this.state === GAME_STATE.PLAYING) {
      this.state = GAME_STATE.PAUSED;
      this.lastTimestamp = 0;
    } else if (this.state === GAME_STATE.PAUSED) {
      this.state = GAME_STATE.PLAYING;
      this.lastTimestamp = 0;
    }
  }

    nextPlatformElement() {
      // 1) 플랫폼 인덱스 변경
      this.currentPlatformIndex =
        (this.currentPlatformIndex + 1) % this.platformTypes.length;

      const cur = this.currentPlatform;

      // 2) UI 갱신
      this.ui.updateElement(cur.type);
    }


  setMoveLeft(isDown) {
    this.paddle.setMoveLeft(isDown);
  }
  setMoveRight(isDown) {
    this.paddle.setMoveRight(isDown);
  }

  // 리셋
  resetGame() {
    this.score = 0;
    this.lives = 3;
    this.elapsedTime = 0;
    this.currentPlatformIndex = 0;

    // 🔹 난이도에 맞춰 목숨 / 줄 내려오는 속도 적용
    this.applyDifficultySettings();
    this.brickField.setLifeMultiplier(this.brickLifeMultiplier);

    this.ui.updateScore(this.score);
    this.ui.updateLives(this.lives);
    this.ui.updateElement(this.currentPlatform.type);

    this.ui.updateTimer(0);

    this.paddle.reset();

    this.rowFallTimer = 0;

    const startX = this.canvas.width / 2;
    const startY = this.canvas.height - 30;

    const initialBall = new Ball(
      BALL_CONFIG.radius,
      startX,
      startY,
      BALL_CONFIG.startSpeedX,
      BALL_CONFIG.startSpeedY,
      this.currentPlatform.type,
      this.currentPlatform.color
    );

    // ✅ 공 시스템 / 아이템 초기화
    this.ballSystem = new BallSystem(initialBall);
    this.items = [];

    this.brickField.resetRandom();

    this.lastTimestamp = 0;
  }


  handleClear() {
    this.state = GAME_STATE.CLEAR;
    this.ui.updateScore(this.score);
    this.ui.updateClearTime(this.elapsedTime);
    this.screenManager.showClear();
  }

  handleGameOver() {
    this.state = GAME_STATE.OVER;
    this.ui.updateScore(this.score);
    this.ui.updateGameOverTime(this.elapsedTime);
    this.screenManager.showGameOver();
  }

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

  // 메인 루프 시작
  startLoop() {
    const step = (timestamp) => {
      if (!this.lastTimestamp) this.lastTimestamp = timestamp;
      const delta = (timestamp - this.lastTimestamp) / 1000;
      this.lastTimestamp = timestamp;

      const frameScale = delta * 60;

      if (this.state === GAME_STATE.PLAYING) {
        this.elapsedTime += delta;
        this.ui.updateTimer(this.elapsedTime);
        this.update(frameScale);
      }

      this.render();

      requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }

  update(frameScale) {
    const balls = this.ballSystem.balls;

    // 🔹 frameScale → deltaSeconds 환산 (startLoop에서 60 * delta로 계산했으므로 역변환)
    const deltaSeconds = frameScale / 60;

    // 🔹 1) 벽돌 줄 이동 타이머 갱신
    this.rowFallTimer += deltaSeconds;
    if (this.rowFallTimer >= this.rowFallInterval) {
      this.rowFallTimer -= this.rowFallInterval;

      // 1-1) 벽돌 한 줄 아래로 + 위에 새 줄 추가
      this.brickField.shiftDownAndAddRow();

      // 1-2) 벽돌이 패들 라인까지 내려왔는지 체크해서, 내려왔으면 게임오버 처리
      const paddleBounds = this.paddle.getBounds(this.canvas.height);
      const paddleTop = paddleBounds.top; // 패들 윗변 y

      if (this.brickField.hasBrickReachedLine(paddleTop)) {
        this.handleGameOver();
        return;
      }
    }

    // 공이 아예 없으면(예외 방지)
    if (balls.length === 0) {
      const startX = this.canvas.width / 2;
      const startY = this.canvas.height - 30;
      const initialBall = new Ball(
        BALL_CONFIG.radius,
        startX,
        startY,
        BALL_CONFIG.startSpeedX,
        BALL_CONFIG.startSpeedY,
        this.currentPlatform.type,
        this.currentPlatform.color
      );
      this.ballSystem = new BallSystem(initialBall);
    }

    const paddleBounds = this.paddle.getBounds(this.canvas.height);

    let allCleared = false;
    const deadBallIndexes = [];

    // 🔹 1) 공 여러 개에 대해 충돌 / 벽 / 패들 / 바닥 처리
    this.ballSystem.forEach((ball, index) => {
      // (1) 벽돌 충돌
      const collisionResult = this.CollisionSystem.handleBallCollision(
        ball,
        this.brickField
      );

      if (collisionResult.collided) {
        // 1) 튕김 처리 (간단하게 위/아래 반사)
        const brickLeft   = collisionResult.brickX;
        const brickRight  = collisionResult.brickX + collisionResult.brickWidth;
        const brickTop    = collisionResult.brickY;
        const brickBottom = collisionResult.brickY + collisionResult.brickHeight;

        // 공과 벽돌 경계 간 거리 비교로 어느 면에서 들어왔는지 대략 추정
        const distLeft   = Math.abs((ball.x + ball.radius) - brickLeft);
        const distRight  = Math.abs((ball.x - ball.radius) - brickRight);
        const distTop    = Math.abs((ball.y + ball.radius) - brickTop);
        const distBottom = Math.abs((ball.y - ball.radius) - brickBottom);

        const minDist = Math.min(distLeft, distRight, distTop, distBottom);

        if (minDist === distLeft || minDist === distRight) {
          ball.dx = -ball.dx;      // 좌우 면에 맞음 → x 반전
        } else {
          ball.dy = -ball.dy;      // 위/아래 면에 맞음 → y 반전
        }

        // 2) 점수 / 아이템 / 클리어는 기존 로직 유지
        if (collisionResult.destroyed) {
          this.onBrickDestroyed(collisionResult);
        }
        if (collisionResult.allCleared) {
          allCleared = true;
        }
      }

      const nextX = ball.x + ball.dx * frameScale;
      const nextY = ball.y + ball.dy * frameScale;

      // (2) 좌우 벽
      if (
        nextX > this.canvas.width - ball.radius ||
        nextX < ball.radius
      ) {
        ball.dx = -ball.dx;
      }

      // (3) 천장
      if (nextY < ball.radius) {
        ball.dy = -ball.dy;
      } else {
        // (4) 패들 충돌
        if (
          nextX > paddleBounds.left &&
          nextX < paddleBounds.right &&
          nextY > paddleBounds.top &&
          nextY < paddleBounds.bottom
        ) {
          const center = paddleBounds.left + PADDLE_CONFIG.width / 2;
          const hitPos =
            (ball.x - center) / (PADDLE_CONFIG.width / 2); // -1 ~ 1
          ball.dx = hitPos * 5;
          ball.dy = -Math.abs(ball.dy);

          // ✅ 패들에 닿은 “그 공만” 현재 플랫폼 속성으로 변경
          const cur = this.currentPlatform;
          ball.setElement(cur.type, cur.color);

          // 🔥 이 공이 분신들의 리더라면, 분신들의 속성도 같이 맞춰준다
          if (ball.isCloneLeader) {
            this.ballSystem.balls.forEach((other) => {
              if (other.isClone) {
                other.setElement(cur.type, cur.color);
              }
            });
          }
        }
      }
      
      // ✅ (5) 바닥으로 떨어졌는지 체크
      // nextY가 캔버스 높이 + 반지름보다 크면 완전히 화면 아래로 나간 것으로 판단
      if (nextY - ball.radius > this.canvas.height) {
        deadBallIndexes.push(index);
      }
    });

    // 🔹 2) 바닥으로 떨어진 공 처리
    if (deadBallIndexes.length > 0) {
      // 뒤에서부터 지워야 index 안 꼬임
      deadBallIndexes
        .sort((a, b) => b - a)
        .forEach((i) => {
          this.ballSystem.balls.splice(i, 1);
        });

      // 모든 공이 사라졌을 때만 라이프 감소
      if (this.ballSystem.balls.length === 0) {
        this.lives--;
        this.ui.updateLives(this.lives);

        if (this.lives <= 0) {
          this.handleGameOver();
          return;
        } else {
          const startX = this.paddle.x + PADDLE_CONFIG.width / 2;
          const startY = this.canvas.height - 30;
          const newBall = new Ball(
            BALL_CONFIG.radius,
            startX,
            startY,
            BALL_CONFIG.startSpeedX,
            BALL_CONFIG.startSpeedY,
            this.currentPlatform.type,
            this.currentPlatform.color
          );
          this.ballSystem = new BallSystem(newBall);
        }
      }
    }

    // 🔹 3) 클리어 체크
    if (allCleared) {
      this.handleClear();
      return;
    }

    // 🔹 4) 패들, 공 이동 & 아이템 업데이트
    this.paddle.update(frameScale);
    this.ballSystem.update(frameScale, { game: this }); // behavior(분신 / 기본) 처리
    this.updateItems(frameScale); // 아래에서 만들 함수
  }

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

    // 기존 일시정지 오버레이 부분은 그대로 둬도 됨
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
