// backend/jest.config.ts

import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // ソースコードを探すルート
  rootDir: './src',
  moduleFileExtensions: ['ts', 'js', 'json'],
  // TS のエイリアス @/... を解決
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // TypeScript を ts-jest でトランスフォーム
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  // テストファイルパターン
  testMatch: ['**/*.spec.ts'],
};

export default config;
