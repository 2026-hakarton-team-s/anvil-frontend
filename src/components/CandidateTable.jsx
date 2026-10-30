import { useEffect, useRef } from 'react';
import { FLAG_LABEL, STATUS_VIEW, TYPES, pct } from '../lib/format.js';

const val = (x) => (x === undefined ? '—' : pct(x));

function Flags({ flags }) {
  if (!flags.length) return <span className="none">없음</span>;
  return flags.map((f) => <span key={f} className="flag on" title={FLAG_LABEL[f]}>{f}</span>);
}

export default function CandidateTable({ candidates, gen, selected, onSelect }) {
  const alive = candidates.filter((r) => r.status === 'ok' || r.status === 'deploy').length;
  const wrapRef = useRef(null);
  // 선택한 행이 스크롤 영역 밖에 있으면 보이도록 표 안에서만 스크롤한다
  useEffect(() => {
    const wrap = wrapRef.current;
    const row = wrap?.querySelector('tr.selected');
    if (!row) return;
    const head = wrap.querySelector('thead').offsetHeight;
    if (row.offsetTop - head < wrap.scrollTop) wrap.scrollTop = row.offsetTop - head;
    else if (row.offsetTop + row.offsetHeight > wrap.scrollTop + wrap.clientHeight) wrap.scrollTop = row.offsetTop + row.offsetHeight - wrap.clientHeight;
  }, [selected]);
  return (
    <div className="card candidates">
      <div className="card-head">
        <h2>이번 세대 후보 시그니처</h2>
        {candidates.length > 0 && <span className="card-sub">세대 {gen} · 후보 {candidates.length}개 중 생존 {alive}개</span>}
      </div>
      <div className="table-wrap" ref={wrapRef}>
        <table>
          <thead>
            <tr><th>유형</th><th>시그니처 (정규식)</th><th>정규화</th><th className="num">탐지</th><th className="num">오탐</th><th className="num">우회</th><th>결과</th></tr>
          </thead>
          <tbody>
            {candidates.length === 0 && (
              <tr><td colSpan="7" className="empty">홈에서 [실행하기] 또는 [1세대 실행]을 눌러 시작하세요.</td></tr>
            )}
            {candidates.map((r) => {
              const [cls, txt] = STATUS_VIEW[r.status];
              return (
                <tr key={r.id} className={selected === r.id ? 'selected' : ''} onClick={() => onSelect(r.id)} title="클릭하면 아래에서 상세 근거를 볼 수 있습니다">
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
    </div>
  );
}
