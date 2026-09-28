import { describe, expect, it } from "vitest";
import { Envelope, frecuenciaMidi, nombreNota } from "./index";

describe("pitch", () => {
  it("La4 = 440 Hz y una octava duplica", () => {
    expect(frecuenciaMidi(69)).toBe(440);
    expect(frecuenciaMidi(81)).toBeCloseTo(880, 8);
  });
  it("nombra las notas", () => {
    expect(nombreNota(60)).toBe("C4");
    expect(nombreNota(69)).toBe("A4");
  });
});

describe("Envelope", () => {
  it("valida los rangos", () => {
    expect(() => new Envelope(0, 0.1, 0.5, 0.2)).toThrow();
    expect(() => new Envelope(0.01, 0.1, 1.5, 0.2)).toThrow();
  });
  it("con() cambia solo un campo", () => {
    const e = new Envelope(0.01, 0.1, 0.5, 0.2).con("sostenimiento", 0.9);
    expect(e.sostenimiento).toBe(0.9);
    expect(e.ataque).toBe(0.01);
  });
});
