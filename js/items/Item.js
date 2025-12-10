// js/items/Item.js
export class Item {
  constructor({ x, y, width, height, fallSpeed, effect }) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.fallSpeed = fallSpeed;
    this.effect = effect; // apply(game)을 가진 객체
    this.isActive = true;
  }

  update(frameScale) {
    if (!this.isActive) return;
    this.y += this.fallSpeed * frameScale;
  }

  draw(ctx) {
    if (!this.isActive) return;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, 6);
    ctx.fillStyle = "#facc15";
    ctx.strokeStyle = "#eab308";
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  collidesWithRect(rect) {
    return (
      this.x < rect.right &&
      this.x + this.width > rect.left &&
      this.y < rect.bottom &&
      this.y + this.height > rect.top
    );
  }

  onPickup(context) {
    if (!this.isActive) return;
    this.isActive = false;
    if (this.effect && typeof this.effect.apply === "function") {
      this.effect.apply(context);
    }
  }
}
