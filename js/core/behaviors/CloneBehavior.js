// js/core/behaviors/CloneBehavior.js
export class CloneBehavior {
  constructor(trailLength = 15) {
    this.trailLength = trailLength;
    this.trail = []; // 리더의 이동 기록
  }

  update(ballSystem, frameScale, context) {
    const balls = ballSystem.balls;
    if (!balls || balls.length === 0) return;

    // 1) 리더 찾기: 기존 리더가 있으면 그대로, 없으면 첫 번째 공을 리더로 승격
    let leader = balls.find((b) => b.isCloneLeader);
    if (!leader) {
      leader = balls[0];
      if (leader) {
        // 새 리더는 분신이 아니도록 강제
        leader.isCloneLeader = true;
        leader.isClone = false;
      }
    }

    // 2) 분신 / 독립 공 분리할 때 리더는 항상 제외
    const clones = balls.filter((b) => b.isClone && b !== leader);
    const independents = balls.filter((b) => !b.isClone && b !== leader);

    // 리더가 없으면 그냥 일반 업데이트로 처리
    if (!leader) {
      balls.forEach((b) => b.updatePosition(frameScale));
      return;
    }

    // 3) 리더는 기존 물리대로 움직임
    leader.updatePosition(frameScale);

    // 4) 리더의 위치 기록
    this.trail.unshift({ x: leader.x, y: leader.y });

    const maxTrailLength = this.trailLength * Math.max(1, clones.length);
    if (this.trail.length > maxTrailLength) {
      this.trail.length = maxTrailLength;
    }

    // 5) 독립 공들은 각자 자유롭게 움직임
    independents.forEach((ball) => {
      ball.updatePosition(frameScale);
    });

    // 6) 분신들은 리더의 이동 경로를 따라감
    clones.forEach((clone, idx) => {
      const offset = this.trailLength * (idx + 1);
      const point = this.trail[offset];

      if (point) {
        clone.x = point.x;
        clone.y = point.y;
      } else {
        // trail이 부족하면 그냥 리더 위치로
        clone.x = leader.x;
        clone.y = leader.y;
      }

      // 리더 속성/색상 복사
      clone.type = leader.type;
      clone.color = leader.color;
    });
  }
}
