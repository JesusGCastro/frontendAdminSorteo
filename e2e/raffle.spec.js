import { test, expect } from "@playwright/test";

test("PAN 1. Mostrar sorteos de inicio.", async ({ page }) => {
  // Abrimos la pagina principal
  await page.goto('/');
  // Comprobamos que se muestran los sorteos
  await expect(
    page.getByText("Gran Sorteo BETO 2025$150.00Navidad$")
  ).toBeVisible();
});

test("PAN 2. Busqueda de sorteos por filtro.", async ({ page }) => {
  // Abrimos la pagina principal
  await page.goto('/');
  // Rellenamos el campo de busqueda y comprobamos que se muestran los sorteos filtrados
  await page.getByRole("textbox", { name: "Buscar sorteo" }).click();
  await page.getByRole("textbox", { name: "Buscar sorteo" }).fill("navidad");
  // Comprobamos que se muestran los sorteos filtrados
  await expect(
    // Busca un elemento con la clase .sorteo-card
    page
      .locator(".sorteo-card")
      // Que contenga el título 'Navidad'
      .filter({ hasText: "Navidad" })
      // Y también contenga el precio '$150.00'
      .filter({ hasText: "$150.00" })
  ).toBeVisible();
});

test("PAN 3. Busqueda de sorteos sin sorteos.", async ({ page }) => {
  // Abrimos la pagina principal
  await page.goto('/');
  // Rellenamos el campo de busqueda con un texto que no existe y comprobamos que se muestra el mensaje de no se encontraron sorteos
  await page.getByRole("textbox", { name: "Buscar sorteo" }).click();
  await page.getByRole("textbox", { name: "Buscar sorteo" }).fill("pascua");
  // Comprobamos que se muestra el mensaje de no se encontraron sorteos
  await page.getByText("No se encontraron sorteos").toBeVisible;
});

test("PAN 4. Ver detalles del sorteo como participante.", async ({ page }) => {
  // Abrimos la pagina principal
  await page.goto('/');
  // Hacemos click en un sorteo y comprobamos que se muestra la descripcion
  await page.getByRole("img", { name: "Navidad" }).click();
  // Comprobamos que se muestra la descripcion del sorteo
  await page.getByRole("heading", { name: "Descripción" }).toBeVisible;
});

test("PAN 5. Seleccionar y apartar numero.", async ({ page }) => {
  await page.goto("http://localhost:5173/frontendAdminSorteo/");
  await page.getByTestId('profile').nth(1).click();
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill("carlos@mail.com");
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').fill("123456");
  await page.getByRole("button", { name: "Iniciar Sesión" }).click();
  await page.getByRole("img", { name: "Navidad" }).click();
  await page.getByRole("button", { name: "9", exact: true }).click();
  page.once("dialog", (dialog) => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
});

test("PAN 6. Verificar que número ocupado está deshabilitado", async ({
  page,
}) => {
  // Navegar a la página principal
  await page.goto('/');
  await page.getByTestId('profile').nth(1).click();

  // Iniciar sesión
  await page.locator('input[type="email"]').fill("reni3@gmail.com");
  await page.locator('input[type="password"]').fill("Reni19*");
  await page.getByRole("button", { name: "Iniciar Sesión" }).click();

  // Navegar al sorteo
  await page.getByRole("img", { name: "Navidad" }).click();

  // Verificar que el boleto 8 está deshabilitado
  await expect(
    page.getByRole("button", { name: "8", exact: true })
  ).toBeDisabled();
});

test("PAN 7. Apartar numero sin cuenta.", async ({ page }) => {
  await page.goto('/');
  await page.getByRole("img", { name: "Navidad" }).click();
  await page.getByRole("button", { name: "52" }).click();
  page.once("dialog", (dialog) => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole("button", { name: "Apartar números" }).click();
});

test("PAN 8. Apartar numero superando el limite por participante.", async ({
  page,
}) => {
  await page.goto('/');
  await page.getByTestId('profile').nth(1).click();
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill("carlos@mail.com");
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').fill("123456");
  await page.getByRole("button", { name: "Iniciar Sesión" }).click();
  await page.getByRole("img", { name: "Navidad" }).click();
  await page.getByRole("button", { name: "2", exact: true }).click();
  await page.getByRole("button", { name: "22" }).click();
  await page.getByRole("button", { name: "23" }).click();
  await page.getByRole("button", { name: "24" }).click();
  await page.getByRole("button", { name: "25" }).click();
  await page.getByRole("button", { name: "5", exact: true }).click();
  await page.getByRole("button", { name: "26" }).click();
  await page.getByRole("button", { name: "27" }).click();
  page.once("dialog", (dialog) => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole("button", { name: "Apartar números" }).click();
});
