import { nombreNota } from "../domain";

const NEGRAS = new Set([1, 3, 6, 8, 10]);

/** Teclado de piano dibujado con divs; notas MIDI consecutivas desde `base`. */
export class Keyboard {
  private teclas = new Map<number, HTMLElement>();

  constructor(private root: HTMLElement, private onDown: (midi: number) => void, private onUp: (midi: number) => void) {}

  render(base: number, total = 25) {
    this.teclas.clear();
    let blancas = 0;
    this.root.replaceChildren(...Array.from({ length: total }, (_, i) => {
      const midi = base + i, negra = NEGRAS.has(midi % 12);
      const el = document.createElement("div");
      el.className = `key ${negra ? "black" : "white"}`;
      if (negra) el.style.left = `calc(${blancas} * var(--w) - var(--w) * 0.3)`;
      else { blancas++; if (midi % 12 === 0) el.textContent = nombreNota(midi); }
      let pulsada = false;
      const soltar = () => { if (pulsada) { pulsada = false; this.onUp(midi); } };
      el.onpointerdown = e => { e.preventDefault(); pulsada = true; this.onDown(midi); };
      el.onpointerup = soltar;
      el.onpointerleave = soltar;
      el.onpointercancel = soltar;
      this.teclas.set(midi, el);
      return el;
    }));
  }

  marcar(midi: number, activa: boolean) { this.teclas.get(midi)?.classList.toggle("active", activa); }
  limpiar() { this.teclas.forEach(el => el.classList.remove("active")); }
}
