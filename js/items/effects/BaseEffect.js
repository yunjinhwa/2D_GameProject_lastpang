/**
 * BaseEffect.js
 * ------------------------------------------
 * - 아이템 효과 클래스들의 공통 베이스.
 * - 하위 클래스는 apply(context)를 반드시 구현해야 한다.
 */
export class BaseEffect {
  /**
   * @param {Object} context
   * @param {BallSystem} context.ballSystem
   */
  apply(context) {
    throw new Error("apply(context) must be implemented");
  }
}
