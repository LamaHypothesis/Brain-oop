'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createBrainInstances, StatusResult } from './brainModel';

type BrainKey = 'cerebrum' | 'diencephalon' | 'brainstem' | 'cerebellum';
type SelectedNode = 'adt' | 'brain' | BrainKey;

interface LogLine {
  id: number;
  ts: string;
  text: string;
  type: 'ok' | 'warn' | 'crit' | 'sys' | 'call';
}

const META: Record<BrainKey, { label: string; korean: string; color: string; hex: string }> = {
  cerebrum:     { label: 'Cerebrum',     korean: '대뇌',   color: 'text-violet-400', hex: '#7c6af5' },
  diencephalon: { label: 'Diencephalon', korean: '사이뇌', color: 'text-amber-400',  hex: '#f5a623' },
  brainstem:    { label: 'Brainstem',    korean: '뇌간',   color: 'text-red-400',    hex: '#ff4f4f' },
  cerebellum:   { label: 'Cerebellum',   korean: '소뇌',   color: 'text-teal-400',   hex: '#00d4aa' },
};

const CHILD_KEYS: BrainKey[] = ['cerebrum', 'diencephalon', 'brainstem', 'cerebellum'];

export default function Home() {
  const [inst] = useState(() => createBrainInstances());

  const [brainDamaged, setBrainDamaged] = useState(false);
  const [regionDamaged, setRegionDamaged] = useState<Record<BrainKey, boolean[]>>({
    cerebrum:     [false, false, false, false],
    diencephalon: [false, false],
    brainstem:    [false, false, false],
    cerebellum:   [false],
  });

  const [selected, setSelected]         = useState<SelectedNode | null>(null);
  const [monitorLines, setMonitorLines] = useState<StatusResult[]>([]);
  const [logs, setLogs]                 = useState<LogLine[]>([]);
  const [flash, setFlash]               = useState<string | null>(null);
  const [time, setTime]                 = useState('');
  const logId  = useRef(0);
  const logEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => { logEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

  const addLog = useCallback((text: string, type: LogLine['type'] = 'sys') => {
    const id = ++logId.current;
    const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev.slice(-99), { id, ts, text, type }]);
  }, []);

  useEffect(() => {
    addLog('SYSTEM BOOT — Brain Neural Monitor v2.0', 'sys');
    addLog('Click any node to run status()', 'sys');
  }, [addLog]);

  const triggerFlash = (key: string) => {
    setFlash(key);
    setTimeout(() => setFlash(null), 500);
  };

  const handleADT = () => {
    setSelected('adt');
    setMonitorLines([
      { region: 'BrainADT', healthy: true, message: "Abstract interface defining Brain's region functions and disabilities." },
      { region: 'Property', healthy: true, message: '@abstractproperty name — identifier of the brain part' },
      { region: 'Property', healthy: true, message: '@abstractproperty struct — list of sub-regions' },
      { region: 'Property', healthy: true, message: '@abstractproperty is_damaged — damage state (T/F or array)' },
      { region: 'Method',   healthy: true, message: '@abstractmethod status() — output current functional state' },
      { region: 'Method',   healthy: true, message: '@abstractmethod got_hurt(index) — apply damage to a region' },
    ]);
    addLog("ADT.info() → Brain's region's functions and disability", 'call');
  };

  const handleBrain = () => {
    setSelected('brain');
    const healthy = !brainDamaged;
    setMonitorLines([{
      region: 'Brain',
      healthy,
      message: healthy
        ? 'Brain is fully operational. All regions are functioning within normal parameters.'
        : 'Brain damage detected. One or more regions are compromised. Check individual regions for details.',
    }]);
    addLog('Brain.status() → base class output', 'call');
  };

  const handleChild = (key: BrainKey) => {
    setSelected(key);
    triggerFlash(key);
    const results = inst[key].status();
    setMonitorLines(results);
    addLog(`${META[key].label}.status() → polymorphic override`, 'call');
    results.forEach(r => addLog(r.message, r.healthy ? 'ok' : 'crit'));
  };

  const handleBrainCheckbox = (checked: boolean) => {
    setBrainDamaged(checked);
    if (checked) addLog('Brain.got_hurt() → overall damage flagged', 'warn');
  };

  const handleRegionCheckbox = (key: BrainKey, idx: number, checked: boolean) => {
    if (!checked) return;
    const result = inst[key].got_hurt(idx);
    setRegionDamaged(prev => {
      const arr = [...prev[key]];
      arr[idx] = true;
      return { ...prev, [key]: arr };
    });
    setBrainDamaged(true);
    triggerFlash(key);
    addLog(`${META[key].label}.got_hurt(${idx}) → ${result.regionName} damaged`, 'crit');
  };

  const handleReset = () => {
    setBrainDamaged(false);
    setRegionDamaged({ cerebrum:[false,false,false,false], diencephalon:[false,false], brainstem:[false,false,false], cerebellum:[false] });
    setSelected(null);
    setMonitorLines([]);
    setLogs([]);
    setTimeout(() => addLog('SYSTEM RESET — all regions restored', 'sys'), 10);
  };

  const anyDamaged = (key: BrainKey) => regionDamaged[key].some(Boolean);
  const fanX = [12.5, 37.5, 62.5, 87.5];

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* Header */}
      <header className="border-b px-6 py-3 flex items-center justify-between"
        style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}>
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full pulse" style={{ background: 'var(--green)' }} />
          <span className="font-display text-xl font-bold tracking-widest" style={{ color: 'var(--green)' }}>
            NEURAL MONITOR
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>BRAIN OOP VISUALIZER</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{time}</span>
          <span className={`text-xs font-bold ${brainDamaged ? 'vital-crit blink' : 'vital-ok'}`}>
            {brainDamaged ? '⚠ DAMAGE DETECTED' : '● ALL SYSTEMS NOMINAL'}
          </span>
          <button onClick={handleReset}
            className="text-xs px-3 py-1 border transition-all"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            RESET
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_440px] min-h-[calc(100vh-53px)]">

        {/* ── LEFT: Hierarchy ── */}
        <div className="p-8 flex flex-col items-center gap-0 overflow-auto">

          {/* ADT node */}
          <motion.button
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            onClick={handleADT}
            className={`node-adt rounded px-8 py-4 text-center w-72 ${selected === 'adt' ? 'border-white/40' : ''}`}>
            <div className="text-[9px] mb-1 tracking-widest" style={{ color: 'var(--text-dim)' }}>«abstract»</div>
            <div className="font-display text-lg font-bold" style={{ color: 'var(--text)' }}>BrainADT</div>
            <div className="mt-2 text-[9px] text-left space-y-0.5" style={{ color: 'var(--text-muted)' }}>
              <div>+ name, struct, is_damaged &nbsp;<span style={{ color: 'var(--text-dim)' }}>@property</span></div>
              <div className="border-t my-1" style={{ borderColor: 'var(--border2)' }} />
              <div>+ status() &nbsp;<span style={{ color: 'var(--green-dim)' }}>«abstract»</span></div>
              <div>+ got_hurt(index) &nbsp;<span style={{ color: 'var(--green-dim)' }}>«abstract»</span></div>
            </div>
          </motion.button>

          {/* ADT → Brain */}
          <svg width="2" height="36" style={{ display: 'block', overflow: 'visible' }}>
            <line x1="1" y1="0" x2="1" y2="30" className="connector" strokeWidth="1.5" />
            <polygon points="1,36 -4,26 6,26" fill="rgba(200,255,232,0.25)" />
          </svg>

          {/* Brain node */}
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex items-center gap-3">
            <button onClick={handleBrain}
              className={`node-base rounded w-72 transition-all ${selected === 'brain' ? 'border-white/50' : ''}`}>
              {/* header row */}
              <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border2)' }}>
                <div className="text-[9px] mb-1 tracking-widest" style={{ color: 'var(--text-dim)' }}>«base class»</div>
                <div className={`font-display text-lg font-bold ${brainDamaged ? 'vital-crit' : 'vital-ok'}`}>
                  Brain {brainDamaged && <span className="text-[10px] blink ml-1">⚠</span>}
                </div>
              </div>
              {/* body */}
              <div className="px-5 py-2 text-[9px] space-y-0.5 text-left" style={{ color: 'var(--text-muted)' }}>
                <div>- __name &nbsp;· &nbsp;- __struct &nbsp;· &nbsp;- _is_damaged</div>
                <div className="border-t my-1" style={{ borderColor: 'var(--border2)' }} />
                <div>+ status() &nbsp;<span style={{ color: 'var(--green-dim)' }}>«concrete»</span></div>
                <div>+ got_hurt(index) &nbsp;<span style={{ color: 'var(--green-dim)' }}>«concrete»</span></div>
              </div>
            </button>
            {/* Brain checkbox */}
            <div className="flex flex-col items-center gap-1">
              <input type="checkbox" className="med-checkbox"
                checked={brainDamaged}
                onChange={e => handleBrainCheckbox(e.target.checked)} />
              <span className="text-[8px]" style={{ color: 'var(--text-dim)' }}>dmg</span>
            </div>
          </motion.div>

          {/* Fan-out arrows */}
          <div className="relative w-full max-w-5xl" style={{ height: '48px' }}>
            <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
              <line x1="50%" y1="0" x2="50%" y2="16" className="connector" strokeWidth="1.5" />
              <line x1={`${fanX[0]}%`} y1="16" x2={`${fanX[3]}%`} y2="16" className="connector" strokeWidth="1.5" />
              {fanX.map((x, i) => (
                <line key={i} x1={`${x}%`} y1="16" x2={`${x}%`} y2="48" className="connector" strokeWidth="1.5" />
              ))}
            </svg>
            <div className="absolute bottom-0 left-0 w-full flex">
              {fanX.map((x, i) => (
                <div key={i} className="absolute" style={{ left: `${x}%`, transform: 'translateX(-50%)' }}>
                  <div style={{ width:0, height:0, borderLeft:'5px solid transparent', borderRight:'5px solid transparent', borderTop:'6px solid rgba(200,255,232,0.3)' }} />
                </div>
              ))}
            </div>
          </div>

          {/* ── Child nodes: one row ── */}
          <div className="grid grid-cols-4 gap-3 w-full max-w-5xl">
            {CHILD_KEYS.map((key, ci) => {
              const meta    = META[key];
              const damaged = anyDamaged(key);
              const regions = inst[key].struct;
              const dmgArr  = regionDamaged[key];
              const isFlash = flash === key;

              return (
                <motion.div key={key}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + ci * 0.07 }}
                  className={isFlash ? 'flash' : ''}>

                  {/* Card with DAMAGE column */}
                  <div className={`node-child rounded overflow-hidden ${selected === key ? 'active' : ''}`}>

                    {/* Card header — click = status() */}
                    <button onClick={() => handleChild(key)} className="w-full text-left px-3 py-2.5 border-b"
                      style={{ borderColor: 'var(--border2)' }}>
                      <div className="flex items-center justify-between">
                        <span className={`font-display text-sm font-bold ${meta.color}`}>{meta.label}</span>
                        <div className="w-1.5 h-1.5 rounded-full"
                          style={{ background: damaged ? 'var(--red)' : 'var(--green)', animation: 'pulse 2s infinite' }} />
                      </div>
                      <div className="text-[8px] mt-0.5" style={{ color: 'var(--text-dim)' }}>
                        {meta.korean} · override status()
                      </div>
                    </button>

                    {/* Region rows: left = name, right = DAMAGE checkbox */}
                    <div>
                      {/* Column header */}
                      <div className="grid border-b" style={{ gridTemplateColumns: '1fr 52px', borderColor: 'var(--border2)' }}>
                        <div className="px-3 py-1 text-[8px]" style={{ color: 'var(--text-dim)' }}>REGION</div>
                        <div className="px-2 py-1 text-[8px] text-center border-l"
                          style={{ color: 'var(--red)', borderColor: 'var(--border2)' }}>DMG</div>
                      </div>

                      {/* Each region row */}
                      {regions.map((r, ri) => (
                        <div key={ri}
                          className="grid border-b last:border-0"
                          style={{ gridTemplateColumns: '1fr 52px', borderColor: 'var(--border2)' }}>
                          {/* Region name */}
                          <div className="px-3 py-2 flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-sm shrink-0 transition-colors"
                              style={{ background: dmgArr[ri] ? 'var(--red)' : meta.hex, opacity: dmgArr[ri] ? 1 : 0.5 }} />
                            <span className={`text-[9px] leading-tight ${dmgArr[ri] ? 'vital-crit' : ''}`}
                              style={{ color: dmgArr[ri] ? undefined : 'var(--text-muted)' }}>
                              {r}
                            </span>
                          </div>
                          {/* Damage checkbox */}
                          <div className="flex items-center justify-center border-l"
                            style={{ borderColor: 'var(--border2)', background: dmgArr[ri] ? 'rgba(255,68,68,0.06)' : 'transparent' }}>
                            <input type="checkbox" className="med-checkbox"
                              checked={dmgArr[ri]}
                              onChange={e => handleRegionCheckbox(key, ri, e.target.checked)} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-6 mt-6 text-[9px]" style={{ color: 'var(--text-dim)' }}>
            <span className="flex items-center gap-1.5">
              <div className="w-4 h-px border-t border-dashed" style={{ borderColor: 'rgba(200,255,232,0.2)' }} />
              inheritance
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm" style={{ background: 'var(--green)', opacity: 0.6 }} />
              healthy
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm" style={{ background: 'var(--red)' }} />
              damaged
            </span>
            <span className="flex items-center gap-1.5">
              <input type="checkbox" className="med-checkbox" readOnly />
              &nbsp;got_hurt()
            </span>
          </div>
        </div>

        {/* ── RIGHT: Monitor ── */}
        <div className="border-l flex flex-col" style={{ borderColor: 'var(--border)' }}>

          <div className="px-5 py-3 border-b flex items-center justify-between"
            style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full pulse" style={{ background: 'var(--green)' }} />
              <span className="font-display text-base font-bold tracking-widest" style={{ color: 'var(--green)' }}>
                PATIENT MONITOR
              </span>
            </div>
            <span className="text-[9px]" style={{ color: 'var(--text-dim)' }}>
              {selected ? `NODE: ${selected.toUpperCase()}` : 'STANDBY'}
            </span>
          </div>

          {/* Vitals strip */}
          <div className="grid grid-cols-4 border-b" style={{ borderColor: 'var(--border)' }}>
            {CHILD_KEYS.map(key => (
              <div key={key} className="px-2 py-2 border-r text-center" style={{ borderColor: 'var(--border)' }}>
                <div className="text-[8px] mb-0.5" style={{ color: 'var(--text-dim)' }}>
                  {META[key].label.slice(0, 5).toUpperCase()}
                </div>
                <div className={`text-[10px] font-bold ${anyDamaged(key) ? 'vital-crit' : 'vital-ok'}`}>
                  {anyDamaged(key) ? 'ABNML' : 'NORML'}
                </div>
              </div>
            ))}
          </div>

          {/* Status readout */}
          <div className="flex-1 overflow-y-auto p-4 grid-bg">
            <AnimatePresence mode="wait">
              {!selected ? (
                <motion.div key="standby"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center gap-2 min-h-[200px]">
                  <div className="text-2xl blink" style={{ color: 'var(--green)' }}>_</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-dim)' }}>AWAITING INPUT — SELECT NODE</div>
                </motion.div>
              ) : (
                <motion.div key={selected}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="space-y-1">
                  <div className="text-[9px] mb-3 pb-2 border-b flex items-center justify-between"
                    style={{ color: 'var(--text-dim)', borderColor: 'var(--border2)' }}>
                    <span>STATUS OUTPUT — {selected.toUpperCase()}</span>
                    <span className="blink">■</span>
                  </div>
                  {monitorLines.map((line, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="readout-line py-1.5 px-2 flex items-start gap-2">
                      <span className={`text-[9px] shrink-0 font-bold ${line.healthy ? 'vital-ok' : 'vital-crit'}`}>
                        {line.healthy ? '●' : '✕'}
                      </span>
                      <div>
                        {line.region && (
                          <span className="text-[9px] mr-2" style={{ color: 'var(--text-dim)' }}>
                            [{line.region.toUpperCase()}]
                          </span>
                        )}
                        <span className={`text-[10px] ${line.healthy ? '' : 'vital-crit'}`}
                          style={line.healthy ? { color: 'var(--text)' } : {}}>
                          {line.message}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Console log */}
          <div className="border-t flex flex-col" style={{ borderColor: 'var(--border)', height: '200px' }}>
            <div className="px-4 py-2 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--border2)', background: 'var(--panel)' }}>
              <span className="text-[9px] tracking-widest" style={{ color: 'var(--text-dim)' }}>SYSTEM LOG</span>
              <div className="w-1.5 h-1.5 rounded-full pulse" style={{ background: 'var(--green)' }} />
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
              {logs.map(log => (
                <div key={log.id} className="flex gap-2 text-[9px]">
                  <span style={{ color: 'var(--text-dim)', flexShrink: 0 }}>{log.ts}</span>
                  <span className={
                    log.type === 'crit' ? 'vital-crit' :
                    log.type === 'warn' ? 'vital-warn' :
                    log.type === 'call' ? 'text-violet-400' :
                    log.type === 'ok'   ? 'vital-ok' : ''
                  } style={log.type === 'sys' ? { color: 'var(--text-muted)' } : {}}>
                    {log.text}
                  </span>
                </div>
              ))}
              <div ref={logEnd} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
