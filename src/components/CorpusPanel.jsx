import { TYPES, showWs } from '../lib/format.js';

export default function CorpusPanel({ corpus, kpis }) {
  const attacks = [...corpus.attacks].sort((a, b) => Number(b.learned) - Number(a.learned));
  return (
    <div className="card corpus">
      <div className="card-head">
        <h2>학습 데이터</h2>
        <span className="card-sub">{attacks.length}건 중 {corpus.learned}건 우회 사례</span>
      </div>
      <div className="tiles">
        <div className="tile" title="공격 샘플 (우회 사례 포함)"><div className="k">학습 데이터</div><div className="v">{kpis.corpus}</div></div>
        <div className="tile" title="정규화로 대응 중"><div className="k">학습한 우회 기법</div><div className="v">{kpis.techniques}</div></div>
      </div>
      <p className="card-sub">주황색은 이전 세대에서 배포 룰을 우회해 새로 추가된 공격입니다.</p>
      <ul>
        {attacks.length === 0 && <li className="empty">아직 학습 데이터가 없습니다.</li>}
        {attacks.map((a, i) => (
          <li key={`${a.text}-${i}`} className={a.learned ? 'learned' : ''}>
            <div className="row">
              <span className={`type type-${a.type}`}>{TYPES[a.type]}</span>
              <span className="tag">{a.learned ? '우회 사례' : '공격 샘플'}</span>
            </div>
            <code title={a.text}>{showWs(a.text)}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}
