// js/core/ElementRules.js
export class ElementRules {
  constructor() {
    // 상극
    this.keuk = {
      wood: "ground",  // 목극토
      ground: "water", // 토극수
      water: "frame",  // 수극화
      frame: "metal",  // 화극금
      metal: "wood",   // 금극목
    };

    // 상생
    this.saeng = {
      wood: "frame",   // 목생화
      frame: "ground", // 화생토
      ground: "metal", // 토생금
      metal: "water",  // 금생수
      water: "wood",   // 수생목
    };
  }

  getDamage(ballType, brickType) {
    if (!ballType || !brickType) return 3;
    if (ballType === brickType) return 3;

    const { keuk, saeng } = this;

    // 상극
    if (keuk[ballType] === brickType) return 6; // 공이 벽돌을 극함
    if (keuk[brickType] === ballType) return 0; // 벽돌이 공을 극함

    // 상생
    if (saeng[ballType] === brickType) return 2; // 공이 벽돌을 생함
    if (saeng[brickType] === ballType) return 4; // 벽돌이 공을 생함

    // 그 외
    return 3;
  }
}
