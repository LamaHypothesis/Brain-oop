// ── OOP Class Hierarchy (TypeScript port of Python original) ──────────────
// BrainADT (Abstract) → Brain (Base) → Cerebrum / Diencephalon / Brainstem / Cerebellum

export interface BrainRegion {
  name: string;
  function: string;
  isHealthy: boolean;
  damageEffect: string;
}

// Abstract interface (mirrors Brain_ADT.py)
export interface BrainADT {
  name: string;
  struct: BrainRegion[];
  status(): StatusResult[];
  gotHurt(index: number): HurtResult;
}

export interface StatusResult {
  region: string;
  healthy: boolean;
  message: string;
  prefix: string;
}

export interface HurtResult {
  success: boolean;
  message: string;
}

// Base class: Brain (mirrors Brain.py)
abstract class Brain implements BrainADT {
  protected _name: string;
  protected _struct: BrainRegion[];

  constructor(name: string) {
    this._name = name;
    this._struct = [];
  }

  get name() { return this._name; }
  get struct() { return this._struct; }

  // Base implementation (overridden by subclasses → Polymorphism)
  status(): StatusResult[] {
    return this._struct.map(item => ({
      region: item.name,
      healthy: item.isHealthy,
      message: item.isHealthy ? `${item.name} is normal` : `${item.name} got damaged`,
      prefix: item.isHealthy ? 'OK' : 'DAMAGED',
    }));
  }

  gotHurt(index: number): HurtResult {
    if (index >= 0 && index < this._struct.length) {
      const region = this._struct[index];
      region.isHealthy = false;
      return { success: true, message: `${this._name}'s ${region.name} got damaged` };
    }
    return { success: false, message: 'Invalid index entered' };
  }
}

// ── Subclass: Cerebrum (대뇌) – cerebrum.py ──────────────────────────────
class Cerebrum extends Brain {
  constructor(name: string) {
    super(name);
    this._struct = [
      { name: 'Frontal Lobe',   function: 'executive function and motor control',    isHealthy: true, damageEffect: 'Personality changes and paralysis' },
      { name: 'Temporal Lobe',  function: 'auditory processing and memory',           isHealthy: true, damageEffect: 'Hearing loss and memory impairment' },
      { name: 'Parietal Lobe',  function: 'sensory integration and spatial awareness',isHealthy: true, damageEffect: 'Sensory neglect and disorientation' },
      { name: 'Occipital Lobe', function: 'visual processing',                        isHealthy: true, damageEffect: 'Visual hallucinations and cortical blindness' },
    ];
  }

  // Overriding status() → Polymorphism
  status(): StatusResult[] {
    return this._struct.map(item => ({
      region: item.name,
      healthy: item.isHealthy,
      message: item.isHealthy
        ? `The ${item.name} works for ${item.function}`
        : `${item.damageEffect} occur because the ${item.name} got damaged`,
      prefix: item.isHealthy ? 'COGNITIVE-ACTIVE' : 'NEURO-DEFICIT',
    }));
  }
}

// ── Subclass: Diencephalon (사이뇌) – diencephalon.py ───────────────────
class Diencephalon extends Brain {
  constructor(name: string) {
    super(name);
    this._struct = [
      { name: 'Thalamus',      function: 'sensory relay and consciousness',        isHealthy: true, damageEffect: 'Sensory impairment and coma' },
      { name: 'Hypothalamus',  function: 'homeostasis and hormone regulation',     isHealthy: true, damageEffect: 'Temperature dysregulation and sleep disorders' },
    ];
  }

  status(): StatusResult[] {
    return this._struct.map(item => ({
      region: item.name,
      healthy: item.isHealthy,
      message: item.isHealthy
        ? `The ${item.name} works for ${item.function}`
        : `${item.damageEffect} occur because the ${item.name} got damaged`,
      prefix: item.isHealthy ? 'HOMEO-BALANCED' : 'SENSORY-BLOCK',
    }));
  }
}

// ── Subclass: Brainstem (뇌간) – brainstem.py ───────────────────────────
class Brainstem extends Brain {
  constructor(name: string) {
    super(name);
    this._struct = [
      { name: 'Midbrain',            function: 'sensory relay, motor signaling',    isHealthy: true, damageEffect: 'Tremors, vision loss' },
      { name: 'Pons',                function: 'breathing, communication bridge',   isHealthy: true, damageEffect: 'Locked-in syndrome, facial palsy' },
      { name: 'Medulla Oblongata',   function: 'heart rate, autonomic vitals',      isHealthy: true, damageEffect: 'Respiratory failure, death' },
    ];
  }

  status(): StatusResult[] {
    return this._struct.map(item => ({
      region: item.name,
      healthy: item.isHealthy,
      message: item.isHealthy
        ? `The ${item.name} works for ${item.function}`
        : `${item.damageEffect} occur because the ${item.name} got damaged`,
      prefix: item.isHealthy ? 'VITAL-CORE' : 'CRITICAL-LIFE',
    }));
  }
}

// ── Subclass: Cerebellum (소뇌) – cerebellum.py ─────────────────────────
class Cerebellum extends Brain {
  constructor(name: string) {
    super(name);
    this._struct = [
      { name: 'Cerebellum', function: 'motor control, cognitive function', isHealthy: true, damageEffect: 'Ataxia, dysmetria' },
    ];
  }

  status(): StatusResult[] {
    return this._struct.map(item => ({
      region: item.name,
      healthy: item.isHealthy,
      message: item.isHealthy
        ? `The ${item.name} works for ${item.function}`
        : `${item.damageEffect} occur because the ${item.name} got damaged`,
      prefix: item.isHealthy ? 'MOTOR-STABLE' : 'ATAXIC-FAILED',
    }));
  }
}

// ── Factory / singleton instances (mirrors main.py) ─────────────────────
export function createBrainInstances() {
  return {
    cerebrum:     new Cerebrum('Cerebrum'),
    diencephalon: new Diencephalon('Diencephalon'),
    brainstem:    new Brainstem('Brainstem'),
    cerebellum:   new Cerebellum('Cerebellum'),
  };
}

export type { Brain };
