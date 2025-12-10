/**
 * CloneBehavior.js
 * ------------------------------------------
 * - 분신(클론) 공의 이동 패턴을 정의하는 Behavior.
 * - 하나의 리더 공이 직접 물리 연산을 하고,
 *   클론 공들은 리더가 지나간 궤적(trail)을 따라 이동한다.
 * - BallSystem.setBehavior()를 통해 적용된다.
 */
export class CloneBehavior {
  /**
   * @param {number} trailLength 분신 간격을 위한 기본 trail 길이 단위
   */
  constructor(trailLength = 15) {
    this.trailLength = trailLength;
    // 리더 공의 이동 기록 (앞일수록 최신)
    this.trail = [];
  }

  /**
   * @param {BallSystem} ballSystem
   * @param {number} frameScale
   * @param {Object} context  // 현재는 game 등 확장 여지용
   */
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

    // 2) 분신 / 독립 공 분리 (리더는 항상 제외)
    const clones = balls.filter((b) => b.isClone && b !== leader);
    const independents = balls.filter((b) => !b.isClone && b !== leader);

    // 리더가 없으면 그냥 기본 움직임
    if (!leader) {
      balls.forEach((b) => b.updatePosition(frameScale));
      return;
    }

    // 3) 리더는 기존 물리대로 움직임
    leader.updatePosition(frameScale);

    // 4) 리더의 위치 기록 (trail 맨 앞에 push)
    this.trail.unshift({ x: leader.x, y: leader.y });

    // 분신 수에 따라 trail 최대 길이 조절
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
        // trail이 부족하면 리더 위치로 보정
        clone.x = leader.x;
        clone.y = leader.y;
      }

      // 리더 속성/색상 복사 (오행/색상 싱크)
      clone.type = leader.type;
      clone.color = leader.color;
    });
  }
}
