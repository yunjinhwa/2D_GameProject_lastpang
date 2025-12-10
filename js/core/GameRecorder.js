/**
 * GameRecorder.js
 * ------------------------------------------
 * - localStorage를 사용하여 플레이 기록을 저장/조회/정렬/삭제하는 모듈.
 * - Game에서 onGameEnd 콜백으로 결과를 넘기면,
 *   이 클래스에서 스코어보드 데이터를 관리한다.
 */
export class GameRecorder {
  /**
   * @param {string} storageKey localStorage 키 이름
   */
  constructor(storageKey = "oheng-breakout-records") {
    this.storageKey = storageKey;
  }

  /** 내부용: 전체 기록을 로드한다. */
  _loadAll() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return [];
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.error("[GameRecorder] load error:", e);
      return [];
    }
  }

  /** 내부용: 전체 기록을 저장한다. */
  _saveAll(records) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(records));
    } catch (e) {
      console.error("[GameRecorder] save error:", e);
    }
  }

  /**
   * 결과 하나를 저장한다.
   * @param {Object} result
   * @param {"clear"|"gameover"} result.type    결과 타입
   * @param {string} result.difficulty          난이도
   * @param {number} result.score               점수
   * @param {number} result.time                클리어/플레이 시간
   * @param {number} result.timestamp           Date.now()
   *
   * @returns {Array} 최신 기준으로 정렬된 전체 기록
   */
  saveRecord(result) {
    const records = this._loadAll();
    const recordWithId = {
      id: Date.now(), // 간단한 식별자
      ...result,
    };

    // 앞에 추가 → latest 우선
    records.unshift(recordWithId);
    // 최대 20개만 보관
    const limited = records.slice(0, 20);
    this._saveAll(limited);
    return limited;
  }

  /** 최신순 (저장된 순서 그대로) */
  getLatestRecords(limit = 20) {
    const records = this._loadAll();
    return limit ? records.slice(0, limit) : records;
  }

  /**
   * 최고 점수순 (점수 내림차순, 동점이면 최신순)
   */
  getBestScoreRecords(limit = 20) {
    const sorted = this._loadAll()
      .slice()
      .sort((a, b) => {
        if ((b.score ?? 0) !== (a.score ?? 0)) {
          return (b.score ?? 0) - (a.score ?? 0);
        }
        return (b.timestamp ?? 0) - (a.timestamp ?? 0);
      });
    return limit ? sorted.slice(0, limit) : sorted;
  }

  /** 기존 getRecords는 최신순으로 동작하도록 유지 */
  getRecords(limit = 20) {
    return this.getLatestRecords(limit);
  }

  /** 모든 기록 초기화 */
  clear() {
    this._saveAll([]);
  }
}
