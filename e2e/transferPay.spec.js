import { test, expect } from '@playwright/test';
import { resolve } from "path";

// Función para iniciar sesión como participante
const loginAsParticipante = async (page) => {
  await page.goto("http://localhost:5173/frontendAdminSorteo/");
  await page.getByTestId("profile").nth(1).click();
  await page.locator('input[type="email"]').fill("hector21@gmail.com");
  await page.locator('input[type="password"]').fill("Hector21$");
  await page.getByRole("button", { name: "Iniciar Sesión" }).click();
  await page.waitForURL("**/", { timeout: 10000 });
};

const waitForToast = async (page, message) => {
  // Esperamos 500 ms
  await page.waitForTimeout(500);
 
  const selectors = [
    `text="${message}"`,
    `text=${message}`,
    `*:has-text("${message}")`,
    `[class*="toast"]:has-text("${message}")`,
    `div:has-text("${message}")`
  ];

  for (const selector of selectors) {
    try {
      const element = page.locator(selector).first();
      await expect(element).toBeVisible({ timeout: 3000 });
      return true; // Si lo encuentra, retorna true
    } catch (e) {
      // Si no, prueba otro
      continue;
    }
  }

  await page.screenshot({ path: `test-results/toast-error-${Date.now()}.png` });
  throw new Error(`Toast no encontrado con mensaje: "${message}". Ver screenshot en test-results/`);
};


test('PRCP 1 - Particpante registra transferencia como comprobante de pago', async ({ page }) => {

    await loginAsParticipante(page);

    await page.getByRole('img', { name: 'Regreso a Clases Solidario' }).click();
    await page.getByRole('button', { name: 'Pagar Números Apartados' }).click();
    await page.getByRole('button', { name: ' Transferencia Bancaria' }).click();
    await page.getByText('Elegir archivo').click();
    
    const mockImagePath = resolve("./e2e/ps5-mock.png");
    await page.locator("#file-upload").setInputFiles(mockImagePath);
    await expect(page.getByText("ps5-mock.png")).toBeVisible();

    await page.getByText('37').click();

    await page.getByRole('button', { name: 'Enviar comprobante de' }).click();

    await waitForToast(page, "Registro de comprobante exitoso! Tus comprbante procederan a ser verificado.");
});

test ('PRCP 2 - Particpante no puede pagar sin seleccionar al menos un número', async ({ page }) => {

    await loginAsParticipante(page);

    await page.getByRole('img', { name: 'Regreso a Clases Solidario' }).click();
    await page.getByRole('button', { name: 'Pagar Números Apartados' }).click();
    await page.getByRole('button', { name: ' Transferencia Bancaria' }).click();

    
    await page.getByText('Elegir archivo').click();
    
    const mockImagePath = resolve("./e2e/ps5-mock.png");
    await page.locator("#file-upload").setInputFiles(mockImagePath);
    await expect(page.getByText("ps5-mock.png")).toBeVisible();

    // Verificar que NO se puede pagar sin seleccionar números
    await expect(
        page.getByText("Enviar comprobante de transferencia")
    ).not.toBeEnabled();
});

test('PRCP 3 - Particpante no puede pagar sin subir comprobante', async ({ page }) => {

    await loginAsParticipante(page);
    await page.getByRole('img', { name: 'Regreso a Clases Solidario' }).click();
    await page.getByRole('button', { name: 'Pagar Números Apartados' }).click();
    await page.getByRole('button', { name: ' Transferencia Bancaria' }).click();

    // Seleccionar un número
    await page.getByText('37').click();

    // Verificar que NO se puede pagar sin subir comprobante

    await expect(
        page.getByText("Enviar comprobante de transferencia")
    ).not.toBeEnabled();
});

test('PRCP 4 - Particpante puede seleccionar todos los boletos apartados sin transferencias en revisión a la vez', async ({ page }) => {

    await loginAsParticipante(page);
    await page.getByRole('img', { name: 'Regreso a Clases Solidario' }).click();
    await page.getByRole('button', { name: 'Pagar Números Apartados' }).click();
    await page.getByRole('button', { name: ' Transferencia Bancaria' }).click();

    const habilitados = page.locator('.boleto.habilitado');   // boletos que sí deben seleccionarse
    const pendientes = page.locator('.boleto.pendiente'); // boletos que no deben seleccionarse

    await page.getByRole('checkbox', { name: 'Pagar todos los numeros' }).check();

    const habilitadosCount = await habilitados.count();
    for (let i = 0; i < habilitadosCount; i++) {
        await expect(habilitados.nth(i)).toHaveClass(/selected/);
    }

    const pendientesCount = await pendientes.count();
    for (let i = 0; i < pendientesCount; i++) {
        await expect(pendientes.nth(i)).not.toHaveClass(/selected/);
    }
});


test('PRCP 5 - Particpante no puede seleccionar boletos apartados con transferencias en revisión', async ({ page }) => {

    await loginAsParticipante(page);
    await page.getByRole('img', { name: 'Regreso a Clases Solidario' }).click();
    await page.getByRole('button', { name: 'Pagar Números Apartados' }).click();
    await page.getByRole('button', { name: ' Transferencia Bancaria' }).click();

    await expect(
        page.getByText("29")
    ).not.toBeEnabled();
});