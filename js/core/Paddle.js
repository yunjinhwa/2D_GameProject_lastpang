/**
 * Paddle.js
 * ------------------------------------------
 * - 패들(플랫폼) 오브젝트의 상태와 이동을 관리한다.
 * - Game이 보유하고, InputHandler가 좌우 이동 플래그를 변경한다.
 * - draw()에서 네온 스타일의 패들을 캔버스에 렌더링한다.
 */
export class Paddle {
  /**
   * @param {number} canvasWidth  캔버스 전체 가로 길이
   * @param {number} width        패들 너비
   * @param {number} height       패들 높이
   * @param {number} speed        프레임당 이동 속도(베이스 값)
   * @param {number} bottomMargin 캔버스 아래에서의 간격
   */
  constructor(canvasWidth, width, height, speed, bottomMargin) {
    this.canvasWidth = canvasWidth;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.bottomMargin = bottomMargin;

    // 화면 중앙으로 초기 위치 설정
    this.x = (canvasWidth - width) / 2;

    // 좌우 이동 플래그
    this.isMovingLeft = false;
    this.isMovingRight = false;
  }

  /** 패들을 초기 상태(가운데)로 리셋한다. */
  reset() {
    this.x = (this.canvasWidth - this.width) / 2;
    this.isMovingLeft = false;
    this.isMovingRight = false;
  }

  /** 왼쪽 이동 여부 설정 */
  setMoveLeft(isDown) {
    this.isMovingLeft = isDown;
  }

  /** 오른쪽 이동 여부 설정 */
  setMoveRight(isDown) {
    this.isMovingRight = isDown;
  }

  /**
   * 패들의 위치를 갱신한다.
   * @param {number} frameScale 프레임 보정 배수 (60fps 기준)
   */
  update(frameScale) {
    const step = this.speed * frameScale;

    if (this.isMovingRight) this.x += step;
    else if (this.isMovingLeft) this.x -= step;

    // 캔버스 밖으로 나가지 않도록 클램핑
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > this.canvasWidth) {
      this.x = this.canvasWidth - this.width;
    }
  }

  /**
   * 네온 스타일 패들을 렌더링한다.
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} color        패들의 메인 색상
   * @param {number} canvasHeight 캔버스 높이(패들 y 계산용)
   */
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

  /**
   * 충돌 체크용 패들 사각형 영역을 반환한다.
   * @param {number} canvasHeight
   * @returns {{left:number,right:number,top:number,bottom:number}}
   */
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
