/**
 * constants.js
 * ------------------------------------------
 * - 게임 전역에서 사용하는 상수 정의.
 * - 상태 값, 공/패들/브릭 레이아웃 설정 등을 포함한다.
 */

export const GAME_STATE = {
  MENU: "menu",
  PLAYING: "playing",
  PAUSED: "paused",
  OVER: "gameover",
};

export const BALL_CONFIG = {
  radius: 8,
  startSpeedX: 6,
  startSpeedY: -6,
};

export const PADDLE_CONFIG = {
  speed: 7,
  height: 14,
  width: 90,
  bottomMargin: 10,
};

export const BRICK_LAYOUT = {
  rows: 5,
  cols: 10,
  width: 70,
  height: 24,
  padding: 4,
  offsetTop: 40,
  offsetLeft: 40,
};
