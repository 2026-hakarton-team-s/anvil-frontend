const STAGES = [
  { name: '공격 요청 분석', desc: '공격 샘플 + 지난 세대에서 우회에 성공한 요청을 학습 데이터로 수집' },
  { name: '시그니처 생성', desc: '공격 패턴을 일반화하고, 지난 세대에 당한 우회 기법에 대한 정규화를 추가' },
  { name: '정상 트래픽 오탐 검증', desc: '정상 요청 로그에 적용해 정상 사용자를 막는 룰 탈락' },
  { name: 'AI 우회 공격 시뮬레이션', desc: '인코딩·대소문자·주석 등으로 변형해 룰을 뚫어봄' },
  { name: '생존 룰 배포', desc: '모든 검증을 통과한 룰만 WAF에 적용, 더 강한 룰로 교체' },
];

export default function Pipeline({ stages, activeStage }) {
  return (
    <>
      <section className="pipeline" aria-label="ANVIL 처리 단계">
        {STAGES.map((s, i) => {
          const active = activeStage === i;
          const done = !active && !!stages[i];
          return (
            <div key={s.name} className={`stage${active ? ' active' : ''}${done ? ' done' : ''}`}>
              <div className="num">STEP {i + 1}</div>
              <div className="name">{s.name}</div>
              <div className="desc">{s.desc}</div>
              <div className="stat">{stages[i]}</div>
            </div>
          );
        })}
      </section>
      <div className="loop-note">↻ 배포 후 실전 레드팀에서 <b>우회에 성공한 공격</b>은 다음 세대의 학습 데이터가 됩니다</div>
    </>
  );
}
