module.exports = {
    clearMocks: true,
    moduleFileExtensions: ['js', 'ts'],
    testMatch: ['**/*.test.ts'],
    testTimeout: 1000 * 60,
    transform: {
        '^.+\\.ts$': 'ts-jest'
    },
    verbose: true
}
