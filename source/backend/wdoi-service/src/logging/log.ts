export const CLASSES_LOG_STEP = 100_000;
export const PROPERTIES_LOG_STEP = 1_000;

export function tryLog(i: number, step: number): void {
  if (i % step === 0) {
    console.log(i);
  }
}

export function log(message: string): void {
  console.log(message);
}
