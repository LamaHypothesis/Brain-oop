'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createBrainInstances, BrainADT, StatusResult } from './brainModel';

type BrainKey = 'cerebrum' | 'diencephalon' | 'brainstem' | 'cerebellum';

interface LogEntry {
  id: number;
  timestamp: string;
  type: 'status' | 'damage' | 'system';
  brainKey?: BrainKey;
  prefix: string;
  message: string;
  healthy: boolean;
}

const BRAIN_META: Record<BrainKey, {
  label: string; korean: string; nodeClass: string; color: string;
  hex: string; icon: string; desc: string;
}> = {
  cerebrum: {
    label: 'Cerebrum', korean: '대뇌',
    nodeClass: 'node-cerebrum', color: 'text-violet-400', hex: '#7c6af5',
    icon: '🧠', desc: 'Overrides: COGNITIVE-ACTIVE / NEURO-DEFICIT',
  },
  diencephalon: {
    label: 'Diencephalon', korean: '사이뇌',
    nodeClass: 'node-diencephalon', color: 'text-amber-400', hex: '#f5a623',
    icon: '⚡', desc: 'Overrides: HOMEO-BALANCED / SENSORY-BLOCK',
  },
  brainstem: {
    label: 'Brainstem', korean: '뇌간',
    nodeClass: 'node-brainstem', color: 'text-red-400', hex: '#e05c5c',
    icon: '💓', desc: 'Overrides: VITAL-CORE / CRITICAL-LIFE',
  },
  cerebellum: {
    label: 'Cerebellum', korean: '소뇌',
    nodeClass: 'node-cerebellum', color: 'text-teal-400', hex: '#4ecdc4',
    icon: '⚙️', desc: 'Overrides: MOTOR-STABLE / ATAXIC-FAILED',
  },
};

