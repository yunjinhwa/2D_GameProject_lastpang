/**
 * CloneBallEffect.js
 * ------------------------------------------
 * - 분신 공을 생성하는 아이템 효과.
 * - 리더 공 하나를 기준으로 cloneCount 만큼 분신을 만든다.
 * - 분신 이동은 CloneBehavior가 담당한다.
 */
import { BaseEffect } from "./BaseEffect.js";
import { Ball } from "../../core/Ball.js";
import { CloneBehavior } from "../../core/behaviors/CloneBehavior.js";

export class CloneBallEffect extends BaseEffect {
  /**
   * @param {number} cloneCount 생성할 분신 개수
   */
  constructor(cloneCount = 2) {
    super();
    this.cloneCount = cloneCount;
  }

  /**
   * @param {Object} context
   * @param {BallSystem} context.ballSystem
   */
  apply(context) {
    const ballSystem = context.ballSystem;
    if (!ballSystem || ballSystem.balls.length === 0) return;

    // 1) 기존 리더가 있으면 그대로 사용
    let leader = ballSystem.balls.find((b) => b.isCloneLeader);

    // 2) 없다면, 분신이 아닌 공 중 하나를 리더로 지정
    if (!leader) {
      leader = ballSystem.balls.find((b) => !b.isClone) || ballSystem.balls[0];
      leader.isCloneLeader = true;
    }

    // 3) 리더를 복제해서 분신 생성
    for (let i = 0; i < this.cloneCount; i++) {
      const clone = new Ball(
        leader.radius,   // radius
        leader.x,        // startX
        leader.y,        // startY
        leader.dx,       // speedX
        leader.dy,       // speedY
        leader.type,
        leader.color
      );
      clone.isClone = true;
      clone.isCloneLeader = false;
      ballSystem.addBall(clone);
    }

    // 4) 분신 이동 Behavior 활성화
    ballSystem.setBehavior(new CloneBehavior());
  }
}
