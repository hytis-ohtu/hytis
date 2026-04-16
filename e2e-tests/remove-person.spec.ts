import { expect, Page } from "@playwright/test";
import { test } from "./testHelper";

test.use({ viewport: { width: 1920, height: 1080 } });

async function openSidePanel(page: Page) {
  await page.locator('[data-room="A210"]').click();
  await page.waitForSelector(".room-details-button", { state: "visible" });
}

test("remove button is visible for each occupant", async ({ page }) => {
  await openSidePanel(page);
  await expect(page.locator(".remove-person-button").first()).toBeVisible();
});

test("confirming remove removes the person from the list", async ({ page }) => {
  await openSidePanel(page);
  const name = await page.locator("details .person-name").first().innerText();
  await page.locator(".remove-person-button").first().click();
  await page.getByRole("button", { name: "Poista" }).click();
  await expect(
    page.locator(".person-name", { hasText: name }),
  ).not.toBeVisible();
});

test("cancelling remove keeps the person in the list", async ({ page }) => {
  await openSidePanel(page);
  const name = await page.locator("details .person-name").first().innerText();
  await page.locator(".remove-person-button").first().click();
  await page.getByRole("button", { name: "Peruuta" }).click();
  await expect(page.locator(".person-name", { hasText: name })).toBeVisible();
});
