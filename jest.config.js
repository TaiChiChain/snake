module.exports = {
    clearMocks: true,
    moduleFileExtensions: ['js', 'ts'],
    testMatch: ['**/*.test.ts'],
    testTimeout: 1000 * 30,
    transform: {
        '^.+\\.ts$': 'ts-jest'
    },
    verbose: true
}
