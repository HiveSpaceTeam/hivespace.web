const path = require('node:path')

const createJestConfig = ({ rootDir, tsconfig, moduleNameMapper = {}, transformIgnorePatterns = [] }) => ({
  rootDir,
  clearMocks: true,
  restoreMocks: true,
  coverageProvider: 'v8',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'vue'],
  moduleNameMapper: {
    '^.+\\.(css|less|sass|scss)$': path.resolve(__dirname, 'test/styleMock.js'),
    '^.+\\.(png|jpg|jpeg|gif|svg|webp|avif)$': path.resolve(__dirname, 'test/fileMock.js'),
    '^@intlify/shared$': require.resolve('@intlify/shared/dist/shared.cjs.js'),
    '^@intlify/core-base$': require.resolve('@intlify/core-base/dist/core-base.cjs.js'),
    '^@intlify/message-compiler$': require.resolve(
      '@intlify/message-compiler/dist/message-compiler.cjs.js',
    ),
    '^vue-i18n$': require.resolve('vue-i18n/dist/vue-i18n.cjs.js'),
    '^vue-final-modal$': path.resolve(__dirname, 'test/vueFinalModalMock.js'),
    '^vue3-apexcharts$': path.resolve(__dirname, 'test/vueComponentMock.js'),
    '^@fullcalendar/vue3$': path.resolve(__dirname, 'test/vueComponentMock.js'),
    '^vue-flatpickr-component$': path.resolve(__dirname, 'test/vueComponentMock.js'),
    '^swiper/vue$': path.resolve(__dirname, 'test/vueComponentMock.js'),
    ...moduleNameMapper,
  },
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  setupFilesAfterEnv: [path.resolve(__dirname, 'test/jest.setup.ts')],
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost/',
  },
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        diagnostics: false,
        tsconfig,
        useESM: true,
      },
    ],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(.*\\.mjs$|@vue|vue-router|vue-i18n|pinia|@hivespace/shared)/)',
    ...transformIgnorePatterns,
  ],
})

module.exports = {
  createJestConfig,
}
