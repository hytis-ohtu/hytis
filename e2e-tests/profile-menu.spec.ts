import { expect, Page } from "@playwright/test";
import { test } from "./testHelper";

test("profile menu can be opened and closed", async ({ page }) => {
  await page.getByRole("button", { name: "Käyttäjä" }).click();
  await expect(page.getByText("Kirjaudu ulos")).toBeVisible();

  await page.getByRole("button", { name: /^käyttäjä$/i }).click();
  await expect(
    page.getByRole("button", { name: "Kirjaudu ulos" }),
  ).not.toBeVisible();
});

test("profile menu can be closed by clicking outside", async ({ page }) => {
  await page.getByRole("button", { name: "Käyttäjä" }).click();
  await expect(
    page.getByRole("button", { name: "Kirjaudu ulos" }),
  ).toBeVisible();

  await page.click("body", { position: { x: 0, y: 0 } });
  await expect(
    page.getByRole("button", { name: "Kirjaudu ulos" }),
  ).not.toBeVisible();
});

test("profile menu can be closed by the close button", async ({ page }) => {
  await page.getByRole("button", { name: "Käyttäjä" }).click();
  await expect(
    page.getByRole("button", { name: "Kirjaudu ulos" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Sulje käyttäjävalikko" }).click();
  await expect(
    page.getByRole("button", { name: "Kirjaudu ulos" }),
  ).not.toBeVisible();
});
