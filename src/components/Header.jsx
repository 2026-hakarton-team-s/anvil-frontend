export default function Header({ gen, connected, env }) {
  return (
    <header>
      <div className="brand">
        <div className="logo" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ff7a1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 8h13l2-3h3v3c0 2-2 4-5 4H9l-1 3h6v4H6v-4h1l1-3H5C3.9 12 3 11.1 3 10V8z" />
          </svg>
        </div>
        <div>
          <h1><span>ANVIL</span> 대시보드</h1>
          <p className="subtitle">자가개선형 웹 방어 시그니처 플랫폼 — 생성 · 오탐 검증 · AI 우회 공격을 반복해 살아남은 룰만 WAF에 적용</p>
        </div>
      </div>
      <div className="head-right">
        <span className={`pill ${connected ? 'on' : 'off'}`}>{connected ? '서버 연결됨' : '서버 연결 끊김'}</span>
        {env && <span className={`pill ${env.wafConnected ? 'on' : ''}`}>WAF {env.wafConnected ? '연동' : '미연동'}</span>}
        {env && <span className={`pill ${env.aiEnabled ? 'on' : ''}`}>{env.aiEnabled ? 'OpenAI 사용' : '패턴 풀 사용'}</span>}
        <div className="gen-badge">세대 <b>{gen}</b></div>
      </div>
    </header>
  );
}
