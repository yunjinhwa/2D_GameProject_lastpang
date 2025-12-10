/**
 * ItemFactory.js
 * ------------------------------------------
 * - 브릭 파괴 시 드랍되는 아이템을 생성하는 책임.
 * - dropRate에 따라 생성 여부를 결정하고,
 *   effectPool에서 랜덤으로 효과를 선택한다.
 */
import { Item } from "./Item.js";
import { MultiBallEffect } from "./effects/MultiBallEffect.js";
import { CloneBallEffect } from "./effects/CloneBallEffect.js";

export class ItemFactory {
  /**
   * @param {Object} options
   * @param {number} options.dropRate  아이템 드랍 확률(0~1)
   */
  constructor({ dropRate = 0.3 } = {}) {
    this.dropRate = dropRate;

    // 나중에 여기 배열에 새 Effect를 추가만 하면 됨
    this.effectPool = [
      () => new MultiBallEffect(1),
      () => new CloneBallEffect(2),
      // () => new SlowDownEffect(...),
      // () => new BigPaddleEffect(...),
    ];
  }

  /**
   * 벽돌 충돌 정보(collisionResult)를 받아서,
   * 실제로 아이템을 생성할지 여부를 결정하고, 생성하면 Item 리턴
   *
   * @param {Object} collisionResult CollisionSystem에서 넘어오는 결과
   * @returns {Item|null}
   */
  createRandomItem(collisionResult) {
    if (!collisionResult || !collisionResult.brickX) return null;

    // 확률 체크
    if (Math.random() > this.dropRate) return null;

    const { brickX, brickY, brickWidth, brickHeight } = collisionResult;

    // 효과 랜덤 선택
    const effectFactory =
      this.effectPool[Math.floor(Math.random() * this.effectPool.length)];
    const effect = effectFactory();

    // 브릭 중앙 근처에서 떨어지도록 위치 설정
    return new Item({
      x: brickX + brickWidth / 2 - 10,
      y: brickY + brickHeight / 2 - 10,
      width: 20,
      height: 20,
      fallSpeed: 3,
      effect,
    });
  }
}
