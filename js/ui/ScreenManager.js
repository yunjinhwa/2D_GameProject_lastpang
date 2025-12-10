// js/ui/ScreenManager.js
export class ScreenManager {
  constructor({ mainMenu, howtoScreen, gameScreen, clearScreen, gameOverScreen }) {
    this.screens = {
      menu: mainMenu,
      howto: howtoScreen,
      game: gameScreen,
      clear: clearScreen,
      gameover: gameOverScreen,
    };
  }

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
  showClear()    { this.setScreen("clear"); }
  showGameOver() { this.setScreen("gameover"); }
}
