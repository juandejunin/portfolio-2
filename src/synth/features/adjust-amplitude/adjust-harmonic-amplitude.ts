import type { HarmonicSeries } from "../../domain";
import type { EventBus } from "../../shared/event-bus";

export type SynthEvents = {
  "harmonic-amplitude-changed": { serie: HarmonicSeries; order: number; value: number };
};

export class AdjustHarmonicAmplitude {
  constructor(private events: EventBus<SynthEvents>) {}

  execute(series: HarmonicSeries, order: number, value: number) {
    const next = series.conAmplitud(order, value);
    this.events.emit("harmonic-amplitude-changed", { serie: next, order, value });
    return next;
  }
}
