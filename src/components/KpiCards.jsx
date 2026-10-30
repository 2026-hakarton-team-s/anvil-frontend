import { pct } from '../lib/format.js';

const CARDS = {
  deployed: (k) => ({ label: '배포된 룰', value: `${k.deployed}/${k.totalTypes}`, hint: '공격 유형 4종 중' }),
  detect: (k) => ({ label: '공격 탐지율', value: pct(k.detect), hint: '원본 + AI 변형 공격' }),
  bypass: (k) => ({ label: '우회 성공률', value: pct(k.bypass), hint: 'AI 변형 공격 기준' }),
  fp: (k) => ({ label: '오탐률', value: pct(k.fp), hint: '정상 트래픽 차단 비율' }),
  techniques: (k) => ({ label: '학습한 우회 기법', value: k.techniques, hint: '정규화로 대응 중' }),
  corpus: (k) => ({ label: '학습 데이터', value: k.corpus, hint: '공격 샘플 (우회 사례 포함)' }),
};

// 지난 세대 대비 변화량을 보여줄 지표와, 값이 오르는 게 좋은 지표인지 여부
const TREND = { detect: true, bypass: false, fp: false };

function Delta({ metric, history }) {
  if (!(metric in TREND) || !history || history.length < 2) return null;
  const diff = history[history.length - 1][metric] - history[history.length - 2][metric];
  if (Math.abs(diff) < 0.005) return null;
  const good = diff > 0 === TREND[metric];
  return (
    <span className={`delta ${good ? 'good' : 'bad'}`} title="지난 세대 대비">
      {diff > 0 ? '▲' : '▼'} {Math.round(Math.abs(diff) * 100)}%
    </span>
  );
}

/** items: 보여줄 카드 키 목록 (CARDS 참고). history를 주면 지난 세대 대비 변화량을 함께 보여준다 */
export default function KpiCards({ kpis, history, items = ['deployed', 'detect', 'bypass', 'fp'] }) {
  return (
    <section className="kpis" aria-label="현재 배포 룰셋 성능">
      {items.map((key) => {
        const c = CARDS[key](kpis);
        return (
          <div key={key} className="kpi" title={c.hint}>
            <div className="label">{c.label}</div>
            <div className="value">{c.value}<Delta metric={key} history={history} /></div>
          </div>
        );
      })}
    </section>
  );
}
