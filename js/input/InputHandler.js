// js/input/InputHandler.js
export class InputHandler {
  constructor({
    isGameActive,
    onMoveLeft,
    onMoveRight,
    onTogglePause,
    onRestart,
    onQuitToMenu,
    onNextElement,
  }) {
    this.isGameActive = isGameActive;
    this.onMoveLeft = onMoveLeft;
    this.onMoveRight = onMoveRight;
    this.onTogglePause = onTogglePause;
    this.onRestart = onRestart;
    this.onQuitToMenu = onQuitToMenu;
    this.onNextElement = onNextElement;

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);

    document.addEventListener("keydown", this.handleKeyDown, false);
    document.addEventListener("keyup", this.handleKeyUp, false);
  }

  handleKeyDown(e) {
    const key = e.key;

    if ((key === "ArrowRight" || key === "Right") && this.isGameActive()) {
      this.onMoveRight(true);
    } else if (
      (key === "ArrowLeft" || key === "Left") &&
      this.isGameActive()
    ) {
      this.onMoveLeft(true);
    } else if (key === " ") {
      if (this.isGameActive()) {
        e.preventDefault();
        this.onNextElement();
      }
    } else if (key === "Escape" || key === "p" || key === "P") {
      if (this.isGameActive()) this.onTogglePause();
    } else if (key === "r" || key === "R") {
      if (this.isGameActive()) this.onRestart();
    } else if (key === "q" || key === "Q") {
      if (this.isGameActive()) this.onQuitToMenu();
    }
  }

  handleKeyUp(e) {
    const key = e.key;
    if (key === "ArrowRight" || key === "Right") {
      this.onMoveRight(false);
    } else if (key === "ArrowLeft" || key === "Left") {
      this.onMoveLeft(false);
    }
  }
}
