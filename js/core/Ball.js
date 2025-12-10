// js/core/Ball.js
export class Ball {
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

    this.isClone = false;        // true면 분신
    this.isCloneLeader = false;  // true면 분신들의 리더
  }

  reset(x, y, speedX, speedY) {
    this.x = x;
    this.y = y;
    this.dx = speedX;
    this.dy = speedY;
  }

  setElement(type, color) {
    this.type = type;
    this.color = color;
  }

  updatePosition(frameScale) {
    this.x += this.dx * frameScale;
    this.y += this.dy * frameScale;
  }

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
