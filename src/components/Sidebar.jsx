const ICON = {
  home: <path d="M3 11.2 12 3.5l9 7.7V21h-6.5v-6h-5v6H3z" fill="currentColor" stroke="none" />,
  report: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V2.8h6V4M9 17v-3M12 17v-6M15 17v-4.5" />
    </>
  ),
  defense: (
    <>
      <path d="M12 2.8 4.5 5.6v5.6c0 4.7 3.2 8.5 7.5 9.9 4.3-1.4 7.5-5.2 7.5-9.9V5.6z" />
      <path d="M12 8v5M12 16.2v.1" />
    </>
  ),
  alerts: (
    <>
      <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.8h-15z" />
      <path d="M10 20.5a2 2 0 0 0 4 0" />
    </>
  ),
  logout: (
    <>
      <path d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14" />
      <path d="M15 12H4.5M8.5 8 4.5 12l4 4" />
    </>
  ),
};

function Icon({ name }) {
  return (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICON[name]}
    </svg>
  );
}

const TOP = [
  { id: 'home', label: '홈' },
  { id: 'report', label: '리포트' },
  { id: 'defense', label: '방어' },
];

export default function Sidebar({ page, onNavigate }) {
  const item = ({ id, label }) => (
    <button
      key={id}
      className={`nav-item${page === id ? ' active' : ''}`}
      onClick={() => onNavigate(id)}
      aria-label={label}
      aria-current={page === id ? 'page' : undefined}
      title={label}
    >
      <Icon name={id} />
    </button>
  );
  return (
    <nav className="sidebar" aria-label="메뉴">
      <div className="sidebar-logo">ANVIL</div>
      <div className="nav-group">{TOP.map(item)}</div>
      <div className="nav-group bottom">
        {item({ id: 'alerts', label: '알림' })}
        {/* 로그인 기능이 아직 없어 자리만 잡아 둔다 */}
        <button className="nav-item" aria-label="로그아웃" title="로그아웃 (준비 중)" disabled>
          <Icon name="logout" />
        </button>
      </div>
    </nav>
  );
}
