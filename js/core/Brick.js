export class Brick {
  constructor(config, x, y) {
    this.type = config.type;
    this.color = config.color;
    this.life = config.life;
    this.maxLife = config.life;
    this.num = config.brick_num ?? null;

    this.x = x;
    this.y = y;
    this.status = 1; // 1: 살아있음, 0: 파괴
  }

  hit(damage) {
    if (this.status !== 1 || damage <= 0) return false;
    this.life -= damage;
    if (this.life <= 0) {
      this.life = 0;
      this.status = 0;
      return true;
    }
    return false;
  }

  // 🔥 glowFactor(광량 계수) 추가
  draw(ctx, width, height, glowFactor = 1) {
    if (this.status !== 1) return;

    const x = this.x;
    const y = this.y;
    const radius = 7;       // 모서리 정도
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

    // damage 에 따라 들어온 glowFactor 로 실제 값 계산
    const t =
      (clampedFactor - minFactor) / (maxFactor - minFactor); // 0 ~ 1
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
    ctx.shadowBlur = shadowBlur;   // 🔆 유리/불리 정도에 따라 달라짐
    ctx.globalAlpha = alpha;       // 🔆 투명도도 함께 조절

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
