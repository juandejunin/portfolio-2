import { Envelope, Harmonic, HarmonicSeries, SoundPreset } from "../../domain";

type Forma = (k: number, f: number) => number;
type Adsr = [ataque: number, decaimiento: number, sostenimiento: number, relajacion: number];

const impar = (k: number) => k % 2 === 1;
/** Cuerda excitada a una fracción x de su longitud: los armónicos múltiplos de 1/x se anulan. */
const posicion = (k: number, x: number) => Math.abs(Math.sin(Math.PI * k * x));
/** Campana gaussiana en Hz, para modelar resonancias (formantes). */
const formante = (hz: number, centro: number, ancho: number) => Math.exp(-(((hz - centro) / ancho) ** 2));

const organo: Record<number, number> = { 1: 1, 2: 0.8, 3: 0.6, 4: 0.5, 6: 0.3, 8: 0.25 };
const SUAVE: Adsr = [0.01, 0.1, 0.8, 0.2];

// [nombre, amplitud relativa del armónico k (fundamental f), ADSR]. Cada espectro se normaliza después a máx = 1.
const formas: [string, Forma, Adsr][] = [
  ["Seno", k => (k === 1 ? 1 : 0), SUAVE],
  ["Cuadrada", k => (impar(k) ? 1 / k : 0), SUAVE],
  ["Triángulo", k => (impar(k) ? 1 / k ** 2 : 0), SUAVE],
  ["Diente de sierra", k => 1 / k, SUAVE],
  // Instrumentos: aproximaciones, no mediciones.
  ["Piano", k => posicion(k, 1 / 8) / k ** 1.5, [0.005, 2.5, 0.05, 0.4]],
  ["Guitarra", k => posicion(k, 1 / 5) / k ** 2, [0.003, 0.9, 0.05, 0.3]],
  ["Órgano", k => organo[k] ?? 0, [0.02, 0.05, 1, 0.08]],
  ["Clarinete", k => (impar(k) ? 1 / k ** 0.7 : 0.04), [0.06, 0.1, 0.8, 0.12]],
  ["Flauta", k => 1 / k ** 2.5, [0.09, 0.1, 0.75, 0.2]],
  ["Trompeta", k => (1 + 1.2 * Math.exp(-((k - 4) ** 2) / 6)) / k ** 0.8, [0.05, 0.15, 0.7, 0.15]],
  ["Voz «a»", (k, f) => {
    const hz = k * f;
    return (1 / k) * (formante(hz, 730, 150) + 0.5 * formante(hz, 1090, 180) + 0.25 * formante(hz, 2440, 300) + 0.02);
  }, [0.08, 0.1, 0.8, 0.25]],
];

export function factoryPresets(n = 32, f = 220) {
  return formas.map(([nombre, forma, adsr], i) => {
    const raw = Array.from({ length: n }, (_, j) => forma(j + 1, f));
    const max = Math.max(...raw) || 1;
    return new SoundPreset(`factory-${i + 1}`, nombre,
      HarmonicSeries.crear(f, raw.map((a, j) => new Harmonic(j + 1, a / max))),
      new Envelope(...adsr));
  });
}
