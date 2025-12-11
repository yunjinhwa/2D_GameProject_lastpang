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
      // 현재 공의 속도 크기와 방향(각도)
      const speed = Math.hypot(sourceBall.dx, sourceBall.dy) || 5;
      const baseAngle = Math.atan2(sourceBall.dy, sourceBall.dx);

      // 공들 사이의 각도 간격 (15도 정도)
      const spread = (Math.PI / 12); // 15도

      for (let i = 0; i < this.extraCount; i++) {
        // i=0 → +spread, i=1 → -spread, i=2 → +2*spread, i=3 → -2*spread ...
        const dir = i % 2 === 0 ? 1 : -1;
        const mul = Math.floor(i / 2) + 1;
        const angle = baseAngle + dir * spread * mul;

        const dx = Math.cos(angle) * speed;
        const dy = Math.sin(angle) * speed;

        const newBall = new Ball(
          sourceBall.radius,
          sourceBall.x,
          sourceBall.y,
          dx,
          dy,
          sourceBall.type,
          sourceBall.color
        );

        // 멀티볼로 생긴 공은 “완전 독립 공”
        newBall.isClone = false;
        newBall.isCloneLeader = false;

        ballSystem.addBall(newBall);
      }
    });
  }
}
