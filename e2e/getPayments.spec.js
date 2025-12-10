/*import { test, expect } from "@playwright/test";


const loginAsSorteador = async (page) => {
  await page.goto("http://localhost:5173/frontendAdminSorteo/");
  await page.getByTestId("profile").nth(1).click();
  await page.locator('input[type="email"]').fill("sorteador4@mail.com");
  await page.locator('input[type="password"]').fill("123456");
  await page.getByRole("button", { name: "Iniciar Sesión" }).click();
  await page.waitForURL("**", { timeout: 10000 });
};

const seleccionarSorteo = async (page) => {
    await page.getByRole('img', { name: 'Regreso a Clases Solidario' }).click();
    await page.getByRole('link', { name: 'Pagos' }).click();
}


test ("SCCP 1 - Sorteador visualiza pagos realizados por participantes", async ({ page }) => {
    await loginAsSorteador(page);
    await seleccionarSorteo(page);
    await page.waitForSelector('tbody tr', { state: 'visible', timeout: 15000 });
    const filas = await page.locator('tbody tr').count();
    expect(filas).toBeGreaterThan(0);
});

test ("SCCP 2 - Sorteador visualiza los detalles de un pago de transferencia", async ({ page }) => {
    await loginAsSorteador(page);
    await seleccionarSorteo(page);
    await page.getByRole('cell', { name: '-11-27 12:27' }).click();
    await expect (page.getByRole('img', { name: 'Comprobante' })).toBeVisible();
});

test ("SCCP 3 - Sorteador visualiza los detalles de un pago en linea", async ({ page }) => {
    await loginAsSorteador(page);
    await seleccionarSorteo(page);
    await page.getByRole('button', { name: '' }).click();
    await page.getByRole('cell', { name: '-11-26 22:21' }).click();
    await expect (page.getByText('Clave de rastreo: PAY-')).toBeVisible();

});


*/
