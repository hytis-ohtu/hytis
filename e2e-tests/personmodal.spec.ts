import { expect, Page } from "@playwright/test";
import { test } from "./testHelper";

test.use({ viewport: { width: 1920, height: 1080 } });

async function openAddPersonModal(page: Page) {
  await page.locator('[data-room="A210"]').click();
  await page.waitForSelector(".room-details-button", { state: "visible" });
  await page.getByRole("button", { name: "Lisää henkilö" }).click();
}

async function fillRequiredFields(page: Page) {
  await page.getByLabel("Etunimi:").fill("Matti");
  await page.getByLabel("Sukunimi:").fill("Meikäläinen");
  await page.getByLabel("Osasto:").selectOption({ index: 1 });
  await page.getByLabel("Työnimike:").selectOption({ index: 1 });
  await page.getByLabel("Esihenkilö(t):").fill("Joku");
  await page.getByLabel("Sopimuksen alku:").fill("2025-01-01");
  await page.getByLabel("Sopimuksen loppu:").fill("2026-01-01");
}

async function searchAndSelectExistingPerson(page: Page, name: string) {
  await page.getByLabel("Hae henkilö:").fill(name);
  await page.waitForSelector(".personform-person-option");
  await page.locator(".personform-person-option").first().click();
}

async function saveAndConfirmPerson(page: Page) {
  await page
    .locator(".personmodal-actions")
    .getByRole("button", { name: "Lisää", exact: true })
    .click();
  await page
    .locator(".confirmation-modal")
    .getByRole("button", { name: "Tallenna" })
    .click();
}

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

test("dropdowns can be selected", async ({ page }) => {
  await openAddPersonModal(page);
  await page.getByLabel("Osasto:").selectOption({ index: 1 });
  await page.getByLabel("Työnimike:").selectOption({ index: 1 });
  await page.getByLabel("Tutkimusryhmä:").selectOption({ index: 1 });
  await expect(page.getByLabel("Osasto:")).not.toHaveValue("");
  await expect(page.getByLabel("Työnimike:")).not.toHaveValue("");
  await expect(page.getByLabel("Tutkimusryhmä:")).not.toHaveValue("");
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
  await saveAndConfirmPerson(page);
  await expect(
    page.getByRole("heading", { name: "Lisää henkilö" }),
  ).not.toBeVisible();
});

test("searching for existing person returns matching results", async ({
  page,
}) => {
  await openAddPersonModal(page);
  await page.getByLabel("Hae henkilö:").fill("Ah");
  await page.waitForSelector(".personform-person-option");
  await expect(page.locator(".personform-person-option")).toHaveCount(1);
  await expect(page.locator(".personform-person-option")).toContainText(
    "Ahmed Ali",
  );
});

test("selecting existing person populates person form fields", async ({
  page,
}) => {
  await openAddPersonModal(page);
  await searchAndSelectExistingPerson(page, "Ah");
  await expect(page.getByLabel("Etunimi:")).toHaveValue("Ahmed");
  await expect(page.getByLabel("Sukunimi:")).toHaveValue("Ali");
  await expect(page.getByLabel("Osasto:")).toContainText("H523 CS");
  await expect(page.getByLabel("Työnimike:")).toContainText("professori");

  const supervisorTag = page.locator(".personform-supervisor-tag");

  await expect(supervisorTag).toHaveCount(1);
  await expect(supervisorTag).toContainText("Päivi Koskinen");
});

test("existing person form fields are read-only except contract dates", async ({
  page,
}) => {
  await openAddPersonModal(page);
  await searchAndSelectExistingPerson(page, "Ah");
  await expect(page.getByLabel("Etunimi:")).toBeDisabled();
  await expect(page.getByLabel("Sukunimi:")).toBeDisabled();
  await expect(page.getByLabel("Osasto:")).toBeDisabled();
  await expect(page.getByLabel("Työnimike:")).toBeDisabled();

  const supervisorTag = page.locator(".personform-supervisor-tag").first();
  await expect(supervisorTag.locator("button")).toBeDisabled();

  await expect(page.getByLabel("Sopimuksen alku:")).toBeEnabled();
  await expect(page.getByLabel("Sopimuksen loppu:")).toBeEnabled();
});

test("selecting existing person enables save button", async ({ page }) => {
  await openAddPersonModal(page);
  await searchAndSelectExistingPerson(page, "Ah");
  await expect(
    page.getByRole("button", { name: "Lisää", exact: true }),
  ).toBeEnabled();
});

test("saving existing person without contract dates closes the modal and persists person", async ({
  page,
}) => {
  await openAddPersonModal(page);
  await searchAndSelectExistingPerson(page, "Ah");
  await saveAndConfirmPerson(page);
  await expect(
    page.getByRole("heading", { name: "Lisää henkilö" }),
  ).not.toBeVisible();
  await expect(
    page.locator(".person-name", { hasText: "Ahmed Ali" }),
  ).toBeVisible();
});

test("saving existing person with contract dates closes the modal and persists person", async ({
  page,
}) => {
  await openAddPersonModal(page);
  await searchAndSelectExistingPerson(page, "Ah");
  await page.getByLabel("Sopimuksen alku:").fill("2025-06-01");
  await page.getByLabel("Sopimuksen loppu:").fill("2026-06-01");
  await saveAndConfirmPerson(page);
  await expect(
    page.getByRole("heading", { name: "Lisää henkilö" }),
  ).not.toBeVisible();

  const personItem = page.locator("details", {
    has: page.locator(".person-name", { hasText: "Ahmed Ali" }),
  });
  await expect(personItem).toContainText("Alkupvm: 2025-06-01");
  await expect(personItem).toContainText("Loppupvm: 2026-06-01");
});
