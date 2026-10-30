import { pct } from '../lib/format.js';

const CARDS = {
  deployed: (k) => ({ label: '배포된 룰', value: `${k.deployed}/${k.totalTypes}`, hint: '공격 유형 4종 중' }),
  detect: (k) => ({ label: '공격 탐지율', value: pct(k.detect), hint: '원본 + AI 변형 공격' }),
  bypass: (k) => ({ label: '우회 성공률', value: pct(k.bypass), hint: 'AI 변형 공격 기준' }),
  fp: (k) => ({ label: '오탐률', value: pct(k.fp), hint: '정상 트래픽 차단 비율' }),
  techniques: (k) => ({ label: '학습한 우회 기법', value: k.techniques, hint: '정규화로 대응 중' }),
  corpus: (k) => ({ label: '학습 데이터', value: k.corpus, hint: '공격 샘플 (우회 사례 포함)' }),
};

/** items: 보여줄 카드 키 목록 (CARDS 참고) */
export default function KpiCards({ kpis, items = ['deployed', 'detect', 'bypass', 'fp'] }) {
  return (
    <section className="kpis" aria-label="현재 배포 룰셋 성능">
      {items.map((key) => {
        const c = CARDS[key](kpis);
        return (
          <div key={key} className="kpi" title={c.hint}>
            <div className="label">{c.label}</div>
            <div className="value">{c.value}</div>
          </div>
        );
      })}
    </section>
  );
}
