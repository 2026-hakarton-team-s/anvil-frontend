import { useState } from 'react';
import { FLAG_LABEL, STATUS_VIEW, TECH_LABEL, TIER_LABEL, TYPES, TYPE_NAMES, pct, showWs } from '../lib/format.js';

const val = (x) => (x === undefined ? '—' : pct(x));

function Flags({ flags }) {
  if (!flags.length) return <span className="none">없음</span>;
  return flags.map((f) => <span key={f} className="flag on" title={FLAG_LABEL[f]}>{f}</span>);
}

function Detail({ rule }) {
  if (!rule) return <div className="detail"><span className="k">선택한 룰 없음 — 표의 행을 클릭하세요.</span></div>;
  return (
    <div className="detail">
      <div className="row"><b>{rule.id}</b> · {TYPE_NAMES[rule.type]} · <span className="k">{TIER_LABEL[rule.tier] ?? rule.tier}</span></div>
      <div className="row"><span className="k">패턴</span> <code>{rule.pattern}</code></div>
      <div className="row"><span className="k">정규화</span> {rule.flags.length ? rule.flags.map((f) => FLAG_LABEL[f]).join(', ') : '없음 (요청을 그대로 검사)'}</div>
      {rule.fpSamples.length > 0 && (
        <div className="row">
          <span className="k" style={{ color: 'var(--bad)' }}>오탐된 정상 요청</span>{' '}
          {rule.fpSamples.map((s) => <code key={s}>{s} </code>)}
        </div>
      )}
      {rule.bypassSamples.length > 0 && (
        <div className="row">
          <span className="k" style={{ color: 'var(--warn)' }}>룰을 뚫은 변형 공격</span>
          {rule.bypassSamples.map((v) => (
            <div key={v.text}><code>{showWs(v.text)}</code> <span className="k">({v.techs.map((t) => TECH_LABEL[t] ?? t).join('+')})</span></div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CandidateTable({ candidates, gen }) {
  const [selected, setSelected] = useState(null);
  const alive = candidates.filter((r) => r.status === 'ok' || r.status === 'deploy').length;
  return (
    <div className="card">
      <div className="card-head">
        <h2>이번 세대 후보 시그니처</h2>
        {candidates.length > 0 && <span className="card-sub">세대 {gen} · 후보 {candidates.length}개 중 생존 {alive}개</span>}
      </div>
      <p className="card-sub">행을 클릭하면 탈락 근거(오탐된 정상 요청, 룰을 뚫은 변형 공격)를 볼 수 있습니다.</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>유형</th><th>시그니처 (정규식)</th><th>정규화</th><th>탐지</th><th>오탐</th><th>우회</th><th>결과</th></tr>
          </thead>
          <tbody>
            {candidates.length === 0 && (
              <tr><td colSpan="7" className="empty">[1세대 실행] 또는 [자동 진화]를 눌러 시작하세요.</td></tr>
            )}
            {candidates.map((r) => {
              const [cls, txt] = STATUS_VIEW[r.status];
              return (
                <tr key={r.id} className={selected === r.id ? 'selected' : ''} onClick={() => setSelected(r.id)}>
                  <td><span className={`type type-${r.type}`}>{TYPES[r.type]}</span></td>
                  <td><div className="pattern" title={r.pattern}>{r.pattern}</div></td>
                  <td className="flags-cell"><Flags flags={r.flags} /></td>
                  <td className="num">{val(r.detect)}</td>
                  <td className="num">{val(r.fp)}</td>
                  <td className="num">{val(r.bypass)}</td>
                  <td><span className={`result ${cls}`}>{txt}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Detail rule={candidates.find((r) => r.id === selected)} />
    </div>
  );
}
