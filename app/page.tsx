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

// Fixed height per region row so all cards align regardless of region count
const ROW_H = 36; // px
// Max regions across all children = 4 (cerebrum), so card body height is fixed to 4 rows
const MAX_REGIONS = 4;

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
  const [monitorTitle, setMonitorTitle] = useState<string>('');
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
    setMonitorTitle('STATUS OUTPUT — ADT');
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
    setMonitorTitle('STATUS OUTPUT — BRAIN');
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
    setMonitorTitle(`OVERRIDDEN STATUS() OUTPUT — ${META[key].label.toUpperCase()}`);
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
    setMonitorTitle('');
    setLogs([]);
    setTimeout(() => addLog('SYSTEM RESET — all regions restored', 'sys'), 10);
  };

  const anyDamaged = (key: BrainKey) => regionDamaged[key].some(Boolean);
  const fanX = [12.5, 37.5, 62.5, 87.5];

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* Header */}
      <header className="border-b px-8 py-4 flex items-center justify-between"
        style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}>
        <div className="flex items-center gap-5">
          <div className="w-2.5 h-2.5 rounded-full pulse" style={{ background: 'var(--green)' }} />
          <span className="font-display text-2xl font-bold tracking-widest" style={{ color: 'var(--green)' }}>
            NEURAL MONITOR
          </span>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>BRAIN OOP VISUALIZER</span>
        </div>
        <div className="flex items-center gap-8">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{time}</span>
          <span className={`text-sm font-bold ${brainDamaged ? 'vital-crit blink' : 'vital-ok'}`}>
            {brainDamaged ? '⚠ DAMAGE DETECTED' : '● ALL SYSTEMS NOMINAL'}
          </span>
          <button onClick={handleReset}
            className="text-sm px-4 py-1.5 border transition-all"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            RESET
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_480px] min-h-[calc(100vh-61px)]">

        {/* ── LEFT: Hierarchy ── */}
        <div className="py-10 px-10 flex flex-col items-center gap-0 overflow-auto">

          {/* ADT node */}
          <motion.button
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            onClick={handleADT}
            className={`node-adt rounded-lg px-8 py-5 text-center w-80 ${selected === 'adt' ? 'border-white/40' : ''}`}>
            <div className="text-xs mb-1.5 tracking-widest" style={{ color: 'var(--text-dim)' }}>«abstract»</div>
            <div className="font-display text-xl font-bold mb-3" style={{ color: 'var(--text)' }}>BrainADT</div>
            <div className="text-xs text-left space-y-1" style={{ color: 'var(--text-muted)' }}>
              <div>+ name, struct, is_damaged &nbsp;<span style={{ color: 'var(--text-dim)' }}>@property</span></div>
              <div className="border-t my-2" style={{ borderColor: 'var(--border2)' }} />
              <div>+ status() &nbsp;<span style={{ color: 'var(--green-dim)' }}>«abstract»</span></div>
              <div>+ got_hurt(index) &nbsp;<span style={{ color: 'var(--green-dim)' }}>«abstract»</span></div>
            </div>
          </motion.button>

          {/* ADT → Brain arrow */}
          <svg width="2" height="44" style={{ display: 'block', overflow: 'visible' }}>
            <line x1="1" y1="0" x2="1" y2="38" className="connector" strokeWidth="1.5" />
            <polygon points="1,44 -5,32 7,32" fill="rgba(200,255,232,0.25)" />
          </svg>

          {/* Brain node */}
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex items-center gap-4">
            <button onClick={handleBrain}
              className={`node-base rounded-lg w-80 transition-all ${selected === 'brain' ? 'border-white/50' : ''}`}>
              <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border2)' }}>
                <div className="text-xs mb-1.5 tracking-widest" style={{ color: 'var(--text-dim)' }}>«base class»</div>
                <div className={`font-display text-xl font-bold ${brainDamaged ? 'vital-crit' : 'vital-ok'}`}>
                  Brain {brainDamaged && <span className="text-sm blink ml-2">⚠</span>}
                </div>
              </div>
              <div className="px-6 py-3 text-xs space-y-1 text-left" style={{ color: 'var(--text-muted)' }}>
                <div>- __name &nbsp;· &nbsp;__struct &nbsp;· &nbsp;_is_damaged</div>
                <div className="border-t my-2" style={{ borderColor: 'var(--border2)' }} />
                <div>+ status() &nbsp;<span style={{ color: 'var(--green-dim)' }}>«concrete»</span></div>
                <div>+ got_hurt(index) &nbsp;<span style={{ color: 'var(--green-dim)' }}>«concrete»</span></div>
              </div>
            </button>
            {/* Brain dmg checkbox */}
            <div className="flex flex-col items-center gap-1.5">
              <input type="checkbox" className="med-checkbox" style={{ width: 16, height: 16 }}
                checked={brainDamaged}
                onChange={e => handleBrainCheckbox(e.target.checked)} />
              <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>dmg</span>
            </div>
          </motion.div>

          {/* Fan-out arrows */}
          <div className="relative w-full max-w-5xl" style={{ height: '56px' }}>
            <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
              <line x1="50%" y1="0" x2="50%" y2="18" className="connector" strokeWidth="1.5" />
              <line x1={`${fanX[0]}%`} y1="18" x2={`${fanX[3]}%`} y2="18" className="connector" strokeWidth="1.5" />
              {fanX.map((x, i) => (
                <line key={i} x1={`${x}%`} y1="18" x2={`${x}%`} y2="52" className="connector" strokeWidth="1.5" />
              ))}
            </svg>
            <div className="absolute bottom-0 left-0 w-full">
              {fanX.map((x, i) => (
                <div key={i} className="absolute" style={{ left: `${x}%`, transform: 'translateX(-50%)' }}>
                  <div style={{ width:0, height:0, borderLeft:'6px solid transparent', borderRight:'6px solid transparent', borderTop:'8px solid rgba(200,255,232,0.3)' }} />
                </div>
              ))}
            </div>
          </div>

          {/* ── Child nodes ── */}
          <div className="grid grid-cols-4 gap-5 w-full max-w-5xl">
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

                  <div className={`node-child rounded-lg overflow-hidden ${selected === key ? 'active' : ''}`}>

                    {/* Card header — click triggers status() */}
                    <button onClick={() => handleChild(key)} className="w-full text-left px-4 py-3 border-b"
                      style={{ borderColor: 'var(--border2)' }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-display text-base font-bold ${meta.color}`}>{meta.label}</span>
                        <div className="w-2 h-2 rounded-full"
                          style={{ background: damaged ? 'var(--red)' : 'var(--green)', animation: 'pulse 2s infinite' }} />
                      </div>
                      <div className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
                        {meta.korean}
                      </div>
                      <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                        override status()
                      </div>
                    </button>

                    {/* Column labels */}
                    <div className="grid border-b" style={{ gridTemplateColumns: '1fr 48px', borderColor: 'var(--border2)' }}>
                      <div className="px-4 py-1.5 text-[10px]" style={{ color: 'var(--text-dim)' }}>REGION</div>
                      <div className="py-1.5 text-[10px] text-center border-l"
                        style={{ color: 'var(--red)', borderColor: 'var(--border2)' }}>DMG</div>
                    </div>

                    {/* Region rows — fixed height, padded with empty rows to MAX_REGIONS */}
                    {Array.from({ length: MAX_REGIONS }).map((_, ri) => {
                      const regionName = regions[ri];
                      const isDmg      = dmgArr[ri] ?? false;
                      const isEmpty    = !regionName;

                      return (
                        <div key={ri}
                          className="grid border-b last:border-0"
                          style={{ gridTemplateColumns: '1fr 48px', borderColor: 'var(--border2)', height: ROW_H }}>
                          {/* Region name */}
                          <div className="px-4 flex items-center gap-2">
                            {!isEmpty && (
                              <>
                                <div className="w-1.5 h-1.5 rounded-sm shrink-0 transition-colors"
                                  style={{ background: isDmg ? 'var(--red)' : meta.hex, opacity: isDmg ? 1 : 0.5 }} />
                                <span className={`text-[11px] leading-tight ${isDmg ? 'vital-crit' : ''}`}
                                  style={{ color: isDmg ? undefined : 'var(--text-muted)' }}>
                                  {regionName}
                                </span>
                              </>
                            )}
                          </div>
                          {/* DMG checkbox */}
                          <div className="flex items-center justify-center border-l"
                            style={{ borderColor: 'var(--border2)', background: isDmg ? 'rgba(255,68,68,0.06)' : 'transparent' }}>
                            {!isEmpty && (
                              <input type="checkbox" className="med-checkbox"
                                checked={isDmg}
                                onChange={e => handleRegionCheckbox(key, ri, e.target.checked)} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-8 mt-10 text-xs" style={{ color: 'var(--text-dim)' }}>
            <span className="flex items-center gap-2">
              <div className="w-5 h-px border-t border-dashed" style={{ borderColor: 'rgba(200,255,232,0.2)' }} />
              inheritance
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: 'var(--green)', opacity: 0.6 }} />
              healthy
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: 'var(--red)' }} />
              damaged
            </span>
            <span className="flex items-center gap-2">
              <input type="checkbox" className="med-checkbox" readOnly />
              &nbsp;got_hurt()
            </span>
          </div>
        </div>

        {/* ── RIGHT: Monitor ── */}
        <div className="border-l flex flex-col" style={{ borderColor: 'var(--border)' }}>

          <div className="px-6 py-4 border-b flex items-center justify-between"
            style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full pulse" style={{ background: 'var(--green)' }} />
              <span className="font-display text-lg font-bold tracking-widest" style={{ color: 'var(--green)' }}>
                PATIENT MONITOR
              </span>
            </div>
            <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
              {selected ? `NODE: ${selected.toUpperCase()}` : 'STANDBY'}
            </span>
          </div>

          {/* Vitals strip */}
          <div className="grid grid-cols-4 border-b" style={{ borderColor: 'var(--border)' }}>
            {CHILD_KEYS.map(key => (
              <div key={key} className="px-3 py-2.5 border-r text-center" style={{ borderColor: 'var(--border)' }}>
                <div className="text-[10px] mb-1" style={{ color: 'var(--text-dim)' }}>
                  {META[key].label.slice(0, 5).toUpperCase()}
                </div>
                <div className={`text-xs font-bold ${anyDamaged(key) ? 'vital-crit' : 'vital-ok'}`}>
                  {anyDamaged(key) ? 'ABNML' : 'NORML'}
                </div>
              </div>
            ))}
          </div>

          {/* Status readout */}
          <div className="flex-1 overflow-y-auto p-5 grid-bg">
            <AnimatePresence mode="wait">
              {!selected ? (
                <motion.div key="standby"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center gap-3 min-h-[200px]">
                  <div className="text-3xl blink" style={{ color: 'var(--green)' }}>_</div>
                  <div className="text-xs" style={{ color: 'var(--text-dim)' }}>AWAITING INPUT — SELECT NODE</div>
                </motion.div>
              ) : (
                <motion.div key={selected}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="space-y-2">
                  <div className="text-xs mb-4 pb-2 border-b flex items-center justify-between"
                    style={{ color: 'var(--text-dim)', borderColor: 'var(--border2)' }}>
                    <span>{monitorTitle}</span>
                    <span className="blink">■</span>
                  </div>
                  {monitorLines.map((line, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="readout-line py-2 px-3 flex items-start gap-3">
                      <span className={`text-xs shrink-0 font-bold ${line.healthy ? 'vital-ok' : 'vital-crit'}`}>
                        {line.healthy ? '●' : '✕'}
                      </span>
                      <div>
                        {line.region && (
                          <span className="text-xs mr-2" style={{ color: 'var(--text-dim)' }}>
                            [{line.region.toUpperCase()}]
                          </span>
                        )}
                        <span className={`text-xs ${line.healthy ? '' : 'vital-crit'}`}
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
          <div className="border-t flex flex-col" style={{ borderColor: 'var(--border)', height: '210px' }}>
            <div className="px-5 py-2.5 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--border2)', background: 'var(--panel)' }}>
              <span className="text-xs tracking-widest" style={{ color: 'var(--text-dim)' }}>SYSTEM LOG</span>
              <div className="w-2 h-2 rounded-full pulse" style={{ background: 'var(--green)' }} />
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {logs.map(log => (
                <div key={log.id} className="flex gap-3 text-xs">
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
