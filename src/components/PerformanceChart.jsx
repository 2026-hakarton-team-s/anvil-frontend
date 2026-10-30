import { pct } from '../lib/format.js';

const W = 460, H = 250, P = { l: 40, r: 14, t: 12, b: 30 };
const SERIES = [
  { key: 'fp', color: '#f5b942', label: '오탐률' },
  { key: 'bypass', color: '#ff5468', label: '우회 성공률' },
  { key: 'detect', color: '#33c48d', label: '공격 탐지율' },
];

export default function PerformanceChart({ history }) {
  const iw = W - P.l - P.r, ih = H - P.t - P.b;
  const n = Math.max(history.length - 1, 5);
  const x = (g) => P.l + (g / n) * iw;
  const y = (v) => P.t + (1 - v) * ih;
  return (
    <div className="card">
      <h2>세대별 방어 성능</h2>
      <p className="card-sub">배포된 룰셋을 매 세대 새로운 AI 변형 공격으로 평가</p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="세대별 탐지율, 우회 성공률, 오탐률 추이">
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <g key={v}>
            <line x1={P.l} x2={W - P.r} y1={y(v)} y2={y(v)} stroke="#2a2f3a" strokeWidth="1" />
            <text x={P.l - 6} y={y(v) + 4} textAnchor="end" fontSize="10" fill="#8b93a3">{v * 100}%</text>
          </g>
        ))}
        {Array.from({ length: n + 1 }, (_, g) => (
          <text key={g} x={x(g)} y={H - 10} textAnchor="middle" fontSize="10" fill="#8b93a3">{g}</text>
        ))}
        {SERIES.map((s) => (
          <g key={s.key}>
            <polyline
              points={history.map((h) => `${x(h.gen).toFixed(1)},${y(h[s.key]).toFixed(1)}`).join(' ')}
              fill="none" stroke={s.color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round"
            />
            {history.map((h) => (
              <circle key={h.gen} cx={x(h.gen)} cy={y(h[s.key])} r="3.2" fill={s.color}>
                <title>{`세대 ${h.gen}: ${pct(h[s.key])}`}</title>
              </circle>
            ))}
          </g>
        ))}
      </svg>
      <div className="legend">
        {[...SERIES].reverse().map((s) => (
          <span key={s.key}><i style={{ background: s.color }} />{s.label}</span>
        ))}
      </div>
    </div>
  );
}
