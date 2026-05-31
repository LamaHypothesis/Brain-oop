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

  // damage state — mirrors Python _is_damaged arrays
  const [brainDamaged, setBrainDamaged]           = useState(false);
  const [regionDamaged, setRegionDamaged] = useState<Record<BrainKey, boolean[]>>({
    cerebrum:     [false, false, false, false],
    diencephalon: [false, false],
    brainstem:    [false, false, false],
    cerebellum:   [false],
  });

  const [selected, setSelected]       = useState<SelectedNode | null>(null);
  const [monitorLines, setMonitorLines] = useState<StatusResult[]>([]);
  const [logs, setLogs]               = useState<LogLine[]>([]);
  const [flash, setFlash]             = useState<string | null>(null);
  const [time, setTime]               = useState('');
  const logId                         = useRef(0);
  const logEnd                        = useRef<HTMLDivElement>(null);

  // clock
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

  // initial boot
  useEffect(() => {
    addLog('SYSTEM BOOT — Brain Neural Monitor v2.0', 'sys');
    addLog('Click any node to run status()', 'sys');
  }, [addLog]);

  const triggerFlash = (key: string) => {
    setFlash(key);
    setTimeout(() => setFlash(null), 500);
  };

  // ── Node click handlers ──────────────────────────────────────────────────

  const handleADT = () => {
    setSelected('adt');
    const lines: StatusResult[] = [
      { region: 'BrainADT', healthy: true, message: "Abstract interface defining Brain's region functions and disabilities." },
      { region: 'Properties', healthy: true, message: '@abstractproperty name — identifier of the brain part' },
      { region: 'Properties', healthy: true, message: '@abstractproperty struct — list of sub-regions' },
      { region: 'Properties', healthy: true, message: '@abstractproperty is_damaged — damage state (T/F or array)' },
      { region: 'Methods', healthy: true, message: '@abstractmethod status() — output current functional state' },
      { region: 'Methods', healthy: true, message: '@abstractmethod got_hurt(index) — apply damage to a region' },
    ];
    setMonitorLines(lines);
    addLog("ADT.info() → Brain's region's functions and disability", 'call');
    lines.forEach(l => addLog(l.message, 'ok'));
  };

  const handleBrain = () => {
    setSelected('brain');
    // Brain.status() — base class output
    const results = inst.cerebrum.status(); // unused — we show Brain level
    const healthy = !brainDamaged;
    const lines: StatusResult[] = [{
      region: 'Brain',
      healthy,
      message: healthy
        ? 'Brain is fully operational. All regions are functioning within normal parameters.'
        : 'Brain damage detected. One or more regions are compromised. Check individual regions for details.',
    }];
    setMonitorLines(lines);
    addLog('Brain.status() → base class output', 'call');
    addLog(lines[0].message, healthy ? 'ok' : 'crit');
  };

  const handleChild = (key: BrainKey) => {
    setSelected(key);
    triggerFlash(key);
    const results = inst[key].status();
    setMonitorLines(results);
    addLog(`${META[key].label}.status() → polymorphic override`, 'call');
    results.forEach(r => addLog(r.message, r.healthy ? 'ok' : 'crit'));
  };

  // ── Checkbox: got_hurt ───────────────────────────────────────────────────
  const handleBrainCheckbox = (checked: boolean) => {
    setBrainDamaged(checked);
    if (checked) {
      addLog('Brain.got_hurt() → overall damage flagged', 'warn');
      if (selected === 'brain') handleBrain();
    }
  };

  const handleRegionCheckbox = (key: BrainKey, idx: number, checked: boolean) => {
    if (!checked) return; // only allow damage, not repair
    const result = inst[key].got_hurt(idx);
    setRegionDamaged(prev => {
      const arr = [...prev[key]];
      arr[idx] = true;
      return { ...prev, [key]: arr };
    });
    setBrainDamaged(true);
    triggerFlash(key);
    addLog(`${META[key].label}.got_hurt(${idx}) → ${result.regionName} damaged`, 'crit');
    // refresh monitor if this node is selected
    if (selected === key) {
      const results = inst[key].status();
      setMonitorLines(results);
      results.forEach(r => addLog(r.message, r.healthy ? 'ok' : 'crit'));
    }
  };

  const handleReset = () => {
    CHILD_KEYS.forEach(k => {
      inst[k].struct.forEach((_, i) => { (inst[k].is_damaged as boolean[])[i] = false; });
    });
    setBrainDamaged(false);
    setRegionDamaged({ cerebrum:[false,false,false,false], diencephalon:[false,false], brainstem:[false,false,false], cerebellum:[false] });
    setSelected(null);
    setMonitorLines([]);
    setLogs([]);
    setTimeout(() => addLog('SYSTEM RESET — all regions restored', 'sys'), 10);
  };

  const anyDamaged = (key: BrainKey) => regionDamaged[key].some(Boolean);

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* ── Header ── */}
      <header className="border-b px-6 py-3 flex items-center justify-between" style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}>
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

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_480px] min-h-[calc(100vh-53px)]">

        {/* ── LEFT: Hierarchy ── */}
        <div className="p-6 flex flex-col items-center gap-0 overflow-auto">

          {/* ADT node */}
          <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
            <button onClick={handleADT}
              className={`node-adt rounded px-6 py-3 text-center min-w-[240px] transition-all ${selected==='adt' ? 'border-white/40' : ''}`}>
              <div className="text-[9px] mb-1 tracking-widest" style={{ color: 'var(--text-dim)' }}>«abstract»</div>
              <div className="font-display text-lg font-bold" style={{ color: 'var(--text)' }}>BrainADT</div>
              <div className="mt-1.5 space-y-0.5 text-[9px] text-left" style={{ color: 'var(--text-muted)' }}>
                <div>+ name, struct, is_damaged <span style={{color:'var(--text-dim)'}}>@property</span></div>
                <div className="border-t my-1" style={{borderColor:'var(--border2)'}}/>
                <div>+ status() <span style={{color:'var(--green-dim)'}}>«abstract»</span></div>
                <div>+ got_hurt(index) <span style={{color:'var(--green-dim)'}}>«abstract»</span></div>
              </div>
            </button>
          </motion.div>

          {/* ADT → Brain */}
          <svg width="2" height="32" style={{display:'block',overflow:'visible'}}>
            <line x1="1" y1="0" x2="1" y2="26" className="connector" strokeWidth="1.5"/>
            <polygon points="1,32 -3,22 5,22" fill="rgba(200,255,232,0.2)"/>
          </svg>

          {/* Brain node */}
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
            <div className="flex items-start gap-2">
              <button onClick={handleBrain}
                className={`node-base rounded px-6 py-3 text-center min-w-[240px] transition-all ${selected==='brain'?'border-white/50':''}`}>
                <div className="text-[9px] mb-1 tracking-widest" style={{ color: 'var(--text-dim)' }}>«base class»</div>
                <div className="flex items-center justify-center gap-2">
                  <div className={`font-display text-lg font-bold ${brainDamaged ? 'vital-crit' : 'vital-ok'}`}>Brain</div>
                  {brainDamaged && <span className="text-[9px] vital-crit blink">DAMAGED</span>}
                </div>
                <div className="mt-1.5 space-y-0.5 text-[9px] text-left" style={{ color: 'var(--text-muted)' }}>
                  <div>- __name, __struct, _is_damaged</div>
                  <div className="border-t my-1" style={{borderColor:'var(--border2)'}}/>
                  <div>+ status() <span style={{color:'var(--green-dim)'}}>«concrete»</span></div>
                  <div>+ got_hurt(index) <span style={{color:'var(--green-dim)'}}>«concrete»</span></div>
                </div>
              </button>
              {/* Brain checkbox */}
              <div className="flex flex-col items-center gap-1 pt-8">
                <input type="checkbox" className="med-checkbox"
                  checked={brainDamaged}
                  onChange={e => handleBrainCheckbox(e.target.checked)}/>
                <span className="text-[8px]" style={{color:'var(--text-dim)'}}>dmg</span>
              </div>
            </div>
          </motion.div>

          {/* Brain → children fan */}
          <div className="relative w-full max-w-4xl h-10">
            <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
              <line x1="50%" y1="0" x2="50%" y2="10" className="connector" strokeWidth="1.5"/>
              <line x1="12.5%" y1="10" x2="87.5%" y2="10" className="connector" strokeWidth="1.5"/>
              {[12.5,37.5,62.5,87.5].map((x,i)=>(
                <line key={i} x1={`${x}%`} y1="10" x2={`${x}%`} y2="40" className="connector" strokeWidth="1.5"/>
              ))}
            </svg>
          </div>

          {/* Child nodes */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl">
            {CHILD_KEYS.map((key, ci) => {
              const meta = META[key];
              const damaged = anyDamaged(key);
              const isFlashing = flash === key;
              const regions = inst[key].struct;
              const dmgArr = regionDamaged[key];

              return (
                <motion.div key={key}
                  initial={{ opacity:0, y:16 }}
                  animate={{ opacity:1, y:0 }}
                  transition={{ delay: 0.3 + ci*0.07 }}
                  className={isFlashing ? 'flash' : ''}>

                  <button onClick={() => handleChild(key)}
                    className={`node-child rounded w-full p-3 text-left ${selected===key?'active':''}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`font-display text-sm font-bold ${meta.color}`}>{meta.label}</span>
                      <div className="w-1.5 h-1.5 rounded-full pulse"
                        style={{ background: damaged ? 'var(--red)' : 'var(--green)' }}/>
                    </div>
                    <div className="text-[9px] mb-2" style={{color:'var(--text-dim)'}}>{meta.korean}</div>
                    <div className="text-[9px] mb-2" style={{color:'var(--text-muted)'}}>
                      override status()
                    </div>

                    {/* region dots */}
                    <div className="flex gap-1 flex-wrap">
                      {regions.map((r, ri) => (
                        <div key={ri} className="w-1.5 h-1.5 rounded-sm"
                          style={{ background: dmgArr[ri] ? 'var(--red)' : meta.hex, opacity: dmgArr[ri] ? 1 : 0.6 }}
                          title={r}/>
                      ))}
                    </div>

                    {damaged && <div className="text-[8px] vital-crit mt-1.5">⚠ REGION DAMAGE</div>}
                  </button>

                  {/* Region checkboxes */}
                  <div className="mt-1.5 space-y-1 px-1">
                    {regions.map((r, ri) => (
                      <label key={ri} className="flex items-center gap-1.5 cursor-pointer group">
                        <input type="checkbox" className="med-checkbox"
                          checked={dmgArr[ri]}
                          onChange={e => handleRegionCheckbox(key, ri, e.target.checked)}/>
                        <span className={`text-[9px] transition-colors ${dmgArr[ri] ? 'vital-crit' : 'group-hover:text-white'}`}
                          style={{ color: dmgArr[ri] ? undefined : 'var(--text-muted)' }}>
                          {r}
                        </span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* legend */}
          <div className="flex gap-6 mt-6 text-[9px]" style={{color:'var(--text-dim)'}}>
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-px border-t border-dashed" style={{borderColor:'rgba(200,255,232,0.2)'}}/> inheritance
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm" style={{background:'var(--green)',opacity:0.6}}/> healthy
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm" style={{background:'var(--red)'}}/> damaged
            </span>
            <span className="flex items-center gap-1.5">
              <input type="checkbox" className="med-checkbox" readOnly/> got_hurt()
            </span>
          </div>
        </div>

        {/* ── RIGHT: Monitor ── */}
        <div className="border-l flex flex-col" style={{borderColor:'var(--border)'}}>

          {/* Monitor header */}
          <div className="px-5 py-3 border-b flex items-center justify-between"
            style={{borderColor:'var(--border)', background:'var(--panel)'}}>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full" style={{background:'var(--green)'}}/>
              <span className="font-display text-base font-bold tracking-widest" style={{color:'var(--green)'}}>
                PATIENT MONITOR
              </span>
            </div>
            <span className="text-[9px]" style={{color:'var(--text-dim)'}}>
              {selected ? `NODE: ${selected.toUpperCase()}` : 'STANDBY'}
            </span>
          </div>

          {/* Vitals bar */}
          <div className="grid grid-cols-4 border-b" style={{borderColor:'var(--border)'}}>
            {CHILD_KEYS.map(key => (
              <div key={key} className="px-3 py-2 border-r text-center" style={{borderColor:'var(--border)'}}>
                <div className="text-[8px] mb-0.5" style={{color:'var(--text-dim)'}}>{META[key].label.slice(0,5).toUpperCase()}</div>
                <div className={`text-[10px] font-bold ${anyDamaged(key) ? 'vital-crit' : 'vital-ok'}`}>
                  {anyDamaged(key) ? 'ABNML' : 'NORML'}
                </div>
              </div>
            ))}
          </div>

          {/* Status readout */}
          <div className="flex-1 p-4 overflow-y-auto grid-bg" style={{minHeight:'200px'}}>
            <AnimatePresence mode="wait">
              {!selected ? (
                <motion.div key="standby" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                  className="h-full flex flex-col items-center justify-center gap-2">
                  <div className="text-2xl blink" style={{color:'var(--green)'}}>_</div>
                  <div className="text-[10px]" style={{color:'var(--text-dim)'}}>
                    AWAITING INPUT — SELECT NODE
                  </div>
                </motion.div>
              ) : (
                <motion.div key={selected} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                  className="space-y-1">
                  <div className="text-[9px] mb-3 pb-2 border-b flex items-center justify-between"
                    style={{color:'var(--text-dim)', borderColor:'var(--border2)'}}>
                    <span>STATUS OUTPUT — {selected.toUpperCase()}</span>
                    <span className="blink">■</span>
                  </div>
                  {monitorLines.map((line, i) => (
                    <motion.div key={i}
                      initial={{opacity:0, x:-6}} animate={{opacity:1, x:0}}
                      transition={{delay: i * 0.05}}
                      className="readout-line py-1.5 px-2 flex items-start gap-2">
                      <span className={`text-[9px] shrink-0 font-bold ${line.healthy ? 'vital-ok' : 'vital-crit'}`}>
                        {line.healthy ? '●' : '✕'}
                      </span>
                      <div>
                        {line.region && (
                          <span className="text-[9px] mr-2" style={{color:'var(--text-dim)'}}>
                            [{line.region.toUpperCase()}]
                          </span>
                        )}
                        <span className={`text-[10px] ${line.healthy ? '' : 'vital-crit'}`}
                          style={line.healthy ? {color:'var(--text)'} : {}}>
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
          <div className="border-t" style={{borderColor:'var(--border)', height:'200px', display:'flex', flexDirection:'column'}}>
            <div className="px-4 py-2 border-b flex items-center justify-between"
              style={{borderColor:'var(--border2)', background:'var(--panel)'}}>
              <span className="text-[9px] tracking-widest" style={{color:'var(--text-dim)'}}>SYSTEM LOG</span>
              <div className="w-1.5 h-1.5 rounded-full pulse" style={{background:'var(--green)'}}/>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
              {logs.map(log => (
                <div key={log.id} className="flex gap-2 text-[9px]">
                  <span style={{color:'var(--text-dim)', flexShrink:0}}>{log.ts}</span>
                  <span className={
                    log.type === 'crit' ? 'vital-crit' :
                    log.type === 'warn' ? 'vital-warn' :
                    log.type === 'call' ? 'text-violet-400' :
                    log.type === 'ok'   ? 'vital-ok' :
                    ''
                  } style={log.type === 'sys' ? {color:'var(--text-muted)'} : {}}>
                    {log.text}
                  </span>
                </div>
              ))}
              <div ref={logEnd}/>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
