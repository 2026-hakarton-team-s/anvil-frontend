import { TYPES, showWs } from '../lib/format.js';

export default function CorpusPanel({ corpus }) {
  const attacks = [...corpus.attacks].sort((a, b) => Number(b.learned) - Number(a.learned));
  return (
    <div className="card corpus">
      <h2>학습 데이터</h2>
      <p className="card-sub">주황색은 이전 세대에서 배포 룰을 우회해 새로 추가된 공격입니다. ({attacks.length}건 중 {corpus.learned}건)</p>
      <ul>
        {attacks.map((a, i) => (
          <li key={`${a.text}-${i}`} className={a.learned ? 'learned' : ''} title={a.text}>
            <span className={`type type-${a.type}`} style={{ marginRight: 6 }}>{TYPES[a.type]}</span>
            {showWs(a.text)}
          </li>
        ))}
      </ul>
    </div>
  );
}
