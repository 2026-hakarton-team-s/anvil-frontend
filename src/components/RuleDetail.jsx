import { FLAG_LABEL, STATUS_VIEW, TECH_LABEL, TIER_LABEL, TYPES, TYPE_NAMES, pct, showWs } from '../lib/format.js';

const val = (x) => (x === undefined ? '—' : pct(x));

function Mark({ ok }) {
  return (
    <svg className={`mark ${ok ? 'ok' : 'bad'}`} width="18" height="18" viewBox="0 0 20 20" aria-label={ok ? '통과' : '탈락'}>
      <circle cx="10" cy="10" r="10" fill="currentColor" />
      <path d={ok ? 'M5.5 10.3 8.6 13.2 14.5 7' : 'M6.5 6.5l7 7M13.5 6.5l-7 7'} fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 상태와 허용치를 바탕으로 살아남은/떨어진 근거를 만든다 */
function reasons(rule, fpMax, bypMax) {
  const items = [];
  if (rule.detect !== undefined) {
    const ok = rule.status !== 'det';
    items.push({ ok, text: ok ? `원본 공격을 탐지함 (탐지 ${pct(rule.detect)})` : `원본 공격을 충분히 탐지하지 못함 (탐지 ${pct(rule.detect)})` });
  }
  if (rule.fp !== undefined) {
    const ok = rule.status !== 'fp';
    items.push({
      ok,
      text: ok
        ? rule.fp === 0 ? '정상 요청을 하나도 막지 않음 (오탐 0%)' : `정상 요청 차단이 허용치 이내 (오탐 ${pct(rule.fp)})`
        : `정상 요청을 막음 (오탐 ${pct(rule.fp)}, 허용치 ${fpMax}%)`,
    });
  }
  if (rule.bypass !== undefined) {
    const ok = rule.status !== 'byp';
    items.push({ ok, text: ok ? `AI 변형 공격 대부분을 막음 (우회 ${pct(rule.bypass)})` : `AI 변형 공격에 뚫림 (우회 ${pct(rule.bypass)}, 허용치 ${bypMax}%)` });
  }
  if (rule.flags.length && rule.status !== 'pending') {
    items.push({ ok: true, text: `정규화로 ${rule.flags.map((f) => FLAG_LABEL[f]).join('·')} 변형을 먼저 정리` });
  }
  return items;
}

const TITLE = { deploy: '배포된 이유', ok: '생존한 이유', fp: '탈락한 이유', det: '탈락한 이유', byp: '탈락한 이유', pending: '검증 중' };
const NOTE = {
  deploy: '배포된 룰도 다음 세대에서 다시 평가됩니다',
  ok: '모든 검증을 통과했지만 이번 세대에 배포되지는 않았습니다',
  pending: '아직 검증이 끝나지 않았습니다',
};

export default function RuleDetail({ rule, deployed, fpMax, bypMax }) {
  if (!rule) {
    return (
      <div className="card rule-detail">
        <h2>선택한 룰 상세</h2>
        <p className="card-sub">위 표에서 룰을 선택하면 살아남거나 떨어진 근거를 볼 수 있습니다.</p>
      </div>
    );
  }
  const [cls, txt] = STATUS_VIEW[rule.status];
  const live = deployed.some((d) => d.id === rule.id);
  const failed = ['fp', 'det', 'byp'].includes(rule.status);
  return (
    <div className="card rule-detail">
      <div className="detail-head">
        <h2>선택한 룰 상세</h2>
        <span className={`type type-${rule.type}`}>{TYPES[rule.type]}</span>
        <span className="rule-name"><b>{rule.id} · {TYPE_NAMES[rule.type]}</b> · {TIER_LABEL[rule.tier] ?? rule.tier}</span>
        <span className={`result ${cls}`}>{txt}</span>
      </div>

      <div className="tiles">
        <div className="tile"><div className="k">탐지</div><div className="v">{val(rule.detect)}</div></div>
        <div className="tile"><div className="k">오탐 · 허용치 {fpMax}% 이하</div><div className={`v${rule.status === 'fp' ? ' bad' : ''}`}>{val(rule.fp)}</div></div>
        <div className="tile"><div className="k">우회 · 허용치 {bypMax}% 이하</div><div className={`v${rule.status === 'byp' ? ' bad' : ''}`}>{val(rule.bypass)}</div></div>
      </div>

      <div className="detail-body">
        <div className="reasons">
          <h3>{TITLE[rule.status]}</h3>
          <ul>
            {reasons(rule, fpMax, bypMax).map((r) => (
              <li key={r.text}><Mark ok={r.ok} />{r.text}</li>
            ))}
          </ul>
          {rule.fpSamples.length > 0 && (
            <div className="samples-box">
              <div className="k bad">오탐된 정상 요청</div>
              {rule.fpSamples.map((s) => <code key={s}>{s}</code>)}
            </div>
          )}
          {rule.bypassSamples.length > 0 && (
            <div className="samples-box">
              <div className="k warn">룰을 뚫은 변형 공격</div>
              {rule.bypassSamples.map((v) => (
                <code key={v.text}>{showWs(v.text)} <span className="k">({v.techs.map((t) => TECH_LABEL[t] ?? t).join('+')})</span></code>
              ))}
            </div>
          )}
          {!failed && <p className="note">{NOTE[rule.status]}</p>}
        </div>

        <div className="spec">
          <h3>패턴</h3>
          <code className="pattern-box">{rule.pattern}</code>
          <h3>정규화</h3>
          <div className="norm">
            {rule.flags.length ? rule.flags.map((f) => <span key={f} className="norm-chip">{f} · {FLAG_LABEL[f]}</span>) : <span className="k">없음 (요청을 그대로 검사)</span>}
          </div>
          <div className={`live${live ? ' on' : ''}`}>
            <span><i aria-hidden="true" />{live ? '웹 서버에 적용 중' : '웹 서버에 적용되지 않음'}</span>
            <a href="#/defense">룰셋 보기 →</a>
          </div>
        </div>
      </div>
    </div>
  );
}
