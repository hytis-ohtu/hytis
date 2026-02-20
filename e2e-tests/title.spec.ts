import { test, expect } from "@playwright/test";

test("title is correct", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await expect(page).toHaveTitle("Tilasijoittelujärjestelmä");
});
