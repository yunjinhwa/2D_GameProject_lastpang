// js/items/effects/BaseEffect.js
export class BaseEffect {
  /**
   * @param {Object} context
   * @param {BallSystem} context.ballSystem
   */
  apply(context) {
    throw new Error("apply(context) must be implemented");
  }
}
