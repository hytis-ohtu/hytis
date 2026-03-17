export default {
  preset: "ts-jest",
  testEnvironment: "node",
  coverageProvider: "v8",
  coverageReporters: ["text", "lcov"],
  coverageDirectory: "./coverage/",
  detectOpenHandles: true,
};
