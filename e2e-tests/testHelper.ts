import { Page, test as base } from "@playwright/test";

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

export async function openSidePanel(page: Page) {
  await page.locator('[data-room="A210"]').click();
  await page.waitForSelector(".room-details-button", { state: "visible" });
}
