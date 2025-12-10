// js/items/ItemFactory.js
import { Item } from "./Item.js";
import { MultiBallEffect } from "./effects/MultiBallEffect.js";
import { CloneBallEffect } from "./effects/CloneBallEffect.js";

export class ItemFactory {
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
   */
  createRandomItem(collisionResult) {
    if (!collisionResult || !collisionResult.brickX) return null;
    if (Math.random() > this.dropRate) return null;

    const { brickX, brickY, brickWidth, brickHeight } = collisionResult;

    // 효과 랜덤 선택
    const effectFactory =
      this.effectPool[Math.floor(Math.random() * this.effectPool.length)];
    const effect = effectFactory();

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
