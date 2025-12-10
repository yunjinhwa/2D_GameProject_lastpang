/**
 * CollisionSystem.js
 * ------------------------------------------
 * - Ball과 BrickField 간의 충돌 판정을 담당한다.
 * - 어떤 브릭이 맞았는지 찾고, 실제 데미지 적용은 BrickField.applyHit에 위임한다.
 * - 충돌 결과 및 브릭 위치 정보를 담은 객체를 반환한다.
 */
export class CollisionSystem {
  /**
   * @param {ElementRules} elementRules 오행 데미지 계산 규칙
   */
  constructor(elementRules) {
    this.elementRules = elementRules;
  }

  /**
   * 기존 BrickField.handleCollisionWithBall(ball)의 역할을 수행.
   * - 어느 벽돌이 맞았는지 찾고
   * - 데미지 계산/체력 감소는 brickField.applyHit()에 위임
   *
   * @param {Ball} ball
   * @param {BrickField} brickField
   * @returns {Object} 충돌 결과 및 브릭 위치 정보
   */
  handleBallCollision(ball, brickField) {
    const { layout, bricks } = brickField;
    const { width, height } = layout;

    for (let c = 0; c < bricks.length; c++) {
      const col = bricks[c];
      if (!col) continue;

      for (let r = 0; r < col.length; r++) {
        const brick = col[r];
        if (!brick || brick.life <= 0 || brick.status !== 1) continue;

        // 실제 벽돌 좌표 사용
        const x = brick.x;
        const y = brick.y;

        const inX =
          ball.x + ball.radius > x && ball.x - ball.radius < x + width;
        const inY =
          ball.y + ball.radius > y && ball.y - ball.radius < y + height;

        if (!inX || !inY) continue;

        // 충돌: BrickField에 데미지 적용 위임
        const hitResult = brickField.applyHit(r, c, ball.type, this.elementRules);

        return {
          collided: true,
          ...hitResult,
          brickX: x,
          brickY: y,
          brickWidth: width,
          brickHeight: height,
          allCleared: brickField.isCleared(),
        };
      }
    }

    // 충돌 없음
    return {
      collided: false,
      destroyed: false,
      allCleared: brickField.isCleared(),
    };
  }
}
