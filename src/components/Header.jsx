import StatusPills from './StatusPills.jsx';

export default function Header({ title, subtitle, gen, connected, env, showStatus = true }) {
  return (
    <header className="topbar">
      <div className="page-title">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="head-right">
        {showStatus && <StatusPills connected={connected} env={env} gen={gen} />}
        <div className="user">
          <div className="avatar" aria-hidden="true">
            <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="12" r="9.5" />
              <circle cx="12" cy="9.5" r="3.4" />
              <path d="M5.8 18.6c1.4-2.3 3.6-3.6 6.2-3.6s4.8 1.3 6.2 3.6" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="hello">환영합니다.</div>
            <div className="name">USER 님</div>
          </div>
        </div>
      </div>
    </header>
  );
}
