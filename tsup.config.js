import { defineConfig } from 'tsup'

export default defineConfig((options) => ({
    entry: ['src/index.ts'],
    splitting: false,
    sourcemap: false,
    clean: true,
    minify: !options.watch,
}))