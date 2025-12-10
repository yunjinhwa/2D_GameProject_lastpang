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

    let leader = ballSystem.balls.find((b) => b.isCloneLeader);
    if (!leader) {
      leader = ballSystem.balls[0];
    }

    leader.isCloneLeader = true;
    leader.isClone = false; // 리더는 분신이 아님

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
      clone.isClone = true;        // 이 공은 분신
      clone.isCloneLeader = false; // 리더는 아님
      
      ballSystem.addBall(clone);
    }

    ballSystem.setBehavior(new CloneBehavior());
  }
}
