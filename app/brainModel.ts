// ── OOP Class Hierarchy ───────────────────────────────────────────────────
// BrainADT (Abstract) → Brain (Base) → Cerebrum / Diencephalon / Brainstem / Cerebellum

export interface StatusResult {
  region: string;
  healthy: boolean;
  message: string;
}

export interface GotHurtResult {
  success: boolean;
  regionName: string;
  index: number;
}

// Abstract interface — mirrors Brain_ADT.py
export interface BrainADT {
  readonly name: string;
  readonly struct: string[];
  is_damaged: boolean | boolean[];
  status(): StatusResult[];
  got_hurt(index?: number): GotHurtResult;
}

// ── Base Class: Brain ─────────────────────────────────────────────────────
abstract class Brain implements BrainADT {
  protected __name: string;
  protected __struct: string[];
  protected _is_damaged: boolean;   // Brain level: single T/F

  constructor(name: string) {
    this.__name = name;
    this.__struct = ['brainstem', 'cerebellum', 'cerebrum', 'diencephalon'];
    this._is_damaged = false;
  }

  get name() { return this.__name; }
  get struct() { return this.__struct; }
  get is_damaged() { return this._is_damaged; }
  set is_damaged(v: boolean | boolean[]) { this._is_damaged = v as boolean; }

  // Brain.status() — overridden by subclasses (Polymorphism)
  status(): StatusResult[] {
    return [{
      region: this.__name,
      healthy: !this._is_damaged,
      message: this._is_damaged
        ? 'Brain damage detected. One or more regions are compromised. Check individual regions for details.'
        : 'Brain is fully operational. All regions are functioning within normal parameters.',
    }];
  }

  got_hurt(index?: number): GotHurtResult {
    this._is_damaged = true;
    return { success: true, regionName: this.__name, index: index ?? 0 };
  }
}

// ── Subclass: Cerebrum (대뇌) ──────────────────────────────────────────────
class Cerebrum extends Brain {
  private __struct_regions: string[];
  private __function: string[];
  private __symptom: string[];
  protected _region_is_damaged: boolean[];

  constructor(name: string) {
    super(name);
    this.__struct_regions = ['Frontal Lobe', 'Temporal Lobe', 'Parietal Lobe', 'Occipital Lobe'];
    this.__function = [
      'executive function and motor control',
      'auditory processing and memory',
      'sensory integration and spatial awareness',
      'visual processing',
    ];
    this.__symptom = [
      'Personality changes and paralysis',
      'Hearing loss and memory impairment',
      'Sensory neglect and disorientation',
      'Visual hallucinations and cortical blindness',
    ];
    this._region_is_damaged = [false, false, false, false];
  }

  get struct() { return this.__struct_regions; }
  get is_damaged(): boolean[] { return this._region_is_damaged; }
  set is_damaged(v: boolean | boolean[]) {
    if (Array.isArray(v)) this._region_is_damaged = v;
  }

  status(): StatusResult[] {
    return this.__struct_regions.map((region, i) => ({
      region,
      healthy: !this._region_is_damaged[i],
      message: this._region_is_damaged[i]
        ? `Damaged ${region} cause ${this.__symptom[i]}`
        : `The ${region} works for ${this.__function[i]}.`,
    }));
  }

  got_hurt(index?: number): GotHurtResult {
    const i = index ?? Math.floor(Math.random() * this.__struct_regions.length);
    this._region_is_damaged[i] = true;
    this._is_damaged = true;
    return { success: true, regionName: this.__struct_regions[i], index: i };
  }
}

// ── Subclass: Diencephalon (사이뇌) ────────────────────────────────────────
class Diencephalon extends Brain {
  private __struct_regions: string[];
  private __function: string[];
  private __symptom: string[];
  protected _region_is_damaged: boolean[];

  constructor(name: string) {
    super(name);
    this.__struct_regions = ['Thalamus', 'Hypothalamus'];
    this.__function = [
      'sensory relay and consciousness',
      'homeostasis and hormone regulation',
    ];
    this.__symptom = [
      'Sensory impairment and coma',
      'Temperature dysregulation and sleep disorders',
    ];
    this._region_is_damaged = [false, false];
  }

