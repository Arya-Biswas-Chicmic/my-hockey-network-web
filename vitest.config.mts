import { defineConfig, configDefaults } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./apps/web/src', import.meta.url)),
    },
  },
  test: {
    // Playwright owns apps/web/e2e/**; its `test`/`expect` aren't Vitest's,
    // so Vitest must not try to collect those files as unit/integration specs.
    exclude: [...configDefaults.exclude, '**/apps/web/e2e/**'],
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
        'apps/web/src/platform/auth-storage.ts',
        'apps/web/src/query/query-client.ts',
        'apps/web/src/utils/guardianUtils.ts',
        'apps/web/src/utils/mediaUtils.ts',
        'apps/web/src/utils/toast.ts',
      ],
      thresholds: { lines: 80, functions: 80, statements: 80, branches: 80 },
    },
  },
});
