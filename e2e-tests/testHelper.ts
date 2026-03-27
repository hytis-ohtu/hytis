import { test as base } from "@playwright/test";

export const test = base.extend<{ forEachTest: void }>({
  forEachTest: [
    async ({ page, request }, use) => {
      // This code runs before every test.
      await request.post("http://localhost:3000/api/testing/reset");
      await page.goto("");
      await page.waitForSelector(".room-group");

      await use();
      // This code runs after every test.
    },
    { auto: true },
  ], // automatically starts for every test.
});