  get struct() { return this.__struct_regions; }
  get is_damaged(): boolean[] { return this._region_is_damaged; }
  set is_damaged(v: boolean | boolean[]) {
    if (Array.isArray(v)) this._region_is_damaged = v;
  }

  status(): StatusResult[] {
    return this.__struct_regions.map((region, i) => ({
      region,
      healthy: !this._region_is_damaged[i],
      message: this._region_is_damaged[i]
        ? `Damaged ${region} cause ${this.__symptom[i]}`
        : `The ${region} works for ${this.__function[i]}.`,
    }));
  }

  got_hurt(index?: number): GotHurtResult {
    const i = index ?? Math.floor(Math.random() * this.__struct_regions.length);
    this._region_is_damaged[i] = true;
    this._is_damaged = true;
    return { success: true, regionName: this.__struct_regions[i], index: i };
  }
}

// ── Subclass: Brainstem (뇌간) ─────────────────────────────────────────────
class Brainstem extends Brain {
  private __struct_regions: string[];
  private __function: string[];
  private __symptom: string[];
  protected _region_is_damaged: boolean[];

  constructor(name: string) {
    super(name);
    this.__struct_regions = ['Midbrain', 'Pons', 'Medulla Oblongata'];
    this.__function = [
      'sensory relay and motor signaling',
      'breathing and communication bridge',
      'heart rate and autonomic vitals',
    ];
    this.__symptom = [
      'Tremors and vision loss',
      'Locked-in syndrome and facial palsy',
      'Respiratory failure and death',
    ];
    this._region_is_damaged = [false, false, false];
  }

  get struct() { return this.__struct_regions; }
  get is_damaged(): boolean[] { return this._region_is_damaged; }
  set is_damaged(v: boolean | boolean[]) {
    if (Array.isArray(v)) this._region_is_damaged = v;
  }

  status(): StatusResult[] {
    return this.__struct_regions.map((region, i) => ({
      region,
      healthy: !this._region_is_damaged[i],
      message: this._region_is_damaged[i]
        ? `Damaged ${region} cause ${this.__symptom[i]}`
        : `The ${region} works for ${this.__function[i]}.`,
    }));
  }

  got_hurt(index?: number): GotHurtResult {
    const i = index ?? Math.floor(Math.random() * this.__struct_regions.length);
    this._region_is_damaged[i] = true;
    this._is_damaged = true;
    return { success: true, regionName: this.__struct_regions[i], index: i };
  }
}

// ── Subclass: Cerebellum (소뇌) ────────────────────────────────────────────
class Cerebellum extends Brain {
  private __struct_regions: string[];
  private __function: string[];
  private __symptom: string[];
  protected _region_is_damaged: boolean[];

  constructor(name: string) {
    super(name);
    this.__struct_regions = ['Cerebellum'];
    this.__function = ['motor control and cognitive function'];
    this.__symptom = ['Ataxia and dysmetria'];
    this._region_is_damaged = [false];
  }

  get struct() { return this.__struct_regions; }
  get is_damaged(): boolean[] { return this._region_is_damaged; }
  set is_damaged(v: boolean | boolean[]) {
    if (Array.isArray(v)) this._region_is_damaged = v;
  }

  status(): StatusResult[] {
    return this.__struct_regions.map((region, i) => ({
      region,
      healthy: !this._region_is_damaged[i],
      message: this._region_is_damaged[i]
        ? `Damaged ${region} cause ${this.__symptom[i]}`
        : `The ${region} works for ${this.__function[i]}.`,
    }));
  }

  got_hurt(index?: number): GotHurtResult {
    const i = index ?? Math.floor(Math.random() * this.__struct_regions.length);
    this._region_is_damaged[i] = true;
    this._is_damaged = true;
    return { success: true, regionName: this.__struct_regions[i], index: i };
  }
}

// ── Factory ────────────────────────────────────────────────────────────────
export function createBrainInstances() {
  return {
    cerebrum:     new Cerebrum('Cerebrum'),
    diencephalon: new Diencephalon('Diencephalon'),
    brainstem:    new Brainstem('Brainstem'),
    cerebellum:   new Cerebellum('Cerebellum'),
  };
}

export type BrainInstance = Cerebrum | Diencephalon | Brainstem | Cerebellum;
