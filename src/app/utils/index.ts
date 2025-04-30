export function stringifyError(err: unknown): string {
  if (typeof err === 'string') {
    return err;
  }

  if (typeof err === 'object' && err !== null) {
    if ('message' in err && typeof err.message === 'string') {
      return err.message;
    }
  }

  throw err;
}
