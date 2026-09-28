import { HarmonicSeries, frecuenciaMidi, nombreNota, type CampoEnvolvente, type Envelope } from "./domain";
import { AdjustHarmonicAmplitude, PlaySound, WebAudioEngine, factoryPresets, type SynthEvents } from "./features";
import { EventBus } from "./shared/event-bus";
import { SynthSession } from "./application/synth-session";
import { Spectrum } from "./ui/spectrum";
import { Keyboard } from "./ui/keyboard";
import { MIN_DB, ampADb, dbAAmp } from "./ui/amplitude-scale";

const events = new EventBus<SynthEvents>();
const play = new PlaySound(new WebAudioEngine());
const session = new SynthSession(new AdjustHarmonicAmplitude(events), 220, 32);
let selected = 1, base = 48, ultima = 57;
const held = new Map<string, number>(); // tecla del ordenador -> nota MIDI que está sonando

const root = document.getElementById("synth-app")!;
const $ = <T extends HTMLElement = HTMLElement>(id: string) => root.querySelector<T>(`#${id}`)!;
const slider = $<HTMLInputElement>("slider");
slider.min = String(MIN_DB); slider.max = "0"; slider.step = "0.1";
$<HTMLInputElement>("count").max = String(HarmonicSeries.MAX_HARMONICS);
const freq = $<HTMLInputElement>("freq");

// ---------- Espectro y editor de armónico ----------
const cur = () => ampADb(session.serie.amplitudDe(selected));

function paint() {
  const s = session.serie, a = s.amplitudDe(selected), db = ampADb(a);
  spectrum.render(s, selected);
  $("title").textContent = `Armónico ${selected} · ${(selected * s.frecuenciaFundamental).toFixed(1)} Hz${s.audible(selected) ? "" : " (fuera del rango audible)"}`;
  $("value").textContent = `${db <= MIN_DB ? "−∞" : db.toFixed(1)} dB (${a.toFixed(5)})`;
  slider.value = String(db);
}
const spectrum = new Spectrum($("spectrum"), o => { selected = o; paint(); $("spectrum").focus({ preventScroll: true }); });

function setDb(db: number) {
  session.ajustar(selected, dbAAmp(Math.max(MIN_DB, Math.min(0, db))));
  paint();
}
function sync() { play.update(session.serie); paint(); }

events.on("harmonic-amplitude-changed", e => play.update(e.serie));
slider.oninput = () => setDb(slider.valueAsNumber);

for (const d of [-6, -1, -0.1, 0.1, 1, 6]) {
  const b = document.createElement("button");
  b.textContent = `${d > 0 ? "+" : "−"}${Math.abs(d)} dB`;
  b.onclick = () => setDb(cur() + d);
  $("steps").append(b);
}
const mute = document.createElement("button");
mute.textContent = "Silenciar";
mute.onclick = () => setDb(MIN_DB);
$("steps").append(mute);

const keys: Record<string, () => void> = {
  ArrowRight: () => { selected = Math.min(session.serie.cantidad, selected + 1); paint(); },
  ArrowLeft: () => { selected = Math.max(1, selected - 1); paint(); },
  ArrowUp: () => setDb(cur() + 1),
  ArrowDown: () => setDb(cur() - 1),
};
// Las flechas solo actúan con el foco dentro del sintetizador, para no bloquear el scroll de la página.
document.addEventListener("keydown", e => {
  const k = keys[e.key], t = e.target as HTMLElement;
  if (!k || !root.contains(t) || t.tagName === "INPUT") return;
  e.preventDefault();
  k();
});

freq.addEventListener("input", e => {
  const f = (e.target as HTMLInputElement).valueAsNumber;
  if (f >= 20) { session.cambiarFrecuencia(f); sync(); }
});
$("count").addEventListener("input", e => {
  const n = (e.target as HTMLInputElement).valueAsNumber;
  if (Number.isInteger(n) && n >= 1 && n <= HarmonicSeries.MAX_HARMONICS) {
    session.cambiarCantidad(n);
    selected = Math.min(selected, n);
    sync();
  }
});

// ---------- Envolvente ADSR ----------
type Control = { campo: CampoEnvolvente; nombre: string; min: number; max: number; log: boolean };
const CONTROLES: Control[] = [
  { campo: "ataque", nombre: "Ataque", min: 0.001, max: 3, log: true },
  { campo: "decaimiento", nombre: "Decaimiento", min: 0.005, max: 3, log: true },
  { campo: "sostenimiento", nombre: "Sostenimiento", min: 0, max: 1, log: false },
  { campo: "relajacion", nombre: "Relajación", min: 0.005, max: 5, log: true },
];
// Los tiempos usan un slider logarítmico: 5 ms y 500 ms deben ser igual de fáciles de ajustar.
const aValor = (c: Control, x: number) => (c.log ? c.min * (c.max / c.min) ** x : x);
const aPos = (c: Control, v: number) => Math.min(1, Math.max(0, c.log ? Math.log(v / c.min) / Math.log(c.max / c.min) : v));
const formato = (c: Control, v: number) =>
  c.campo === "sostenimiento" ? `${Math.round(v * 100)} %` : v < 1 ? `${Math.round(v * 1000)} ms` : `${v.toFixed(2)} s`;

