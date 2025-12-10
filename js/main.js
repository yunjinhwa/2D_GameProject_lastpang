// js/main.js
import { ELEMENT_NAMES_KO, PLATFORM_TYPES, BRICK_TYPES } from "./config/elements.js";
import { ElementRules } from "./core/ElementRules.js";
import { Game } from "./core/Game.js";
import { ScreenManager } from "./ui/ScreenManager.js";
import { GameUI } from "./ui/GameUI.js";
import { InputHandler } from "./input/InputHandler.js";

document.addEventListener("DOMContentLoaded", () => {
  // 캔버스 / UI DOM
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const scoreEl = document.getElementById("score");
  const livesEl = document.getElementById("lives");
  const currentElementLabel = document.getElementById("currentElementKorean");
  const clearTimeEl = document.getElementById("clearTime");
  const finalScoreEls = document.querySelectorAll(".final-score");

  const mainMenu = document.getElementById("main-menu");
  const howtoScreen = document.getElementById("howto-screen");
  const gameScreen = document.getElementById("game-screen");
  const clearScreen = document.getElementById("clear-screen");
  const gameOverScreen = document.getElementById("gameover-screen");

  const btnStart = document.getElementById("btnStart");
  const btnHowTo = document.getElementById("btnHowTo");
  const btnHowToBack = document.getElementById("btnHowToBack");
  const btnBackToMenu = document.getElementById("btnBackToMenu");
  const btnRestartClear = document.getElementById("btnRestartClear");
  const btnClearToMenu = document.getElementById("btnClearToMenu");
  const btnRestartOver = document.getElementById("btnRestartOver");
  const btnOverToMenu = document.getElementById("btnOverToMenu");

  const navHome = document.getElementById("navHome");
  const navHowto = document.getElementById("navHowto");
  const navPlay = document.getElementById("navPlay");

  // 의존성 생성
  const elementRules = new ElementRules();
  const screenManager = new ScreenManager({
    mainMenu,
    howtoScreen,
    gameScreen,
    clearScreen,
    gameOverScreen,
  });

  const ui = new GameUI({
    scoreEl,
    livesEl,
    elementLabelEl: currentElementLabel,
    elementNames: ELEMENT_NAMES_KO,
    finalScoreEls,
    clearTimeEl,
  });

  const game = new Game({
    canvas,
    ctx,
    platformTypes: PLATFORM_TYPES,
    brickTypes: BRICK_TYPES,
    elementRules,
    ui,
    screenManager,
  });

  // 초기 화면
  screenManager.showMenu();

  // 키보드 입력
  new InputHandler({
    isGameActive: () => game.isPlayingOrPaused(),
    onMoveLeft: (down) => game.setMoveLeft(down),
    onMoveRight: (down) => game.setMoveRight(down),
    onTogglePause: () => game.togglePause(),
    onRestart: () => game.restartInPlace(),
    onQuitToMenu: () => game.showMenu(),
    onNextElement: () => game.nextPlatformElement(),
  });

  // 버튼 이벤트
  if (btnStart)        btnStart.addEventListener("click", () => game.startGame());
  if (btnHowTo)        btnHowTo.addEventListener("click", () => game.showHowTo());
  if (btnHowToBack)    btnHowToBack.addEventListener("click", () => game.showMenu());
  if (btnBackToMenu)   btnBackToMenu.addEventListener("click", () => game.showMenu());
  if (btnRestartClear) btnRestartClear.addEventListener("click", () => game.startGame());
  if (btnClearToMenu)  btnClearToMenu.addEventListener("click", () => game.showMenu());
  if (btnRestartOver)  btnRestartOver.addEventListener("click", () => game.startGame());
  if (btnOverToMenu)   btnOverToMenu.addEventListener("click", () => game.showMenu());

  if (navHome)  navHome.addEventListener("click", () => game.showMenu());
  if (navHowto) navHowto.addEventListener("click", () => game.showHowTo());
  if (navPlay)  navPlay.addEventListener("click", () => game.startGame());

  // 게임 루프 시작
  game.startLoop();
});
