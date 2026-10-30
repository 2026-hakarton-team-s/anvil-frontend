import { useEffect, useRef, useState } from 'react';

const PlayIcon = () => <path d="M6 3.5v17l14-8.5z" fill="currentColor" />;

/** 막대를 끌어 값을 고르는 슬라이더 (실제 조작은 투명한 range input이 받는다) */
function Bar({ id, label, value, min, max, step, onChange }) {
  const ratio = (value - min) / (max - min);
  return (
    <div className="bar-field">
      <label htmlFor={id}>{label}</label>
      <div className="bar">
        <div className="bar-fill" style={{ width: `calc(56px + (100% - 56px) * ${ratio})` }}>{value}%</div>
        <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      </div>
    </div>
  );
}

function Segment({ label, options, value, onChange }) {
  return (
    <div className="seg-field">
      <span id={`seg-${label}`}>{label}</span>
      <div className="seg" role="radiogroup" aria-labelledby={`seg-${label}`}>
        {options.map(([v, text]) => (
          <button key={v} type="button" role="radio" aria-checked={value === v} className={value === v ? 'on' : ''} onClick={() => onChange(v)}>
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Controls({ children, theme, onToggleTheme, opts, setOpts, auto, busy, paused, stopping, onStep, onAuto, onReset, error }) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef(null);
  const set = (key) => (v) => setOpts({ ...opts, [key]: v });

  useEffect(() => {
    const d = dialogRef.current;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  // 멈춰 있을 때는 설정 창을 띄우고, 실행 중이거나 일시정지 상태면 바로 일시정지/이어하기
  const onMain = () => (auto || paused ? onAuto() : setOpen(true));
  const start = () => { setOpen(false); onAuto(); };
  const once = () => { setOpen(false); onStep(); };

  return (
    <section className="controls" aria-label="시뮬레이션 조작">
      <div className="btns">
        <button className="run" onClick={onMain} disabled={(busy && !auto && !paused) || stopping} aria-haspopup={auto || paused ? undefined : 'dialog'}>
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            {auto ? <path d="M6 4h4v16H6zM14 4h4v16h-4z" fill="currentColor" /> : <PlayIcon />}
          </svg>
          {auto ? '일시정지' : stopping ? '멈추는 중…' : paused ? '이어하기' : '실행하기'}
        </button>
        <button className="theme-toggle" role="switch" aria-checked={theme === 'dark'} aria-label="다크 모드" onClick={onToggleTheme}>
          <span className={theme === 'dark' ? '' : 'on'} aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
            </svg>
          </span>
          <span className={theme === 'dark' ? 'on' : ''} aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" /></svg>
          </span>
        </button>
        {children && <div className="btns-right">{children}</div>}
      </div>
      {error && <div className="err" role="alert">{error}</div>}

      <dialog
        ref={dialogRef}
        className="run-dialog"
        aria-label="실행 설정"
        onClose={() => setOpen(false)}
        onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
      >
        <button className="close" onClick={() => setOpen(false)} aria-label="닫기">
          <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
        <Bar id="fpMax" label="오탐 허용치" value={opts.fpMax} min={0} max={10} step={1} onChange={set('fpMax')} />
        <Bar id="bypMax" label="우회 허용치" value={opts.bypMax} min={0} max={60} step={5} onChange={set('bypMax')} />
        <div className="seg-row">
          <Segment label="AI 공격 강도" options={[[1, '1단계'], [2, '2단계'], [3, '3단계']]} value={opts.intensity} onChange={set('intensity')} />
          <Segment label="진행 속도" options={[[1, '느림'], [2, '보통'], [3, '빠름']]} value={opts.speed} onChange={set('speed')} />
        </div>
        <div className="dialog-actions">
          <button className="start" onClick={start} disabled={busy}>
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><PlayIcon /></svg>
            실행하기
          </button>
          <button className="reset" onClick={onReset} disabled={busy} aria-label="초기화" title="초기화">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M19 12a7 7 0 1 1-2.05-4.95" /><path d="M19 4v4h-4" />
            </svg>
          </button>
        </div>
        <button className="once" onClick={once} disabled={busy}>1세대만 실행</button>
      </dialog>
    </section>
  );
}
