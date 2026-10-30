const LEVEL_TAG = { ok: '완료', warn: '경고', bad: '실패', info: '정보' };

/** 메시지 내용으로 단계 태그를 정하고, 알 수 없으면 레벨 이름을 쓴다 */
function tag({ level, msg }) {
  if (/배포/.test(msg)) return '배포';
  if (/검증|오탐/.test(msg)) return '검증';
  if (/생성/.test(msg)) return '생성';
  if (/완료/.test(msg)) return '완료';
  if (/우회|뚫/.test(msg)) return '우회';
  return LEVEL_TAG[level] ?? level;
}

export default function EventLog({ logs }) {
  return (
    <div className="card events">
      <div className="card-head">
        <h2>이벤트 로그</h2>
        <span className="card-sub">최신 이벤트가 위에 표시됩니다.</span>
      </div>
      <ul className="log">
        {logs.length === 0 && <li className="empty">아직 이벤트가 없습니다.</li>}
        {logs.map((l, i) => (
          <li key={`${l.t}-${i}`} className={`lv-${l.level}`}>
            <span className="g">G{String(l.gen).padStart(2, '0')}</span>
            <span className="msg">{l.msg}</span>
            <span className="tag">{tag(l)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
