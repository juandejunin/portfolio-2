export type CampoEnvolvente = "ataque" | "decaimiento" | "sostenimiento" | "relajacion";

/** Envolvente ADSR: tiempos en segundos, sostenimiento como nivel 0..1. */
export class Envelope {
  constructor(readonly ataque: number, readonly decaimiento: number, readonly sostenimiento: number, readonly relajacion: number) {
    for (const [nombre, t] of [["Ataque", ataque], ["Decaimiento", decaimiento], ["Relajación", relajacion]] as const) {
      if (!Number.isFinite(t) || t < 0.001 || t > 10) throw new Error(`${nombre} inválido`);
    }
    if (!Number.isFinite(sostenimiento) || sostenimiento < 0 || sostenimiento > 1) throw new Error("Sostenimiento inválido");
  }

  con(campo: CampoEnvolvente, valor: number) {
    const p = { ataque: this.ataque, decaimiento: this.decaimiento, sostenimiento: this.sostenimiento, relajacion: this.relajacion };
    p[campo] = valor;
    return new Envelope(p.ataque, p.decaimiento, p.sostenimiento, p.relajacion);
  }
}
