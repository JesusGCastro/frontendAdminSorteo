import { test, expect } from "@playwright/test";

const loginAsSorteador = async (page) => {
    await page.goto("http://localhost:5173/frontendAdminSorteo/");
    await page.getByTestId("profile").nth(1).click();
    await page.locator('input[type="email"]').fill("sorteador4@mail.com");
    await page.locator('input[type="password"]').fill("123456");
    await page.getByRole("button", { name: "Iniciar Sesión" }).click();
    await page.waitForURL("**/", { timeout: 10000 });
};

const seleccionarSorteo = async (page) => {
    await page.getByRole('img', { name: 'Regreso a Clases Solidario' }).click();
    await page.getByRole('link', { name: 'Pagos' }).click();
}

test("SMNP 1 - Confirmar comprobante de pago", async ({ page }) => {
    await loginAsSorteador(page);
    await seleccionarSorteo(page);
    await page.getByRole('cell', { name: '-11-27 12:27' }).click();
    //Boton confirmar debe ser visible
    await page.getByRole('button', { name: ' CONFIRMAR PAGO' }).toBeVisible();
});

test("SMNP 2 - Rechazar comprobante de pago", async ({ page }) => {
    await loginAsSorteador(page);
    await seleccionarSorteo(page);
    await page.getByRole('cell', { name: '-11-27 12:27' }).click();
    //Boton rechazar debe ser visible
    await page.getByRole('button', { name: ' RECHAZAR PAGO' }).toBeVisible();
});

test("SMNP 3 - Visualización de botones en transferencia no pendiente", async ({ page }) => {
    await loginAsSorteador(page);
    await seleccionarSorteo(page);
    await page.getByRole('cell', { name: '-11-27 12:19' }).click();
    await expect(page.getByRole('img', { name: 'Comprobante' })).toBeVisible();
    //Botones no deben ser visibles
    await expect(page.getByRole('button', { name: ' RECHAZAR PAGO' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: ' CONFIRMAR PAGO' })).not.toBeVisible();
});

test("SMNP 4 - Visualización de botones en no transferencia.", async ({ page }) => {
    await loginAsSorteador(page);
    await seleccionarSorteo(page);
    await page.getByRole('cell', { name: '-11-26 22:21' }).click();
    await page.getByText('Clave de rastreo: PAY-').click();
    //Botones no deben ser visibles
    await expect(page.getByRole('button', { name: ' RECHAZAR PAGO' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: ' CONFIRMAR PAGO' })).not.toBeVisible();
});

