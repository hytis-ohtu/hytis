import { expect, Page } from "@playwright/test";
import { test } from "./testHelper";

test.use({ viewport: { width: 1920, height: 1080 } });

async function openEditRoomModal(page: Page) {
  await page.locator('[data-room="A210"]').click();
  await page.waitForSelector(".room-details-button", { state: "visible" });
  await page.locator('[data-testid="edit-room-button"]').click();
}

async function fillRoomFields(page: Page) {
  await page.getByLabel("Kapasiteetti:").fill("10");
  await page.getByLabel("Huonetyyppi:").selectOption({ index: 2 });
  await page.getByLabel("Osasto:").selectOption({ index: 1 });
  await page.getByLabel("Lisätiedot:").fill("Lisätietoja huoneesta");
}

test("edit room modal can be opened", async ({ page }) => {
  await openEditRoomModal(page);
  await expect(
    page.getByRole("heading", { name: "Muokkaa huonetta" }),
  ).toBeVisible();
});

test("confirming close dismisses modal", async ({ page }) => {
  await openEditRoomModal(page);
  await page.locator(".roommodal-close-button").click();
  await page.getByText("Kyllä").click();
  await expect(
    page.getByRole("heading", { name: "Muokkaa huonetta" }),
  ).not.toBeVisible();
});

test("cancelling close keeps modal open", async ({ page }) => {
  await openEditRoomModal(page);
  await page.locator(".roommodal-close-button").click();
  await page.getByText("Peruuta").click();
  await expect(
    page.getByRole("heading", { name: "Muokkaa huonetta" }),
  ).toBeVisible();
});

test("form fields are pre-populated with existing room values", async ({
  page,
}) => {
  await openEditRoomModal(page);
  await expect(page.getByLabel("Kapasiteetti:")).not.toHaveValue("");
});

test("save button triggers confirmation dialog", async ({ page }) => {
  await openEditRoomModal(page);
  await page.locator(".roommodal-save-button").click();
  await expect(page.getByText("Tallenna muutokset?")).toBeVisible();
});

test("cancelling save confirmation keeps modal open", async ({ page }) => {
  await openEditRoomModal(page);
  await page.locator(".roommodal-save-button").click();
  await page.getByText("Peruuta").click();
  await expect(
    page.getByRole("heading", { name: "Muokkaa huonetta" }),
  ).toBeVisible();
});

test("confirming save after editing fields closes modal", async ({ page }) => {
  await openEditRoomModal(page);
  await fillRoomFields(page);
  await page.locator(".roommodal-save-button").click();
  await page
    .locator(".confirmation-modal")
    .getByRole("button", { name: "Tallenna" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Muokkaa huonetta" }),
  ).not.toBeVisible();
});

test("saved changes are reflected in room info after modal closes", async ({
  page,
}) => {
  await openEditRoomModal(page);
  await page.getByLabel("Huonetyyppi:").selectOption({ label: "Työhuone" });
  await page.locator(".roommodal-save-button").click();
  await page
    .locator(".confirmation-modal")
    .getByRole("button", { name: "Tallenna" })
    .click();
  await expect(page.getByText("Työhuone")).toBeVisible();
});
