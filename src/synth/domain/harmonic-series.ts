import { Harmonic } from "./harmonic";

export class HarmonicSeries {
  static readonly MAX_HARMONICS = 128;
  static readonly LIMITE_AUDIBLE_HZ = 20000;

  private constructor(readonly frecuenciaFundamental: number, readonly armonicos: readonly Harmonic[]) {}

  static crear(f: number, a: readonly Harmonic[]) {
    if (!Number.isFinite(f) || f <= 0) throw new Error("Frecuencia inválida");
    if (!a.length || a.length > HarmonicSeries.MAX_HARMONICS) throw new Error("Número de armónicos inválido");
    if (new Set(a.map(x => x.orden)).size !== a.length) throw new Error("Órdenes repetidos");
    return new HarmonicSeries(f, [...a].sort((x, y) => x.orden - y.orden));
  }

  /** Solo la fundamental a amplitud 1; el resto en silencio. */
  static inicial(f: number, n: number) {
    return HarmonicSeries.crear(f, Array.from({ length: n }, (_, i) => new Harmonic(i + 1, i ? 0 : 1)));
  }

  get cantidad() { return this.armonicos.length; }

  amplitudDe(orden: number) { return this.armonicos.find(h => h.orden === orden)?.amplitud ?? 0; }

  audible(orden: number) { return orden * this.frecuenciaFundamental < HarmonicSeries.LIMITE_AUDIBLE_HZ; }

  conAmplitud(orden: number, a: number) {
    if (!this.armonicos.some(x => x.orden === orden)) throw new Error("Armónico inexistente");
    return HarmonicSeries.crear(this.frecuenciaFundamental, this.armonicos.map(x => (x.orden === orden ? x.conAmplitud(a) : x)));
  }

  conFrecuencia(f: number) { return HarmonicSeries.crear(f, this.armonicos); }

  /** Conserva los armónicos existentes (órdenes 1..N contiguos) y añade los nuevos en silencio. */
  conCantidad(n: number) {
    return HarmonicSeries.crear(this.frecuenciaFundamental, Array.from({ length: n }, (_, i) => this.armonicos[i] ?? new Harmonic(i + 1, 0)));
  }
}
