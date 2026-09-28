import { describe, expect, it } from "vitest";
import { HarmonicSeries } from "./index";

describe("HarmonicSeries", () => {
  it("no redondea amplitudes muy pequeñas", () => {
    const s = HarmonicSeries.inicial(220, 64).conAmplitud(64, 1 / 64 ** 2);
    expect(s.amplitudDe(64)).toBeCloseTo(1 / 4096, 10);
  });
  it("conCantidad conserva lo existente y añade silencio", () => {
    const s = HarmonicSeries.inicial(220, 4).conAmplitud(2, 0.5).conCantidad(8);
    expect(s.cantidad).toBe(8);
    expect(s.amplitudDe(2)).toBe(0.5);
    expect(s.amplitudDe(8)).toBe(0);
  });
  it("rechaza armónicos inexistentes", () => {
    expect(() => HarmonicSeries.inicial(220, 4).conAmplitud(99, 0.5)).toThrow();
  });
});
