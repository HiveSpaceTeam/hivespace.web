import { resolve, dirname } from 'node:path'
import { realpathSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// This file lives at packages/vite-config/index.js.
// Go up two levels to reach the monorepo workspace root.
const workspaceRoot = resolve(dirname(realpathSync(fileURLToPath(import.meta.url))), '../..')

/**
 * Returns the standard Vite alias array for all HiveSpace apps.
 *
 * Includes:
 *  - `@hivespace/shared` → packages/shared/src/index.ts  (exact RegExp so
 *    subpath imports like `@hivespace/shared/theme.css` resolve via the
 *    pnpm symlink's `exports` field)
 *  - `@hivespace/demo`   → packages/demo/src/index.ts (same exact-match)
 *
 * Usage in vite.config.ts:
 * ```ts
 * import { workspaceAliases } from '@hivespace/vite-config'
 *
 * export default defineConfig({
 *   resolve: {
 *     alias: [
 *       { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
 *       ...workspaceAliases(),
 *     ],
 *   },
 * })
 * ```
 *
 * @returns {import('vite').Alias[]}
 */
export function workspaceAliases() {
  return [
    {
      // Exact match only — subpath imports (e.g. @hivespace/shared/theme.css)
      // fall through to the pnpm symlink and resolve via package.json#exports.
      find: /^@hivespace\/shared$/,
      replacement: resolve(workspaceRoot, 'packages/shared/src/index.ts'),
    },
    {
      find: /^@hivespace\/demo$/,
      replacement: resolve(workspaceRoot, 'packages/demo/src/index.ts'),
    },
  ]
}
