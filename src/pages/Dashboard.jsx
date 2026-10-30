import { useEffect, useRef, useState } from 'react';
import { useReport } from '../hooks/useReport.js';
import { pauseRun, resetAll, resumeRun, runGeneration } from '../api/client.js';
import Sidebar from '../components/Sidebar.jsx';
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
import RecentGenerations from '../components/RecentGenerations.jsx';
import RuleDetail from '../components/RuleDetail.jsx';

const SPEED_MS = { 1: 1100, 2: 600, 3: 220 };
const MAX_GEN = 12;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const PAGES = {
  home: { title: '홈', subtitle: '자기개선형 방어 현황을 한눈에 확인하세요' },
  report: { title: '후보 · 학습', subtitle: '이번 세대 후보가 왜 살아남고 떨어졌는지 확인하세요' },
  defense: { title: '룰셋 · 테스트', subtitle: '지금 적용된 룰을 확인하고 직접 검사해 보세요' },
  alerts: { title: '알림', subtitle: '세대별 이벤트 로그를 확인하세요' },
};
const pageFromHash = () => {
  const id = window.location.hash.replace('#/', '');
  return PAGES[id] ? id : 'home';
};

export default function Dashboard() {
  const { report, connected } = useReport();
  const [page, setPage] = useState(pageFromHash);
  const [opts, setOpts] = useState({ fpMax: 0, bypMax: 10, intensity: 2, speed: 2 });
  const [auto, setAuto] = useState(false);
  const [error, setError] = useState('');
  const [stopping, setStopping] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const autoRef = useRef(false);
  const loopRef = useRef(0); // 자동 진화 루프 번호. 이어하기로 새 루프가 시작되면 이전 루프는 끝낸다
  const inflightRef = useRef(null); // 진행 중인 세대 요청
  const optsRef = useRef(opts);
  optsRef.current = opts; // 자동 진화 중에도 슬라이더 값을 바로 반영

  const step = () => {
    const { fpMax, bypMax, intensity, speed } = optsRef.current;
    setError('');
    const p = runGeneration({ fpMax, bypMax, intensity, stageDelayMs: SPEED_MS[speed] }).catch((e) => {
      setError(e.message);
      return null;
    });
    inflightRef.current = p;
    p.finally(() => { if (inflightRef.current === p) inflightRef.current = null; });
    return p;
  };

  const toggleAuto = async () => {
    if (autoRef.current) {
      autoRef.current = false;
      setAuto(false);
      if (!pauseRun()) setStopping(true); // 바로 멈출 수 없으면 진행 중인 세대가 끝난 뒤 멈춘다
      return;
    }
    if (report?.paused) resumeRun();
    const id = ++loopRef.current;
    const alive = () => autoRef.current && loopRef.current === id;
    autoRef.current = true;
    setAuto(true);
    while (alive()) {
      const r = await (inflightRef.current ?? step()); // 멈췄던 세대가 있으면 그것부터 마저 기다린다
      if (!r || r.gen >= MAX_GEN || r.converged || !alive()) break; // 수렴하거나 최대 세대에 도달하면 멈춤
      await sleep(SPEED_MS[optsRef.current.speed]);
    }
    if (loopRef.current === id) {
      autoRef.current = false;
      setAuto(false);
      setStopping(false);
    }
  };

  useEffect(() => {
    const onHash = () => setPage(pageFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const navigate = (id) => { window.location.hash = `/${id}`; };

  const reset = async () => {
    setError('');
    try { await resetAll(); } catch (e) { setError(e.message); }
  };

  const renderPage = () => {
    if (!report) {
      return <div className="card"><p className="card-sub">{connected ? '불러오는 중…' : '백엔드(platform-api)에 연결하는 중입니다. 서버가 켜져 있는지 확인하세요.'}</p></div>;
    }
    switch (page) {
      case 'report': {
        // 고른 룰이 이번 세대 후보에 없으면 배포된 룰(없으면 첫 번째 후보)을 보여준다
        const { candidates } = report;
        const rule = candidates.find((r) => r.id === selectedRule) ?? candidates.find((r) => r.status === 'deploy') ?? candidates[0];
        return (
          <>
            <CandidateTable candidates={candidates} gen={report.gen} selected={rule?.id} onSelect={setSelectedRule} />
            <section className="report-grid">
              <RuleDetail rule={rule} deployed={report.deployed} fpMax={opts.fpMax} bypMax={opts.bypMax} />
              <CorpusPanel corpus={report.corpus} kpis={report.kpis} />
            </section>
          </>
        );
      }
      case 'defense':
        return (
          <section className="defense-grid">
            <div className="defense-left">
              <DeployedRules deployed={report.deployed} />
              <EventLog logs={report.logs} />
            </div>
            <LiveTester />
          </section>
        );
      case 'alerts':
        return <EventLog logs={report.logs} />;
      default:
        return (
          <>
            <Controls opts={opts} setOpts={setOpts} auto={auto} busy={report.busy} paused={!!report.paused} stopping={stopping} onStep={step} onAuto={toggleAuto} onReset={reset} error={error} />
            <section className="home">
              <div className="home-left">
                <KpiCards kpis={report.kpis} />
                <RecentGenerations history={report.history} gen={report.gen} busy={report.busy} paused={!!report.paused} activeStage={report.activeStage} deployed={report.deployed} logs={report.logs} />
              </div>
              <div className="card home-panel">
                <Pipeline stages={report.stages} activeStage={report.activeStage} paused={!!report.paused} />
                <PerformanceChart history={report.history} />
              </div>
            </section>
          </>
        );
    }
  };

  return (
    <div className="layout">
      <Sidebar page={page} onNavigate={navigate} />
      <main className="page">
        <Header {...PAGES[page]} gen={report?.gen ?? 0} connected={connected} env={report?.env} />
        {renderPage()}
      </main>
    </div>
  );
}
