/**
 * BallSystem.js
 * ------------------------------------------
 * - 여러 개의 Ball 인스턴스를 관리하는 컨테이너.
 * - Behavior(예: CloneBehavior)를 주입받아 업데이트 방식을 바꿀 수 있다.
 * - Game은 이 시스템을 통해 공 집합을 다룬다.
 */
export class BallSystem {
  /**
   * @param {Ball} initialBall 최초 Ball
   */
  constructor(initialBall) {
    // 항상 최소 하나 이상 가지고 시작
    this.balls = [initialBall];
    // null이면 기본: 각 Ball이 스스로 updatePosition() 호출
    this.behavior = null;
  }

  /** 현재 Behavior를 교체한다. */
  setBehavior(behavior) {
    this.behavior = behavior;
  }

  /** 공 추가 */
  addBall(ball) {
    this.balls.push(ball);
  }

  /**
   * 특정 공만 남기고 나머지는 모두 제거할 때 사용.
   * (예: 라이프 소진 후 리셋 등)
   */
  clearToSingle(ball) {
    this.balls = [ball];
  }

  /**
   * 공 시스템 업데이트
   * @param {number} frameScale
   * @param {Object} context Behavior에 넘길 수 있는 컨텍스트
   */
  update(frameScale, context) {
    if (this.behavior) {
      this.behavior.update(this, frameScale, context);
    } else {
      // Ball에 이미 있는 움직임 함수 쓰기
      this.balls.forEach((b) => b.updatePosition(frameScale));
    }
  }

  /** 모든 공을 렌더링 */
  draw(ctx) {
    this.balls.forEach((b) => b.draw(ctx));
  }

  /**
   * forEach 래핑 (Game 쪽에서 공을 순회할 때 사용)
   */
  forEach(callback) {
    this.balls.forEach(callback);
  }
}
