const SPEED_LABEL = { 1: '느림', 2: '보통', 3: '빠름' };

export default function Controls({ opts, setOpts, auto, busy, onStep, onAuto, onReset, error }) {
  const set = (key) => (e) => setOpts({ ...opts, [key]: Number(e.target.value) });
  return (
    <section className="controls" aria-label="시뮬레이션 조작">
      <div className="btns">
        <button className="primary" onClick={onAuto} disabled={busy && !auto}>
          {auto ? '⏸ 일시정지' : '▶ 자동 진화'}
        </button>
        <button onClick={onStep} disabled={busy || auto}>1세대 실행</button>
        <button onClick={onReset} disabled={busy}>초기화</button>
      </div>
      <div className="slider">
        <label htmlFor="fpMax">오탐 허용치 <b>{opts.fpMax}%</b></label>
        <input id="fpMax" type="range" min="0" max="10" step="1" value={opts.fpMax} onChange={set('fpMax')} />
      </div>
      <div className="slider">
        <label htmlFor="bypMax">우회 허용치 <b>{opts.bypMax}%</b></label>
        <input id="bypMax" type="range" min="0" max="60" step="5" value={opts.bypMax} onChange={set('bypMax')} />
      </div>
      <div className="slider">
        <label htmlFor="intensity">AI 공격 강도 <b>{opts.intensity}단계</b></label>
        <input id="intensity" type="range" min="1" max="3" step="1" value={opts.intensity} onChange={set('intensity')} />
      </div>
      <div className="slider">
        <label htmlFor="speed">진행 속도 <b>{SPEED_LABEL[opts.speed]}</b></label>
        <input id="speed" type="range" min="1" max="3" step="1" value={opts.speed} onChange={set('speed')} />
      </div>
      {error && <div className="err" role="alert">{error}</div>}
    </section>
  );
}
