import { useState } from 'react';
import { pct } from '../lib/format.js';

const W = 860, H = 380, P = { l: 64, r: 24, t: 16, b: 48 }, PAD = 40;
const SERIES = [
  { key: 'bypass', label: '우회 성공률', color: 'var(--series-bypass)' },
  { key: 'detect', label: '공격 탐지율', color: 'var(--accent)' },
  { key: 'fp', label: '오탐률', color: 'var(--series-fp)' },
];

export default function PerformanceChart({ history }) {
  // 범례 칩을 눌러 선을 켜고 끈다
  const [hidden, setHidden] = useState([]);
  const toggle = (key) => setHidden(hidden.includes(key) ? hidden.filter((k) => k !== key) : [...hidden, key]);
  const points = history.filter((h) => h.gen >= 1);
  const last = points.length ? points[points.length - 1].gen : 0;
  const n = Math.max(last, 5);
  const iw = W - P.l - P.r, ih = H - P.t - P.b;
  const x = (g) => P.l + PAD + ((g - 1) / (n - 1)) * (iw - PAD * 2);
  const y = (v) => P.t + (1 - v) * ih;
  const shown = SERIES.filter((s) => !hidden.includes(s.key));
  return (
    <div className="chart">
      <h2>세대별 방어 성능</h2>
      <div className="legend">
        {SERIES.map((s) => (
          <button key={s.key} className={hidden.includes(s.key) ? 'off' : ''} style={{ '--c': s.color }} onClick={() => toggle(s.key)} aria-pressed={!hidden.includes(s.key)}>
            <i aria-hidden="true" />{s.label}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`세대별 ${shown.map((s) => s.label).join(', ')} 추이`}>
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <g key={v}>
            <line x1={P.l} x2={W - P.r} y1={y(v)} y2={y(v)} stroke="var(--grid)" strokeWidth="1" />
            <text x={P.l - 14} y={y(v) + 5} textAnchor="end" className="tick">{v * 100}%</text>
          </g>
        ))}
        {Array.from({ length: n }, (_, i) => (
          <text key={i} x={x(i + 1)} y={H - 14} textAnchor="middle" className="tick">{i + 1}세대</text>
        ))}
        {last > 0 && <line x1={x(last)} x2={x(last)} y1={P.t} y2={P.t + ih} stroke="var(--text)" strokeWidth="1" strokeDasharray="3 4" />}
        {shown.map((s) => (
          <g key={s.key}>
            <polyline
              points={points.map((h) => `${x(h.gen).toFixed(1)},${y(h[s.key]).toFixed(1)}`).join(' ')}
              fill="none" stroke={s.color} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round"
            />
            {points.map((h) => (
              <circle key={h.gen} cx={x(h.gen)} cy={y(h[s.key])} r="9" fill={s.color}>
                <title>{`${h.gen}세대 ${s.label}: ${pct(h[s.key])}`}</title>
              </circle>
            ))}
          </g>
        ))}
      </svg>
      {points.length === 0 && <p className="card-sub chart-empty">세대를 실행하면 그래프가 그려집니다.</p>}
    </div>
  );
}
