import { useEffect, useRef, useState } from 'react';
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

/** 세대의 마지막 로그 시각을 '방금 전 / N분 전'으로. 시각이 없으면 빈 문자열 */
function ago(g, logs, running, now) {
  const t = Math.max(0, ...logs.filter((l) => l.gen === g).map((l) => l.t));
  if (t < 1e12) return g === running ? '방금 전' : ''; // 밀리초 타임스탬프가 아니면 표시하지 않음
  const min = Math.floor((now - t) / 60000);
  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  if (min < 1440) return `${Math.floor(min / 60)}시간 전`;
  return `${Math.floor(min / 1440)}일 전`;
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
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000); // 'N분 전'을 30초마다 갱신
    return () => clearInterval(id);
  }, []);
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
            <span className="gen-time">{ago(g, logs, running, now)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
