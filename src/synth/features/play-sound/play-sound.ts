import { frecuenciaMidi, type Envelope, type HarmonicSeries } from "../../domain";
import type { AudioEngine } from "./audio-engine";

export class PlaySound {
  constructor(private audio: AudioEngine) {}
  noteOn(midi: number, s: HarmonicSeries, e: Envelope) { this.audio.notaOn(midi, frecuenciaMidi(midi), s, e); }
  noteOff(midi: number) { this.audio.notaOff(midi); }
  update(s: HarmonicSeries) { this.audio.actualizar(s); }
  stopAll() { this.audio.detenerTodo(); }
}
