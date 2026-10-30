import { pct } from '../lib/format.js';

export default function KpiCards({ kpis }) {
  const cards = [
    { label: '배포된 룰', value: `${kpis.deployed}/${kpis.totalTypes}`, hint: '공격 유형 4종 중' },
    { label: '공격 탐지율', value: pct(kpis.detect), hint: '원본 + AI 변형 공격', tone: 'good' },
    { label: '우회 성공률', value: pct(kpis.bypass), hint: 'AI 변형 공격 기준', tone: 'bad' },
    { label: '오탐률', value: pct(kpis.fp), hint: '정상 트래픽 차단 비율', tone: 'warn' },
    { label: '학습한 우회 기법', value: kpis.techniques, hint: '정규화로 대응 중' },
    { label: '학습 데이터', value: kpis.corpus, hint: '공격 샘플 (우회 사례 포함)' },
  ];
  return (
    <section className="kpis" aria-label="현재 배포 룰셋 성능">
      {cards.map((c) => (
        <div key={c.label} className={`kpi ${c.tone ?? ''}`}>
          <div className="label">{c.label}</div>
          <div className="value">{c.value}</div>
          <div className="hint">{c.hint}</div>
        </div>
      ))}
    </section>
  );
}
