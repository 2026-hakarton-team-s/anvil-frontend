import { useEffect, useRef } from 'react';
import { pct } from '../lib/format.js';

function summary(g, history, deployed, logs, activeStage, paused) {
  const cur = history.find((h) => h.gen === g);
  const prev = history.find((h) => h.gen === g - 1);
  const parts = [];
  if (cur) {
    parts.push(prev ? `우회 성공률 ${pct(prev.bypass)} → ${pct(cur.bypass)}` : `우회 성공률 ${pct(cur.bypass)}`);
    parts.push(`탐지율 ${pct(cur.detect)}`);
  }
  const ids = deployed.filter((r) => r.gen === g).map((r) => r.id);
  if (ids.length) parts.push(`${ids.join(', ')} 배포`);
  if (!cur) parts.push(activeStage != null ? `STEP ${activeStage + 1}/5 ${paused ? '일시정지' : '진행 중'}` : logs.find((l) => l.gen === g)?.msg ?? '진행 중');
  return parts.join(' · ');
}

export default function RecentGenerations({ history, gen, busy, paused, activeStage, deployed, logs }) {
  const gens = history.filter((h) => h.gen > 0).map((h) => h.gen);
  // 실행 중인 세대: 현재 세대가 이미 기록돼 있으면 다음 세대가 돌고 있는 것
  const running = busy ? (gens.includes(gen) ? gen + 1 : Math.max(gen, 1)) : null;
  if (running && !gens.includes(running)) gens.push(running);
  // 1세대부터 차례로 쌓고, 새 세대가 생기면 목록 아래쪽으로 스크롤한다
  const recent = [...new Set(gens)].sort((a, b) => a - b);
  const latest = recent[recent.length - 1];
  const listRef = useRef(null);
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [latest]);
  return (
    <div className="card recent">
      <h2>최근 세대</h2>
      {recent.length === 0 && <p className="card-sub">아직 실행한 세대가 없습니다. [실행하기]를 눌러 시작하세요.</p>}
      <ul ref={listRef}>
        {recent.map((g) => (
          <li key={g} className={g === latest ? 'latest' : ''}>
            <div className="gen-title">
              세대 {g}
              {g === running && <span className={`badge${paused ? ' paused' : ''}`}>{paused ? '일시정지' : '진행중'}</span>}
            </div>
            <div className="gen-sum">{summary(g, history, deployed, logs, activeStage, paused)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
