module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
      '^@libs/api-gateway$': '<rootDir>/src/libs/api-gateway.ts',
    },
};