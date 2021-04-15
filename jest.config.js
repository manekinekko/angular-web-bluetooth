module.exports = {
  displayName: 'angular-web-bluetooth-starter',
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
  testPathIgnorePatterns: ['<rootDir>/projects/'],
  modulePathIgnorePatterns: [
    "dist/*"
  ],
  moduleNameMapper: {
    "@manekinekko/(.+)": '<rootDir>/projects/manekinekko/$1/src/public_api.ts'
  }
}
