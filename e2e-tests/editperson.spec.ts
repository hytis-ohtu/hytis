import { expect, Page } from "@playwright/test";
import { test } from "./testHelper";

test.use({ viewport: { width: 1920, height: 1080 } });

async function openSidePanel(page: Page) {
  await page.locator('[data-room="A210"]').click();
  await page.waitForSelector(".room-details-button", { state: "visible" });
}

test("edit person button is visible for each room occupant", async ({
  page,
}) => {
  await openSidePanel(page);
  const editButtons = page.locator(".edit-person-button");

  const count = await editButtons.count();
  for (let i = 0; i < count; i++) {
    await expect(editButtons.nth(i)).toBeVisible();
  }
});
