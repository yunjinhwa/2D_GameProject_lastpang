// js/core/Game.js
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

  handleGameOver() {
    this.state = GAME_STATE.OVER;
    this.ui.updateScore(this.score);
    this.ui.updateGameOverTime(this.elapsedTime);
    this.screenManager.showGameOver();
    this.notifyGameEnd("gameover");
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

  const deltaSeconds = frameScale / 60;

  // 1) 벽돌 줄 이동 타이머 (그대로 유지)
  this.rowFallTimer += deltaSeconds;
  if (this.rowFallTimer >= this.rowFallInterval) {
    this.rowFallTimer -= this.rowFallInterval;

    this.brickField.shiftDownAndAddRow();

    const paddleBoundsForLine = this.paddle.getBounds(this.canvas.height);
    const paddleTop = paddleBoundsForLine.top;

    if (this.brickField.hasBrickReachedLine(paddleTop)) {
      this.handleGameOver();
      return;
    }
  }

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
  const deadBallIndexes = [];

  this.ballSystem.forEach((ball, index) => {
    const collisionResult = this.CollisionSystem.handleBallCollision(
      ball,
      this.brickField
    );

    if (collisionResult.collided) {
      const brickLeft   = collisionResult.brickX;
      const brickRight  = collisionResult.brickX + collisionResult.brickWidth;
      const brickTop    = collisionResult.brickY;
      const brickBottom = collisionResult.brickY + collisionResult.brickHeight;

      const distLeft   = Math.abs((ball.x + ball.radius) - brickLeft);
      const distRight  = Math.abs((ball.x - ball.radius) - brickRight);
      const distTop    = Math.abs((ball.y + ball.radius) - brickTop);
      const distBottom = Math.abs((ball.y - ball.radius) - brickBottom);

      const minDist = Math.min(distLeft, distRight, distTop, distBottom);

      if (minDist === distLeft || minDist === distRight) {
        ball.dx = -ball.dx;
      } else {
        ball.dy = -ball.dy;
      }

      if (collisionResult.destroyed) {
        this.onBrickDestroyed(collisionResult);
      }
      // ✅ 더 이상 allCleared 체크 안함
    }

    const nextX = ball.x + ball.dx * frameScale;
    const nextY = ball.y + ball.dy * frameScale;

    // 좌우 벽
    if (nextX > this.canvas.width - ball.radius || nextX < ball.radius) {
      ball.dx = -ball.dx;
    }

    // 천장 / 패들
    if (nextY < ball.radius) {
      ball.dy = -ball.dy;
    } else {
      if (
        nextX > paddleBounds.left &&
        nextX < paddleBounds.right &&
        nextY > paddleBounds.top &&
        nextY < paddleBounds.bottom
      ) {
        const center = paddleBounds.left + PADDLE_CONFIG.width / 2;
        const hitPos = (ball.x - center) / (PADDLE_CONFIG.width / 2);
        ball.dx = hitPos * 5;
        ball.dy = -Math.abs(ball.dy);

        const cur = this.currentPlatform;
        ball.setElement(cur.type, cur.color);

        if (ball.isCloneLeader) {
          this.ballSystem.balls.forEach((other) => {
            if (other.isClone) {
              other.setElement(cur.type, cur.color);
            }
          });
        }
      }
    }

    // 바닥으로 떨어진 공
    if (nextY - ball.radius > this.canvas.height) {
      deadBallIndexes.push(index);
    }
  });

  // 떨어진 공 정리 + 라이프 처리 (기존 그대로)
  if (deadBallIndexes.length > 0) {
    deadBallIndexes
      .sort((a, b) => b - a)
      .forEach((i) => {
        this.ballSystem.balls.splice(i, 1);
      });

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

  this.paddle.update(frameScale);
  this.ballSystem.update(frameScale, { game: this });
  this.updateItems(frameScale);
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
