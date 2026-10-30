import { useRef, useState } from 'react';
import { useReport } from '../hooks/useReport.js';
import { resetAll, runGeneration } from '../api/client.js';
import Header from '../components/Header.jsx';
import Pipeline from '../components/Pipeline.jsx';
import Controls from '../components/Controls.jsx';
import KpiCards from '../components/KpiCards.jsx';
import CandidateTable from '../components/CandidateTable.jsx';
import PerformanceChart from '../components/PerformanceChart.jsx';
import DeployedRules from '../components/DeployedRules.jsx';
import LiveTester from '../components/LiveTester.jsx';
import CorpusPanel from '../components/CorpusPanel.jsx';
import EventLog from '../components/EventLog.jsx';

const SPEED_MS = { 1: 1100, 2: 600, 3: 220 };
const MAX_GEN = 12;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Dashboard() {
  const { report, connected } = useReport();
  const [opts, setOpts] = useState({ fpMax: 0, bypMax: 10, intensity: 2, speed: 2 });
  const [auto, setAuto] = useState(false);
  const [error, setError] = useState('');
  const autoRef = useRef(false);
  const optsRef = useRef(opts);
  optsRef.current = opts; // 자동 진화 중에도 슬라이더 값을 바로 반영

  const step = async () => {
    const { fpMax, bypMax, intensity, speed } = optsRef.current;
    setError('');
    try {
      return await runGeneration({ fpMax, bypMax, intensity, stageDelayMs: SPEED_MS[speed] });
    } catch (e) {
      setError(e.message);
      return null;
    }
  };

  const toggleAuto = async () => {
    if (autoRef.current) { autoRef.current = false; setAuto(false); return; }
    autoRef.current = true;
    setAuto(true);
    while (autoRef.current) {
      const r = await step();
      if (!r || r.gen >= MAX_GEN || r.converged) break; // 수렴하거나 최대 세대에 도달하면 멈춤
      await sleep(SPEED_MS[optsRef.current.speed]);
    }
    autoRef.current = false;
    setAuto(false);
  };

  const reset = async () => {
    setError('');
    try { await resetAll(); } catch (e) { setError(e.message); }
  };

  if (!report) {
    return (
      <div className="page">
        <Header gen={0} connected={connected} />
        <div className="card"><p className="card-sub">{connected ? '불러오는 중…' : '백엔드(platform-api)에 연결하는 중입니다. 서버가 켜져 있는지 확인하세요.'}</p></div>
      </div>
    );
  }

  return (
    <div className="page">
      <Header gen={report.gen} connected={connected} env={report.env} />
      <Pipeline stages={report.stages} activeStage={report.activeStage} />
      <Controls opts={opts} setOpts={setOpts} auto={auto} busy={report.busy} onStep={step} onAuto={toggleAuto} onReset={reset} error={error} />
      <KpiCards kpis={report.kpis} />
      <section className="grid">
        <CandidateTable candidates={report.candidates} gen={report.gen} />
        <PerformanceChart history={report.history} />
      </section>
      <section className="grid">
        <DeployedRules deployed={report.deployed} />
        <LiveTester />
      </section>
      <section className="grid">
        <CorpusPanel corpus={report.corpus} />
        <EventLog logs={report.logs} />
      </section>
    </div>
  );
}
