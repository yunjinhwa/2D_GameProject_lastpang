// js/items/effects/CloneBallEffect.js
import { BaseEffect } from "./BaseEffect.js";
import { Ball } from "../../core/Ball.js";
import { CloneBehavior } from "../../core/behaviors/CloneBehavior.js";

export class CloneBallEffect extends BaseEffect {
  constructor(cloneCount = 2) {
    super();
    this.cloneCount = cloneCount;
  }

  apply(context) {
    const ballSystem = context.ballSystem;
    if (!ballSystem || ballSystem.balls.length === 0) return;

    let leader = ballSystem.balls.find((b) => b.isCloneLeader);
    if (!leader) {
      leader = ballSystem.balls.find((b) => !b.isClone) || ballSystem.balls[0];
      leader.isCloneLeader = true;
    }

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

    ballSystem.setBehavior(new CloneBehavior());
  }
}
