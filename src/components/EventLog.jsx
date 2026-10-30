export default function EventLog({ logs }) {
  return (
    <div className="card">
      <h2>이벤트 로그</h2>
      <p className="card-sub">최신 이벤트가 위에 표시됩니다.</p>
      <div className="log">
        {logs.map((l, i) => (
          <div key={`${l.t}-${i}`}>
            <span className="g">G{String(l.gen).padStart(2, '0')}</span>
            <span className={`lv-${l.level}`}>{l.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
