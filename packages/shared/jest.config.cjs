/* eslint-disable @typescript-eslint/no-require-imports */
const { createJestConfig } = require('../../jest.base.cjs')

module.exports = createJestConfig({
  rootDir: __dirname,
  tsconfig: '<rootDir>/tsconfig.json',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@hivespace/shared$': '<rootDir>/src/internal.ts',
  },
})
