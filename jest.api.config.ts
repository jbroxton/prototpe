import type { Config } from 'jest';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Ensure both __tests__ and tests/* patterns are covered
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.js',
    '**/__tests__/**/*.test.tsx',
    '**/tests/**/*.test.ts',
    '**/tests/**/*.test.js',
    '**/tests/**/*.test.tsx',
  ],
  // Make sure TS tests in tests/ are transformed
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
      },
    }],
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'app/api/**/*.{ts,tsx}',
    '!app/api/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testTimeout: 30000,
  verbose: true,
  setupFiles: ['<rootDir>/jest.setup.ts'],
};

export default config;
