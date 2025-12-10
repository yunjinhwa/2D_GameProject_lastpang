/**
 * ScreenManager.js
 * ------------------------------------------
 * - 메인/게임/설명/게임오버 등 여러 화면(screen)의 활성 상태를 관리한다.
 * - DOM 요소를 직접 숨기거나 보여주는 역할만 담당.
 */
export class ScreenManager {
  /**
   * @param {Object} params
   * @param {HTMLElement} params.mainMenu
   * @param {HTMLElement} params.howtoScreen
   * @param {HTMLElement} params.gameScreen
   * @param {HTMLElement} params.clearScreen
   * @param {HTMLElement} params.gameOverScreen
   */
  constructor({ mainMenu, howtoScreen, gameScreen, clearScreen, gameOverScreen }) {
    this.screens = {
      menu: mainMenu,
      howto: howtoScreen,
      game: gameScreen,
      clear: clearScreen,
      gameover: gameOverScreen,
    };
  }

  /**
   * 모든 화면에서 active 클래스를 제거하고,
   * 지정한 이름의 화면에만 active를 부여한다.
   */
  setScreen(name) {
    Object.values(this.screens).forEach((el) => {
      if (!el) return;
      el.classList.remove("active");
    });
    const target = this.screens[name];
    if (target) target.classList.add("active");
  }

  showMenu()     { this.setScreen("menu"); }
  showGame()     { this.setScreen("game"); }
  showHowTo()    { this.setScreen("howto"); }
  showGameOver() { this.setScreen("gameover"); }
}
