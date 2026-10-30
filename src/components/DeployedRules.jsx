import { FLAG_LABEL, TYPES, TYPE_NAMES, pct } from '../lib/format.js';

export default function DeployedRules({ deployed }) {
  const byType = Object.fromEntries(deployed.map((r) => [r.type, r]));
  const types = Object.keys(TYPES);
  const live = types.filter((t) => byType[t]).length;
  return (
    <div className="card ruleset">
      <div className="card-head">
        <h2>웹 서버에 적용된 룰셋</h2>
        <span className="card-sub">적용 중 {live} · 비어 있음 {types.length - live}</span>
      </div>
      <p className="card-sub">모든 검증을 통과한 룰만 배포됩니다. 더 강한 룰이 나오면 교체됩니다.</p>
      <div className="deployed">
        {types.map((t) => {
          const r = byType[t];
          if (!r) {
            return (
              <div key={t} className="dep-item empty-slot">
                <div className="dep-top">
                  <span className={`type type-${t}`}>{TYPES[t]}</span>
                  <span className="dep-name">{TYPE_NAMES[t]}</span>
                  <span className="dep-state">아직 모든 검증을 통과한 룰이 없음</span>
                </div>
              </div>
            );
          }
          return (
            <div key={t} className="dep-item">
              <div className="dep-top">
                <span className={`type type-${t}`}>{TYPES[t]}</span>
                <span className="dep-name">{TYPE_NAMES[t]}</span>
                <span className="dep-state on"><i aria-hidden="true" />적용 중</span>
              </div>
              <code className="dep-pattern">{r.pattern}</code>
              <div className="dep-meta">
                <span className="chip id">{r.id}</span>
                <span className="chip">{r.gen}세대 생성</span>
                <span className="chip bad">우회 {pct(r.bypass)}</span>
                <span className="chip warn">오탐 {pct(r.fp)}</span>
                <span className="chip info">정규화 {r.flags.length ? r.flags.map((f) => FLAG_LABEL[f]).join(' / ') : '없음'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
