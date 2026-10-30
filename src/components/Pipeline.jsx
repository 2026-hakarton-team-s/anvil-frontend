import { useEffect, useState } from 'react';

const STAGES = [
  { name: '공격 요청 분석', desc: '공격 샘플 + 지난 세대에서 우회에 성공한 요청을 학습 데이터로 수집' },
  { name: '시그니처 생성', desc: '공격 패턴을 일반화하고, 지난 세대에 당한 우회 기법에 대한 정규화를 추가' },
  { name: '정상 트래픽 오탐 검증', desc: '정상 요청 로그에 적용해 정상 사용자를 막는 룰 탈락' },
  { name: 'AI 우회 공격 시뮬레이션', desc: '인코딩·대소문자·주석 등으로 변형해 룰을 뚫어봄' },
  { name: '생존 룰 배포', desc: '모든 검증을 통과한 룰만 WAF에 적용, 더 강한 룰로 교체' },
];

export default function Pipeline({ stages, activeStage, paused }) {
  const [picked, setPicked] = useState(0);
  // 진행 중에는 현재 단계를 따라가고, 끝나면 마지막 단계에 머문다. 멈춰 있을 때는 사용자가 고른 단계를 펼친다
  useEffect(() => { if (activeStage != null) setPicked(activeStage); }, [activeStage]);
  const shown = activeStage ?? picked;
  const reached = (i) => activeStage === i || !!stages[i];
  return (
    <section className="pipeline" aria-label="ANVIL 처리 단계">
      <ol className="stepper">
        {STAGES.map((s, i) => {
          const cls = ['step'];
          if (shown === i) cls.push('open');
          if (activeStage === i) cls.push(paused ? 'paused' : 'active');
          else if (stages[i]) cls.push('done');
          return (
            <li key={s.name}>
              {i > 0 && <span className={`link${reached(i - 1) && reached(i) ? ' solid' : ''}`} aria-hidden="true" />}
              <button className={cls.join(' ')} onClick={() => setPicked(i)} title={`STEP ${i + 1} · ${s.name}`} aria-pressed={shown === i}>
                <span className="no">{i + 1}</span>
                <span className="label">{s.name}</span>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="step-detail">
        <span className="desc">{STAGES[shown].desc}</span>
        {stages[shown] && <span className="stat">{stages[shown]}</span>}
      </div>
      <div className="loop-note">↻ 배포 후 실전 레드팀에서 <b>우회에 성공한 공격</b>은 다음 세대의 학습 데이터가 됩니다</div>
    </section>
  );
}
