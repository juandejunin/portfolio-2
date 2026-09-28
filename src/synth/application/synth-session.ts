import { Envelope, HarmonicSeries, SoundPreset, type CampoEnvolvente } from "../domain";
import type { AdjustHarmonicAmplitude } from "../features";

/** Guarda el preset actual (espectro + envolvente) para que la UI no gestione estado de dominio. */
export class SynthSession {
  private preset: SoundPreset;

  constructor(private adjust: AdjustHarmonicAmplitude, frecuencia: number, cantidad: number) {
    this.preset = new SoundPreset("current", "Actual", HarmonicSeries.inicial(frecuencia, cantidad), new Envelope(0.01, 0.1, 0.8, 0.2));
  }

  get serie() { return this.preset.serie; }
  get envolvente() { return this.preset.envolvente; }

  ajustar(orden: number, amplitud: number) { this.preset = this.preset.conSerie(this.adjust.execute(this.serie, orden, amplitud)); }
  cambiarFrecuencia(f: number) { this.preset = this.preset.conSerie(this.serie.conFrecuencia(f)); }
  cambiarCantidad(n: number) { this.preset = this.preset.conSerie(this.serie.conCantidad(n)); }
  cambiarEnvolvente(campo: CampoEnvolvente, valor: number) { this.preset = this.preset.conEnvolvente(this.envolvente.con(campo, valor)); }
  cargar(p: SoundPreset) { this.preset = new SoundPreset("current", p.nombre, p.serie, p.envolvente); }
}
