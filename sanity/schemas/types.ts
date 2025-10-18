// Type definitions for Sanity schema validation rules
export interface SanityRule {
  required: () => SanityRule;
  email: () => SanityRule;
  min: (value: number) => SanityRule;
  max: (value: number) => SanityRule;
  length: (value: number) => SanityRule;
  positive: () => SanityRule;
  integer: () => SanityRule;
  precision: (value: number) => SanityRule;
  custom: (fn: (value: unknown) => boolean | string) => SanityRule;
  error: (message: string) => SanityRule;
  warning: (message: string) => SanityRule;
}
