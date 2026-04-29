import { Locator } from "@playwright/test";
import { test } from "./testHelper";

test.use({
  // video: { mode: "on", size: { width: 3840, height: 2160 } },
  viewport: { width: 3840, height: 2160 },
  headless: false,
});

test("demo", async ({ page }) => {
  test.setTimeout(0);

  const hoverClick = async (locator: Locator, delay = 300) => {
    await locator.hover();
    await page.waitForTimeout(delay);
    await locator.click();
  };

  await page.waitForTimeout(10000);

  // Toggle color
  await hoverClick(page.getByRole("button", { name: "Vastuualueet" }));
  await page.waitForTimeout(2000);
  await hoverClick(page.getByRole("button", { name: "Varaustila" }));
  await page.waitForTimeout(2000);

  // Zoom the map in and out with buttons
  const zoomInButton = page.getByRole("button", { name: "Suurenna" });
  const zoomOutButton = page.getByRole("button", { name: "Loitonna" });

  for (let i = 0; i < 4; i++) {
    await zoomInButton.click();
    await page.waitForTimeout(250);
  }

  for (let i = 0; i < 4; i++) {
    await zoomOutButton.click();
    await page.waitForTimeout(250);
  }

  await page.waitForTimeout(1500);

  // Zoom in and out with scroll wheel
  const inputContainer = page.getByTestId("input-container");
  await inputContainer.hover();

  // Zoom in
  for (let i = 0; i < 4; i++) {
    await page.mouse.wheel(0, -240);
    await page.waitForTimeout(100);
  }

  await page.waitForTimeout(1500);

  // Zoom out
  for (let i = 0; i < 4; i++) {
    await page.mouse.wheel(0, 240);
    await page.waitForTimeout(100);
  }

  await page.waitForTimeout(1500);

  // Zoom the map in with buttons
  for (let i = 0; i < 4; i++) {
    await zoomInButton.click();
    await page.waitForTimeout(250);
  }

  await page.waitForTimeout(1500);

  // Drag the map with the mouse
  await inputContainer.hover();
  const inputBox = await inputContainer.boundingBox();

  if (!inputBox) {
    throw new Error("Input container has no bounding box");
  }

  // Move 1
  await page.mouse.move(inputBox.x + 10, inputBox.y + inputBox.height * 0.95);
  await page.mouse.down();
  await page.mouse.move(
    inputBox.x + inputBox.width * 0.7,
    inputBox.y + inputBox.height * 0.6,
    { steps: 100 },
  );
  await page.mouse.up();

  await page.waitForTimeout(500);

  // Move 2
  await page.mouse.move(
    inputBox.x + inputBox.width * 0.95,
    inputBox.y + inputBox.height * 0.95,
  );
  await page.mouse.down();
  await page.mouse.move(
    inputBox.x + inputBox.width * 0.2,
    inputBox.y + inputBox.height * 0.7,
    { steps: 100 },
  );
  await page.mouse.up();

  await page.waitForTimeout(500);

  // Move 3
  await page.mouse.move(inputBox.x + inputBox.width * 0.5, inputBox.y + 10);
  await page.mouse.down();
  await page.mouse.move(
    inputBox.x + inputBox.width * 0.4,
    inputBox.y + inputBox.height * 0.95,
    { steps: 100 },
  );
  await page.mouse.up();

  await page.waitForTimeout(500);

  // Move 4
  await page.mouse.move(inputBox.x + inputBox.width * 0.6, inputBox.y + 10);
  await page.mouse.down();
  await page.mouse.move(
    inputBox.x + inputBox.width * 0.3,
    inputBox.y + inputBox.height * 0.5,
    { steps: 100 },
  );
  await page.mouse.up();

  await page.waitForTimeout(2000);

  // Edit room details
  await hoverClick(page.locator('[id="1"]'));
  await page.waitForTimeout(4000);
  await hoverClick(
    page.getByRole("button", { name: "Muokkaa huoneen tietoja" }),
  );
  await page.waitForTimeout(1000);
  await page.getByLabel("Huonetyyppi").selectOption("2");
  await page.waitForTimeout(1000);
  await page.getByLabel("Osasto").selectOption("1");
  await page.waitForTimeout(1000);
  await page.getByRole("spinbutton", { name: "Kapasiteetti" }).click();
  await page.getByRole("spinbutton", { name: "Kapasiteetti" }).fill("10");
  await page.waitForTimeout(1000);
  await hoverClick(page.getByRole("button", { name: "Tallenna" }));
  await page.waitForTimeout(1000);
  await hoverClick(
    page
      .getByRole("alertdialog", { name: "Tallenna muutokset?" })
      .getByRole("button", { name: "Tallenna" }),
  );

  await page.waitForTimeout(4000);

  // Edit person details
  await page
    .getByRole("article", { name: "Virtanen Matti" })
    .getByLabel("Avaa henkilön tiedot")
    .click();
  await page.waitForTimeout(1500);
  await page
    .getByRole("article", { name: "Virtanen Matti" })
    .getByLabel("Muokkaa henkilön tietoja")
    .click();
  await page.waitForTimeout(1500);
  await hoverClick(page.getByRole("textbox", { name: "Esihenkilö(t)" }));
  await page.waitForTimeout(1000);
  await hoverClick(page.getByRole("option", { name: "Lars Andersson" }));
  await page.waitForTimeout(1000);
  await page.getByLabel("Osasto").selectOption("2");
  await page.waitForTimeout(1000);
  await page
    .getByRole("textbox", { name: "Sopimuksen alku" })
    .fill("2023-05-01");
  await page.waitForTimeout(1000);
  await hoverClick(page.getByRole("button", { name: "Tallenna" }));
  await page.waitForTimeout(1500);
  await hoverClick(
    page
      .getByLabel("Tallenna muutokset?")
      .getByRole("button", { name: "Tallenna" }),
  );
  await page.waitForTimeout(4000);

  // Open and close room info and people
  await hoverClick(page.getByRole("button", { name: "Sulje huoneen tiedot" }));
  await page.waitForTimeout(1000);
  await hoverClick(
    page.getByRole("button", { name: "Sulje huoneen henkilöt" }),
  );
  await page.waitForTimeout(1000);
  await hoverClick(page.getByRole("button", { name: "Avaa huoneen tiedot" }));
  await page.waitForTimeout(1000);
  await hoverClick(page.getByRole("button", { name: "Avaa huoneen henkilöt" }));
  await page.waitForTimeout(2000);

  // Select another room on the map
  await hoverClick(page.locator('[id="2"]'));
  await page.waitForTimeout(4000);
  await hoverClick(
    page.getByRole("button", { name: "Sulje huone", exact: true }),
  );
  await page.waitForTimeout(2000);

  // Search by name
  await hoverClick(page.getByRole("button", { name: "Hakutyyppi" }));
  await page.waitForTimeout(1000);
  await hoverClick(page.getByRole("menuitemradio", { name: "Esihenkilö" }));
  await page.waitForTimeout(1000);
  await hoverClick(page.getByRole("button", { name: "Hakutyyppi" }));
  await page.waitForTimeout(1000);
  await hoverClick(
    page.getByRole("menuitemradio", { name: "Sopimuksen päättymispäivä" }),
  );
  await page.waitForTimeout(1000);
  await hoverClick(page.getByRole("button", { name: "Hakutyyppi" }));
  await page.waitForTimeout(1000);
  await hoverClick(page.getByRole("menuitemradio", { name: "Nimi" }));
  await page.waitForTimeout(1000);
  await hoverClick(
    page.getByRole("searchbox", { name: "Hae henkilöä nimellä" }),
  );
  await page.waitForTimeout(1000);
  await page
    .getByRole("searchbox", { name: "Hae henkilöä nimellä" })
    .fill("Wei");
  await page.waitForTimeout(1000);
  await hoverClick(page.getByRole("button", { name: "Wei Chen" }));
  await page.waitForTimeout(4000);

  // Search by supervisor
  await hoverClick(page.getByRole("button", { name: "Hakutyyppi" }));
  await page.waitForTimeout(1000);
  await hoverClick(page.getByRole("menuitemradio", { name: "Esihenkilö" }));
  await page.waitForTimeout(1000);
  await hoverClick(
    page.getByRole("searchbox", { name: "Hae henkilöä esihenkilöllä" }),
  );
  await page.waitForTimeout(1000);
  await page
    .getByRole("searchbox", { name: "Hae henkilöä esihenkilöllä" })
    .fill("Anna");
  await page.waitForTimeout(1000);
  await hoverClick(page.getByRole("button", { name: "Elena Popova" }));
  await page.waitForTimeout(4000);

  // Search by contract end date
  await hoverClick(page.getByRole("button", { name: "Hakutyyppi" }));
  await page.waitForTimeout(1000);
  await hoverClick(
    page.getByRole("menuitemradio", { name: "Sopimuksen päättymispäivä" }),
  );
  await page.waitForTimeout(1000);
  await hoverClick(
    page.getByRole("searchbox", { name: "Hae henkilöä päättymispäivällä" }),
  );
  await page.waitForTimeout(1000);
  await page
    .getByRole("searchbox", { name: "Hae henkilöä päättymispäivällä" })
    .fill("2026");
  await page.waitForTimeout(1000);
  await hoverClick(page.getByRole("button", { name: "Anna Ivanova" }));
  await page.waitForTimeout(4000);
  await hoverClick(
    page.getByRole("button", { name: "Sulje huone", exact: true }),
  );
  await page.waitForTimeout(3000);

  // Open settings
  await hoverClick(page.getByRole("button", { name: "Asetukset" }));
  await page.waitForTimeout(1000);
  await page
    .getByRole("slider", { name: "Kartan tekstin fonttikoko:" })
    .fill("16");
  await page.waitForTimeout(3000);
  await page
    .getByRole("slider", { name: "Kartan tekstin fonttikoko:" })
    .fill("24");
  await page.waitForTimeout(2000);
  await hoverClick(page.getByRole("button", { name: "Sulje asetukset" }));
  await page.waitForTimeout(2000);

  // Open user menu
  await hoverClick(page.getByRole("button", { name: "Käyttäjä" }));
  await page.waitForTimeout(2000);
  await hoverClick(page.getByRole("button", { name: "Sulje käyttäjävalikko" }));
  await page.waitForTimeout(2000);
});
