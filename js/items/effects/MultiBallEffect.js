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
    const currentBalls = [...ballSystem.balls];

    currentBalls.forEach((baseBall) => {
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

        ballSystem.addBall(newBall);
      }
    });

    // 멀티볼은 기본 동작이면 충분하니까 behavior는 건들지 않음
    ballSystem.setBehavior(null);
  }
}
