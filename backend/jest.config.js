export default {
  preset: "ts-jest",
  testEnvironment: "node",
  coverageProvider: "v8",
  coverageReporters: ["text", "lcov"],
  coverageDirectory: "./coverage/",
  collectCoverageFrom: ["src/**/*.{ts,tsx}"],
  detectOpenHandles: true,
};