export default function Home() {
  const [instances] = useState(() => createBrainInstances());
  const [selected, setSelected] = useState<BrainKey | null>(null);
  const [statusResults, setStatusResults] = useState<StatusResult[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [flashKey, setFlashKey] = useState<BrainKey | null>(null);
  const logIdRef = useRef(0);
  const logEndRef = useRef<HTMLDivElement>(null);

  const [damageState, setDamageState] = useState<Record<BrainKey, boolean[]>>({
    cerebrum: [true, true, true, true],
    diencephalon: [true, true],
    brainstem: [true, true, true],
    cerebellum: [true],
  });

  const addLog = useCallback((entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const id = ++logIdRef.current;
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev.slice(-49), { ...entry, id, timestamp }]);
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    addLog({ type: 'system', prefix: 'BOOT', message: 'Brain OOP Visualizer initialized. Click a brain region to call status().', healthy: true });
  }, [addLog]);

  const handleNodeClick = useCallback((key: BrainKey) => {
    setSelected(key);
    const inst = instances[key] as BrainADT;
    const results = inst.status();
    setStatusResults(results);
    setFlashKey(key);
    setTimeout(() => setFlashKey(null), 600);
    const meta = BRAIN_META[key];
    addLog({ type: 'system', brainKey: key, prefix: 'CALL', message: `${meta.label}.status() → polymorphic dispatch`, healthy: true });
    results.forEach(r => {
      addLog({ type: 'status', brainKey: key, prefix: r.prefix, message: r.message, healthy: r.healthy });
    });
  }, [instances, addLog]);

  const handleGotHurt = useCallback((key: BrainKey, index: number) => {
    const inst = instances[key] as BrainADT;
    const result = inst.gotHurt(index);
    if (result.success) {
      setDamageState(prev => {
        const arr = [...prev[key]];
        arr[index] = false;
        return { ...prev, [key]: arr };
      });
      setFlashKey(key);
      setTimeout(() => setFlashKey(null), 600);
      addLog({ type: 'damage', brainKey: key, prefix: 'DAMAGE', message: result.message, healthy: false });
      const results = inst.status();
      setStatusResults(results);
      results.forEach(r => {
        addLog({ type: 'status', brainKey: key, prefix: r.prefix, message: r.message, healthy: r.healthy });
      });
    }
  }, [instances, addLog]);

  const handleReset = useCallback(() => {
    Object.values(instances).forEach(inst => {
      inst.struct.forEach(s => { s.isHealthy = true; });
    });
    setDamageState({
      cerebrum: [true, true, true, true],
      diencephalon: [true, true],
      brainstem: [true, true, true],
      cerebellum: [true],
    });
    setSelected(null);
    setStatusResults([]);
    setLogs([]);
    setTimeout(() => addLog({ type: 'system', prefix: 'RESET', message: 'All brain regions restored to healthy state.', healthy: true }), 10);
  }, [instances, addLog]);

  const allHealthy = (key: BrainKey) => damageState[key].every(Boolean);

  return (
    <main className="min-h-screen neural-bg">
      <header className="border-b border-white/8 px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-white">
            Brain <span className="text-violet-400">OOP</span> Visualizer
          </h1>
          <p className="text-xs text-white/30 mt-0.5 font-mono">
            BrainADT → Brain → [Cerebrum · Diencephalon · Brainstem · Cerebellum]
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-white/20 font-mono hidden sm:block">
            Polymorphism · Inheritance · Override
          </div>
          <button
            onClick={handleReset}
            className="text-xs border border-white/15 text-white/40 hover:text-white/70 hover:border-white/30 px-3 py-1.5 rounded transition-all"
          >
            RESET
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] min-h-[calc(100vh-69px)]">
        <div className="p-8 flex flex-col gap-8">
          <div className="flex flex-col items-center gap-0">

            {/* BrainADT node */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="node-adt rounded-xl px-8 py-4 text-center min-w-[260px]"
            >
              <div className="text-[10px] text-white/30 mb-1 font-mono tracking-widest">«abstract»</div>
              <div className="font-display text-lg font-bold text-white/70">BrainADT</div>
              <div className="mt-2 space-y-0.5 text-[10px] text-white/30 font-mono">
                <div>+ name: str &nbsp;<span className="text-white/15">// @abstractproperty</span></div>
                <div>+ struct: list &nbsp;<span className="text-white/15">// @abstractproperty</span></div>
                <div className="text-white/20">──────────────────────</div>
                <div>+ status() <span className="text-violet-300/50">«abstract»</span></div>
                <div>+ got_hurt(index) <span className="text-violet-300/50">«abstract»</span></div>
              </div>
            </motion.div>

            {/* Arrow down */}
            <svg width="2" height="36" className="overflow-visible" style={{display:'block'}}>
              <line x1="1" y1="0" x2="1" y2="30" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeDasharray="4 4" />
              <polygon points="1,36 -4,26 6,26" fill="rgba(255,255,255,0.15)" />
            </svg>

            {/* Brain base node */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="node-base rounded-xl px-8 py-4 text-center min-w-[260px]"
            >
              <div className="text-[10px] text-white/30 mb-1 font-mono tracking-widest">«base class»</div>
              <div className="font-display text-lg font-bold text-white/80">Brain</div>
              <div className="mt-2 space-y-0.5 text-[10px] text-white/40 font-mono">
                <div>- __name: str</div>
                <div>- _struct: list</div>
                <div className="text-white/20">──────────────────────</div>
                <div className="text-white/60">+ status() <span className="text-green-400/60">«concrete»</span></div>
                <div className="text-white/60">+ got_hurt(index) <span className="text-green-400/60">«concrete»</span></div>
              </div>
            </motion.div>

            {/* Fan-out SVG */}
            <div className="relative w-full max-w-3xl h-12">
              <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                <line x1="50%" y1="0" x2="50%" y2="12" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeDasharray="4 4" />
                <line x1="12.5%" y1="12" x2="87.5%" y2="12" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeDasharray="4 4" />
                {[12.5, 37.5, 62.5, 87.5].map((x, i) => (
                  <line key={i} x1={`${x}%`} y1="12" x2={`${x}%`} y2="48"
                    stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeDasharray="4 4" />
                ))}
              </svg>
            </div>

            {/* Subclass nodes */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-3xl">
              {(Object.keys(BRAIN_META) as BrainKey[]).map((key, i) => {
                const meta = BRAIN_META[key];
                const isActive = selected === key;
                const isFlashing = flashKey === key;
                const healthy = allHealthy(key);

                return (
                  <motion.button
                    key={key}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.07 }}
                    onClick={() => handleNodeClick(key)}
                    className={`${meta.nodeClass} ${isActive ? 'active' : ''} rounded-xl p-4 text-left transition-all duration-200 cursor-pointer ${isFlashing ? 'damage-flash' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xl">{meta.icon}</span>
                      <div
                        className={`w-2 h-2 rounded-full ${healthy ? 'pulse-dot' : ''}`}
                        style={{ background: healthy ? meta.hex : '#ef4444', opacity: healthy ? 1 : 0.8 }}
                      />
                    </div>
                    <div className={`font-display text-sm font-bold ${meta.color}`}>{meta.label}</div>
                    <div className="text-[10px] text-white/30 mt-0.5">{meta.korean}</div>
                    <div className="mt-2 text-[9px] text-white/20 font-mono leading-tight">{meta.desc}</div>
                    <div className="mt-3 flex gap-1">
                      {damageState[key].map((h, idx) => (
                        <div
                          key={idx}
                          className="w-1.5 h-1.5 rounded-full transition-colors"
                          style={{ background: h ? meta.hex : '#ef4444', opacity: h ? 0.8 : 1 }}
                        />
                      ))}
                    </div>
                    <div className="mt-2 text-[9px] text-white/20 font-mono">click → status()</div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 text-[10px] text-white/25 font-mono border-t border-white/5 pt-4">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-px border-t border-dashed border-white/20" />
              <span>abstract inheritance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400/40" />
              <span>healthy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-400/60" />
              <span>damaged</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="border-l border-white/8 flex flex-col">
          <div className="flex-1 p-6 overflow-y-auto">
            <AnimatePresence mode="wait">
              {!selected ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-center gap-3 min-h-[300px]"
                >
                  <div className="text-4xl opacity-20">🧬</div>
                  <div className="text-white/20 text-xs font-mono">
                    Click any brain region node<br />to call its overridden status()
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={selected}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className={`font-display text-xl font-bold ${BRAIN_META[selected].color}`}>
                        {BRAIN_META[selected].label}
                      </div>
                      <div className="text-[10px] text-white/30 font-mono mt-0.5">
                        {BRAIN_META[selected].korean} · status() output
                      </div>
                    </div>
                    <span className="text-2xl">{BRAIN_META[selected].icon}</span>
                  </div>

                  <div className="bg-white/3 border border-white/8 rounded-lg px-3 py-2 mb-4 text-[10px] font-mono text-white/40">
                    <span className="text-violet-400/70">override</span>{' '}
                    <span className="text-white/60">status()</span>
                    {' → '}{BRAIN_META[selected].desc.split(':')[1]}
                  </div>

                  <div className="space-y-2 mb-6">
                    {statusResults.map((r, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className={`rounded-lg p-3 border ${
                          r.healthy ? 'bg-white/3 border-white/8' : 'bg-red-500/8 border-red-500/25'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={r.healthy ? { background: BRAIN_META[selected].hex } : { background: '#ef4444' }}
                          />
                          <span className={`text-[9px] font-mono font-semibold tracking-widest ${
                            r.healthy ? BRAIN_META[selected].color : 'text-red-400'
                          }`}>
                            [{r.prefix}]
                          </span>
                        </div>
                        <div className="text-xs text-white/70 font-mono leading-relaxed">{r.message}</div>
                      </motion.div>
                    ))}
                  </div>

                  <div>
                    <div className="text-[10px] text-white/30 font-mono mb-2 tracking-widest">
                      got_hurt(index) — inherited from Brain
                    </div>
                    <div className="space-y-1.5">
                      {instances[selected].struct.map((region, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleGotHurt(selected, idx)}
                          disabled={!region.isHealthy}
                          className={`w-full text-left rounded-lg px-3 py-2.5 border text-[11px] font-mono transition-all ${
                            !region.isHealthy
                              ? 'bg-red-500/5 border-red-500/20 text-red-400/50 cursor-not-allowed'
                              : 'bg-white/3 border-white/8 text-white/50 hover:text-white/80 hover:border-white/20 hover:bg-white/5 cursor-pointer'
                          }`}
                        >
                          <span className="text-white/25">[{idx}]</span>{' '}
                          {region.name}
                          {!region.isHealthy && <span className="ml-2 text-red-400/60">✗ damaged</span>}
                          {region.isHealthy && <span className="ml-2 text-white/20">→ got_hurt({idx})</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Console */}
          <div className="border-t border-white/8 h-48 flex flex-col">
            <div className="px-4 py-2 flex items-center justify-between border-b border-white/5">
              <span className="text-[10px] text-white/25 font-mono tracking-widest">CONSOLE</span>
              <div className="w-1.5 h-1.5 rounded-full bg-green-400/60 pulse-dot" />
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
              {logs.map(log => (
                <div key={log.id} className="log-entry flex gap-2 text-[9px] font-mono">
                  <span className="text-white/15 shrink-0">{log.timestamp}</span>
                  <span className={`shrink-0 ${
                    log.type === 'damage' ? 'text-red-400/70' :
                    log.type === 'system' ? 'text-violet-400/70' :
                    log.healthy ? 'text-green-400/60' : 'text-red-400/60'
                  }`}>[{log.prefix}]</span>
                  <span className="text-white/40 leading-relaxed">{log.message}</span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
