// js/core/behaviors/CloneBehavior.js
export class CloneBehavior {
  constructor(trailLength = 15) {
    this.trailLength = trailLength;
    this.trail = []; // 리더의 이동 기록
  }

  update(ballSystem, frameScale, context) {
    const balls = ballSystem.balls;
    if (balls.length === 0) return;

    const leader = balls[0];
    const clones = balls.slice(1);

    // 1) 리더는 기존 움직임 그대로
    leader.updatePosition(frameScale);

    // 2) 리더 위치 기록
    this.trail.unshift({ x: leader.x, y: leader.y });
    if (this.trail.length > this.trailLength * clones.length) {
      this.trail.pop();
    }

    // 3) 분신들은 trail을 따라감
    clones.forEach((clone, idx) => {
      const offset = this.trailLength * (idx + 1);
      const point = this.trail[offset];
      if (point) {
        clone.x = point.x;
        clone.y = point.y;
      } else {
        clone.x = leader.x;
        clone.y = leader.y;
      }
    });
  }
}
