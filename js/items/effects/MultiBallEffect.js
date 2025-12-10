/**
 * MultiBallEffect.js
 * ------------------------------------------
 * - 공을 추가로 복제하는 아이템 효과.
 * - 분신이 아닌 공들(sourceBalls)만 기준으로 복제한다.
 * - 분신/리더 플래그는 false로 설정하여 독립 공이 되게 한다.
 */
import { BaseEffect } from "./BaseEffect.js";
import { Ball } from "../../core/Ball.js";

export class MultiBallEffect extends BaseEffect {
  /**
   * @param {number} extraCount 각 공당 추가로 생성할 개수
   */
  constructor(extraCount = 1) {
    super();
    this.extraCount = extraCount;
  }

  /**
   * @param {Object} context
   * @param {BallSystem} context.ballSystem
   */
  apply(context) {
    const ballSystem = context.ballSystem;
    if (!ballSystem || !ballSystem.balls.length) return;

    // 분신이 아닌 공만 기준으로 사용
    const sourceBalls = ballSystem.balls.filter((b) => !b.isClone);

    sourceBalls.forEach((sourceBall) => {
      for (let i = 0; i < this.extraCount; i++) {
        const newBall = new Ball(
          sourceBall.radius,   // radius
          sourceBall.x,        // startX
          sourceBall.y,        // startY
          sourceBall.dx,       // speedX
          sourceBall.dy,       // speedY
          sourceBall.type,
          sourceBall.color
        );
        newBall.isClone = false;
        newBall.isCloneLeader = false;
        ballSystem.addBall(newBall);
      }
    });
  }
}
