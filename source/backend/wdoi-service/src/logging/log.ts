export const CLASSES_LOG_STEP = 100_000;
export const PROPERTIES_LOG_STEP = 1_000;

export const envToLogger: any = {
  development: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
  production: true,
  test: false,
};

export function tryLog(i: number, step: number): void {
  if (i % step === 0) {
    log(i);
  }
}

export function log(message: any): void {
  console.log(message);
}
