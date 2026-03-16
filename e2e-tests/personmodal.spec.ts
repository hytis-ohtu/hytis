import { test, expect, Page } from "@playwright/test";

async function openAddPersonModal(page: Page) {
  await page.locator('[data-room="A210"]').click();
  await page.waitForSelector(".room-details-button", { state: "visible" });
  await page.getByRole("button", { name: "Lisää henkilö" }).click();
}

async function fillRequiredFields(page: Page) {
  await page.getByLabel("Nimi:").fill("Matti Testaaja");
  await page.getByLabel("Osasto:").fill("IT");
  await page.getByLabel("Työnimike:").fill("Developer");
  await page.getByLabel("Esihenkilö(t):").fill("Liisa");
  await page.getByLabel("Sopimusalku:").fill("2025-01-01");
  await page.getByLabel("Sopimusloppu:").fill("2026-01-01");
}

test.beforeEach(async ({ page, request }) => {
  await request.post("http://localhost:3000/api/testing/reset");
  await page.goto("");
  await page.waitForSelector(".room-group");
});

test("person modal can be opened", async ({ page }) => {
  await openAddPersonModal(page);
  await expect(
    page.getByRole("heading", { name: "Lisää henkilö" }),
  ).toBeVisible();
});

test("close button opens confirmation dialog", async ({ page }) => {
  await openAddPersonModal(page);
  await page.locator(".personmodal-close-button").click();
  await expect(page.getByText("Sulje ilman tallennusta?")).toBeVisible();
});

test("clicking outside modal opens confirmation dialog", async ({ page }) => {
  await openAddPersonModal(page);
  await page.locator(".personmodal-overlay").dispatchEvent("click");
  await expect(page.getByText("Sulje ilman tallennusta?")).toBeVisible();
});

test("confirming close via overlay dismisses modal", async ({ page }) => {
  await openAddPersonModal(page);
  await page.locator(".personmodal-overlay").dispatchEvent("click");
  await page.getByText("Kyllä").click();
  await expect(
    page.getByRole("heading", { name: "Lisää henkilö" }),
  ).not.toBeVisible();
});

test("confirming close dismisses modal", async ({ page }) => {
  await openAddPersonModal(page);
  await page.locator(".personmodal-close-button").click();
  await page.getByText("Kyllä").click();
  await expect(
    page.getByRole("heading", { name: "Lisää henkilö" }),
  ).not.toBeVisible();
});

test("cancelling close keeps modal open", async ({ page }) => {
  await openAddPersonModal(page);
  await page.locator(".personmodal-close-button").click();
  await page.getByText("Peruuta").click();
  await expect(
    page.getByRole("heading", { name: "Lisää henkilö" }),
  ).toBeVisible();
});

test("save button is disabled when form is empty", async ({ page }) => {
  await openAddPersonModal(page);
  await expect(
    page.getByRole("button", { name: "Lisää", exact: true }),
  ).toBeDisabled();
});

test("save button is enabled when required fields are filled", async ({
  page,
}) => {
  await openAddPersonModal(page);
  await fillRequiredFields(page);
  await expect(
    page.getByRole("button", { name: "Lisää", exact: true }),
  ).toBeEnabled();
});

test("saving opens confirmation dialog", async ({ page }) => {
  await openAddPersonModal(page);
  await fillRequiredFields(page);
  await page
    .locator(".personmodal-actions")
    .getByRole("button", { name: "Lisää", exact: true })
    .click();
  await expect(page.getByText("Tallenna muutokset?")).toBeVisible();
});

test("cancelling save confirmation keeps modal open", async ({ page }) => {
  await openAddPersonModal(page);
  await fillRequiredFields(page);
  await page
    .locator(".personmodal-actions")
    .getByRole("button", { name: "Lisää", exact: true })
    .click();
  await page.getByText("Peruuta").click();
  await expect(
    page.getByRole("heading", { name: "Lisää henkilö" }),
  ).toBeVisible();
});

test("confirming save closes modal and persists person", async ({ page }) => {
  await openAddPersonModal(page);
  await fillRequiredFields(page);
  await page
    .locator(".personmodal-actions")
    .getByRole("button", { name: "Lisää", exact: true })
    .click();
  await page
    .locator(".confirmation-modal")
    .getByRole("button", { name: "Tallenna" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Lisää henkilö" }),
  ).not.toBeVisible();
});
