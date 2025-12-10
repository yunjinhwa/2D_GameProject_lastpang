/**
 * elements.js
 * ------------------------------------------
 * - 오행(화/토/금/수/목)에 대한 브릭/플랫폼 설정과
 *   화면에서 사용할 한글 이름 매핑을 정의한다.
 */

// 브릭 타입 (오행 + 색 + 체력)
export const BRICK_TYPES = [
  { brick_num: 1, type: "frame",  color: "red",   life: 6 },
  { brick_num: 2, type: "ground", color: "gold",  life: 6 },
  { brick_num: 3, type: "metal",  color: "white", life: 6 },
  { brick_num: 4, type: "water",  color: "blue",  life: 6 },
  { brick_num: 5, type: "wood",   color: "green", life: 6 },
];

// 패들(플랫폼) 타입
export const PLATFORM_TYPES = [
  { num: 1, type: "frame",  color: "red" },
  { num: 2, type: "ground", color: "gold" },
  { num: 3, type: "metal",  color: "white" },
  { num: 4, type: "water",  color: "blue" },
  { num: 5, type: "wood",   color: "green" },
];

// 화면에 보여줄 한글 이름
export const ELEMENT_NAMES_KO = {
  frame:  "화(火)",
  ground: "토(土)",
  metal:  "금(金)",
  water:  "수(水)",
  wood:   "목(木)",
};
