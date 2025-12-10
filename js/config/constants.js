// js/config/constants.js

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
