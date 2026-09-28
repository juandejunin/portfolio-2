const NOMBRES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

/** Frecuencia de una nota MIDI en afinación temperada (69 = La4 = 440 Hz). */
export const frecuenciaMidi = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

export const nombreNota = (midi: number) => `${NOMBRES[midi % 12]}${Math.floor(midi / 12) - 1}`;
