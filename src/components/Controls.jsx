import { useState } from 'react';

const SPEED_LABEL = { 1: '느림', 2: '보통', 3: '빠름' };

export default function Controls({ opts, setOpts, auto, busy, paused, stopping, onStep, onAuto, onReset, error }) {
  const [open, setOpen] = useState(false);
  const set = (key) => (e) => setOpts({ ...opts, [key]: Number(e.target.value) });
  return (
    <section className="controls" aria-label="시뮬레이션 조작">
      <div className="btns">
        <button className="run" onClick={onAuto} disabled={(busy && !auto && !paused) || stopping}>
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            {auto ? <path d="M6 4h4v16H6zM14 4h4v16h-4z" fill="currentColor" /> : <path d="M6 3.5v17l14-8.5z" fill="currentColor" />}
          </svg>
          {auto ? '일시정지' : stopping ? '멈추는 중…' : paused ? '이어하기' : '실행하기'}
        </button>
        <button className="ghost" onClick={onStep} disabled={busy || auto}>1세대 실행</button>
        <button className="ghost" onClick={onReset} disabled={busy}>초기화</button>
        <button className={`ghost${open ? ' on' : ''}`} onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="run-settings">
          설정
        </button>
      </div>
      {open && (
        <div className="settings" id="run-settings">
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
        </div>
      )}
      {error && <div className="err" role="alert">{error}</div>}
    </section>
  );
}
