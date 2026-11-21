const ENCODED_UTF8_SEQUENCE =
  /%(?:C[2-DF]|E[0-9A-F]|F[0-4])%[89AB][0-9A-F]/i

export const decodeProductHandle = (handle: string) =>
  ENCODED_UTF8_SEQUENCE.test(handle) ? decodeURIComponent(handle) : handle
