// js/main.js
import { ELEMENT_NAMES_KO, PLATFORM_TYPES, BRICK_TYPES } from "./config/elements.js";
import { ElementRules } from "./core/ElementRules.js";
import { Game } from "./core/Game.js";
import { ScreenManager } from "./ui/ScreenManager.js";
import { GameUI } from "./ui/GameUI.js";
import { InputHandler } from "./input/InputHandler.js";
import { GameRecorder } from "./core/GameRecorder.js";

document.addEventListener("DOMContentLoaded", () => {
  // 캔버스 / UI DOM
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const scoreEl = document.getElementById("score");
  const livesEl = document.getElementById("lives");
  const currentElementLabel = document.getElementById("currentElementKorean");
  const clearTimeEl = document.getElementById("clearTime");
  const finalScoreEls = document.querySelectorAll(".final-score");
  const timerEl = document.getElementById("timer");
  const gameOverTimeEl = document.getElementById("gameOverTime");
  const difficultyOverlay = document.getElementById("difficulty-overlay");
  const diffButtons = document.querySelectorAll(".diff-btn");
  const recordListEl = document.getElementById("recordList");

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

  const sortLatestBtn = document.getElementById("recordSortLatest");
  const sortBestBtn = document.getElementById("recordSortBest");

  // 의존성 생성
  const elementRules = new ElementRules();
  const screenManager = new ScreenManager({
    mainMenu,
    howtoScreen,
    gameScreen,
    clearScreen,
    gameOverScreen,
  });

  // 🔹 기록 매니저 생성
  const recorder = new GameRecorder();

  // 🔹 현재 정렬 모드: "latest" | "best"
  let recordSortMode = "latest";

  // 🔹 기록 UI 렌더 함수
  const renderRecords = () => {
    if (!recordListEl) return;

    let records;
    if (recordSortMode === "best") {
      records = recorder.getBestScoreRecords(10);   // 최고 점수 기준 10개
    } else {
      records = recorder.getLatestRecords(10);      // 최신순 10개
    }

    recordListEl.innerHTML = "";

    if (!records.length) {
      const li = document.createElement("li");
      li.textContent = "플레이 기록이 아직 없습니다.";
      recordListEl.appendChild(li);
      return;
    }

    records.forEach((r, index) => {
      const li = document.createElement("li");
      const d = new Date(r.timestamp);
      const dateStr = `${d.getFullYear()}-${String(
        d.getMonth() + 1
      ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

      const diffLabel = r.difficulty || "normal";
      const timeText =
        typeof r.time === "number" ? r.time.toFixed(2) + "초" : "-";

      // 최고점수 모드일 때는 랭킹 번호도 같이 보여주면 직관적
      const prefix =
        recordSortMode === "best" ? `${index + 1}. ` : "";

      li.textContent =
        `${prefix}[${dateStr}] ${diffLabel} / ` +
        `${r.score}점 / ${timeText}`;
      recordListEl.appendChild(li);
    });
  };

  const ui = new GameUI({
    scoreEl,
    livesEl,
    elementLabelEl: currentElementLabel,
    elementNames: ELEMENT_NAMES_KO,
    finalScoreEls,
    clearTimeEl,
    timerEl,
    gameOverTimeEl,
  });

  const game = new Game({
    canvas,
    ctx,
    platformTypes: PLATFORM_TYPES,
    brickTypes: BRICK_TYPES,
    elementRules,
    ui,
    screenManager,
    onGameEnd: (result) => {
      recorder.saveRecord(result);
      renderRecords();
    },
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
  const openGameForDifficultySelect = () => {
    game.showGameForDifficultySelect();
    if (difficultyOverlay) {
      difficultyOverlay.classList.add("active");
    }
  };

  // 🔹 난이도 버튼(Easy/Normal/Hard/Extrim) 클릭 시
  diffButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const level = btn.dataset.diff; // "easy" | "normal" | "hard" | "extrim"
      game.startWithDifficulty(level);
      if (difficultyOverlay) {
        difficultyOverlay.classList.remove("active");
      }
    });
  });

  if (btnStart)        btnStart.addEventListener("click", openGameForDifficultySelect);
  if (btnHowTo)        btnHowTo.addEventListener("click", openGameForDifficultySelect);
  if (btnHowToBack)    btnHowToBack.addEventListener("click", openGameForDifficultySelect);
  
    if (btnBackToMenu)
    btnBackToMenu.addEventListener("click", () => {
      if (difficultyOverlay) difficultyOverlay.classList.remove("active");
      game.showMenu();
    });

  if (btnRestartClear)
    btnRestartClear.addEventListener("click", () => {
      if (difficultyOverlay) difficultyOverlay.classList.remove("active");
      game.startGame();          // 현재 선택된 난이도 그대로 재시작
    });

  if (btnClearToMenu)
    btnClearToMenu.addEventListener("click", () => {
      if (difficultyOverlay) difficultyOverlay.classList.remove("active");
      game.showMenu();
    });

  if (btnRestartOver)
    btnRestartOver.addEventListener("click", () => {
      if (difficultyOverlay) difficultyOverlay.classList.remove("active");
      game.startGame();          // 현재 난이도로 재시작
    });

  if (btnOverToMenu)
    btnOverToMenu.addEventListener("click", () => {
      if (difficultyOverlay) difficultyOverlay.classList.remove("active");
      game.showMenu();
    });


  if (navHome)  navHome.addEventListener("click", () => game.showMenu());
  if (navHowto) navHowto.addEventListener("click", () => game.showHowTo());
  if (navPlay)  navPlay.addEventListener("click", () => game.startGame());

  // 🔹 footer 기록 정렬 버튼
  if (sortLatestBtn) {
    sortLatestBtn.addEventListener("click", () => {
      recordSortMode = "latest";
      sortLatestBtn.classList.add("active");
      if (sortBestBtn) sortBestBtn.classList.remove("active");
      renderRecords();
    });
  }

  if (sortBestBtn) {
    sortBestBtn.addEventListener("click", () => {
      recordSortMode = "best";
      sortBestBtn.classList.add("active");
      if (sortLatestBtn) sortLatestBtn.classList.remove("active");
      renderRecords();
    });
  }

  renderRecords();

  // 게임 루프 시작
  game.startLoop();
});
