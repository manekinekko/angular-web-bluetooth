module.exports = {
  displayName: "angular-web-bluetooth-starter",
  setupFilesAfterEnv: ["<rootDir>/test-setup.ts"],
  modulePathIgnorePatterns: ["dist/*"],
  moduleNameMapper: {
    "@manekinekko/(.+)": "<rootDir>/projects/manekinekko/$1/src/public_api.ts",
  },
};
