import type { Envelope, HarmonicSeries } from "../../domain";
import type { AudioEngine } from "./audio-engine";

type Voz = { osc: OscillatorNode; gain: GainNode; relajacion: number };

/** Motor polifónico: una voz (oscilador + ganancia con ADSR) por nota. */
export class WebAudioEngine implements AudioEngine {
  private ctx?: AudioContext;
  private salida?: GainNode;
  private voces = new Map<number, Voz>();

  private contexto() {
    if (!this.ctx) {
      const ctx = new AudioContext();
      const master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.createDynamicsCompressor()).connect(ctx.destination); // el compresor evita saturar con acordes
      this.ctx = ctx;
      this.salida = master;
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  private onda(ctx: AudioContext, s: HarmonicSeries) {
    const max = Math.max(...s.armonicos.map(h => h.orden));
    const real = new Float32Array(max + 1), imag = new Float32Array(max + 1);
    for (const h of s.armonicos) imag[h.orden] = h.amplitud;
    return ctx.createPeriodicWave(real, imag);
  }

  notaOn(id: number, frecuencia: number, s: HarmonicSeries, e: Envelope) {
    const ctx = this.contexto();
    if (this.voces.has(id)) return;
    const t = ctx.currentTime, pico = 0.4;
    const osc = ctx.createOscillator(), gain = ctx.createGain(), g = gain.gain;
    osc.setPeriodicWave(this.onda(ctx, s));
    osc.frequency.value = frecuencia;
    g.setValueAtTime(0, t);
    g.linearRampToValueAtTime(pico, t + e.ataque);                                   // Ataque
    g.setTargetAtTime(pico * e.sostenimiento, t + e.ataque, e.decaimiento / 4);      // Decaimiento hacia el sostenimiento
    osc.connect(gain).connect(this.salida!);
    osc.onended = () => gain.disconnect();
    osc.start(t);
    this.voces.set(id, { osc, gain, relajacion: e.relajacion });
  }

  notaOff(id: number) {
    const v = this.voces.get(id);
    if (!v) return;
    this.voces.delete(id);
    this.soltar(v);
  }

  actualizar(s: HarmonicSeries) {
    if (!this.ctx || !this.voces.size) return;
    const onda = this.onda(this.ctx, s);
    this.voces.forEach(v => v.osc.setPeriodicWave(onda));
  }

  detenerTodo() {
    this.voces.forEach(v => this.soltar(v));
    this.voces.clear();
  }

  /** Relajación: desde el nivel actual (esté donde esté la envolvente) hasta cero. */
  private soltar(v: Voz) {
    const t = this.ctx!.currentTime, g = v.gain.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    g.setTargetAtTime(0, t, v.relajacion / 5);
    v.osc.stop(t + v.relajacion + 0.05);
  }
}
