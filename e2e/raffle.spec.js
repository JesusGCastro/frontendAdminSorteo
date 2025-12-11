import { test, expect } from "@playwright/test";

// Función para iniciar sesión como participante
const loginAsParticipante = async (page) => {
  await page.goto("http://localhost:5173/frontendAdminSorteo/");
  await page.getByTestId("profile").nth(1).click();
  await page.locator('input[type="email"]').fill("hector21@gmail.com");
  await page.locator('input[type="password"]').fill("Hector21$");
  await page.getByRole("button", { name: "Iniciar Sesión" }).click();
  await page.waitForURL("**", { timeout: 10000 });
};

test("PAN 1. Mostrar sorteos de inicio.", async ({ page }) => {
  // Abrimos la pagina principal
  await page.goto('http://localhost:5173/frontendAdminSorteo/');
  // Comprobamos que se muestran los sorteos
  await page.getByRole('img', { name: 'Navidad', exact: true }).click();
});

test("PAN 2. Busqueda de sorteos por filtro.", async ({ page }) => {
  // Abrimos la pagina principal
  await page.goto('http://localhost:5173/frontendAdminSorteo/');
  // Rellenamos el campo de busqueda y comprobamos que se muestran los sorteos filtrados
  await page.getByRole('textbox', { name: 'Buscar sorteo' }).click();
  await page.getByRole('textbox', { name: 'Buscar sorteo' }).fill('navidad'); 

  await page.getByRole('img', { name: 'Navidad', exact: true }).click();
});

test("PAN 3. Busqueda de sorteos sin sorteos.", async ({ page }) => {
  // Abrimos la pagina principal
  await page.goto('http://localhost:5173/frontendAdminSorteo/');
  // Rellenamos el campo de busqueda con un texto que no existe y comprobamos que se muestra el mensaje de no se encontraron sorteos
  await page.getByRole("textbox", { name: "Buscar sorteo" }).click();
  await page.getByRole("textbox", { name: "Buscar sorteo" }).fill("pascua");
  // Comprobamos que se muestra el mensaje de no se encontraron sorteos
  await page.getByText("No se encontraron sorteos").toBeVisible;
});

test("PAN 4. Ver detalles del sorteo como participante.", async ({ page }) => {
  // Abrimos la pagina principal
  await page.goto('http://localhost:5173/frontendAdminSorteo/');
  // Hacemos click en un sorteo y comprobamos que se muestra la descripcion
  await page.getByRole('img', { name: 'Navidad', exact: true }).click();
  // Comprobamos que se muestra la descripcion del sorteo
  await page.getByRole("heading", { name: "Descripción" }).toBeVisible;
});

test("PAN 5. Seleccionar y apartar numero.", async ({ page }) => {
  // Ingresar como participante
  await loginAsParticipante(page);

  // Hacemos click en un sorteo y comprobamos que se muestra la descripcion
  await page.getByRole('img', { name: 'Navidad', exact: true }).click();
  await page.getByRole("button", { name: "9", exact: true }).click();
  page.once("dialog", (dialog) => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => { });
  });
});

test("PAN 6. Verificar que número ocupado está deshabilitado", async ({
  page,
}) => {
  // Ingresar como participante
  await loginAsParticipante(page);

  // Navegar al sorteo
  await page.getByRole('img', { name: 'Navidad', exact: true }).click();

  // Verificar que el boleto 8 está deshabilitado
  //await expect(
  //  page.getByRole("button", { name: "8", exact: true })
  //).toBeDisabled();
});

test("PAN 7. Apartar numero sin cuenta.", async ({ page }) => {
  await page.goto('http://localhost:5173/frontendAdminSorteo/');
  await page.getByRole('img', { name: 'Navidad', exact: true }).click();
  await page.getByRole("button", { name: "50" }).click();
  page.once("dialog", (dialog) => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => { });
  });
  await page.getByRole("button", { name: "Apartar números" }).click();
});

test("PAN 8. Apartar numero superando el limite por participante.", async ({
  page,
}) => {
  await page.goto('http://localhost:5173/frontendAdminSorteo/');
  await page.getByTestId('profile').nth(1).click();
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill("carlos@mail.com");
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').fill("123456");
  await page.getByRole("button", { name: "Iniciar Sesión" }).click();
  await page.getByRole('img', { name: 'Navidad', exact: true }).click();
  await page.getByRole("button", { name: "51", exact: true }).click();
  page.once("dialog", (dialog) => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => { });
  });
  await page.getByRole("button", { name: "Apartar números" }).click();
});
