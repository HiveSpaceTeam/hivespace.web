/* eslint-disable @typescript-eslint/no-require-imports */
const { createJestConfig } = require('../../jest.base.cjs')

module.exports = createJestConfig({
  rootDir: __dirname,
  tsconfig: '<rootDir>/tsconfig.app.json',
  moduleNameMapper: {
    '^@/config$': '<rootDir>/src/test/config-test-shim.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@hivespace/shared/test-utils$': '<rootDir>/../../packages/shared/src/test-utils/index.ts',
    '^@hivespace/shared$': '<rootDir>/src/test/shared-test-shim.ts',
    '^@hivespace/demo$': '<rootDir>/../../packages/demo/src/index.ts',
  },
})
