/**
 * Ball.js
 * ------------------------------------------
 * - 공(볼) 오브젝트의 위치, 속도, 오행/색상, 분신 여부를 저장한다.
 * - updatePosition()으로 이동하고, draw()로 렌더링한다.
 */
export class Ball {
  /**
   * @param {number} radius  공 반지름
   * @param {number} startX  시작 x 좌표
   * @param {number} startY  시작 y 좌표
   * @param {number} speedX  초기 x 속도
   * @param {number} speedY  초기 y 속도
   * @param {string} type    오행 타입
   * @param {string} color   렌더링 색상
   */
  constructor(radius, startX, startY, speedX, speedY, type, color) {
    this.radius = radius;
    this.startX = startX;
    this.startY = startY;
    this.startSpeedX = speedX;
    this.startSpeedY = speedY;

    this.x = startX;
    this.y = startY;
    this.dx = speedX;
    this.dy = speedY;

    this.type = type;
    this.color = color;

    // 분신 관련 플래그
    this.isClone = false;        // true면 분신
    this.isCloneLeader = false;  // true면 분신들의 리더
  }

  /**
   * 공 위치/속도를 초기화(리셋)한다.
   */
  reset(x, y, speedX, speedY) {
    this.x = x;
    this.y = y;
    this.dx = speedX;
    this.dy = speedY;
  }

  /**
   * 공의 오행/색상을 변경한다.
   */
  setElement(type, color) {
    this.type = type;
    this.color = color;
  }

  /**
   * 프레임별 위치 업데이트
   * @param {number} frameScale
   */
  updatePosition(frameScale) {
    this.x += this.dx * frameScale;
    this.y += this.dy * frameScale;
  }

  /**
   * 네온 스타일의 공을 그린다.
   */
  draw(ctx) {
    ctx.save();

    // 네온 발광
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 14;     // 너무 크지 않게
    ctx.globalAlpha = 0.98;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();

    ctx.restore();
  }
}
