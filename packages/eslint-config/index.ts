import type { Linter } from 'eslint'
export { default as iconsIndexPlugin } from './icons-index.plugin'

const APP_PACKAGES = [
  { app: 'admin',      pkg: '@hivespace/admin' },
  { app: 'seller',     pkg: '@hivespace/seller' },
  { app: 'buyer', pkg: '@hivespace/buyer' },
] as const

const crossAppRestrictions: Linter.Config[] = APP_PACKAGES.map(({ app, pkg }) => ({
  files: [`apps/${app}/**`],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: APP_PACKAGES
        .filter(entry => entry.pkg !== pkg)
        .flatMap(({ pkg: otherPkg }) => [
          {
            group: [otherPkg, `${otherPkg}/*`],
            message: 'Cross-app imports are not allowed. Move shared code to @hivespace/shared.',
          },
          {
            group: [`**/apps/${otherPkg.split('/')[1]}/**`],
            message: 'Cross-app source imports are not allowed. Move shared code to @hivespace/shared.',
          },
        ]),
    }],
  },
}))

const sharedRestrictions: Linter.Config = {
  files: ['packages/shared/**'],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: APP_PACKAGES.flatMap(({ pkg, app }) => [
        {
          group: [pkg, `${pkg}/*`, `**/apps/${app}/**`],
          message: 'Shared code must not depend on app-specific code.',
        },
      ]),
    }],
  },
}

const ignoreCommonJs: Linter.Config = {
  ignores: ['**/*.cjs'],
}

export default [ignoreCommonJs, ...crossAppRestrictions, sharedRestrictions]
