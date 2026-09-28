export class Harmonic {
  constructor(readonly orden: number, readonly amplitud: number) {
    if (!Number.isInteger(orden) || orden < 1) throw new Error("Orden inválido");
    if (!Number.isFinite(amplitud) || amplitud < 0 || amplitud > 1) throw new Error("Amplitud inválida");
  }
  conAmplitud(a: number) { return new Harmonic(this.orden, a); }
}
