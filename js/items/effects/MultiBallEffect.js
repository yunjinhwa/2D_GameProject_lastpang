// js/items/effects/MultiBallEffect.js
import { BaseEffect } from "./BaseEffect.js";
import { Ball } from "../../core/Ball.js";

export class MultiBallEffect extends BaseEffect {
  constructor(extraCount = 1) {
    super();
    this.extraCount = extraCount;
  }

  apply(game) {
    const ballSystem = game.ballSystem;
    if (!ballSystem || !ballSystem.balls.length) return;

    // 🔥 분신이 아닌 공들만 복제 대상 (리더 + 독립 공)
    const sourceBalls = ballSystem.balls.filter((b) => !b.isClone);

    if (sourceBalls.length === 0) return;

    sourceBalls.forEach((baseBall) => {
      for (let i = 0; i < this.extraCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.hypot(baseBall.dx, baseBall.dy) || 6;

        const newBall = new Ball(
          baseBall.radius,
          baseBall.x,
          baseBall.y,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          baseBall.type,
          baseBall.color
        );

        // 🔥 새 공은 “분신이 아닌 독립 공”
        newBall.isClone = false;
        newBall.isCloneLeader = false;

        ballSystem.addBall(newBall);
      }
    });

    // 🔥 중요: 분신 모드(behavior)는 건드리지 않는다
    // 이전에 있던 `ballSystem.setBehavior(null);` 같은 라인은 삭제해야 함
  }
}
