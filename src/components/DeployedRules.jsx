import { FLAG_LABEL, TYPES, TYPE_NAMES, pct } from '../lib/format.js';

export default function DeployedRules({ deployed }) {
  const byType = Object.fromEntries(deployed.map((r) => [r.type, r]));
  return (
    <div className="card">
      <h2>웹 서버에 적용된 룰셋</h2>
      <p className="card-sub">모든 검증을 통과한 룰만 배포됩니다. 더 강한 룰이 나오면 교체됩니다.</p>
      <div className="deployed">
        {Object.keys(TYPES).map((t) => {
          const r = byType[t];
          if (!r) {
            return (
              <div key={t} className="dep-item empty-slot">
                <span className={`type type-${t}`}>{TYPES[t]}</span>
                <div className="dep-meta">아직 모든 검증을 통과한 룰이 없음 ({TYPE_NAMES[t]})</div>
              </div>
            );
          }
          return (
            <div key={t} className="dep-item">
              <span className={`type type-${t}`}>{TYPES[t]}</span>
              <div>
                <div className="dep-pattern">{r.pattern}</div>
                <div className="dep-meta">
                  {r.id} · {r.gen}세대 생성 · 정규화 {r.flags.length ? r.flags.map((f) => FLAG_LABEL[f]).join('/') : '없음'} · 우회 {pct(r.bypass)} · 오탐 {pct(r.fp)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
