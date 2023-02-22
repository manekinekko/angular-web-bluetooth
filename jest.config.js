module.exports = {
  preset: 'jest-preset-angular',
  displayName: "angular-web-bluetooth-starter",
  setupFilesAfterEnv: ["<rootDir>/test-setup.ts"],
  modulePathIgnorePatterns: ["dist/*"],
  globalSetup: 'jest-preset-angular/global-setup',
  moduleNameMapper: {
    "@manekinekko/(.+)": "<rootDir>/projects/manekinekko/$1/src/public_api.ts",
  },
};
