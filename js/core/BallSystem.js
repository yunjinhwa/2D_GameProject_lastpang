// js/core/BallSystem.js
export class BallSystem {
  constructor(initialBall) {
    this.balls = [initialBall];  // 항상 최소 하나
    this.behavior = null;        // null이면 기본: 공 각자 알아서 움직임
  }

  setBehavior(behavior) {
    this.behavior = behavior;
  }

  addBall(ball) {
    this.balls.push(ball);
  }

  clearToSingle(ball) {
    this.balls = [ball];
  }

  update(frameScale, context) {
    if (this.behavior) {
      this.behavior.update(this, frameScale, context);
    } else {
      this.balls.forEach((b) => b.updatePosition(frameScale)); // Ball에 이미 있는 움직임 함수 쓰기
    }
  }

  draw(ctx) {
    this.balls.forEach((b) => b.draw(ctx));
  }

  forEach(callback) {
    this.balls.forEach(callback);
  }
}
