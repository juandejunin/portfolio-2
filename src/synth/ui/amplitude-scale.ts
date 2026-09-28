/** Escala del slider: dB, porque el oído percibe la amplitud de forma logarítmica. */
export const MIN_DB = -100;
export const dbAAmp = (db: number) => (db <= MIN_DB ? 0 : Math.min(1, 10 ** (db / 20)));
export const ampADb = (a: number) => (a <= 0 ? MIN_DB : Math.max(MIN_DB, 20 * Math.log10(a)));
