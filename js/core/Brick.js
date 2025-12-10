/**
 * Brick.js
 * ------------------------------------------
 * - 개별 벽돌(브릭)의 속성과 상태를 담당한다.
 * - 체력(life), 색상, 타입(오행) 정보를 가진다.
 * - BrickField에서 생성/보관하며, draw()로 렌더링된다.
 */
export class Brick {
  /**
   * @param {Object} config 브릭 타입 설정 (type, color, life 등)
   * @param {number} x      화면상의 x 좌표
   * @param {number} y      화면상의 y 좌표
   */
  constructor(config, x, y) {
    this.type = config.type;
    this.color = config.color;
    this.life = config.life;
    this.maxLife = config.life;
    this.num = config.brick_num ?? null;

    this.x = x;
    this.y = y;

    // 1: 살아있음, 0: 파괴됨
    this.status = 1;
  }

  /**
   * 브릭이 데미지를 받았을 때 체력을 감소시키고,
   * 체력이 0 이하가 되면 파괴 상태로 변경한다.
   *
   * @param {number} damage
   * @returns {boolean} 파괴되었으면 true
   */
  hit(damage) {
    if (this.status !== 1 || damage <= 0) return false;

    this.life -= damage;

    if (this.life <= 0) {
      this.life = 0;
      this.status = 0; // 파괴
      return true;
    }
    return false;
  }

  /**
   * 네온 스타일 브릭 렌더링
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} width   브릭 너비
   * @param {number} height  브릭 높이
   * @param {number} glowFactor 광량 계수 (공/벽돌 상성에 따라 조절)
   */
  draw(ctx, width, height, glowFactor = 1) {
    if (this.status !== 1) return;

    const x = this.x;
    const y = this.y;
    const radius = 7;       // 모서리 둥글기
    const border = 3;       // 네온 테두리 두께
    const innerPadding = 3; // 안쪽 사각형 여백

    // glowFactor 범위 클램프 (너무 극단적이지 않게)
    const minFactor = 0.25;
    const maxFactor = 2.0;
    const clampedFactor = Math.max(minFactor, Math.min(glowFactor, maxFactor));

    // 네온 세기/투명도 기본값
    const baseShadowBlur = 14;
    const baseAlphaMin = 0.18; // 완전 불리한 블럭 → 거의 희미
    const baseAlphaMax = 1.0;  // 완전 유리한 블럭 → 풀 밝기

    // glowFactor 로 실제 값 계산
    const t =
      (clampedFactor - minFactor) / (maxFactor - minFactor); // 0 ~ 1 범위
    const alpha = baseAlphaMin + t * (baseAlphaMax - baseAlphaMin);

    const shadowBlur = baseShadowBlur * clampedFactor;

    ctx.save();

    // ===== 1) 바깥 네온 테두리 =====
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, y, width, height, radius);
    } else {
      ctx.rect(x, y, width, height);
    }

    ctx.lineWidth = border;
    ctx.strokeStyle = this.color;

    ctx.shadowColor = this.color;
    ctx.shadowBlur = shadowBlur;   // 유리/불리 정도에 따라 달라짐
    ctx.globalAlpha = alpha;       // 투명도도 함께 조절

    ctx.stroke();

    // ===== 2) 안쪽 어두운 칸 =====
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    ctx.beginPath();
    const innerX = x + innerPadding;
    const innerY = y + innerPadding;
    const innerW = width - innerPadding * 2;
    const innerH = height - innerPadding * 2;

    if (ctx.roundRect) {
      ctx.roundRect(innerX, innerY, innerW, innerH, Math.max(radius - 2, 0));
    } else {
      ctx.rect(innerX, innerY, innerW, innerH);
    }

    ctx.fillStyle = "rgba(3, 7, 18, 0.96)";
    ctx.fill();

    // ===== 3) 체력 숫자 =====
    ctx.font = "16px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#f9fafb";
    ctx.fillText(
      this.life,
      x + width / 2,
      y + height / 2
    );

    ctx.restore();
  }
}
