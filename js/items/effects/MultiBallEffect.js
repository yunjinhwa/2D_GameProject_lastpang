// js/items/effects/MultiBallEffect.js
import { BaseEffect } from "./BaseEffect.js";
import { Ball } from "../../core/Ball.js";

export class MultiBallEffect extends BaseEffect {
  constructor(extraCount = 1) {
    super();
    this.extraCount = extraCount;
  }

  apply(context) {
    const ballSystem = context.ballSystem;
    if (!ballSystem || !ballSystem.balls.length) return;

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
