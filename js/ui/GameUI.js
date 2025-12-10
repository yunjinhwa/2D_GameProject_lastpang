// js/ui/GameUI.js
export class GameUI {
  constructor({ scoreEl, livesEl, elementLabelEl, elementNames, finalScoreEls, clearTimeEl }) {
    this.scoreEl = scoreEl;
    this.livesEl = livesEl;
    this.elementLabelEl = elementLabelEl;
    this.elementNames = elementNames;
    this.finalScoreEls = finalScoreEls;
    this.clearTimeEl = clearTimeEl;
  }

  updateScore(score) {
    if (this.scoreEl) this.scoreEl.textContent = String(score);
    if (this.finalScoreEls) {
      this.finalScoreEls.forEach((el) => {
        el.textContent = String(score);
      });
    }
  }

  updateLives(lives) {
    if (this.livesEl) this.livesEl.textContent = String(lives);
  }

  updateElement(elementType) {
    if (!this.elementLabelEl) return;
    const label = this.elementNames[elementType] || elementType;
    this.elementLabelEl.textContent = label;

    const wrapper = this.elementLabelEl.parentElement;
    if (!wrapper) return;

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

  updateClearTime(seconds) {
    if (!this.clearTimeEl) return;
    this.clearTimeEl.textContent = seconds.toFixed(2) + "초";
  }
}
