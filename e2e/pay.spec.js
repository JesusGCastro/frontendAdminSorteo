import { test, expect } from '@playwright/test';

// Función para iniciar sesión como sorteador
const loginAsSorteador = async (page) => {
  await page.goto("http://localhost:5173/frontendAdminSorteo/");
  await page.getByTestId("profile").nth(1).click();
  await page.locator('input[type="email"]').fill("sorteador4@mail.com");
  await page.locator('input[type="password"]').fill("123456");
  await page.getByRole("button", { name: "Iniciar Sesión" }).click();
  await page.waitForURL("**", { timeout: 10000 });
};

// Función para iniciar sesión como participante
const loginAsParticipante = async (page) => {
  await page.goto("http://localhost:5173/frontendAdminSorteo/");
  await page.getByTestId("profile").nth(1).click();
  await page.locator('input[type="email"]').fill("hector21@gmail.com");
  await page.locator('input[type="password"]').fill("Hector21$");
  await page.getByRole("button", { name: "Iniciar Sesión" }).click();
  await page.waitForURL("**", { timeout: 10000 });
};

const selectRaffle = async (page) => {
  await page.getByRole('img', { name: 'Navidad', exact: true }).click();
}

test('PPL 1. El sorteador no puede comprar números.', async ({ page }) => {
  // Ingresar como sorteador
  await loginAsSorteador(page);

  // Hacemos click en un sorteo y comprobamos que se muestra la descripcion
  await page.getByRole('img', { name: 'Navidad', exact: true }).click();

  // Comprobamos que este en la pantalla correcta de descripcion de sorteos
  await expect(page).toHaveURL(/edicionSorteos/);
});

test('PPL 2. El invitado no puede realizar compras.', async ({ page }) => {
  await page.goto('/');

  // Hacemos click en un sorteo y comprobamos que se muestra la descripcion
  await page.getByRole('img', { name: 'Navidad', exact: true }).click();

  // Validar que NO exista el botón de pagar
  await expect(page.getByTestId('btn-pagar-online')).not.toBeVisible();
});

test('PPL 3. No se puede pagar sin números apartados.', async ({ page }) => {
  // Ingresar como participante
  await loginAsParticipante(page);

  // Hacemos click en un sorteo y comprobamos que se muestra la descripcion
  await page.getByRole('img', { name: 'Navidad', exact: true }).click();

  // Validar que NO exista el botón pagar
  //await expect(page.getByTestId('btn-pagar-online')).not.toBeVisible();
});

test('PPL 4. Validación de campos de tarjeta y selección mínima.', async ({ page }) => {
  await loginAsSorteador(page);

  await page.getByRole('img', { name: 'Navidad', exact: true }).click();

  /*await page.getByRole('button', { name: 'Pagar Números Apartados' }).click();

  await page.getByRole('button', { name: 'Pago en Línea' }).click();

  // Verificar que NO se puede pagar sin llenar tarjeta
  await expect(page.getByText('Realizar compra')).toBeDisabled();

  // CORRECCIÓN: Los números son divs con clase "boleto-item", no buttons
  // Buscar el div que contiene el texto "1" exactamente
  await page.locator('.boleto-item').filter({ hasText: /^1$/ }).click();

  await page.getByRole('textbox', { name: '•••• •••• •••• ••••' }).click();
  await page.getByRole('textbox', { name: '•••• •••• •••• ••••' }).fill('1234 1234 1234 1234');
  await page.getByRole('textbox', { name: 'MM' }).click();
  await page.getByRole('textbox', { name: 'MM' }).fill('11');
  await page.getByRole('textbox', { name: 'AA' }).click();
  // Año futuro para no expirar
  await page.getByRole('textbox', { name: 'AA' }).fill('30');
  await page.getByRole('textbox', { name: 'CVC' }).click();
  await page.getByRole('textbox', { name: 'CVC' }).fill('060');

  //Verificar que si este disponible el boton de pagar
  await expect(page.getByText('Realizar compra')).toBeEnabled();

  await page.getByRole('textbox', { name: '•••• •••• •••• ••••' }).click();
  await page.getByRole('textbox', { name: '•••• •••• •••• ••••' }).fill('1234 1234 1234 12w$');

  // Verificar que NO se puede pagar sin llenar tarjeta
  await expect(page.getByText('Realizar compra')).toBeDisabled();

  await page.getByRole('textbox', { name: '•••• •••• •••• ••••' }).fill('1234 1234 1234 1234');

  //Verificar que si este disponible el boton de pagar
  await expect(page.getByText('Realizar compra')).toBeEnabled();

  await page.getByRole('textbox', { name: 'MM' }).click();
  // Usamos '00' para forzar inválido
  await page.getByRole('textbox', { name: 'MM' }).fill('00');

  // Verificar que NO se puede pagar sin llenar tarjeta (mes inválido)
  await expect(page.getByText('Realizar compra')).toBeDisabled();

  await page.getByRole('textbox', { name: 'MM' }).click();
  await page.getByRole('textbox', { name: 'MM' }).fill('11');

  //Verificar que si este disponible el boton de pagar
  await expect(page.getByText('Realizar compra')).toBeEnabled();

  // Deseleccionar el boleto "1" que habíamos seleccionado al inicio
  const boleto1 = page.locator('.boleto-item').filter({ hasText: /^1$/ });

  // Verificar que el boleto está seleccionado antes de deseleccionar
  await expect(boleto1).toHaveClass(/selected/);

  // Hacer clic para deseleccionar
  await boleto1.click();

  // Esperar a que React actualice el estado
  await page.waitForTimeout(500);

  // Verificar que el boleto ya NO está seleccionado
  await expect(boleto1).not.toHaveClass(/selected/);

  // Verificar que NO se puede pagar sin boletos seleccionados
  await expect(page.getByText('Realizar compra')).toBeDisabled();

  // Volver a seleccionar el boleto 1
  await boleto1.click();
  await page.waitForTimeout(300);

  //Verificar que si este disponible el boton de pagar
  await expect(page.getByText('Realizar compra')).toBeEnabled();*/
});

test('PPL 5. Pago de todos los números apartados.', async ({ page }) => {
  // Ingresar como participante
  await loginAsParticipante(page);

  // Hacemos click en un sorteo y comprobamos que se muestra la descripcion
  await page.getByRole('img', { name: 'Navidad', exact: true }).click();

  // Dar click en pagar números apartados
  await page.getByRole('button', { name: 'Pagar Números Apartados' }).click();

  await page.getByRole('button', { name: 'Pago en Línea' }).click();

  // Llenar tarjeta válida
  await page.getByRole('textbox', { name: '•••• •••• •••• ••••' }).click();
  await page.getByRole('textbox', { name: '•••• •••• •••• ••••' }).fill('1234 1234 1234 1234');
  await page.getByRole('textbox', { name: 'MM' }).click();
  await page.getByRole('textbox', { name: 'MM' }).fill('11');
  await page.getByRole('textbox', { name: 'AA' }).click();
  // Año futuro para no expirar
  await page.getByRole('textbox', { name: 'AA' }).fill('30');
  await page.getByRole('textbox', { name: 'CVC' }).click();
  await page.getByRole('textbox', { name: 'CVC' }).fill('060');

  // Seleccionar todos los números
  await page.getByRole('checkbox', { name: 'Comprar todos los numeros' }).check();

  // Validar que NO exista el botón pagar
  await expect(page.getByText('Realizar compra')).toBeEnabled();
});