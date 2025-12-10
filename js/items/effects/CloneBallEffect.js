// js/items/effects/CloneBallEffect.js
import { BaseEffect } from "./BaseEffect.js";
import { Ball } from "../../core/Ball.js";
import { CloneBehavior } from "../../core/behaviors/CloneBehavior.js";

export class CloneBallEffect extends BaseEffect {
  constructor(cloneCount = 2) {
    super();
    this.cloneCount = cloneCount;
  }

  apply(game) {
    const ballSystem = game.ballSystem;
    if (ballSystem.balls.length === 0) return;

    const leader = ballSystem.balls[0];

    for (let i = 0; i < this.cloneCount; i++) {
      const clone = new Ball(
        leader.radius,
        leader.x,
        leader.y,
        leader.dx,
        leader.dy,
        leader.type,
        leader.color
      );
      ballSystem.addBall(clone);
    }

    ballSystem.setBehavior(new CloneBehavior());
  }
}
