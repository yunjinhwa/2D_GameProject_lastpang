// js/core/Paddle.js
export class Paddle {
  constructor(canvasWidth, width, height, speed, bottomMargin) {
    this.canvasWidth = canvasWidth;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.bottomMargin = bottomMargin;

    this.x = (canvasWidth - width) / 2;
    this.isMovingLeft = false;
    this.isMovingRight = false;
  }

  reset() {
    this.x = (this.canvasWidth - this.width) / 2;
    this.isMovingLeft = false;
    this.isMovingRight = false;
  }

  setMoveLeft(isDown) {
    this.isMovingLeft = isDown;
  }

  setMoveRight(isDown) {
    this.isMovingRight = isDown;
  }

  update(frameScale) {
    const step = this.speed * frameScale;

    if (this.isMovingRight) this.x += step;
    else if (this.isMovingLeft) this.x -= step;

    if (this.x < 0) this.x = 0;
    if (this.x + this.width > this.canvasWidth) {
      this.x = this.canvasWidth - this.width;
    }
  }

    draw(ctx, color, canvasHeight) {
    const y = canvasHeight - this.height - this.bottomMargin;
    const radius = 10;
    const innerPadding = 2;

    ctx.save();

    // ===== 1) 바깥 네온 테두리 =====
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(this.x, y, this.width, this.height, radius);
    } else {
      ctx.rect(this.x, y, this.width, this.height);
    }

    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.globalAlpha = 0.95;
    ctx.stroke();

    // ===== 2) 안쪽 어두운 바 =====
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    ctx.beginPath();
    const innerX = this.x + innerPadding;
    const innerY = y + innerPadding;
    const innerW = this.width - innerPadding * 2;
    const innerH = this.height - innerPadding * 2;

    if (ctx.roundRect) {
      ctx.roundRect(innerX, innerY, innerW, innerH, Math.max(radius - 2, 0));
    } else {
      ctx.rect(innerX, innerY, innerW, innerH);
    }

    ctx.fillStyle = "rgba(3, 7, 18, 0.96)";
    ctx.fill();

    ctx.restore();
  }


  getBounds(canvasHeight) {
    const top = canvasHeight - this.height - this.bottomMargin;
    const bottom = canvasHeight - this.bottomMargin;
    return {
      left: this.x,
      right: this.x + this.width,
      top,
      bottom,
    };
  }
}
