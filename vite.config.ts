import { svelteTesting } from '@testing-library/svelte/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    projects: [{
      extends: './vite.config.ts',
      plugins: [svelteTesting()],
      test: {
        name: 'frontend',
        environment: 'jsdom',
        clearMocks: true,
        include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
        exclude: ['src/lib/server/**'],
        setupFiles: ['./vitest-setup-client.ts']
      }
    },
    {
      extends: true,
      plugins: [],
      test: {}
    }]
  }
});