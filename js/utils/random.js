/**
 * random.js
 * ------------------------------------------
 * - 단순 유틸리티 랜덤 함수 모음.
 * - 현재는 정수 범위 랜덤 한 개만 제공.
 */

/**
 * [min, max] 범위의 정수를 균등 분포로 반환한다.
 * @param {number} min
 * @param {number} max
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