const ctrl = CONTROLES.map(c => {
  const fila = document.createElement("label");
  const out = document.createElement("output");
  const r = document.createElement("input");
  r.type = "range"; r.min = "0"; r.max = "1"; r.step = "0.001";
  r.oninput = () => { session.cambiarEnvolvente(c.campo, aValor(c, r.valueAsNumber)); pintarEnv(); };
  fila.append(c.nombre, out, r);
  $("env-controls").append(fila);
  return { c, r, out };
});

function dibujarEnv(e: Envelope) {
  const mantener = 0.5, total = e.ataque + e.decaimiento + mantener + e.relajacion; // 0.5 s de nota mantenida, solo para dibujar
  const x = (t: number) => ((t / total) * 300).toFixed(1), y = (v: number) => (76 - v * 72).toFixed(1);
  const fin = e.ataque + e.decaimiento + mantener;
  const pts = [[0, 0], [e.ataque, 1], [e.ataque + e.decaimiento, e.sostenimiento], [fin, e.sostenimiento], [total, 0]];
  $("env-svg").innerHTML =
    `<line x1="${x(fin)}" x2="${x(fin)}" y1="0" y2="80" stroke="rgba(255,255,255,.35)" stroke-dasharray="4" vector-effect="non-scaling-stroke"/>` +
    `<polyline points="${pts.map(([t, v]) => `${x(t!)},${y(v!)}`).join(" ")}" fill="none" stroke="#DD356E" stroke-width="2" vector-effect="non-scaling-stroke"/>`;
}
function pintarEnv() {
  const e = session.envolvente;
  for (const { c, r, out } of ctrl) { r.value = String(aPos(c, e[c.campo])); out.textContent = formato(c, e[c.campo]); }
  dibujarEnv(e);
}

// ---------- Teclado ----------
function tocar(midi: number) {
  ultima = midi;
  const f = frecuenciaMidi(midi);
  session.cambiarFrecuencia(f); // la fundamental sigue a la última tecla pulsada
  freq.value = f.toFixed(2);
  play.noteOn(midi, session.serie, session.envolvente);
  teclado.marcar(midi, true);
  paint();
}
function soltar(midi: number) { play.noteOff(midi); teclado.marcar(midi, false); }
function audicionar() {
  const m = ultima;
  play.noteOn(m, session.serie, session.envolvente);
  setTimeout(() => play.noteOff(m), 700);
}

const teclado = new Keyboard($("piano"), tocar, soltar);
function dibujarTeclado() {
  teclado.render(base);
  $("rango").textContent = `${nombreNota(base)} – ${nombreNota(base + 24)}`;
}
$("oct-down").onclick = () => { base = Math.max(24, base - 12); dibujarTeclado(); };
$("oct-up").onclick = () => { base = Math.min(84, base + 12); dibujarTeclado(); };
$("stop").onclick = () => { play.stopAll(); held.clear(); teclado.limpiar(); };

const TECLAS = "zsxdcvgbhnjmq2w3er5t6y7ui"; // 25 teclas: de base a base + 24
const esCampo = (t: EventTarget | null) =>
  (t instanceof HTMLInputElement && t.type !== "range") || t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement;
document.addEventListener("keydown", e => {
  const k = e.key.toLowerCase(), i = TECLAS.indexOf(k);
  if (k.length !== 1 || i < 0 || e.repeat || e.ctrlKey || e.metaKey || e.altKey || esCampo(e.target) || held.has(k)) return;
  held.set(k, base + i);
  tocar(base + i);
});
document.addEventListener("keyup", e => {
  const k = e.key.toLowerCase(), m = held.get(k);
  if (m === undefined) return;
  held.delete(k);
  soltar(m);
});
window.addEventListener("blur", () => { held.forEach(m => soltar(m)); held.clear(); });

// ---------- Presets ----------
factoryPresets(1).forEach((p, i) => {
  const b = document.createElement("button");
  b.textContent = p.nombre;
  b.onclick = () => {
    session.cargar(factoryPresets(session.serie.cantidad, session.serie.frecuenciaFundamental)[i]!);
    sync();
    pintarEnv();
    audicionar();
  };
  $("presets").append(b);
});

paint();
pintarEnv();
dibujarTeclado();
