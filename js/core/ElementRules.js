/**
 * ElementRules.js
 * ------------------------------------------
 * - 오행 상생/상극 규칙을 캡슐화한 모듈.
 * - ballType, brickType 조합에 따라 데미지 값을 계산한다.
 * - 다른 곳에서는 getDamage() 결과만 사용하면 된다.
 */
export class ElementRules {
  constructor() {
    // 상극(극하는 관계) 매핑: A가 B를 이긴다.
    this.keuk = {
      wood: "ground",  // 목극토
      ground: "water", // 토극수
      water: "frame",  // 수극화
      frame: "metal",  // 화극금
      metal: "wood",   // 금극목
    };

    // 상생(도와주는 관계) 매핑: A가 B를 생한다.
    this.saeng = {
      wood: "frame",   // 목생화
      frame: "ground", // 화생토
      ground: "metal", // 토생금
      metal: "water",  // 금생수
      water: "wood",   // 수생목
    };
  }

  /**
   * 공/벽돌의 오행 타입에 따라 데미지를 계산한다.
   *
   * @param {string} ballType  공의 오행 타입
   * @param {string} brickType 벽돌의 오행 타입
   * @returns {number} 데미지 값
   */
  getDamage(ballType, brickType) {
    if (!ballType || !brickType) return 3;
    if (ballType === brickType) return 3;

    const { keuk, saeng } = this;

    // 상극: 공이 벽돌을 극함 → 큰 데미지
    if (keuk[ballType] === brickType) return 6;
    // 상극: 벽돌이 공을 극함 → 데미지 0
    if (keuk[brickType] === ballType) return 0;

    // 상생: 공이 벽돌을 생함
    if (saeng[ballType] === brickType) return 2;
    // 상생: 벽돌이 공을 생함
    if (saeng[brickType] === ballType) return 4;

    // 그 외 중립
    return 3;
  }
}
