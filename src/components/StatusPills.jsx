/** 서버 · WAF · AI 연결 상태. gen을 주면 현재 세대도 함께 보여준다 */
export default function StatusPills({ connected, env, gen }) {
  return (
    <div className="pills">
      <span className={`pill ${connected ? 'on' : 'off'}`}>
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          {[2, 5, 8].map((x, i) => (
            <rect key={x} x={x} y={8 - i * 2.5} width="2" height={3 + i * 2.5} rx="0.5" fill="currentColor" opacity={connected ? 1 : 0.35} />
          ))}
        </svg>
        {connected ? '서버 연결됨' : '서버 연결 끊김'}
      </span>
      {env && <span className={`pill ${env.wafConnected ? 'on' : ''}`}>WAF {env.wafConnected ? '연동' : '미연동'}</span>}
      {env && <span className={`pill ${env.aiEnabled ? 'on' : ''}`}>{env.aiEnabled ? 'OpenAI 사용' : '패턴 풀 사용'}</span>}
      {gen !== undefined && <span className="pill gen">세대 <b>{gen}</b></span>}
    </div>
  );
}
