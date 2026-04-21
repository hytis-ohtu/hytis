export default {
  preset: "ts-jest",
  testEnvironment: "node",
  coverageProvider: "v8",
  roots: ["<rootDir>/tests"],
  coverageReporters: ["text", "lcov"],
  coverageDirectory: "./coverage/",
  collectCoverageFrom: ["src/**/*.{ts,tsx}"],
  coveragePathIgnorePatterns: ["src/data/", "src/models/"],
  detectOpenHandles: true,
};
