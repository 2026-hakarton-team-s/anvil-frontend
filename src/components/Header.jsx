export default function Header({ title, subtitle, gen, connected, env }) {
  return (
    <header className="topbar">
      <div className="page-title">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="head-right">
        <div className="pills">
          <span className={`pill ${connected ? 'on' : 'off'}`}>{connected ? '서버 연결됨' : '서버 연결 끊김'}</span>
          {env && <span className={`pill ${env.wafConnected ? 'on' : ''}`}>WAF {env.wafConnected ? '연동' : '미연동'}</span>}
          {env && <span className={`pill ${env.aiEnabled ? 'on' : ''}`}>{env.aiEnabled ? 'OpenAI 사용' : '패턴 풀 사용'}</span>}
          <span className="pill gen">세대 <b>{gen}</b></span>
        </div>
        <div className="user">
          <div className="avatar" aria-hidden="true" />
          <div>
            <div className="hello">환영합니다.</div>
            <div className="name">USER 님</div>
          </div>
        </div>
      </div>
    </header>
  );
}
