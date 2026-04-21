import { expect } from "@playwright/test";
import { test, openSidePanel } from "./testHelper";

test.use({ viewport: { width: 1920, height: 1080 } });

test("remove button is visible for each occupant", async ({ page }) => {
  await openSidePanel(page);
  await expect(
    page.getByRole("button", { name: /poista henkilö/i }),
  ).toHaveCount(3);
});

test("removing a person removes them from the list", async ({ page }) => {
  await openSidePanel(page);
  const firstContract = page.getByRole("article").first();
  const name = await firstContract
    .getByRole("heading", { level: 3 })
    .innerText();
  await firstContract.getByRole("button", { name: /poista henkilö/i }).click();
  await page.getByRole("button", { name: /^poista$/i }).click();
  await expect(page.getByRole("article", { name })).not.toBeVisible();
});

test("cancelling deletion keeps the person in the list", async ({ page }) => {
  await openSidePanel(page);
  const firstContract = page.getByRole("article").first();
  const name = await firstContract
    .getByRole("heading", { level: 3 })
    .innerText();
  await firstContract.getByRole("button", { name: /poista henkilö/i }).click();
  await page.getByRole("button", { name: "Peruuta" }).click();
  await expect(page.getByRole("article", { name })).toBeVisible();
});
