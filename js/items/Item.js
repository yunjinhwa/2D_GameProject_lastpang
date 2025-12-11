/**
 * Item.js
 * ------------------------------------------
 * - 벽돌을 파괴했을 때 떨어지는 아이템 오브젝트.
 * - 위치/크기/낙하 속도와 이펙트(효과 객체)를 가진다.
 * - Paddle과 충돌하면 effect.apply(context)를 호출하고 사라진다.
 */
export class Item {
  /**
   * @param {Object} params
   * @param {number} params.x
   * @param {number} params.y
   * @param {number} params.width
   * @param {number} params.height
   * @param {number} params.fallSpeed  한 프레임당 낙하 속도
   * @param {BaseEffect} params.effect 적용할 아이템 효과 객체
   */
  constructor({ x, y, width, height, fallSpeed, effect }) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.fallSpeed = fallSpeed;
    this.effect = effect; // apply(context)를 가진 객체
    this.isActive = true;
  }

  /**
   * 아이템 위치 업데이트 (아래로 낙하)
   * @param {number} frameScale
   */
  update(frameScale) {
    if (!this.isActive) return;
    this.y += this.fallSpeed * frameScale;
  }

  /** 아이템을 화면에 그린다. */
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

  /**
   * 단순 AABB 충돌 체크
   * @param {{left:number,right:number,top:number,bottom:number}} rect
   */
  collidesWithRect(rect) {
    return (
      this.x < rect.right &&
      this.x + this.width > rect.left &&
      this.y < rect.bottom &&
      this.y + this.height > rect.top
    );
  }

  /**
   * 아이템이 집어졌을 때 실행.
   * - isActive를 false로 만들고, effect.apply(context)를 호출한다.
   */
  onPickup(context) {
    if (!this.isActive) return;
    this.isActive = false;

    if (this.effect && typeof this.effect.apply === "function") {
      this.effect.apply(context);
    }
    console.log("[Item] pickup!", this.effect?.constructor?.name);
  }
}
