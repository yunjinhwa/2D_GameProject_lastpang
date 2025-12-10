/**
 * InputHandler.js
 * ------------------------------------------
 * - 키보드 입력을 담당하는 모듈.
 * - Game 인스턴스를 직접 알지 않고 콜백만 받아서 호출한다.
 * - SOLID 중 DIP(의존성 역전)를 지키는 구조.
 */
export class InputHandler {
  /**
   * @param {Object} params
   * @param {() => boolean} params.isGameActive  입력을 받을 수 있는 상태인지
   * @param {(down:boolean) => void} params.onMoveLeft
   * @param {(down:boolean) => void} params.onMoveRight
   * @param {() => void} params.onTogglePause
   * @param {() => void} params.onRestart
   * @param {() => void} params.onQuitToMenu
   * @param {() => void} params.onNextElement
   */
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

    // this 바인딩 유지
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);

    // 전역 키 이벤트 등록
    document.addEventListener("keydown", this.handleKeyDown, false);
    document.addEventListener("keyup", this.handleKeyUp, false);
  }

  /** keydown 이벤트 핸들러 */
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
      // Space: 속성 변경
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

  /** keyup 이벤트 핸들러 */
  handleKeyUp(e) {
    const key = e.key;
    if (key === "ArrowRight" || key === "Right") {
      this.onMoveRight(false);
    } else if (key === "ArrowLeft" || key === "Left") {
      this.onMoveLeft(false);
    }
  }
}
