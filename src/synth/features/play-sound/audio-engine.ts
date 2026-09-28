import type { Envelope, HarmonicSeries } from "../../domain";

export interface AudioEngine {
  notaOn(id: number, frecuencia: number, s: HarmonicSeries, e: Envelope): void;
  notaOff(id: number): void;
  /** Cambia el timbre de las notas que están sonando. */
  actualizar(s: HarmonicSeries): void;
  detenerTodo(): void;
}
