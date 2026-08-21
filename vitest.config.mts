import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: 'coverage',
      include: [
        'packages/api-client/src/index.ts',
        'packages/auth/src/index.ts',
        'packages/domain/src/index.ts',
        'packages/validation/src/index.ts',
        'packages/core/src/api/signUpRules.ts',
      ],
      thresholds: { lines: 80, functions: 80, statements: 80, branches: 80 },
    },
  },
});
