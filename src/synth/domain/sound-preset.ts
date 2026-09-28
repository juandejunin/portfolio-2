import type { Envelope } from "./envelope";
import type { HarmonicSeries } from "./harmonic-series";

export class SoundPreset {
  constructor(readonly id: string, readonly nombre: string, readonly serie: HarmonicSeries, readonly envolvente: Envelope) {}
  conSerie(s: HarmonicSeries) { return new SoundPreset(this.id, this.nombre, s, this.envolvente); }
  conEnvolvente(e: Envelope) { return new SoundPreset(this.id, this.nombre, this.serie, e); }
}
