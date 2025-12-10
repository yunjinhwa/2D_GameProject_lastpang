export class GameRecorder {
  constructor(storageKey = "oheng-breakout-records") {
    this.storageKey = storageKey;
  }

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

  _saveAll(records) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(records));
    } catch (e) {
      console.error("[GameRecorder] save error:", e);
    }
  }

  /**
   * result: { type, difficulty, score, time, timestamp }
   * 반환값: 최신 기준으로 정렬된 전체 기록 배열
   */
  saveRecord(result) {
    const records = this._loadAll();
    const recordWithId = {
      id: Date.now(), // 간단한 식별자
      ...result,
    };

    records.unshift(recordWithId);        // 앞에 추가 → latest 우선
    const limited = records.slice(0, 20); // 최대 20개만 보관
    this._saveAll(limited);
    return limited;
  }

  /** 최신순 (저장된 순서 그대로) */
  getLatestRecords(limit = 20) {
    const records = this._loadAll();
    return limit ? records.slice(0, limit) : records;
  }

  /** 최고 점수순 (점수 내림차순, 동점이면 최신순) */
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

  clear() {
    this._saveAll([]);
  }
}
