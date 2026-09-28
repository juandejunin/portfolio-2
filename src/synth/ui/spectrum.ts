import type { HarmonicSeries } from "../domain";
import { MIN_DB, ampADb } from "./amplitude-scale";

export class Spectrum {
  constructor(private root: HTMLElement, private onSelect: (orden: number) => void) {}

  render(s: HarmonicSeries, selected: number) {
    this.root.replaceChildren(...s.armonicos.map(h => {
      const db = ampADb(h.amplitud);
      const bar = document.createElement("div");
      bar.className = "bar" + (h.orden === selected ? " selected" : "") + (s.audible(h.orden) ? "" : " inaudible");
      bar.title = `Armónico ${h.orden}: ${db.toFixed(1)} dB`;
      const track = document.createElement("div");
      track.className = "track";
      const fill = document.createElement("div");
      fill.className = "fill";
      fill.style.height = `${((db - MIN_DB) / -MIN_DB) * 100}%`;
      track.append(fill);
      const label = document.createElement("span");
      label.textContent = h.orden === 1 || h.orden % 4 === 0 ? String(h.orden) : "\u00a0";
      bar.append(track, label);
      bar.onclick = () => this.onSelect(h.orden);
      return bar;
    }));
  }
}
