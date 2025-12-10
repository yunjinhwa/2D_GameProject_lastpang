/**
 * GameUI.js
 * ------------------------------------------
 * - DOM 요소를 직접 다루지 않고, UI 갱신 로직을 캡슐화한다.
 * - 점수/목숨/현재 속성/타이머/결과 화면 텍스트 갱신을 담당.
 */
export class GameUI {
  /**
   * @param {Object} params
   * @param {HTMLElement} params.scoreEl
   * @param {HTMLElement} params.livesEl
   * @param {HTMLElement} params.elementLabelEl
   * @param {Object} params.elementNames  오행 한글 이름 매핑
   * @param {NodeListOf<HTMLElement>} params.finalScoreEls
   * @param {HTMLElement} params.clearTimeEl
   * @param {HTMLElement} params.timerEl
   * @param {HTMLElement} params.gameOverTimeEl
   */
  constructor({
    scoreEl,
    livesEl,
    elementLabelEl,
    elementNames,
    finalScoreEls,
    clearTimeEl,
    timerEl,
    gameOverTimeEl,
  }) {
    this.scoreEl = scoreEl;
    this.livesEl = livesEl;
    this.elementLabelEl = elementLabelEl;
    this.elementNames = elementNames;
    this.finalScoreEls = finalScoreEls;
    this.clearTimeEl = clearTimeEl;
    this.timerEl = timerEl;
    this.gameOverTimeEl = gameOverTimeEl;
  }

  /** 상단/결과 화면의 점수 텍스트를 갱신한다. */
  updateScore(score) {
    if (this.scoreEl) this.scoreEl.textContent = String(score);
    if (this.finalScoreEls) {
      this.finalScoreEls.forEach((el) => {
        el.textContent = String(score);
      });
    }
  }

  /** 남은 목숨 텍스트 갱신 */
  updateLives(lives) {
    if (this.livesEl) this.livesEl.textContent = String(lives);
  }

  /**
   * 현재 속성(오행) 텍스트 및 배경 스타일 갱신
   * @param {string} elementType "frame" | "ground" | ...
   */
  updateElement(elementType) {
    if (!this.elementLabelEl) return;
    const label = this.elementNames[elementType] || elementType;
    this.elementLabelEl.textContent = label;

    const wrapper = this.elementLabelEl.parentElement;
    if (!wrapper) return;

    // 속성에 따른 색상 매핑
    let bg = "#0f172a";
    switch (elementType) {
      case "frame":  bg = "#b91c1c"; break;
      case "ground": bg = "#92400e"; break;
      case "metal":  bg = "#6b7280"; break;
      case "water":  bg = "#0ea5e9"; break;
      case "wood":   bg = "#16a34a"; break;
    }

    wrapper.style.background = `linear-gradient(90deg, rgba(15,23,42,0.95), ${bg})`;
    wrapper.style.borderColor = bg;
    wrapper.style.boxShadow = `0 0 12px ${bg}55`;
  }

  /** 클리어 화면에서 클리어 타임 표시 */
  updateClearTime(seconds) {
    if (!this.clearTimeEl) return;
    this.clearTimeEl.textContent = seconds.toFixed(2) + "초";
  }

  /** 상단 실시간 타이머 표시 */
  updateTimer(seconds) {
    if (!this.timerEl) return;
    this.timerEl.textContent = seconds.toFixed(2);
  }

  /** 게임 오버 화면의 플레이 타임 표시 */
  updateGameOverTime(seconds) {
    if (!this.gameOverTimeEl) return;
    this.gameOverTimeEl.textContent = seconds.toFixed(2) + "초";
  }
}
