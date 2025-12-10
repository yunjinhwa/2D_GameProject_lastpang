/**
 * main.js
 * ------------------------------------------
 * - DOMContentLoaded 시점에 전체 게임을 초기화하는 엔트리 포인트.
 * - DOM 요소를 탐색하고, ScreenManager / GameUI / Game / InputHandler / GameRecorder를 구성한다.
 * - 버튼/네비게이션 이벤트와 기록 정렬/초기화 UI를 연결한다.
 */
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
  const clearRecordsBtn = document.getElementById("recordClearBtn");

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

  /**
   * footer 영역의 기록 리스트를 렌더링한다.
   * 현재 recordSortMode에 따라 최신순/최고점수 순으로 표시.
   */
  const renderRecords = () => {
    if (!recordListEl) return;

    let records;
    if (recordSortMode === "best") {
      // 최고 점수 기준 10개
      records = recorder.getBestScoreRecords(10);
    } else {
      // 최신순 10개
      records = recorder.getLatestRecords(10);
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
    // 게임이 끝날 때마다 기록 저장 + 렌더
    onGameEnd: (result) => {
      recorder.saveRecord(result);
      renderRecords();
    },
  });

  // 초기 화면: 메인 메뉴
  screenManager.showMenu();

  // 키보드 입력 핸들러 등록
  new InputHandler({
    isGameActive: () => game.isPlayingOrPaused(),
    onMoveLeft: (down) => game.setMoveLeft(down),
    onMoveRight: (down) => game.setMoveRight(down),
    onTogglePause: () => game.togglePause(),
    onRestart: () => game.restartInPlace(),
    onQuitToMenu: () => game.showMenu(),
    onNextElement: () => game.nextPlatformElement(),
  });

  /** 게임 화면을 열고 난이도 선택 오버레이를 활성화하는 함수 */
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

  // 메인 메뉴 버튼들
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

  // 상단 네비게이션
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

  // 🔹 기록 초기화 버튼
  if (clearRecordsBtn) {
    clearRecordsBtn.addEventListener("click", () => {
      const ok = confirm("정말로 모든 플레이 기록을 삭제할까요?");
      if (!ok) return;

      recorder.clear();   // localStorage 비움
      renderRecords();    // UI 갱신 → "플레이 기록이 아직 없습니다." 표시
    });
  }

  // 페이지 처음 로드 시 기록 표시
  renderRecords();

  // 게임 루프 시작
  game.startLoop();
});
