import { expect } from "@playwright/test";
import { test, openSidePanel } from "./testHelper";

test.use({ viewport: { width: 1920, height: 1080 } });

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

test("edit person modal opens when edit button is clicked", async ({
  page,
}) => {
  await openSidePanel(page);
  await page.locator(".edit-person-button").first().click();
  await expect(page.locator(".personmodal-overlay")).toBeVisible();
  await expect(page.locator(".personmodal-content")).toBeVisible();
});
