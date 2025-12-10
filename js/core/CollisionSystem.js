// js/core/CollisionSystem.js
export class CollisionSystem {
  constructor(elementRules) {
    this.elementRules = elementRules;
  }

  /**
   * 기존 BrickField.handleCollisionWithBall(ball)의 역할을 그대로 수행
   * - 어느 벽돌이 맞았는지 찾고
   * - 데미지 계산/체력 감소는 brickField 쪽 메서드에 위임
   * - 충돌 결과 객체를 반환
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

        // ✅ 실제 벽돌 좌표 사용
        const x = brick.x;
        const y = brick.y;

        const inX =
            ball.x + ball.radius > x && ball.x - ball.radius < x + width;
        const inY =
            ball.y + ball.radius > y && ball.y - ball.radius < y + height;

        if (!inX || !inY) continue;

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

    return {
        collided: false,
        destroyed: false,
        allCleared: brickField.isCleared(),
    };
    }
}
